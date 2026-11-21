# Statut production — narahservice.fr

**Date :** 2026-11-21  
**Commit `main` code site :** `9812505` (+ PR bootstrap manuel en cours)

## Diagnostic actuel (externe)

| Contrôle | Résultat |
|---|---|
| DNS A `narahservice.fr` | `147.79.118.212` |
| HTTP `http://narahservice.fr` | **200** — page **Welcome to nginx!** (vhost `default`) |
| HTTPS ecom-touch.tech | **200** (intact) |
| Secrets Cloud Agent `VPS_SSH_*` | **ABSENT** (agent + sous-agent) |

**Cause :** aucun vhost/app NARAH déployé. Nginx répond avec le site par défaut.

## Action

Déploiement **manuel root** : voir [`docs/VPS-MANUAL-DEPLOY.md`](./VPS-MANUAL-DEPLOY.md)

```bash
git clone --depth 1 --branch cursor/vps-manual-deploy-dcdc \
  https://github.com/warrzy/Narahservice.git /tmp/narah-src
bash /tmp/narah-src/scripts/deploy/vps-bootstrap-as-root.sh
```

## Après succès attendu

- `/var/www/narahservice/app` + build Next.js
- `systemctl is-active narahservice` → active
- `/etc/nginx/sites-enabled/narahservice`
- LE `narahservice.fr` + `www`
- HTML contient « NARAH SERVICE »
- ecom-touch.tech toujours 200
