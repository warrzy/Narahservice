#!/usr/bin/env bash
# Mise en production complète NARAH SERVICE — root sur le VPS.
# Corrige : EACCES npm, dubious ownership git, vhost/SSL manquants.
# Ne touche PAS ecom-touch.tech ni les autres sites.
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

echo "=== [1] Backup Nginx ==="
mkdir -p "${BACKUP_DIR}"
cp -a /etc/nginx/sites-available "${BACKUP_DIR}/" 2>/dev/null || true
cp -a /etc/nginx/sites-enabled "${BACKUP_DIR}/" 2>/dev/null || true
echo "BACKUP=${BACKUP_DIR}"

echo "=== [2] Node >= 20 ==="
if ! command -v node >/dev/null || [[ "$(node -v | sed 's/^v//;s/\..*//')" -lt 20 ]]; then
  apt-get update -y
  apt-get install -y ca-certificates curl gnupg
  curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
  apt-get install -y nodejs
fi
apt-get install -y git nginx certbot python3-certbot-nginx curl openssl
node -v

echo "=== [3] Port (conserver le port NARAH existant) ==="
APP_PORT=""
# 1) .env déjà déployé
if [[ -f "${APP_ROOT}/shared/.env" ]] && grep -q '^PORT=' "${APP_ROOT}/shared/.env"; then
  APP_PORT="$(grep '^PORT=' "${APP_ROOT}/shared/.env" | cut -d= -f2 | tr -d '[:space:]')"
fi
# 2) unit systemd existante
if [[ -z "${APP_PORT}" ]] && [[ -f /etc/systemd/system/narahservice.service ]]; then
  APP_PORT="$(grep -oE '127\.0\.0\.1:[0-9]+' /etc/systemd/system/narahservice.service | head -1 | cut -d: -f2 || true)"
fi
# 3) sinon premier port libre (premier déploiement)
if [[ -z "${APP_PORT}" ]]; then
  for p in 3010 3011 3012 3020 3030 3040; do
    if ! ss -tuln | grep -qE ":${p}\\b"; then APP_PORT=$p; break; fi
  done
fi
[[ -n "${APP_PORT}" ]] || { echo "[ABORT] aucun port libre"; exit 1; }
echo "APP_PORT=${APP_PORT}"

echo "=== [4] User narah + répertoires ==="
mkdir -p "${APP_ROOT}/shared" "${APP_ROOT}/releases" /var/www/certbot
if ! id narah >/dev/null 2>&1; then
  useradd --system --home "${APP_ROOT}" --shell /usr/sbin/nologin narah
fi
# Git safe.directory : repo souvent chown narah alors que root exécute les scripts
git config --global --add safe.directory "${APP_ROOT}/app" || true

echo "=== [5] Code source ==="
if [[ ! -d "${APP_ROOT}/app/.git" ]]; then
  rm -rf "${APP_ROOT}/app"
  git clone --branch "${APP_REF}" --depth 1 "${REPO_URL}" "${APP_ROOT}/app"
else
  # Remettre root comme propriétaire le temps des ops git, puis rendre à narah
  chown -R root:root "${APP_ROOT}/app"
  git -C "${APP_ROOT}/app" fetch origin "${APP_REF}"
  git -C "${APP_ROOT}/app" checkout "${APP_REF}"
  git -C "${APP_ROOT}/app" reset --hard "origin/${APP_REF}"
fi
DEPLOY_SHA="$(git -C "${APP_ROOT}/app" rev-parse HEAD)"
echo "SHA=${DEPLOY_SHA}"

echo "=== [6] .env ==="
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
fi
chmod 640 "${APP_ROOT}/shared/.env"
chown root:narah "${APP_ROOT}/shared/.env"
ln -sfn "${APP_ROOT}/shared/.env" "${APP_ROOT}/app/.env.local"
echo "${DEPLOY_SHA}" > "${APP_ROOT}/shared/DEPLOYED_SHA"

echo "=== [7] Permissions npm ==="
chown narah:narah "${APP_ROOT}"
mkdir -p "${APP_ROOT}/shared/npm-cache"
chown -R narah:narah "${APP_ROOT}/app" "${APP_ROOT}/shared" "${APP_ROOT}/releases"
rm -rf "${APP_ROOT}/app/node_modules" "${APP_ROOT}/.npm" "${APP_ROOT}/app/.next"

