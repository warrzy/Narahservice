#!/usr/bin/env bash
# Audit lecture seule du VPS — n'altère rien.
set -euo pipefail

echo "=== HOST ==="
hostnamectl 2>/dev/null || hostname
uname -a
echo
echo "=== DISK / MEM ==="
df -h /
free -h
echo
echo "=== LISTENING PORTS ==="
ss -tulpn | sed -n '1,80p'
echo
echo "=== RUNNING SERVICES (sample) ==="
systemctl list-units --type=service --state=running --no-pager | head -60
echo
echo "=== NGINX ==="
nginx -v 2>&1 || true
ls -la /etc/nginx/sites-enabled/ 2>/dev/null || true
ls -la /etc/nginx/conf.d/ 2>/dev/null || true
echo
echo "=== NODE / PM2 / DOCKER ==="
node -v 2>/dev/null || echo "node: absent"
npm -v 2>/dev/null || echo "npm: absent"
command -v pm2 >/dev/null && pm2 list || echo "pm2: absent"
command -v docker >/dev/null && docker ps --format 'table {{.Names}}\t{{.Ports}}\t{{.Status}}' || echo "docker: absent"
echo
echo "=== WEB ROOTS ==="
ls -la /var/www 2>/dev/null || true
ls -la /opt 2>/dev/null | head -40
echo
echo "=== CERTBOT ==="
command -v certbot >/dev/null && certbot certificates 2>/dev/null | head -40 || echo "certbot: absent"
echo
echo "=== DONE AUDIT ==="
