#!/usr/bin/env bash
# Bootstrap production NARAH SERVICE — à exécuter EN ROOT sur le VPS Hostinger.
# Usage :
#   curl -fsSL https://raw.githubusercontent.com/warrzy/Narahservice/main/scripts/deploy/vps-bootstrap-as-root.sh | bash
# ou :
#   bash /chemin/vers/vps-bootstrap-as-root.sh
#
# Ne touche PAS aux vhosts ecom-touch.tech / autres apps.
# Effectue nginx -t avant tout reload + backup pour rollback.
set -euo pipefail

if [[ "${EUID}" -ne 0 ]]; then
  echo "[ABORT] Exécuter en root (sudo -i)." >&2
  exit 1
fi

DOMAIN="${DOMAIN:-narahservice.fr}"
WWW_DOMAIN="${WWW_DOMAIN:-www.${DOMAIN}}"
APP_REF="${APP_REF:-main}"
REPO_URL="${REPO_URL:-https://github.com/warrzy/Narahservice.git}"
APP_ROOT="/var/www/narahservice"
SITE_URL="https://${DOMAIN}"
WORK="/tmp/narah-bootstrap-$$"
BACKUP_DIR="/var/backups/narahservice/$(date +%Y%m%d-%H%M%S)"

cleanup() { rm -rf "${WORK}"; }
trap cleanup EXIT

echo "=== [0] Prérequis & audit (lecture) ==="
hostname
uname -a
df -h / | tail -1
free -h | head -2
echo "--- ports ---"
ss -tuln | head -40 || true
echo "--- sites-enabled ---"
ls -la /etc/nginx/sites-enabled/ 2>/dev/null || true
echo "--- ecom-touch (ne pas modifier) ---"
curl -sI --max-time 8 https://ecom-touch.tech 2>/dev/null | head -3 || echo "(check local later)"

echo "=== [1] Backup Nginx ==="
mkdir -p "${BACKUP_DIR}"
cp -a /etc/nginx/sites-available "${BACKUP_DIR}/sites-available" 2>/dev/null || true
cp -a /etc/nginx/sites-enabled "${BACKUP_DIR}/sites-enabled" 2>/dev/null || true
cp -a /etc/nginx/nginx.conf "${BACKUP_DIR}/nginx.conf" 2>/dev/null || true
echo "BACKUP=${BACKUP_DIR}"

echo "=== [2] Node.js 20+ ==="
need_node=0
if ! command -v node >/dev/null; then
  need_node=1
else
  major=$(node -v | sed 's/^v//' | cut -d. -f1)
  if [[ "${major}" -lt 20 ]]; then
    need_node=1
  fi
fi
if [[ "${need_node}" -eq 1 ]]; then
  apt-get update -y
  apt-get install -y ca-certificates curl gnupg
  mkdir -p /etc/apt/keyrings
  curl -fsSL https://deb.nodesource.com/gpgkey/nodesource-repo.gpg.key \
    | gpg --dearmor -o /etc/apt/keyrings/nodesource.gpg
  echo "deb [signed-by=/etc/apt/keyrings/nodesource.gpg] https://deb.nodesource.com/node_20.x nodistro main" \
    > /etc/apt/sources.list.d/nodesource.list
  apt-get update -y
  apt-get install -y nodejs
fi
node -v
npm -v

echo "=== [3] Paquets système ==="
apt-get update -y
DEBIAN_FRONTEND=noninteractive apt-get install -y git nginx certbot python3-certbot-nginx curl

echo "=== [4] Port applicatif libre ==="
APP_PORT="${APP_PORT:-}"
if [[ -z "${APP_PORT}" ]]; then
  for p in 3010 3011 3012 3020 3030 3040; do
    if ! ss -tuln | grep -qE ":${p}\\b"; then
      APP_PORT="$p"
      break
    fi
  done
fi
if [[ -z "${APP_PORT}" ]]; then
  echo "[ABORT] Aucun port libre parmi 3010-3040." >&2
  exit 1
fi
echo "APP_PORT=${APP_PORT}"

echo "=== [5] Scripts de déploiement ==="
# Si lancé depuis un checkout local (recommandé), réutiliser ces scripts.
# Sinon cloner SCRIPTS_REF (défaut: même que APP_REF).
SCRIPTS_REF="${SCRIPTS_REF:-${APP_REF}}"
SELF_DIR=""
if [[ -n "${BASH_SOURCE[0]:-}" && -f "${BASH_SOURCE[0]}" ]]; then
  SELF_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
fi
if [[ -n "${SELF_DIR}" && -f "${SELF_DIR}/02-deploy-remote.sh" ]]; then
  SCRIPT_DIR="${SELF_DIR}"
  echo "[bootstrap] scripts locaux: ${SCRIPT_DIR}"
else
  rm -rf "${WORK}"
  mkdir -p "${WORK}"
  git clone --branch "${SCRIPTS_REF}" --depth 1 "${REPO_URL}" "${WORK}/repo"
  SCRIPT_DIR="${WORK}/repo/scripts/deploy"
  echo "[bootstrap] scripts clonés (${SCRIPTS_REF}): ${SCRIPT_DIR}"
fi
chmod +x "${SCRIPT_DIR}"/*.sh

echo "=== [6] Déploiement isolé ==="
export DOMAIN WWW_DOMAIN APP_PORT APP_REF SITE_URL REPO_URL
mkdir -p /tmp/narah-deploy
cp -a "${SCRIPT_DIR}/." /tmp/narah-deploy/
chmod +x /tmp/narah-deploy/*.sh

DOMAIN="${DOMAIN}" WWW_DOMAIN="${WWW_DOMAIN}" APP_PORT="${APP_PORT}" \
  APP_REF="${APP_REF}" SITE_URL="${SITE_URL}" REPO_URL="${REPO_URL}" \
  bash /tmp/narah-deploy/02-deploy-remote.sh

echo "=== [7] Vérifications locales ==="
systemctl is-active narahservice && echo "narahservice: active" || echo "narahservice: FAIL"
systemctl is-active nginx && echo "nginx: active" || echo "nginx: FAIL"
nginx -t
echo "--- sites-enabled ---"
ls -la /etc/nginx/sites-enabled/
echo "--- server_name conflicts (narahservice) ---"
grep -R "server_name" /etc/nginx/sites-enabled/ /etc/nginx/sites-available/ 2>/dev/null | grep -E "narahservice|default" || true
echo "--- curl local via Host ---"
curl -sI -H "Host: ${DOMAIN}" http://127.0.0.1/ | head -8
curl -s -H "Host: ${DOMAIN}" http://127.0.0.1/ | head -c 200; echo
echo "--- ecom-touch intact ---"
curl -sI --max-time 10 https://ecom-touch.tech | head -5 || true

echo "=== [8] Smoke HTTPS (si certificat prêt) ==="
if [[ -f "/etc/letsencrypt/live/${DOMAIN}/fullchain.pem" ]]; then
  bash /tmp/narah-deploy/04-smoke-prod.sh "${DOMAIN}" || true
else
  echo "[WARN] Certificat LE absent — vérifier certbot manuellement."
fi

echo
echo "=== DÉPLOIEMENT TERMINÉ ==="
echo "URL=https://${DOMAIN}"
echo "PORT=${APP_PORT}"
echo "BACKUP=${BACKUP_DIR}"
echo "Rollback vhost: bash /tmp/narah-deploy/03-rollback-remote.sh ${BACKUP_DIR}"
echo "SHA=$(cat ${APP_ROOT}/shared/DEPLOYED_SHA 2>/dev/null || echo unknown)"