echo "=== [8] npm ci + build ==="
sudo -u narah -H bash -lc "
  set -euo pipefail
  cd ${APP_ROOT}/app
  export npm_config_cache=${APP_ROOT}/shared/npm-cache
  npm ci --no-audit --no-fund
  npm run build
"
test -d "${APP_ROOT}/app/.next" || { echo "[ABORT] .next absent"; exit 1; }

echo "=== [9] systemd ==="
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
echo "local Next OK"
curl -s "http://127.0.0.1:${APP_PORT}/" | tr '\n' ' ' | grep -oi 'NARAH SERVICE' | head -1

echo "=== [10] Nginx vhost isolé ==="
render_nginx() {
  sed -e "s/__DOMAIN__/${DOMAIN}/g" \
      -e "s/__WWW_DOMAIN__/${WWW_DOMAIN}/g" \
      -e "s/__APP_PORT__/${APP_PORT}/g" \
      "$1" > /etc/nginx/sites-available/narahservice
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
  [[ -f /etc/letsencrypt/ssl-dhparams.pem ]] || openssl dhparam -out /etc/letsencrypt/ssl-dhparams.pem 2048
}

if [[ ! -f "/etc/letsencrypt/live/${DOMAIN}/fullchain.pem" ]]; then
  render_nginx "${SCRIPT_DIR}/narahservice.nginx.http-bootstrap.conf.tpl"
else
  ensure_ssl_includes
  render_nginx "${SCRIPT_DIR}/narahservice.nginx.conf.tpl"
fi
ln -sfn /etc/nginx/sites-available/narahservice /etc/nginx/sites-enabled/narahservice
nginx -t
systemctl reload nginx

echo "=== HTTP Host=${DOMAIN} ==="
curl -sI -H "Host: ${DOMAIN}" http://127.0.0.1/ | head -10
BODY=$(curl -s -H "Host: ${DOMAIN}" http://127.0.0.1/ | head -c 500)
echo "$BODY" | tr '\n' ' ' | grep -qi 'NARAH SERVICE' && echo "HTTP brand OK" || echo "HTTP brand FAIL: $BODY"

echo "=== [11] Let's Encrypt ==="
if [[ ! -f "/etc/letsencrypt/live/${DOMAIN}/fullchain.pem" ]]; then
  certbot certonly --webroot -w /var/www/certbot \
    -d "${DOMAIN}" -d "${WWW_DOMAIN}" \
    --non-interactive --agree-tos --register-unsafely-without-email \
    || certbot certonly --nginx -d "${DOMAIN}" -d "${WWW_DOMAIN}" \
         --non-interactive --agree-tos --register-unsafely-without-email
  ensure_ssl_includes
  render_nginx "${SCRIPT_DIR}/narahservice.nginx.conf.tpl"
  ln -sfn /etc/nginx/sites-available/narahservice /etc/nginx/sites-enabled/narahservice
  for f in /etc/nginx/sites-enabled/${DOMAIN} /etc/nginx/sites-enabled/${DOMAIN}.conf; do
    [[ -e "$f" && ! "$f" -ef /etc/nginx/sites-enabled/narahservice ]] && rm -f "$f"
  done
  nginx -t
  systemctl reload nginx
fi

echo "=== [12] Vérifs finales ==="
echo | openssl s_client -servername "${DOMAIN}" -connect 127.0.0.1:443 2>/dev/null \
  | openssl x509 -noout -subject 2>/dev/null || true
curl -sk https://${DOMAIN}/ | tr '\n' ' ' | grep -oiE 'NARAH SERVICE|ECOM-TOUCH|Welcome to nginx' | head -5
curl -sI https://ecom-touch.tech | head -5
bash "${SCRIPT_DIR}/04-smoke-prod.sh" "${DOMAIN}" || true

echo
echo "=== TERMINÉ ==="
echo "URL=https://${DOMAIN}"
echo "PORT=${APP_PORT}"
echo "SHA=${DEPLOY_SHA}"
echo "BACKUP=${BACKUP_DIR}"
echo "Rollback: bash ${SCRIPT_DIR}/03-rollback-remote.sh ${BACKUP_DIR}"
