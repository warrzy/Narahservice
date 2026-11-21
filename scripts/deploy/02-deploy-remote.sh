#!/usr/bin/env bash
# Déploiement isolé NARAH SERVICE sur VPS Hostinger.
# Prérequis : DOMAIN, APP_PORT libres, Node.js, Nginx, Certbot.
# Ne touche PAS aux autres vhosts / apps.
set -euo pipefail

DOMAIN="${DOMAIN:?DOMAIN requis}"
WWW_DOMAIN="${WWW_DOMAIN:-www.${DOMAIN}}"
APP_PORT="${APP_PORT:?APP_PORT requis}"
REPO_URL="${REPO_URL:-https://github.com/warrzy/Narahservice.git}"
APP_REF="${APP_REF:-main}"
SITE_URL="${SITE_URL:-https://${DOMAIN}}"
APP_ROOT="/var/www/narahservice"
BACKUP_DIR="/var/backups/narahservice/$(date +%Y%m%d-%H%M%S)"
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"

echo "[deploy] domain=${DOMAIN} port=${APP_PORT} ref=${APP_REF}"

# --- Safety: refuse occupied port ---
if ss -tuln | grep -qE ":${APP_PORT}\\b"; then
  echo "[ERROR] Port ${APP_PORT} déjà occupé. Abandon." >&2
  exit 1
fi

# --- Safety: refuse overwriting foreign nginx sites ---
if [[ -e /etc/nginx/sites-enabled/${DOMAIN} ]] || [[ -e /etc/nginx/sites-available/${DOMAIN} ]]; then
  echo "[WARN] Un vhost ${DOMAIN} existe déjà — sauvegarde avant écrasement contrôlé."
fi

mkdir -p "${BACKUP_DIR}"
mkdir -p /var/www/certbot
mkdir -p "${APP_ROOT}/shared" "${APP_ROOT}/releases"

# Backup nginx configs concerned
if [[ -d /etc/nginx ]]; then
  cp -a /etc/nginx/sites-available "${BACKUP_DIR}/sites-available" 2>/dev/null || true
  cp -a /etc/nginx/sites-enabled "${BACKUP_DIR}/sites-enabled" 2>/dev/null || true
  cp -a /etc/nginx/nginx.conf "${BACKUP_DIR}/nginx.conf" 2>/dev/null || true
  echo "[deploy] backup nginx -> ${BACKUP_DIR}"
fi

# User dédié
if ! id narah >/dev/null 2>&1; then
  useradd --system --home "${APP_ROOT}" --shell /usr/sbin/nologin narah
fi

# Clone / update code
if [[ ! -d "${APP_ROOT}/app/.git" ]]; then
  git clone --branch "${APP_REF}" --depth 1 "${REPO_URL}" "${APP_ROOT}/app"
else
  git -C "${APP_ROOT}/app" fetch origin "${APP_REF}"
  git -C "${APP_ROOT}/app" checkout "${APP_REF}"
  git -C "${APP_ROOT}/app" reset --hard "origin/${APP_REF}"
fi

DEPLOY_SHA="$(git -C "${APP_ROOT}/app" rev-parse HEAD)"
echo "[deploy] commit=${DEPLOY_SHA}"
echo "${DEPLOY_SHA}" > "${APP_ROOT}/shared/DEPLOYED_SHA"

# Env (ne pas journaliser)
if [[ ! -f "${APP_ROOT}/shared/.env" ]]; then
  cat > "${APP_ROOT}/shared/.env" <<EOF
NODE_ENV=production
NEXT_PUBLIC_SITE_URL=${SITE_URL}
PORT=${APP_PORT}
HOSTNAME=127.0.0.1
EOF
  chmod 640 "${APP_ROOT}/shared/.env"
  chown root:narah "${APP_ROOT}/shared/.env"
  echo "[deploy] .env créé (SMTP/WhatsApp à compléter si besoin)"
else
  # Mettre à jour l'URL publique sans toucher aux autres secrets
  if grep -q '^NEXT_PUBLIC_SITE_URL=' "${APP_ROOT}/shared/.env"; then
    sed -i "s|^NEXT_PUBLIC_SITE_URL=.*|NEXT_PUBLIC_SITE_URL=${SITE_URL}|" "${APP_ROOT}/shared/.env"
  else
    echo "NEXT_PUBLIC_SITE_URL=${SITE_URL}" >> "${APP_ROOT}/shared/.env"
  fi
fi

ln -sfn "${APP_ROOT}/shared/.env" "${APP_ROOT}/app/.env.local"
chown -R narah:narah "${APP_ROOT}/app" "${APP_ROOT}/shared" "${APP_ROOT}/releases"

# Build as narah user
sudo -u narah -H bash -lc "cd ${APP_ROOT}/app && npm ci && npm run build"

# systemd unit
sed -e "s/__APP_PORT__/${APP_PORT}/g" \
  "${SCRIPT_DIR}/narahservice.service.tpl" > /etc/systemd/system/narahservice.service
systemctl daemon-reload
systemctl enable narahservice.service
systemctl restart narahservice.service
sleep 2
systemctl --no-pager --full status narahservice.service | head -30

# Nginx : bootstrap HTTP si pas encore de certificat, sinon conf HTTPS complète
render_nginx() {
  local tpl="$1"
  sed -e "s/__DOMAIN__/${DOMAIN}/g" \
      -e "s/__WWW_DOMAIN__/${WWW_DOMAIN}/g" \
      -e "s/__APP_PORT__/${APP_PORT}/g" \
      "${tpl}" > /etc/nginx/sites-available/narahservice
}

if [[ ! -f "/etc/letsencrypt/live/${DOMAIN}/fullchain.pem" ]]; then
  render_nginx "${SCRIPT_DIR}/narahservice.nginx.http-bootstrap.conf.tpl"
else
  render_nginx "${SCRIPT_DIR}/narahservice.nginx.conf.tpl"
fi

ln -sfn /etc/nginx/sites-available/narahservice /etc/nginx/sites-enabled/narahservice
nginx -t
systemctl reload nginx

# Certbot — certificat dédié NARAH uniquement
if [[ ! -f "/etc/letsencrypt/live/${DOMAIN}/fullchain.pem" ]]; then
  certbot --nginx -d "${DOMAIN}" -d "${WWW_DOMAIN}" --non-interactive --agree-tos --register-unsafely-without-email --redirect \
    || certbot certonly --webroot -w /var/www/certbot -d "${DOMAIN}" -d "${WWW_DOMAIN}" --non-interactive --agree-tos --register-unsafely-without-email
  render_nginx "${SCRIPT_DIR}/narahservice.nginx.conf.tpl"
  # Si certbot a déjà écrit un vhost, on garde le nôtre isolé nommé narahservice
  nginx -t
  systemctl reload nginx
fi

echo "[deploy] OK"
echo "URL=https://${DOMAIN}"
echo "SHA=${DEPLOY_SHA}"
echo "BACKUP=${BACKUP_DIR}"
echo "SERVICE=narahservice"
echo "PORT=${APP_PORT}"
