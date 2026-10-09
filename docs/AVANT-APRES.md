# Comparatif avant après du widget Grist

Comparaison de la version datagora-erasme au commit 91c929d4332df314729f49008a70be4944961e6d avec les améliorations publiées dans ce dépôt. Le comportement après correspond au code préparé ; la recette interactive dans Grist reste à effectuer.

| Modification | Avant | Après | Bénéfice |
| --- | --- | --- | --- |
| 1 Titre des cartes | Le titre dépendait de la première colonne ; Photo placée en premier reléguait le nom parmi les propriétés. | Le titre est choisi séparément, avec détection de Nom ou Titre et un réglage explicite. | Identifier une fiche dès le premier regard. |
| 2 Propriétés visibles | Les premières propriétés, notamment les dates techniques, occupaient l’aperçu. | Trois propriétés utiles sont proposées automatiquement ; leur sélection est configurable. | Comparer les projets à partir des critères métier. |
| 3 Couvertures | Les images des cartes avaient une hauteur de 192 pixels. | Les couvertures mesurent 128 pixels, peuvent être masquées et utilisent le chargement différé. | Voir davantage de fiches dans la même section. |
| 4 Ouverture des fiches | La carte cumulait la consultation et le glisser-déposer, avec un indicateur + autres. | Le titre et Voir la fiche complète ouvrent la fiche ; une poignée distincte sert au déplacement. | Comprendre et choisir le bon geste. |
| 5 Recherche | Aucune barre de recherche n’était proposée dans le widget. | Une recherche personnelle dans toutes les vues ignore la casse et les accents et combine les mots saisis. | Retrouver un projet sans parcourir chaque colonne. |
| 6 Compteur | Le kanban affichait des compteurs de groupe sans total global des résultats. | La recherche affiche le nombre de fiches retenues et le total reçu de Grist. | Comprendre l’effet de la recherche et du filtre. |
| 7 Galerie | Le composant existait dans les sources sans être proposé dans la navigation de l’application. | La galerie est disponible avec une grille adaptative et l’ouverture des fiches. | Parcourir visuellement les projets. |
| 8 Navigation | Les colonnes kanban hors écran n’avaient pas de commande visible en haut. | Deux boutons permettent de parcourir les colonnes ; les boutons des vues reviennent à la ligne. | Atteindre les groupes masqués et garder les vues lisibles. |
| 9 Libellés | Les contrôles fermés montraient notamment none, asc et Publie_. | Les listes natives présentent les libellés français et les noms des propriétés. | Régler la vue sans interpréter des identifiants. |
| 10 Filtres | La comparaison par fragment pouvait retenir plusieurs valeurs de choix proches. | Les choix et booléens sont comparés exactement ; les filtres textuels gardent la recherche par fragment. | Obtenir des résultats cohérents avec la valeur choisie. |
| 11 Filtre actif | La compréhension du filtre dépendait de l’ouverture des réglages. | Un résumé reste visible et une commande réinitialise le tri et le filtre. | Expliquer pourquoi une fiche manque dans une vue. |
| 12 Application des réglages | Le cycle de configuration ne proposait pas de brouillon commun avec annulation explicite. | Les changements restent locaux jusqu’à Appliquer ; Annuler restaure les options reçues. Un message rappelle Enregistrer dans Grist. | Essayer un réglage et comprendre quand il devient partagé. |
| 13 Titres et configuration | Le titre se modifiait par double clic, un geste peu découvrable. | Configurer expose le titre, sa colonne, les propriétés des cartes et les couvertures. | Trouver les réglages sans connaître de geste caché. |
| 14 Déplacement alternatif | Le déplacement dépendait du glisser-déposer et des groupes contenant déjà des cartes. | Déplacer vers dans la fiche donne une alternative ; les choix définis mais vides sont proposés comme destinations. | Déplacer une carte sans geste de précision. |
| 15 Erreurs d’écriture | Le code ne donnait pas de message utilisateur systématique pour un refus de déplacement. | Un état en cours, une confirmation ou une erreur visible accompagne la tentative. | Distinguer une écriture réussie d’un refus Grist. |
| 16 Types protégés | Le déplacement générique pouvait écrire un libellé dans un champ incompatible. | Seuls Text, Choice et Bool non calculés sont déplaçables avec accès adapté. Références et choix multiples restent consultables. | Éviter d’écraser une liste ou une référence. |
| 17 Fiches et tableau | Le panneau était intitulé Détail ; certains badges manquaient de label et les lignes du tableau n’avaient pas de bouton d’ouverture. | Un panneau commun porte le titre de la fiche et nomme les propriétés. Le tableau place le titre en premier avec un bouton ; ses textes longs sont limités à trois lignes. | Consulter les mêmes informations depuis toutes les vues et au clavier. |
| 18 États et fichiers | Les erreurs de fichier étaient peu visibles ; un échec de jeton pouvait bloquer les tentatives suivantes. | Les chargements et listes vides sont expliqués. Les fichiers ont une erreur et une nouvelle tentative ; le jeton est réinitialisé après échec. Les booléens sont Oui ou Non. | Comprendre l’état de l’interface et savoir comment réessayer. |

## Adaptation au dépôt Notion-Like

- Chemin Vite /Notion-Like/ pour les ressources du widget.
- Lint, tests et compilation avant déploiement Pages.
- Node 24 et installation reproductible avec npm ci.
- Documentation des commandes actuelles et de la sauvegarde des options Grist.

## Vérifications

35 tests automatiques passent, ainsi que lint et compilation. Les tests couvrent 26 scénarios de logique et 9 scénarios de rendu serveur React. Ils ne valident pas les écritures réelles Grist, le tactile ni le cycle complet de sauvegarde partagée.
