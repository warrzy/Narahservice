#!/usr/bin/env bash
# Mise à jour de release NARAH SERVICE (app déjà en prod).
# - Backup Nginx + SHA courant
# - Conserve le port existant (ex. 3011)
# - Ne touche PAS ecom-touch.tech ni les autres vhosts
# Exécuter en root sur le VPS.
set -euo pipefail

if [[ "${EUID}" -ne 0 ]]; then
  echo "[ABORT] Exécuter en root." >&2
  exit 1
fi

DOMAIN="${DOMAIN:-narahservice.fr}"
WWW_DOMAIN="${WWW_DOMAIN:-www.${DOMAIN}}"
APP_REF="${APP_REF:-main}"
REPO_URL="${REPO_URL:-https://github.com/warrzy/Narahservice.git}"
SITE_URL="${SITE_URL:-https://${DOMAIN}}"
APP_ROOT="/var/www/narahservice"
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
BACKUP_DIR="/var/backups/narahservice/$(date +%Y%m%d-%H%M%S)"

echo "=== [1] Backup ==="
mkdir -p "${BACKUP_DIR}"
cp -a /etc/nginx/sites-available "${BACKUP_DIR}/" 2>/dev/null || true
cp -a /etc/nginx/sites-enabled "${BACKUP_DIR}/" 2>/dev/null || true
cp -a /etc/nginx/nginx.conf "${BACKUP_DIR}/nginx.conf" 2>/dev/null || true
if [[ -f "${APP_ROOT}/shared/DEPLOYED_SHA" ]]; then
  cp -a "${APP_ROOT}/shared/DEPLOYED_SHA" "${BACKUP_DIR}/DEPLOYED_SHA.prev"
fi
if [[ -f /etc/systemd/system/narahservice.service ]]; then
  cp -a /etc/systemd/system/narahservice.service "${BACKUP_DIR}/"
fi
# Snapshot léger du code (SHA seulement — le rollback code = git reset)
echo "BACKUP=${BACKUP_DIR}"

# Port actuel : .env > unit systemd > 3011
APP_PORT=""
if [[ -f "${APP_ROOT}/shared/.env" ]] && grep -q '^PORT=' "${APP_ROOT}/shared/.env"; then
  APP_PORT="$(grep '^PORT=' "${APP_ROOT}/shared/.env" | cut -d= -f2 | tr -d '[:space:]')"
fi
if [[ -z "${APP_PORT}" ]] && [[ -f /etc/systemd/system/narahservice.service ]]; then
  APP_PORT="$(grep -oE '127\.0\.0\.1:[0-9]+' /etc/systemd/system/narahservice.service | head -1 | cut -d: -f2 || true)"
fi
APP_PORT="${APP_PORT:-3011}"
echo "APP_PORT=${APP_PORT} (conservé)"

echo "=== [2] Préflight isolation ==="
curl -sI -o /dev/null -w "ecom-touch HTTP %{http_code}\n" https://ecom-touch.tech || echo "ecom-touch check skipped"
test -d "${APP_ROOT}/app/.git" || {
  echo "[ABORT] ${APP_ROOT}/app n'est pas un dépôt git. Utilisez 07-go-live.sh pour le premier déploiement." >&2
  exit 1
}

echo "=== [3] Code ${APP_REF} ==="
git config --global --add safe.directory "${APP_ROOT}/app" || true
chown -R root:root "${APP_ROOT}/app"
git -C "${APP_ROOT}/app" remote set-url origin "${REPO_URL}"
git -C "${APP_ROOT}/app" fetch --depth 1 origin "${APP_REF}"
git -C "${APP_ROOT}/app" checkout -B "${APP_REF}" "origin/${APP_REF}"
git -C "${APP_ROOT}/app" reset --hard "origin/${APP_REF}"
DEPLOY_SHA="$(git -C "${APP_ROOT}/app" rev-parse HEAD)"
PREV_SHA="$(cat "${BACKUP_DIR}/DEPLOYED_SHA.prev" 2>/dev/null || echo unknown)"
echo "PREV=${PREV_SHA}"
echo "SHA=${DEPLOY_SHA}"
echo "${DEPLOY_SHA}" > "${APP_ROOT}/shared/DEPLOYED_SHA"

echo "=== [4] .env (port figé) ==="
mkdir -p "${APP_ROOT}/shared"
if [[ ! -f "${APP_ROOT}/shared/.env" ]]; then
  cat > "${APP_ROOT}/shared/.env" <<EOF
