#!/usr/bin/env bash
# Orchestrateur Cloud Agent → VPS Hostinger.
# N'affiche jamais le contenu des secrets.
# Supporte :
#   - clé privée sans phrase secrète (recommandé pour l'automatisation)
#   - clé privée + VPS_SSH_PASSPHRASE via ssh-agent + SSH_ASKPASS
#   - mot de passe compte via sshpass (secours)
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"

DOMAIN="${NARAH_DOMAIN:-narahservice.fr}"
SSH_HOST="${VPS_SSH_HOST:-147.79.118.212}"
SSH_USER="${VPS_SSH_USER:-root}"
SSH_PORT="${VPS_SSH_PORT:-22}"
APP_PORT="${APP_PORT:-3010}"
APP_REF="${APP_REF:-main}"

SSH_OPTS=(
  -o StrictHostKeyChecking=accept-new
  -o IdentitiesOnly=yes
  -o PreferredAuthentications=publickey
  -o PasswordAuthentication=no
  -o BatchMode=yes
  -p "${SSH_PORT}"
)
SSH_TARGET="${SSH_USER}@${SSH_HOST}"

KEY_FILE=""
ASKPASS_FILE=""
AGENT_STARTED=0

cleanup() {
  if [[ "${AGENT_STARTED}" -eq 1 ]]; then
    ssh-agent -k >/dev/null 2>&1 || true
  fi
  [[ -n "${KEY_FILE}" && -f "${KEY_FILE}" ]] && rm -f "${KEY_FILE}"
  [[ -n "${ASKPASS_FILE}" && -f "${ASKPASS_FILE}" ]] && rm -f "${ASKPASS_FILE}"
}
trap cleanup EXIT

start_ssh_agent_with_key() {
  KEY_FILE="$(mktemp)"
  # Normalize newlines (Windows secrets sometimes use CRLF)
  printf '%s\n' "${VPS_SSH_PRIVATE_KEY}" | tr -d '\r' > "${KEY_FILE}"
  chmod 600 "${KEY_FILE}"

  if [[ ! -s "${KEY_FILE}" ]]; then
    echo "[ABORT] VPS_SSH_PRIVATE_KEY est vide après écriture." >&2
    exit 2
  fi

  # Detect encrypted key (OpenSSH or PEM)
  if grep -q "ENCRYPTED" "${KEY_FILE}" || grep -q "Proc-Type: 4,ENCRYPTED" "${KEY_FILE}"; then
    if [[ -z "${VPS_SSH_PASSPHRASE:-}" ]]; then
      echo "[ABORT] Clé chiffrée détectée mais VPS_SSH_PASSPHRASE absent." >&2
      echo "        Ajoutez un Runtime Secret VPS_SSH_PASSPHRASE, ou utilisez une clé d'automatisation sans passphrase." >&2
      exit 2
    fi
  fi

  eval "$(ssh-agent -s)" >/dev/null
  AGENT_STARTED=1

  if [[ -n "${VPS_SSH_PASSPHRASE:-}" ]]; then
    ASKPASS_FILE="$(mktemp)"
    cat > "${ASKPASS_FILE}" <<'ASK'
#!/usr/bin/env bash
printf '%s\n' "${VPS_SSH_PASSPHRASE}"
ASK
    chmod 700 "${ASKPASS_FILE}"
    export SSH_ASKPASS="${ASKPASS_FILE}"
    export SSH_ASKPASS_REQUIRE=force
    # DISPLAY must be set for some OpenSSH builds even with SSH_ASKPASS_REQUIRE
    export DISPLAY="${DISPLAY:-:0}"
    if ! SSH_ASKPASS="${ASKPASS_FILE}" SSH_ASKPASS_REQUIRE=force DISPLAY="${DISPLAY}" \
      ssh-add "${KEY_FILE}" </dev/null >/tmp/narah-ssh-add.out 2>/tmp/narah-ssh-add.err; then
      echo "[ABORT] ssh-add a échoué (passphrase incorrecte ou clé invalide)." >&2
      # Do not cat err if it might contain sensitive hints beyond generic failure
      exit 2
    fi
  else
    if ! ssh-add "${KEY_FILE}" </dev/null >/tmp/narah-ssh-add.out 2>/tmp/narah-ssh-add.err; then
      echo "[ABORT] ssh-add a échoué. Si la clé a une passphrase, définissez VPS_SSH_PASSPHRASE." >&2
      exit 2
    fi
  fi

  SSH_OPTS+=(-o IdentityAgent="${SSH_AUTH_SOCK}")
}

