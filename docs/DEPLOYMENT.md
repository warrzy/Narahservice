# Déploiement Hostinger VPS — NARAH SERVICE

**Règle absolue :** ne jamais modifier, interrompre, redémarrer ou supprimer une application déjà présente sur le serveur sans validation explicite.

Serveur cible prévu : `srv1392968.hstgr.cloud` (Ubuntu 24.04 LTS, KVM 2).

## 1. Audit préalable (obligatoire)

Se connecter en SSH, puis inventorier l’existant **en lecture seule** :

```bash
# Ports en écoute
ss -tulpn

# Services systemd
systemctl list-units --type=service --state=running

# Processus Node / Nginx / Caddy / Apache
ps aux | egrep 'nginx|caddy|apache|node|pm2|docker' | grep -v egrep

# Conteneurs éventuels
docker ps 2>/dev/null || true
pm2 list 2>/dev/null || true

# Espace disque & mémoire
df -h
free -h
```

Identifier :

1. Le reverse proxy (Nginx, Caddy, Traefik…)
2. Les ports déjà utilisés (80/443 et ports applicatifs)
3. Les répertoires des apps existantes
4. Les ressources disponibles

## 2. Isolation proposée

Répertoire applicatif dédié (exemple) :

```text
/var/www/narahservice/
  ├── app/          # code Next.js (clone git)
  ├── shared/       # .env, logs
  └── releases/     # optionnel (déploiements versionnés)
```

Utilisateur système dédié recommandé : `narah` (sans droits sur les autres apps).

Port applicatif interne dédié, ex. **`3010`** (à confirmer après audit — ne pas écraser un port existant).

## 3. Build & process

Sur le VPS, dans le répertoire isolé :

```bash
git clone https://github.com/warrzy/Narahservice.git app
cd app
cp /var/www/narahservice/shared/.env .env.local
npm ci
npm run build
```

Process manager (PM2) — **nouvelle app uniquement**, sans toucher aux apps existantes :

```bash
pm2 start npm --name narahservice -- start -- -p 3010
pm2 save
```

Ne pas exécuter `pm2 kill`, `pm2 delete all`, ni redémarrer le reverse proxy global sans validation.

## 4. Reverse proxy (domaine ultérieur)

Exemple Nginx (vhost **nouveau**, sans modifier les autres sites) :

```nginx
server {
    listen 80;
    server_name votredomaine.com www.votredomaine.com;

    location / {
        proxy_pass http://127.0.0.1:3010;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

HTTPS (Certbot) une fois le DNS pointé :

```bash
sudo certbot --nginx -d votredomaine.com -d www.votredomaine.com
```

Mettre à jour `NEXT_PUBLIC_SITE_URL` en conséquence, puis rebuild / restart **uniquement** `narahservice`.

## 5. Variables d’environnement

Fichier : `/var/www/narahservice/shared/.env` (hors Git).

Voir `.env.example` à la racine du projet.

Secrets interdits dans Git : mots de passe SMTP, clés API, tokens.

## 6. Checklist avant mise en production

- [ ] Audit ports / services effectué
- [ ] Répertoire isolé créé
- [ ] Port interne libre confirmé
- [ ] `.env` renseigné (WhatsApp, SMTP, URL)
- [ ] Logo officiel intégré
- [ ] Build `npm run build` OK
- [ ] Vhost dédié testé
- [ ] HTTPS activé
- [ ] Formulaire devis testé bout-en-bout
- [ ] Validation explicite du client pour le go-live

## 7. Rollback

```bash
pm2 stop narahservice
# ou revenir à un tag / commit précédent dans le répertoire app
```

Ne jamais supprimer d’autres services pour libérer des ressources sans accord.
