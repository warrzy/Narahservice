# Résultats des tests — NARAH SERVICE

Date d’exécution : 2026-11-21

## Commandes automatisées

| Commande | Résultat |
|---|---|
| `npm run lint` | OK |
| `npm run typecheck` | OK |
| `npm run build` | OK (Next.js 16.4.6) |
| `npm run start` | OK — http://localhost:3000 |

## Routes HTTP

| Route | Statut |
|---|---|
| `/` | 200 |
| `/a-propos` | 200 |
| `/materiaux` | 200 |
| `/realisations` | 200 |
| `/contact` | 200 |
| `/sitemap.xml` | 200 |
| `/robots.txt` | 200 |

## API devis `POST /api/devis`

| Cas | Résultat attendu | Observé |
|---|---|---|
| Corps vide | 400 validation | 400 |
| Données valides, SMTP absent | 503 + message clair | 503 — *« L'envoi d'e-mails n'est pas encore configuré… »* |
| Honeypot rempli | 200 silencieux | Non rejoué en QA manuelle (code présent) |

**L’envoi n’est pas simulé.** Sans SMTP, l’API refuse explicitement.

## Responsive (Playwright)

Largeurs testées : 320, 375, 390, 430, 768, 1024, 1440 px.

| Largeur | Scroll horizontal |
|---|---|
| 320–1440 | Aucun (`scrollWidth === clientWidth`) |

Captures : `/opt/cursor/artifacts/01-*.png` … `11-*.png`

## Points fonctionnels

- [x] Liens `tel:` sur les trois numéros
- [x] WhatsApp masqué tant que `NEXT_PUBLIC_WHATSAPP_NUMBER` est vide
- [x] Message d’attente WhatsApp sur la page contact
- [x] Validation formulaire côté client
- [x] API 503 sans SMTP (comportement documenté)
- [ ] Envoi e-mail réel — **dépend de la config SMTP client**
- [x] Pas de scroll horizontal mobile
- [x] `prefers-reduced-motion` géré dans CSS + Motion

## Notes

- Logo officiel absent : wordmark provisoire HTML/CSS.
- Visuels hero/matériaux : illustrations (IA / stock) clairement signalées ; à remplacer par photos réelles.
- Numéro WhatsApp et adresse Maps : en attente client.
