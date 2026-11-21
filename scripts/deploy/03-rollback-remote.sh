#!/usr/bin/env bash
# Rollback NARAH SERVICE uniquement — ne touche pas aux autres sites.
set -euo pipefail

APP_ROOT="/var/www/narahservice"
BACKUP_ROOT="${1:-}"

echo "[rollback] arrêt service narahservice"
systemctl stop narahservice.service || true
systemctl disable narahservice.service || true

echo "[rollback] retrait vhost narahservice (sites-enabled)"
rm -f /etc/nginx/sites-enabled/narahservice
# Conserve sites-available + backups pour analyse
nginx -t
systemctl reload nginx

if [[ -n "${BACKUP_ROOT}" && -d "${BACKUP_ROOT}/sites-enabled" ]]; then
  echo "[rollback] restauration optionnelle sites-enabled depuis ${BACKUP_ROOT}"
  echo "  (manuelle : comparer avant copie — non automatique pour éviter d'écraser d'autres sites)"
fi

echo "[rollback] code conservé dans ${APP_ROOT} (non supprimé)"
echo "[rollback] pour revenir à un commit :"
echo "  git -C ${APP_ROOT}/app checkout <sha> && systemctl start narahservice"
echo "[rollback] OK — ecom-touch.tech et autres vhosts non modifiés par ce script"
