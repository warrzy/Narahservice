#!/usr/bin/env bash
# Reprise après échec npm (EACCES /.npm ou TAR_ENTRY_ERROR).
# À exécuter en ROOT sur le VPS. Ne touche pas ecom-touch.
set -euo pipefail

if [[ "${EUID}" -ne 0 ]]; then
  echo "[ABORT] root requis" >&2
  exit 1
fi

APP_ROOT="/var/www/narahservice"
DOMAIN="${DOMAIN:-narahservice.fr}"
WWW_DOMAIN="${WWW_DOMAIN:-www.${DOMAIN}}"
SITE_URL="${SITE_URL:-https://${DOMAIN}}"
APP_REF="${APP_REF:-main}"
REPO_URL="${REPO_URL:-https://github.com/warrzy/Narahservice.git}"
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"

# Port : depuis .env si présent, sinon premier libre
if [[ -f "${APP_ROOT}/shared/.env" ]] && grep -q '^PORT=' "${APP_ROOT}/shared/.env"; then
  APP_PORT="$(grep '^PORT=' "${APP_ROOT}/shared/.env" | cut -d= -f2)"
else
  APP_PORT=""
  for p in 3010 3011 3012 3020 3030 3040; do
    if ! ss -tuln | grep -qE ":${p}\\b"; then
      APP_PORT="$p"
      break
    fi
  done
fi
APP_PORT="${APP_PORT:?Aucun port libre}"

echo "[resume] APP_PORT=${APP_PORT} DOMAIN=${DOMAIN}"

if ! id narah >/dev/null 2>&1; then
  useradd --system --home "${APP_ROOT}" --shell /usr/sbin/nologin narah
fi

mkdir -p "${APP_ROOT}/shared" "${APP_ROOT}/releases" /var/www/certbot
git config --global --add safe.directory "${APP_ROOT}/app" || true

if [[ ! -d "${APP_ROOT}/app/.git" ]]; then
  git clone --branch "${APP_REF}" --depth 1 "${REPO_URL}" "${APP_ROOT}/app"
else
  # Évite « dubious ownership » quand root opère un repo chown narah
  chown -R root:root "${APP_ROOT}/app" || true
  git -C "${APP_ROOT}/app" fetch origin "${APP_REF}"
  git -C "${APP_ROOT}/app" checkout "${APP_REF}"
  git -C "${APP_ROOT}/app" reset --hard "origin/${APP_REF}"
fi

if [[ ! -f "${APP_ROOT}/shared/.env" ]]; then
  cat > "${APP_ROOT}/shared/.env" <<EOF
NODE_ENV=production
NEXT_PUBLIC_SITE_URL=${SITE_URL}
PORT=${APP_PORT}
HOSTNAME=127.0.0.1
EOF
  chmod 640 "${APP_ROOT}/shared/.env"
  chown root:narah "${APP_ROOT}/shared/.env"
else
  sed -i "s|^PORT=.*|PORT=${APP_PORT}|" "${APP_ROOT}/shared/.env" || echo "PORT=${APP_PORT}" >> "${APP_ROOT}/shared/.env"
  if grep -q '^NEXT_PUBLIC_SITE_URL=' "${APP_ROOT}/shared/.env"; then
    sed -i "s|^NEXT_PUBLIC_SITE_URL=.*|NEXT_PUBLIC_SITE_URL=${SITE_URL}|" "${APP_ROOT}/shared/.env"
  else
    echo "NEXT_PUBLIC_SITE_URL=${SITE_URL}" >> "${APP_ROOT}/shared/.env"
  fi
fi

ln -sfn "${APP_ROOT}/shared/.env" "${APP_ROOT}/app/.env.local"

echo "[resume] correction permissions + nettoyage node_modules"
chown narah:narah "${APP_ROOT}"
chown -R narah:narah "${APP_ROOT}/app" "${APP_ROOT}/shared" "${APP_ROOT}/releases"
mkdir -p "${APP_ROOT}/shared/npm-cache"
chown -R narah:narah "${APP_ROOT}/shared/npm-cache"
rm -rf "${APP_ROOT}/app/node_modules" "${APP_ROOT}/.npm" "${APP_ROOT}/app/.next"

echo "[resume] npm ci + build (utilisateur narah)"
sudo -u narah -H bash -lc "
  set -euo pipefail
  cd ${APP_ROOT}/app
  export npm_config_cache=${APP_ROOT}/shared/npm-cache
  npm ci --no-audit --no-fund
  npm run build