if [[ -n "${VPS_SSH_PRIVATE_KEY:-}" ]]; then
  start_ssh_agent_with_key
elif [[ -n "${VPS_SSH_PASSWORD:-}" ]]; then
  if ! command -v sshpass >/dev/null; then
    echo "[ABORT] sshpass requis pour auth par mot de passe compte." >&2
    exit 2
  fi
  # Override PreferredAuthentications for password path
  SSH_OPTS=(
    -o StrictHostKeyChecking=accept-new
    -o PreferredAuthentications=password
    -o PubkeyAuthentication=no
    -p "${SSH_PORT}"
  )
  export SSHPASS="${VPS_SSH_PASSWORD}"
  ssh() { command sshpass -e ssh "$@"; }
  scp() { command sshpass -e scp "$@"; }
else
  echo "[ABORT] Fournissez VPS_SSH_PRIVATE_KEY (+ VPS_SSH_PASSPHRASE si chiffrée) ou VPS_SSH_PASSWORD." >&2
  exit 2
fi

remote() {
  ssh "${SSH_OPTS[@]}" "${SSH_TARGET}" "$@"
}

echo "[agent] test SSH (sans secrets)"
if ! remote 'echo SSH_OK; whoami; hostname'; then
  echo "[ABORT] Connexion SSH échouée." >&2
  exit 2
fi

echo "[agent] audit distant (lecture seule)"
remote 'bash -s' < "${SCRIPT_DIR}/01-audit-remote.sh" | tee /tmp/narah-audit.log

# Choisir un port libre si 3010 pris
if remote "ss -tuln | grep -qE ':${APP_PORT}\\b'"; then
  echo "[agent] port ${APP_PORT} occupé, recherche alternative..."
  for p in 3011 3012 3020 3030 3040; do
    if ! remote "ss -tuln | grep -qE ':${p}\\b'"; then
      APP_PORT="$p"
      break
    fi
  done
  echo "[agent] port retenu: ${APP_PORT}"
fi

echo "[agent] vérification DNS ${DOMAIN} -> ${SSH_HOST}"
resolved=$(dig +short A "${DOMAIN}" | head -1 || true)
if [[ "${resolved}" != "${SSH_HOST}" ]]; then
  echo "[ABORT] DNS ${DOMAIN} résout vers '${resolved}' (attendu ${SSH_HOST})." >&2
  exit 3
fi
www_resolved=$(dig +short A "www.${DOMAIN}" | head -1 || true)
echo "[agent] www -> ${www_resolved:-<vide>}"

remote "mkdir -p /tmp/narah-deploy"
scp "${SSH_OPTS[@]}" \
  "${SCRIPT_DIR}/01-audit-remote.sh" \
  "${SCRIPT_DIR}/02-deploy-remote.sh" \
  "${SCRIPT_DIR}/03-rollback-remote.sh" \
  "${SCRIPT_DIR}/04-smoke-prod.sh" \
  "${SCRIPT_DIR}/narahservice.nginx.conf.tpl" \
  "${SCRIPT_DIR}/narahservice.nginx.http-bootstrap.conf.tpl" \
  "${SCRIPT_DIR}/narahservice.service.tpl" \
  "${SSH_TARGET}:/tmp/narah-deploy/"

remote "chmod +x /tmp/narah-deploy/*.sh"

echo "[agent] déploiement"
remote "sudo DOMAIN='${DOMAIN}' WWW_DOMAIN='www.${DOMAIN}' APP_PORT='${APP_PORT}' APP_REF='${APP_REF}' SITE_URL='https://${DOMAIN}' bash /tmp/narah-deploy/02-deploy-remote.sh"

echo "[agent] smoke tests"
bash "${SCRIPT_DIR}/04-smoke-prod.sh" "${DOMAIN}"

echo "[agent] terminé"
