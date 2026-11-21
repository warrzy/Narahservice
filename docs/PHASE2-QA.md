# Phase 2 — Recette mobile & finitions

**Branche :** `cursor/phase2-mobile-polish-dcdc`  
**Build :** lint ✅ · typecheck ✅ · next build ✅  
**Déploiement prod :** non (en attente d’autorisation)

## Modifications

- Menu mobile plein écran opaque (portal `document.body`), hamburger animé, ARIA, Escape, scroll-lock
- Logo provisoire (monogramme N or + wordmark) — à valider client
- Téléphones affichés avec `+226` ; `tel:+226…` vérifiés
- WhatsApp provisoire `wa.me/22678024690` (Contact + menu + footer) — **pas** de flottant
- E-mail `faouzoubalima@gmail.com` (provisoire)
- Boutons : contrastes, `min-h-12`, outline plus lisible sur fond vert
- Barre mobile : Appeler + Devis uniquement
- Micro-animations / Reveal conservés avec `prefers-reduced-motion`

## Responsive (overflow horizontal)

Aucune page ne déborde aux largeurs 320, 360, 375, 390, 414, 768, 1024, 1440.

## Liens contact (échantillon Playwright)

| Type | Valeur |
|---|---|
| tel | `+22678024690`, `+22676340541`, `+22670641658` |
| mailto | `faouzoubalima@gmail.com` |
| WhatsApp | `https://wa.me/22678024690?text=…` |

## Formulaire / SMTP

Toujours **503** honnête sans SMTP — non simulé.

## Captures

Dossier `/opt/cursor/artifacts/phase2/` — notamment `p2-04-menu-mobile-ouvert.png`, `p2-home-320.png`, `p2-06-contact-mobile.png`.

## Logo

Logos officiels client intégrés (`public/images/brand/`) :
- `logo-official.png` / `logo-header.png` — PNG à **canal alpha réel** (coins alpha=0)
- Composant `Logo` : **aucun** `bg-black` / pastille blanche (fond CSS transparent)
- `logo-mark-house.jpg` — marque maison/N (favicon)
- Favicon / apple-icon générés

Pastille blanche sous le logo sur fonds verts (lisibilité).

## À confirmer client

1. Activation WhatsApp réelle du `+226 78 02 46 90`
2. Variante logo préférée en header (camion vs camion+maison vs maison/N) — actuellement **camion**
3. 2ᵉ adresse e-mail
4. SMTP pour les devis
5. Autorisation de déploiement production
