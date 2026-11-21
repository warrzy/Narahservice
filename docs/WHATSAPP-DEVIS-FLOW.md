# Flux devis WhatsApp (indépendant du SMTP)

## Comportement

1. Validation côté navigateur (Zod / react-hook-form).
2. Ouverture **synchrone** de `https://wa.me/22678024690?text=…` dans le geste utilisateur.
3. Message UI : *« Votre message est prêt dans WhatsApp. Appuyez sur Envoyer pour transmettre votre demande. »*
4. **Jamais** « Devis envoyé » pour une seule ouverture WhatsApp.
5. E-mail SMTP = opération **indépendante** :
   - `GET /api/devis` → `{ smtpConfigured }` (aucune donnée formulaire)
   - `POST /api/devis` uniquement si `smtpConfigured === true`
   - Si SMTP inactif : aucun corps de formulaire n’est lu par l’API

## Numéro provisoire

`NEXT_PUBLIC_WHATSAPP_NUMBER=22678024690` (fallback identique dans `company.ts`).  
Activation WhatsApp Business à confirmer par le client.

## Privacy

Sans SMTP, les données du formulaire ne quittent le navigateur que vers WhatsApp (`wa.me`).
