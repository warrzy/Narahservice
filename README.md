# NARAH SERVICE — Site vitrine

Site vitrine premium pour **NARAH SERVICE**, entreprise de fourniture et livraison de matériaux de construction à Ouagadougou (Burkina Faso).

## Stack

- Next.js (App Router) + TypeScript
- Tailwind CSS
- Motion (Framer Motion)
- React Hook Form + Zod
- Nodemailer (envoi des devis)

## Démarrage local

```bash
cp .env.example .env.local
npm install
npm run dev
```

Ouvrir [http://localhost:3000](http://localhost:3000).

## Scripts

| Commande | Description |
|---|---|
| `npm run dev` | Serveur de développement |
| `npm run build` | Build de production |
| `npm run start` | Serveur de production |
| `npm run lint` | ESLint |
| `npm run typecheck` | Vérification TypeScript |

## Configuration métier

Les contenus et coordonnées sont centralisés dans :

- `src/config/company.ts` — entreprise, téléphones, matériaux, galerie, SEO
- `.env.local` — WhatsApp, SMTP, URL du site (voir `.env.example`)

### WhatsApp

Renseigner `NEXT_PUBLIC_WHATSAPP_NUMBER` (ex. `22678024690`). Tant que la variable est vide, les boutons WhatsApp restent masqués (sauf messages d’attente sur la page contact).

### Formulaire de devis

L’API `POST /api/devis` envoie un e-mail via SMTP. Sans variables SMTP, l’API répond `503` avec un message clair : **l’envoi n’est pas simulé**.

## Pages

| Route | Contenu |
|---|---|
| `/` | Accueil |
| `/a-propos` | Présentation institutionnelle |
| `/materiaux` | Sable, granite, latérite |
| `/realisations` | Galerie filtrable (illustrations) |
| `/contact` | Devis + coordonnées |

## Logo

Le fichier `public/images/brand/logo-placeholder.svg` est un **emplacement provisoire**. Remplacer par le logo officiel sans déformation.

## Images

Les photographies actuelles sont des **visuels d’illustration** (droits d’usage stock). Elles ne doivent pas être présentées comme des réalisations réelles de NARAH SERVICE. La galerie l’indique explicitement.

## Déploiement

Voir [`docs/DEPLOYMENT.md`](docs/DEPLOYMENT.md) pour Hostinger VPS (Ubuntu 24.04), isolation des applications et HTTPS.

**Ne pas déployer en production sans validation explicite du client.**

## Informations encore nécessaires côté client

1. Logo officiel (SVG ou PNG haute résolution)
2. Numéro WhatsApp principal confirmé
3. Adresse exacte + lien / embed Google Maps
4. Identifiants SMTP (ou service transactionnel)
5. Nom de domaine définitif
6. Photographies réelles (flotte, livraisons, chantiers)
7. E-mail de contact public (facultatif)
