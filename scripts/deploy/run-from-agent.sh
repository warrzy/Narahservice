#!/usr/bin/env bash
# Orchestrateur local : lit les secrets d'environnement et déploie sur le VPS.
# N'affiche jamais les secrets.
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"

DOMAIN="${NARAH_DOMAIN:-}"
SSH_HOST="${VPS_SSH_HOST:-147.79.118.212}"
SSH_USER="${VPS_SSH_USER:-root}"
APP_PORT="${APP_PORT:-3010}"
APP_REF="${APP_REF:-main}"

if [[ -z "${DOMAIN}" || "${DOMAIN}" == *"[À RENSEIGNER]"* || "${DOMAIN}" == "votredomaine.com" ]]; then
  echo "[ABORT] NARAH_DOMAIN manquant ou placeholder. Fournissez le domaine exact." >&2
  exit 2
fi

# Auth: clé privée ou password
SSH_OPTS=(-o StrictHostKeyChecking=accept-new -o IdentitiesOnly=yes)
SSH_TARGET="${SSH_USER}@${SSH_HOST}"

if [[ -n "${VPS_SSH_PRIVATE_KEY:-}" ]]; then
  KEY_FILE="$(mktemp)"
  printf '%s\n' "${VPS_SSH_PRIVATE_KEY}" > "${KEY_FILE}"
  chmod 600 "${KEY_FILE}"
  trap 'rm -f "${KEY_FILE}"' EXIT
  SSH_OPTS+=(-i "${KEY_FILE}")
elif [[ -n "${VPS_SSH_PASSWORD:-}" ]]; then
  if ! command -v sshpass >/dev/null; then
    echo "[ABORT] sshpass requis pour auth par mot de passe." >&2
    exit 2
  fi
  export SSHPASS="${VPS_SSH_PASSWORD}"
  ssh() { command sshpass -e ssh "$@"; }
  scp() { command sshpass -e scp "$@"; }
else
  echo "[ABORT] Fournissez VPS_SSH_PRIVATE_KEY ou VPS_SSH_PASSWORD." >&2
  exit 2
fi

remote() {
  ssh "${SSH_OPTS[@]}" "${SSH_TARGET}" "$@"
}

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

# Vérifier DNS
echo "[agent] vérification DNS ${DOMAIN} -> ${SSH_HOST}"
resolved=$(dig +short A "${DOMAIN}" | head -1 || true)
if [[ "${resolved}" != "${SSH_HOST}" ]]; then
  echo "[ABORT] DNS ${DOMAIN} résout vers '${resolved}' (attendu ${SSH_HOST})." >&2
  exit 3
fi
www_resolved=$(dig +short A "www.${DOMAIN}" | head -1 || true)
echo "[agent] www -> ${www_resolved:-<vide>}"

# Copier scripts
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
