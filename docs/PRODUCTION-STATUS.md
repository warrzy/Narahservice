# Statut production — narahservice.fr

**Date :** 2026-11-21  
**main :** `6919b1c` (bootstrap VPS fusionné, PR #6)

## Diagnostic externe (avant déploiement manuel)

| URL | Résultat |
|---|---|
| `http://narahservice.fr` | Welcome to nginx! (default HTTP) |
| `https://narahservice.fr` | Contenu **ECOM-TOUCH** + cert `CN=ecom-touch.tech` (default SSL) |
| `https://ecom-touch.tech` | 200 OK — ne pas toucher |
| Secrets Cloud `VPS_SSH_*` | ABSENT |

## Action VPS (root)

```bash
rm -rf /tmp/narah-src
git clone --depth 1 --branch main \
  https://github.com/warrzy/Narahservice.git /tmp/narah-src
bash /tmp/narah-src/scripts/deploy/vps-bootstrap-as-root.sh
```

Détails : [`VPS-MANUAL-DEPLOY.md`](./VPS-MANUAL-DEPLOY.md)
