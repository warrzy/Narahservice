# Statut production — narahservice.fr

**Date :** 2026-11-21  
**Commit `main` :** `9812505` (merge PR #4 — support SSH passphrase / ssh-agent)

## PR #4

| Champ | Valeur |
|---|---|
| État | **MERGED** |
| Merge | `9812505db0ecc43edade1e0906069c85e1231a63` |
| URL | https://github.com/warrzy/Narahservice/pull/4 |

## Secrets Cloud Agent (sans valeurs)

Vérifié dans cet agent **et** dans un sous-agent `new_cloud_vm` (même environmentId) :

| Variable | État |
|---|---|
| `VPS_SSH_HOST` | ABSENT |
| `VPS_SSH_USER` | ABSENT |
| `VPS_SSH_PORT` | ABSENT |
| `VPS_SSH_PRIVATE_KEY` | ABSENT |
| `VPS_SSH_PASSPHRASE` | ABSENT (OK si clé non chiffrée) |

**Conséquence :** `scripts/deploy/run-from-agent.sh` n’a pas pu être exécuté. Aucune modification VPS.

Les secrets « App » (`bind-app-secrets`) sont distincts et **vides** côté plateforme ; le déploiement SSH exige des **Runtime Secrets d’environnement**.

Environnement cible :  
https://cursor.com/dashboard/cloud-agents/environments/e/074c956f-e59c-11f1-8a40-564e3474c41f

## DNS (prérequis OK)

| Contrôle | Résultat |
|---|---|
| `narahservice.fr` A | `147.79.118.212` |
| `www.narahservice.fr` | CNAME → `narahservice.fr` → `147.79.118.212` |
| MX | `10 mail.narahservice.fr.` (intact) |
| `https://ecom-touch.tech` | HTTP **200** |

## Déploiement

| Étape | État |
|---|---|
| Audit VPS | Non exécuté (SSH bloqué) |
| `/var/www/narahservice` | Non créé |
| systemd `narahservice` | Non installé |
| Nginx vhost | Non installé |
| Let’s Encrypt | Non demandé |
| Smoke HTTPS | Non exécuté |

## Suite

1. Enregistrer les 4 secrets Runtime sur l’environnement ci-dessus (clé agent dédiée).
2. Relancer un agent / follow-up avec : `bash scripts/deploy/run-from-agent.sh`
3. Vérifier HTTPS + ecom-touch intact.
