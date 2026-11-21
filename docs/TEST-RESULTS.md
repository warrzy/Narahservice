# Résultats des tests

Document mis à jour après exécution des vérifications automatisées et manuelles.

## Commandes

```bash
npm run lint
npm run typecheck
npm run build
```

## Statut

À remplir après la première exécution complète dans cet environnement.

## Responsive (à vérifier manuellement)

Largeurs cibles : 320, 375, 390, 430, 768, 1024, 1440 px.

## Points de contrôle fonctionnels

- [ ] Liens `tel:` sur les trois numéros
- [ ] Bouton WhatsApp absent si numéro non configuré
- [ ] Bouton WhatsApp actif après configuration
- [ ] Formulaire : validation client
- [ ] Formulaire : API 503 sans SMTP (comportement attendu)
- [ ] Formulaire : envoi OK avec SMTP configuré
- [ ] Pas de scroll horizontal mobile
- [ ] `prefers-reduced-motion` respecté
