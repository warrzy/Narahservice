# Go-live production — checklist

## Prérequis (bloquants)

1. **Domaine exact** renseigné (pas un placeholder)
2. DNS A (et www) → `147.79.118.212`
3. Accès SSH VPS (clé ou mot de passe) via secrets
4. PR #1 fusionnée dans `main`

## Secrets attendus

| Nom | Usage |
|---|---|
| `NARAH_DOMAIN` | Domaine de production |
| `VPS_SSH_HOST` | Défaut possible : `147.79.118.212` |
| `VPS_SSH_USER` | Ex. `root` |
| `VPS_SSH_PRIVATE_KEY` **ou** `VPS_SSH_PASSWORD` | Auth SSH |
| SMTP_* / MAIL_* | Optionnel pour devis |
| WhatsApp | Via `NEXT_PUBLIC_WHATSAPP_NUMBER` dans `.env` serveur |

## Isolation

- Répertoire : `/var/www/narahservice/`
- Service systemd : `narahservice` (port interne libre, ex. 3010)
- Vhost Nginx : `sites-available/narahservice` uniquement
- **Ne pas** modifier le vhost `ecom-touch.tech`

## Commande

```bash
export NARAH_DOMAIN=...
export VPS_SSH_USER=...
# + clé ou mot de passe
bash scripts/deploy/run-from-agent.sh
```

## Rollback

```bash
# Sur le VPS
bash /tmp/narah-deploy/03-rollback-remote.sh /var/backups/narahservice/<timestamp>
```

Retire le vhost NARAH et arrête le service, sans toucher aux autres sites.
