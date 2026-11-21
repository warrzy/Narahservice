# Déploiement manuel sur VPS Hostinger (root)

**Contexte :** les secrets SSH Cloud Agent sont absents → déploiement depuis le terminal VPS.  
**Symptôme actuel :** `http://narahservice.fr` → page « Welcome to nginx! » (vhost `default`, aucune app NARAH).

Ne modifie **pas** ecom-touch.tech ni les autres vhosts.

---

## Option A — Deux commandes (recommandée, immédiatement)

Connecté en **root** sur le VPS (`ssh root@147.79.118.212`) :

```bash
git clone --depth 1 --branch cursor/vps-manual-deploy-dcdc \
  https://github.com/warrzy/Narahservice.git /tmp/narah-src
bash /tmp/narah-src/scripts/deploy/vps-bootstrap-as-root.sh
```

Après merge dans `main` :

```bash
git clone --depth 1 --branch main \
  https://github.com/warrzy/Narahservice.git /tmp/narah-src
bash /tmp/narah-src/scripts/deploy/vps-bootstrap-as-root.sh
```

Le script : audit → backup Nginx → Node 20 → clone app `main` → build → systemd `narahservice` → vhost isolé → Let’s Encrypt → vérifs.

---

## Option B — Commandes pas à pas

### 0) Audit + backup

```bash
ss -tuln
ls -la /etc/nginx/sites-enabled/
systemctl list-units --type=service --state=running --no-pager | head -40
curl -sI https://ecom-touch.tech | head -5

BACKUP="/var/backups/narahservice/$(date +%Y%m%d-%H%M%S)"
mkdir -p "$BACKUP"
cp -a /etc/nginx/sites-available "$BACKUP/"
cp -a /etc/nginx/sites-enabled "$BACKUP/"
cp -a /etc/nginx/nginx.conf "$BACKUP/"
echo "BACKUP=$BACKUP"
```

### 1) Node 20 + outils

```bash
apt-get update -y
apt-get install -y ca-certificates curl gnupg git nginx certbot python3-certbot-nginx
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt-get install -y nodejs
node -v   # >= v20
```

### 2) Port libre

```bash
APP_PORT=3010
for p in 3010 3011 3012 3020 3030 3040; do
  ss -tuln | grep -qE ":$p\b" || { APP_PORT=$p; break; }
done
echo "APP_PORT=$APP_PORT"
```

### 3) Scripts + déploiement

```bash
rm -rf /tmp/narah-deploy
git clone --depth 1 --branch main https://github.com/warrzy/Narahservice.git /tmp/narah-src
cp -a /tmp/narah-src/scripts/deploy /tmp/narah-deploy
chmod +x /tmp/narah-deploy/*.sh

DOMAIN=narahservice.fr \
WWW_DOMAIN=www.narahservice.fr \
APP_PORT="$APP_PORT" \
APP_REF=main \
SITE_URL=https://narahservice.fr \
bash /tmp/narah-deploy/02-deploy-remote.sh
```

### 4) Vérifications

```bash
systemctl status narahservice --no-pager | head -25
nginx -t
ls -la /etc/nginx/sites-enabled/
curl -sI -H 'Host: narahservice.fr' http://127.0.0.1/ | head -10
curl -s  -H 'Host: narahservice.fr' http://127.0.0.1/ | head -c 300; echo
curl -sI https://narahservice.fr | head -15
curl -sI https://www.narahservice.fr | head -15
curl -sI https://ecom-touch.tech | head -5
certbot certificates | sed -n '/narahservice/,/^$/p'
bash /tmp/narah-deploy/04-smoke-prod.sh narahservice.fr
```

Attendu : HTML contenant **NARAH SERVICE**, plus la page Welcome nginx.

### 5) Rollback (si besoin)

```bash
bash /tmp/narah-deploy/03-rollback-remote.sh "$BACKUP"
# Restaure uniquement le retrait du vhost narahservice + arrêt du service.
# ecom-touch.tech n’est pas modifié.
```

---

## Pourquoi « Welcome to nginx! » ?

Le site `default` répond quand **aucun** `server_name` ne correspond au Host.  
Après déploiement, le fichier `/etc/nginx/sites-enabled/narahservice` déclare `server_name narahservice.fr www.narahservice.fr` et proxifie vers Next.js (`127.0.0.1:$APP_PORT`). Le site `default` peut rester (non détruit).