"

echo "${APP_PORT}" > /tmp/narah-resume-port
DEPLOY_SHA="$(git -C "${APP_ROOT}/app" rev-parse HEAD)"
echo "${DEPLOY_SHA}" > "${APP_ROOT}/shared/DEPLOYED_SHA"
echo "[resume] build OK sha=${DEPLOY_SHA}"

# Enchaîner le reste via 02 à partir de systemd serait trop long à dupliquer :
# on appelle 02 seulement si demandé, sinon on continue ici.
echo "[resume] systemd + nginx + certbot"

sed -e "s/__APP_PORT__/${APP_PORT}/g" \
  "${SCRIPT_DIR}/narahservice.service.tpl" > /etc/systemd/system/narahservice.service
systemctl daemon-reload
systemctl enable narahservice.service
systemctl restart narahservice.service
sleep 3
systemctl --no-pager --full status narahservice.service | head -30
systemctl is-active --quiet narahservice.service || {
  journalctl -u narahservice -n 50 --no-pager
  exit 1
}

render_nginx() {
  local tpl="$1"
  sed -e "s/__DOMAIN__/${DOMAIN}/g" \
      -e "s/__WWW_DOMAIN__/${WWW_DOMAIN}/g" \
      -e "s/__APP_PORT__/${APP_PORT}/g" \
      "${tpl}" > /etc/nginx/sites-available/narahservice
}

ensure_ssl_includes() {
  if [[ ! -f /etc/letsencrypt/options-ssl-nginx.conf ]]; then
    mkdir -p /etc/letsencrypt
    cat > /etc/letsencrypt/options-ssl-nginx.conf <<'SSL'
ssl_session_cache shared:le_nginx_SSL:10m;
ssl_session_timeout 1440m;
ssl_session_tickets off;
ssl_protocols TLSv1.2 TLSv1.3;
ssl_prefer_server_ciphers off;
SSL
  fi
  if [[ ! -f /etc/letsencrypt/ssl-dhparams.pem ]]; then
    openssl dhparam -out /etc/letsencrypt/ssl-dhparams.pem 2048
  fi
}

BACKUP_DIR="/var/backups/narahservice/$(date +%Y%m%d-%H%M%S)"
mkdir -p "${BACKUP_DIR}"
cp -a /etc/nginx/sites-available "${BACKUP_DIR}/" 2>/dev/null || true
cp -a /etc/nginx/sites-enabled "${BACKUP_DIR}/" 2>/dev/null || true
echo "BACKUP=${BACKUP_DIR}"

if [[ ! -f "/etc/letsencrypt/live/${DOMAIN}/fullchain.pem" ]]; then
  render_nginx "${SCRIPT_DIR}/narahservice.nginx.http-bootstrap.conf.tpl"
else
  ensure_ssl_includes
  render_nginx "${SCRIPT_DIR}/narahservice.nginx.conf.tpl"
fi

ln -sfn /etc/nginx/sites-available/narahservice /etc/nginx/sites-enabled/narahservice
nginx -t
systemctl reload nginx

if [[ ! -f "/etc/letsencrypt/live/${DOMAIN}/fullchain.pem" ]]; then
  certbot certonly --webroot -w /var/www/certbot \
    -d "${DOMAIN}" -d "${WWW_DOMAIN}" \
    --non-interactive --agree-tos --register-unsafely-without-email \
    || certbot --nginx -d "${DOMAIN}" -d "${WWW_DOMAIN}" \
         --non-interactive --agree-tos --register-unsafely-without-email --redirect
  ensure_ssl_includes
  render_nginx "${SCRIPT_DIR}/narahservice.nginx.conf.tpl"
  nginx -t
  systemctl reload nginx
fi

echo "[resume] vérifs"
curl -sI -H "Host: ${DOMAIN}" http://127.0.0.1/ | head -8
curl -s  -H "Host: ${DOMAIN}" http://127.0.0.1/ | head -c 200; echo
curl -sI https://ecom-touch.tech | head -5 || true
bash "${SCRIPT_DIR}/04-smoke-prod.sh" "${DOMAIN}" || true

echo "[resume] OK URL=https://${DOMAIN} PORT=${APP_PORT} SHA=${DEPLOY_SHA}"
