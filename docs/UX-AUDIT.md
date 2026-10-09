# Améliorations ergonomiques de la bibliothèque Grist

Cette branche prépare une refonte de la consultation et des réglages. Elle doit être validée dans une copie Grist avant déploiement. Aucun jeu de données réel n'est inclus.

## Changements réalisés

- Recherche personnelle insensible à la casse et aux accents, compteur de fiches et état vide explicite.
- Galerie disponible, grille adaptative et ouverture explicite des fiches.
- Titre choisi indépendamment de la première colonne, aperçu métier configurable et couvertures plus courtes.
- Réglages natifs avec libellés français, filtres multiples exacts pour les choix et les booléens.
- Modifications locales annulables ; application explicite à Grist et rappel de la sauvegarde des options partagées dans Grist.
- Boutons de navigation dans le kanban, poignées distinctes des actions d'ouverture et maintien des destinations Choice vides.
- Déplacement alternatif depuis la fiche, erreurs visibles et blocage des écritures pour les références, formules et choix multiples.
- Fiche commune aux vues, défilement du panneau, boutons nommés, booléens en texte et liens HTTP cliquables.
- Pièces jointes avec état d'erreur et nouvelle tentative, promesse de jeton remise à zéro après échec.

## Validation réalisée

Depuis `widget/` : `npm ci`, `npm run build`, `npm run lint`, `npm test`.

35 tests passent : 26 tests de logique et 9 tests de rendu serveur React. Ces tests ne remplacent pas une recette de l'iframe Grist. Les écritures réelles, le tactile, la restitution du focus, le thème sombre et les lecteurs d'écran restent à vérifier.

## Prévisualisation avec données fictives

Depuis `widget/` : `npm run dev`, puis ouvrir `/Notion-Like/tests/manual-preview.html?readonly=false` sur le serveur Vite.

Variantes : `readonly=true`, `empty=1`, `save-error=1`, `move-error=1`. Les paramètres d'erreur simulent les refus sans données réelles. Cette page utilise uniquement un faux adaptateur Grist et n'est pas incluse dans le build de production.

## Compatibilité et recette

Les options `titre`, `kanbanVues` et `ordreVues` sont conservées. Les nouvelles options sont `titreChamp`, `champsApercu` et `couvertures`. Les anciens filtres restent lus ; la comparaison des choix passe de la sous-chaîne à la valeur exacte. Vérifier les vues historiques utilisant des fragments de choix.

L'ordre des colonnes de kanban accepte les libellés historiques et enregistre ensuite des clés JSON typées. Tester le retour à l'ancienne version si une restauration des options est nécessaire.

Avant livraison : vérifier le glisser-déposer (carte et colonne), le déplacement par menu, les refus ACL, le bouton Enregistrer de Grist, la navigation au clavier, les petites sections, les pièces jointes et les changements de données pendant l'ouverture d'une fiche.
