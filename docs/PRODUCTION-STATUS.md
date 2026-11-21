# Statut production — narahservice.fr

**Date :** 2026-11-21  
**Statut :** **EN LIGNE**

| Élément | Valeur |
|---|---|
| URL | https://narahservice.fr |
| WWW | https://www.narahservice.fr |
| Commit déployé | `0924ebc` |
| Port app | `3011` |
| Service | `narahservice` (systemd) active |
| Vhost | `/etc/nginx/sites-enabled/narahservice` |
| Certificat | LE `CN=narahservice.fr` (+ SAN www) |
| Backup | `/var/backups/narahservice/20261121-134631` |

## Vérifications externes (post-déploiement)

| Contrôle | Résultat |
|---|---|
| HTTPS `/` | 200 — titre **NARAH SERVICE** |
| `/a-propos` `/materiaux` `/realisations` `/contact` | 200 |
| HTTP → HTTPS | 301 |
| Certificat SAN | `narahservice.fr`, `www.narahservice.fr` |
| API `/api/devis` | 503 (SMTP non configuré — attendu) |
| WhatsApp | inactif tant que non configuré |
| `https://ecom-touch.tech` | 200 intact |

## Rollback

```bash
bash /tmp/narah-src/scripts/deploy/03-rollback-remote.sh /var/backups/narahservice/20261121-134631
```
