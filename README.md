# Notion Like pour Grist

Widget bibliothèque pour consulter une table Grist en tableau, galerie et kanban.
Cette version reprend [Grist-widget-Notion-like de datagora-erasme](https://github.com/datagora-erasme/Grist-widget-Notion-like) et ajoute des améliorations de consultation, de configuration et de gestion des déplacements.

## URL du widget

URL prévue après un déploiement GitHub Pages réussi :

https://arthurpanck.github.io/Notion-Like/

Dans Grist, ajouter un widget personnalisé lié à la table, coller cette URL puis autoriser l'accès complet au document pour charger les métadonnées. Les permissions et règles ACL Grist restent responsables des écritures autorisées.

## Utilisation

- Rechercher une fiche avec la barre de recherche personnelle.
- Choisir Tableau, Galerie ou une vue kanban configurée.
- Ouvrir la fiche avec son titre ou Voir la fiche complète.
- Utiliser Configurer pour choisir le titre, les propriétés des cartes et les couvertures, ou ajouter une vue kanban.
- Modifier le tri et le filtre dans Réglages de cette vue.
- Appliquer les réglages, puis Enregistrer dans le menu des options du widget Grist pour les partager. Annuler permet de restaurer les options reçues avant application.
- Déplacer une carte avec sa poignée ou Déplacer vers dans sa fiche, uniquement sur un champ pris en charge et avec les droits nécessaires. Les choix multiples, références et formules ne sont pas déplaçables.

Consulter [le comparatif avant après](docs/AVANT-APRES.md) et [le protocole de validation](docs/UX-AUDIT.md).

## Développement

Depuis le dossier widget :

```bash
npm ci
npm run dev
```

La page `/Notion-Like/tests/manual-preview.html?readonly=false` utilise quatre fiches fictives. Variantes : `readonly=true`, `empty=1`, `save-error=1`, `move-error=1`. Cette page est exclue de la compilation de production.

```bash
npm run lint
npm test
npm run build
```

## Déploiement

Un push sur main exécute les tests, le lint et la compilation avant GitHub Pages. Dans Settings puis Pages, la source doit être GitHub Actions. L'activation de Pages dépend du plan GitHub et des permissions du dépôt privé. Le workflow tente l'activation si possible ; aucun jeton personnel n'est inclus.

## Validation

35 tests automatiques couvrent la logique et le rendu serveur de composants. Ils ne remplacent pas une recette dans Grist. Le glisser-déposer, les sauvegardes communes, les refus ACL, le tactile, le focus et les lecteurs d'écran restent à vérifier dans l'iframe avec la version publiée.

## Origine

Base du travail : commit `91c929d4332df314729f49008a70be4944961e6d` du dépôt datagora-erasme/Grist-widget-Notion-like. Aucun jeu de données ni capture du document TWINK n'est inclus dans ce dépôt.