NODE_ENV=production
NEXT_PUBLIC_SITE_URL=${SITE_URL}
PORT=${APP_PORT}
HOSTNAME=127.0.0.1
EOF
else
  grep -q '^NEXT_PUBLIC_SITE_URL=' "${APP_ROOT}/shared/.env" \
    && sed -i "s|^NEXT_PUBLIC_SITE_URL=.*|NEXT_PUBLIC_SITE_URL=${SITE_URL}|" "${APP_ROOT}/shared/.env" \
    || echo "NEXT_PUBLIC_SITE_URL=${SITE_URL}" >> "${APP_ROOT}/shared/.env"
  grep -q '^PORT=' "${APP_ROOT}/shared/.env" \
    && sed -i "s|^PORT=.*|PORT=${APP_PORT}|" "${APP_ROOT}/shared/.env" \
    || echo "PORT=${APP_PORT}" >> "${APP_ROOT}/shared/.env"
  grep -q '^HOSTNAME=' "${APP_ROOT}/shared/.env" \
    || echo "HOSTNAME=127.0.0.1" >> "${APP_ROOT}/shared/.env"
fi
chmod 640 "${APP_ROOT}/shared/.env"
chown root:narah "${APP_ROOT}/shared/.env"
ln -sfn "${APP_ROOT}/shared/.env" "${APP_ROOT}/app/.env.local"

echo "=== [5] Build ==="
chown narah:narah "${APP_ROOT}"
mkdir -p "${APP_ROOT}/shared/npm-cache" "${APP_ROOT}/releases"
chown -R narah:narah "${APP_ROOT}/app" "${APP_ROOT}/shared" "${APP_ROOT}/releases"
rm -rf "${APP_ROOT}/app/node_modules" "${APP_ROOT}/.npm" "${APP_ROOT}/app/.next"
sudo -u narah -H bash -lc "
  set -euo pipefail
  cd ${APP_ROOT}/app
  export npm_config_cache=${APP_ROOT}/shared/npm-cache
  npm ci --no-audit --no-fund
  npm run build
"
test -d "${APP_ROOT}/app/.next" || { echo "[ABORT] .next absent"; exit 1; }

echo "=== [6] Restart systemd (même port) ==="
sed -e "s/__APP_PORT__/${APP_PORT}/g" \
  "${SCRIPT_DIR}/narahservice.service.tpl" > /etc/systemd/system/narahservice.service
systemctl daemon-reload
systemctl enable narahservice.service
systemctl restart narahservice.service
sleep 4
systemctl is-active --quiet narahservice.service || {
  journalctl -u narahservice -n 50 --no-pager
  exit 1
}
curl -sf -o /dev/null "http://127.0.0.1:${APP_PORT}/" || {
  echo "[ABORT] Next ne répond pas sur :${APP_PORT}"
  journalctl -u narahservice -n 40 --no-pager
  exit 1
}

echo "=== [7] Nginx (re-render uniquement narahservice, même port) ==="
if [[ -f "/etc/letsencrypt/live/${DOMAIN}/fullchain.pem" ]]; then
  sed -e "s/__DOMAIN__/${DOMAIN}/g" \
      -e "s/__WWW_DOMAIN__/${WWW_DOMAIN}/g" \
      -e "s/__APP_PORT__/${APP_PORT}/g" \
      "${SCRIPT_DIR}/narahservice.nginx.conf.tpl" > /etc/nginx/sites-available/narahservice
else
  sed -e "s/__DOMAIN__/${DOMAIN}/g" \
      -e "s/__WWW_DOMAIN__/${WWW_DOMAIN}/g" \
      -e "s/__APP_PORT__/${APP_PORT}/g" \
      "${SCRIPT_DIR}/narahservice.nginx.http-bootstrap.conf.tpl" > /etc/nginx/sites-available/narahservice
fi
ln -sfn /etc/nginx/sites-available/narahservice /etc/nginx/sites-enabled/narahservice
nginx -t
systemctl reload nginx

echo "=== [8] Smoke ==="
curl -sk "https://${DOMAIN}/" | tr '\n' ' ' | grep -oiE 'NARAH SERVICE|ECOM-TOUCH|Welcome to nginx' | head -5
curl -sI "https://ecom-touch.tech" | head -5
bash "${SCRIPT_DIR}/04-smoke-prod.sh" "${DOMAIN}" || true

echo
echo "=== UPDATE OK ==="
echo "URL=https://${DOMAIN}"
echo "PORT=${APP_PORT}"
echo "SHA=${DEPLOY_SHA}"
echo "BACKUP=${BACKUP_DIR}"
echo "Rollback code: cd ${APP_ROOT}/app && git reset --hard ${PREV_SHA} && systemctl restart narahservice"
echo "Rollback nginx: restaurer ${BACKUP_DIR} puis nginx -t && systemctl reload nginx"
