#!/usr/bin/env bash
# Déploiement isolé NARAH SERVICE sur VPS Hostinger.
# Prérequis : DOMAIN, APP_PORT libres, Node.js, Nginx, Certbot.
# Ne touche PAS aux autres vhosts / apps (ecom-touch.tech inclus).
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

if ! command -v node >/dev/null || [[ "$(node -v | sed 's/^v//;s/\..*//')" -lt 20 ]]; then
  echo "[ERROR] Node.js >= 20 requis. Lancez d'abord vps-bootstrap-as-root.sh" >&2
  exit 1
fi

# --- Safety: refuse overwriting foreign nginx sites ---
if [[ -e /etc/nginx/sites-enabled/${DOMAIN} ]] || [[ -e /etc/nginx/sites-available/${DOMAIN} ]]; then
  echo "[WARN] Un vhost nommé ${DOMAIN} existe déjà — sauvegarde avant écrasement contrôlé du seul fichier narahservice."
fi

# Signaler les server_name déjà déclarés pour ce domaine (hors notre futur fichier)
if grep -R --include='*' -n "server_name.*${DOMAIN}" /etc/nginx/sites-enabled/ 2>/dev/null \
  | grep -v "/narahservice:" | grep -v "sites-enabled/narahservice"; then
  echo "[WARN] Autre vhost mentionne déjà ${DOMAIN} — vérifier manuellement (conflit possible)."
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

# Clone / update code (safe.directory si repo déjà chown narah)
git config --global --add safe.directory "${APP_ROOT}/app" || true
if [[ ! -d "${APP_ROOT}/app/.git" ]]; then
  git clone --branch "${APP_REF}" --depth 1 "${REPO_URL}" "${APP_ROOT}/app"
else
  chown -R root:root "${APP_ROOT}/app" || true
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
  if grep -q '^PORT=' "${APP_ROOT}/shared/.env"; then
    sed -i "s|^PORT=.*|PORT=${APP_PORT}|" "${APP_ROOT}/shared/.env"
  else
    echo "PORT=${APP_PORT}" >> "${APP_ROOT}/shared/.env"
  fi
fi

ln -sfn "${APP_ROOT}/shared/.env" "${APP_ROOT}/app/.env.local"

# HOME de narah = APP_ROOT : il doit pouvoir créer .npm / écrire le cache.
# Sans cela → EACCES sur /var/www/narahservice/.npm + TAR_ENTRY_ERROR.
chown narah:narah "${APP_ROOT}"
chown -R narah:narah "${APP_ROOT}/app" "${APP_ROOT}/shared" "${APP_ROOT}/releases"
mkdir -p "${APP_ROOT}/shared/npm-cache"
chown -R narah:narah "${APP_ROOT}/shared/npm-cache"
# Nettoyer une install partielle éventuelle
rm -rf "${APP_ROOT}/app/node_modules" "${APP_ROOT}/.npm"
rm -f "${APP_ROOT}/app/package-lock.json.bak" 2>/dev/null || true

# Build as narah user (cache dédié, writable)
sudo -u narah -H bash -lc "
  set -euo pipefail
  cd ${APP_ROOT}/app
  export npm_config_cache=${APP_ROOT}/shared/npm-cache
  export npm_config_prefer_offline=false
  npm ci --no-audit --no-fund
  npm run build
"

# systemd unit
sed -e "s/__APP_PORT__/${APP_PORT}/g" \
  "${SCRIPT_DIR}/narahservice.service.tpl" > /etc/systemd/system/narahservice.service
systemctl daemon-reload
systemctl enable narahservice.service
systemctl restart narahservice.service
sleep 3
if ! systemctl is-active --quiet narahservice.service; then
  echo "[ERROR] Service narahservice inactif." >&2
  journalctl -u narahservice -n 40 --no-pager >&2 || true
  exit 1
fi
systemctl --no-pager --full status narahservice.service | head -30

# Nginx : bootstrap HTTP si pas encore de certificat, sinon conf HTTPS complète
# Fichier dédié `narahservice` uniquement — ne pas toucher default / ecom-touch.
render_nginx() {
  local tpl="$1"
  sed -e "s/__DOMAIN__/${DOMAIN}/g" \
      -e "s/__WWW_DOMAIN__/${WWW_DOMAIN}/g" \
      -e "s/__APP_PORT__/${APP_PORT}/g" \
      "${tpl}" > /etc/nginx/sites-available/narahservice
}

ensure_ssl_includes() {
  # Fichiers souvent créés par certbot ; fallback minimal si absents
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

if [[ ! -f "/etc/letsencrypt/live/${DOMAIN}/fullchain.pem" ]]; then
  render_nginx "${SCRIPT_DIR}/narahservice.nginx.http-bootstrap.conf.tpl"
else
  ensure_ssl_includes
  render_nginx "${SCRIPT_DIR}/narahservice.nginx.conf.tpl"
fi

ln -sfn /etc/nginx/sites-available/narahservice /etc/nginx/sites-enabled/narahservice

# La page « Welcome to nginx! » vient du site `default` (default_server).
# On NE le supprime pas (autres usages éventuels) : notre server_name doit matcher le Host.
# Si un fichier default contient aussi server_name narahservice.fr, on le signale.
if [[ -e /etc/nginx/sites-enabled/default ]]; then
  if grep -E "server_name.*${DOMAIN}" /etc/nginx/sites-enabled/default >/dev/null 2>&1; then
    echo "[WARN] sites-enabled/default contient server_name ${DOMAIN} — conflit potentiel."
  else
    echo "[deploy] sites-enabled/default présent (Welcome page) — OK tant que Host=${DOMAIN} match notre vhost."
  fi
fi

nginx -t
systemctl reload nginx

# Certbot — certificat dédié NARAH uniquement (ne demande pas d'autres domaines)
if [[ ! -f "/etc/letsencrypt/live/${DOMAIN}/fullchain.pem" ]]; then
  certbot certonly --webroot -w /var/www/certbot \
    -d "${DOMAIN}" -d "${WWW_DOMAIN}" \
    --non-interactive --agree-tos --register-unsafely-without-email \
    || certbot --nginx -d "${DOMAIN}" -d "${WWW_DOMAIN}" \
         --non-interactive --agree-tos --register-unsafely-without-email --redirect
  ensure_ssl_includes
  render_nginx "${SCRIPT_DIR}/narahservice.nginx.conf.tpl"
  # Retirer d'éventuels vhosts auto-générés par certbot pour ce domaine (garder le nôtre)
  for f in /etc/nginx/sites-enabled/${DOMAIN} /etc/nginx/sites-enabled/${DOMAIN}.conf; do
    if [[ -e "$f" && ! "$f" -ef /etc/nginx/sites-enabled/narahservice ]]; then
      echo "[deploy] retrait lien certbot parasite: $f"
      rm -f "$f"
    fi
  done
  nginx -t
  systemctl reload nginx
fi

echo "[deploy] OK"
echo "URL=https://${DOMAIN}"
echo "SHA=${DEPLOY_SHA}"
echo "BACKUP=${BACKUP_DIR}"
echo "SERVICE=narahservice"
echo "PORT=${APP_PORT}"
