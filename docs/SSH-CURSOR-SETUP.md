# Accès SSH pour Cursor Cloud Agent (NARAH SERVICE)

## Verdict

| Méthode | Support scripts | Recommandé |
|---|---|---|
| Clé **sans** passphrase (dédiée automatisation) | Oui | **Oui** |
| Clé **avec** passphrase + `VPS_SSH_PASSPHRASE` (ssh-agent) | Oui (ajouté) | Possible, moins idéal |
| Mot de passe compte root (`VPS_SSH_PASSWORD`) | Oui (sshpass) | Non préféré |

**Important :** coller uniquement une clé chiffrée (`VPS_SSH_PRIVATE_KEY`) **sans** `VPS_SSH_PASSPHRASE` fera échouer `ssh` en mode non interactif (`BatchMode`).

---

## Option A — Recommandée : clé d’automatisation dédiée (sans toucher à votre clé perso)

Votre clé Windows `id_ed25519` (avec phrase secrète) reste intacte.  
On **ajoute** une 2ᵉ clé publique dans `authorized_keys` (complément, pas remplacement).

### Sur Windows (PowerShell)

```powershell
# 1) Créer une clé DÉDIÉE agent, SANS passphrase
ssh-keygen -t ed25519 -f "$env:USERPROFILE\.ssh\cursor_narah_ed25519" -N '""' -C "cursor-cloud-narahservice"

# 2) Afficher la publique (à coller sur le VPS)
Get-Content "$env:USERPROFILE\.ssh\cursor_narah_ed25519.pub"

# 3) Tester plus tard après ajout serveur
ssh -i "$env:USERPROFILE\.ssh\cursor_narah_ed25519" -o IdentitiesOnly=yes -o BatchMode=yes root@147.79.118.212 "whoami; hostname"
```

### Sur le VPS (en tant que root, via votre accès déjà validé)

```bash
umask 077
mkdir -p ~/.ssh
chmod 700 ~/.ssh
# AJOUT (append) — ne remplace pas les clés existantes
echo 'COLLER_ICI_LA_LIGNE_PUBLIQUE_cursor_narah_ed25519.pub' >> ~/.ssh/authorized_keys
chmod 600 ~/.ssh/authorized_keys
# Vérifier sans rien supprimer
wc -l ~/.ssh/authorized_keys
ssh-keygen -lf ~/.ssh/authorized_keys
```

### Secrets Cursor (Runtime pour la privée)

| Nom | Type | Valeur |
|---|---|---|
| `VPS_SSH_HOST` | Environment Variable | `147.79.118.212` |
| `VPS_SSH_USER` | Environment Variable | `root` |
| `VPS_SSH_PORT` | Environment Variable | `22` |
| `VPS_SSH_PRIVATE_KEY` | **Runtime Secret** | contenu de `cursor_narah_ed25519` (fichier **privé**) |
| `NARAH_DOMAIN` | Environment Variable | `narahservice.fr` (optionnel, défaut script) |

**Ne pas** définir `VPS_SSH_PASSPHRASE` pour cette option.

---

## Option B — Réutiliser votre clé personnelle chiffrée

Possible via `ssh-agent` + `SSH_ASKPASS`, mais la passphrase devient un 2ᵉ secret Runtime.

| Nom | Type |
|---|---|
| `VPS_SSH_HOST` | Environment Variable = `147.79.118.212` |
| `VPS_SSH_USER` | Environment Variable = `root` |
| `VPS_SSH_PORT` | Environment Variable = `22` |
| `VPS_SSH_PRIVATE_KEY` | **Runtime Secret** = contenu de `C:\Users\LENOVO-L490\.ssh\id_ed25519` |
| `VPS_SSH_PASSPHRASE` | **Runtime Secret** = phrase secrète de cette clé |

Inconvénients : la passphrase circule dans l’environnement agent ; moins adapté à l’automatisation longue durée.

---

## Où configurer dans Cursor

1. https://cursor.com/dashboard?tab=cloud-agents  
2. **Environments** → environnement du repo `Narahservice`  
3. Onglet **Secrets**  
4. Créer les variables ci-dessus (`VPS_SSH_PRIVATE_KEY` / `VPS_SSH_PASSPHRASE` en **Runtime Secret**)  
5. **Démarrer un nouvel agent** (les secrets ne sont souvent injectés qu’au boot)

### Test que le nouvel agent doit exécuter (sans afficher les secrets)

```bash
[ -n "$VPS_SSH_PRIVATE_KEY" ] && echo KEY=PRESENT || echo KEY=ABSENT
[ -n "$VPS_SSH_USER" ] && echo USER="$VPS_SSH_USER" || echo USER=ABSENT
[ -n "$VPS_SSH_PASSPHRASE" ] && echo PASSPHRASE=PRESENT || echo PASSPHRASE=ABSENT
bash scripts/deploy/run-from-agent.sh
```

---

## Après accès OK

Le script déploie `/var/www/narahservice`, systemd `narahservice`, Nginx dédié, Let’s Encrypt pour `narahservice.fr` + `www`, sans toucher ecom-touch.tech.
