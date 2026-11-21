#!/usr/bin/env bash
# Finalise systemd + Nginx + LE quand le build Next existe déjà.
# Ne touche PAS ecom-touch.tech. Root requis.
set -euo pipefail

if [[ "${EUID}" -ne 0 ]]; then
  echo "[ABORT] root requis" >&2
  exit 1
fi

APP_ROOT="/var/www/narahservice"
DOMAIN="${DOMAIN:-narahservice.fr}"
WWW_DOMAIN="${WWW_DOMAIN:-www.${DOMAIN}}"
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"

echo "=== DIAG ==="
ls -la "${APP_ROOT}/" || true
ls -la "${APP_ROOT}/app/" 2>/dev/null | head -20 || true
test -d "${APP_ROOT}/app/.next" && echo "BUILD=.next PRESENT" || echo "BUILD=.next ABSENT"
test -f "${APP_ROOT}/shared/.env" && grep -E '^(PORT|NEXT_PUBLIC_SITE_URL)=' "${APP_ROOT}/shared/.env" || echo "ENV=ABSENT"
id narah 2>/dev/null || echo "user narah ABSENT"
systemctl is-active narahservice 2>/dev/null || echo "service=absent/inactive"
ls -la /etc/nginx/sites-enabled/ | grep -E 'narah|default|ecom-touch' || true
ss -tuln | grep -E ':(3010|3011|3012|3020|3030|3040)\b' || echo "ports app: aucun"

if [[ ! -d "${APP_ROOT}/app/.next" ]]; then
  echo "[ABORT] Build absent. Lance d'abord :" >&2
  echo "  bash ${SCRIPT_DIR}/05-resume-npm-build.sh" >&2
  exit 2
fi

APP_PORT="$(grep '^PORT=' "${APP_ROOT}/shared/.env" 2>/dev/null | cut -d= -f2 || true)"
if [[ -z "${APP_PORT}" ]]; then
  for p in 3010 3011 3012 3020 3030 3040; do
    if ! ss -tuln | grep -qE ":${p}\\b"; then APP_PORT=$p; break; fi
  done
  echo "PORT=${APP_PORT}" >> "${APP_ROOT}/shared/.env"
fi
echo "APP_PORT=${APP_PORT}"

BACKUP_DIR="/var/backups/narahservice/$(date +%Y%m%d-%H%M%S)"
mkdir -p "${BACKUP_DIR}"
cp -a /etc/nginx/sites-available "${BACKUP_DIR}/" 2>/dev/null || true
cp -a /etc/nginx/sites-enabled "${BACKUP_DIR}/" 2>/dev/null || true
echo "BACKUP=${BACKUP_DIR}"

# systemd
sed -e "s/__APP_PORT__/${APP_PORT}/g" \
  "${SCRIPT_DIR}/narahservice.service.tpl" > /etc/systemd/system/narahservice.service
systemctl daemon-reload
systemctl enable narahservice.service
systemctl restart narahservice.service
sleep 3
systemctl --no-pager --full status narahservice.service | head -30
systemctl is-active --quiet narahservice.service || {
  journalctl -u narahservice -n 60 --no-pager
  exit 1
}

# Vérifier que Next répond en local
curl -sf -o /dev/null "http://127.0.0.1:${APP_PORT}/" || {
  echo "[ABORT] Next ne répond pas sur 127.0.0.1:${APP_PORT}" >&2
  journalctl -u narahservice -n 40 --no-pager
  exit 1
}
curl -s "http://127.0.0.1:${APP_PORT}/" | head -c 200; echo

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
  if [[ ! -f /etc/letsencrypt/ssl-dhparams.pem ]]; then
    openssl dhparam -out /etc/letsencrypt/ssl-dhparams.pem 2048
  fi
}

mkdir -p /var/www/certbot

# Toujours commencer en HTTP bootstrap pour ACME si pas de cert NARAH
if [[ ! -f "/etc/letsencrypt/live/${DOMAIN}/fullchain.pem" ]]; then
  render_nginx "${SCRIPT_DIR}/narahservice.nginx.http-bootstrap.conf.tpl"
else
  ensure_ssl_includes
  render_nginx "${SCRIPT_DIR}/narahservice.nginx.conf.tpl"
fi

ln -sfn /etc/nginx/sites-available/narahservice /etc/nginx/sites-enabled/narahservice

# Important : ne pas toucher ecom-touch-public.conf / default (sauf vérifier conflits)
if grep -R --include='*.conf' -n "server_name.*${DOMAIN}" /etc/nginx/sites-enabled/ 2>/dev/null \
  | grep -v 'sites-enabled/narahservice'; then
  echo "[WARN] autre fichier mentionne ${DOMAIN}"
fi

nginx -t
systemctl reload nginx

echo "=== HTTP local Host=${DOMAIN} ==="
curl -sI -H "Host: ${DOMAIN}" http://127.0.0.1/ | head -12
curl -s  -H "Host: ${DOMAIN}" http://127.0.0.1/ | tr '\n' ' ' | grep -oiE 'NARAH SERVICE|ECOM-TOUCH|Welcome' | head -5

if [[ ! -f "/etc/letsencrypt/live/${DOMAIN}/fullchain.pem" ]]; then
  echo "=== Certbot LE pour ${DOMAIN} + ${WWW_DOMAIN} ==="
  # webroot d'abord (ne modifie pas les autres vhosts)
  certbot certonly --webroot -w /var/www/certbot \
    -d "${DOMAIN}" -d "${WWW_DOMAIN}" \
    --non-interactive --agree-tos --register-unsafely-without-email \
    || certbot certonly --nginx \
         -d "${DOMAIN}" -d "${WWW_DOMAIN}" \
         --non-interactive --agree-tos --register-unsafely-without-email
  ensure_ssl_includes
  render_nginx "${SCRIPT_DIR}/narahservice.nginx.conf.tpl"
  ln -sfn /etc/nginx/sites-available/narahservice /etc/nginx/sites-enabled/narahservice
  # retirer éventuels liens parasites créés par certbot pour ce domaine
  for f in /etc/nginx/sites-enabled/${DOMAIN} /etc/nginx/sites-enabled/${DOMAIN}.conf; do
    if [[ -e "$f" && ! "$f" -ef /etc/nginx/sites-enabled/narahservice ]]; then
      rm -f "$f"
    fi
  done
  nginx -t
  systemctl reload nginx
fi

echo "=== CERT subject ==="
echo | openssl s_client -servername "${DOMAIN}" -connect 127.0.0.1:443 2>/dev/null \
  | openssl x509 -noout -subject 2>/dev/null || true

echo "=== ecom-touch intact ==="
curl -sI https://ecom-touch.tech | head -5

echo "=== smoke ==="
bash "${SCRIPT_DIR}/04-smoke-prod.sh" "${DOMAIN}" || true

echo
echo "OK si marque NARAH + cert CN=${DOMAIN}"
echo "BACKUP=${BACKUP_DIR}"
