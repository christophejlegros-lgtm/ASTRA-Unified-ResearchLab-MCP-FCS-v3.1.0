# Consolidation ASTRA-FCS v3.2.0-rc.1

**Candidate locale préparée le 9 octobre 2026, à partir de l’archive fournie.
Aucune publication GitHub, aucun DOI, aucun dépôt de protocole ni aucune revue
indépendante n’est affirmé.**

## Changements appliqués

| Axe du programme minimal | Résultat livré | Travail externe restant |
|---|---|---|
| Stabiliser l’objet | Version cohérente, scripts de contrôle, archive déterministe et manifeste | Publier une release immuable et identifier son commit réel |
| Consolider les organoïdes | Banc E3 de prédiction bayésienne multivariée avec âge et contrôle sans âge ; contrôles de fuite et de qualité | Sélectionner les données nouvelles, justifier les effectifs, enregistrer et exécuter E3 |
| Valider les proxys | Formules rectifiées, null pour indisponibilité, couverture des états, contrôles synthétiques et fiches de mesure | Validation biologique/computationnelle externe et ablations de mécanismes |
| Achever H1-H3 | Observables, contrastes, confondants, dossier structuré et contrôle de complétude | Laboratoire, instruments, paramètres expérimentaux, autorisations, effectifs et dépôt |
| Revue indépendante | Dossier de transmission et journal des objections préparés | Désignation des relecteurs, conflits déclarés et relectures effectives |

## Corrections du code

- `RIIUPhi.estimate()` renvoie valeur, statut, motif, nombre d’échantillons et
  construit. Warmup/covariance dégénérée donnent **null**, distinct d’un vrai zéro.
  Configuration, finitude et dimensions sont contrôlées. Le rapport est une
  somme de valeurs absolues de covariance, pas une énergie ni une part de variance.
- `estimateTransitionInformation()` expose les lignes visitées et leur couverture ;
  les entrées hors domaine sont rejetées. Le calcul est **observationnel** et
  n’identifie pas une matrice de transitions causales.
- `tcai_metrics` expose les estimations séparées ; le composite public vaut null.
  Les anciens champs numériques peuvent donc devenir null : les clients doivent
  vérifier `status`, `reason` et `gnwAvailability` avant d’afficher un zéro.
- Les indices conventionnels internes de contrôle restent utilisables pour le
  pilotage. Le composite ACM historique reste un diagnostic d’ingénierie sans
  classe de conscience ; sa « confidence » est explicitement une heuristique,
  pas une probabilité ni une précision validée.
- La provenance FCS est attachée aux canaux : biomarqueurs du magasin d’état
  simulés dans tous les modes, valeurs de l’appelant rapportées par défaut.
  `mode=live` ne crée ni mesure ni champ MEA. `realisationBasis` distingue une
  hypothèse taxonomique organoïde de l’inspection du modèle silicium.
- Les alertes éthiques restent des seuils de démonstration non validés pour le
  bien-être. Niveau IRB non attribué, aucun diagnostic de souffrance ni aucune
  autorisation institutionnelle induite par un label.
- Pareto est présenté comme politique FCS. La dépendance de l’indice de strate
  n’est plus confondue avec une violation démontrée de l’axiome d’Arrow ; la
  dominance entre deux options demeure indépendante du retrait d’une troisième.
- Les descriptions API et tableaux de bord signalent ces limites. Les tableaux
  de bord embarqués sont des démonstrations statiques, pas des capteurs validés.

## E3 livré : candidat statistique, pas simulateur neuronal validé

`empirical/e3/` prédit conjointement S1-S5 avec une régression bayésienne et une
covariance résiduelle complète. La variabilité entre organoïdes et l’âge sont
représentés ; les graines ne sont pas comptées comme sujets. Le contrôle utilise
la même famille sans âge. Score énergétique joint, erreurs et intervalles
prédictifs remplacent toute lecture confirmatoire du min-max historique.

Le dossier refuse le jeu 001603 comme nouveau test, les empreintes E1/E2 déjà
vues, les cultures répétées et les fuites de donneurs ; un objectif externe
impose aussi des laboratoires distincts. Les identités déclarées requièrent
une vérification humaine. Les fichiers bruts sont hachés avant analyse ; la
durée doit provenir d’une observation explicite, non des premiers/derniers spikes.

Le protocole livré reste non déposé et sans données sélectionnées. Le contrôleur
échoue volontairement avant accès aux spikes tant que les champs nécessaires
ne sont pas résolus. Une déclaration de dépôt n’est pas une authentification de
son antériorité. Le mode exploratoire marque explicitement le résultat comme
exploratoire et ne désactive pas la prévention des fuites.

## Preuves historiques et corrections théoriques

Les fichiers source gelés pour E2, les pré-enregistrements, comptes rendus et
résultats E1/E2 ainsi que `FCS v1.5/` sont conservés **octet pour octet**.
`validation/historical-evidence.json` contient leurs empreintes ; le contrôle
ne prétend pas authentifier l’historique distant GitHub.

Le rectificatif `docs/CORRECTIONS-THEORIQUES.fr.md` accompagne les textes
historiques sans les réécrire rétroactivement. Il précise notamment la portée
faible du substrat, la sous-détermination métaphysique, la politique de calcul
polynomial et la charge de preuve des signatures d’accès.

## Vérifier et reproduire

```bash
npm ci
python3 -m pip install -r empirical/requirements.txt
npm run validate:software
# Échec attendu sur les brouillons incomplets, sans modifier leurs résultats :
npm run check:e3
npm run check:study
# Source distribuable, à côté du projet extrait :
npm run release:archive
python3 scripts/verify-release.py ../ASTRA-FCS-v3.2.0-rc.1.zip
```

Le manifeste de release donne les SHA-256 de chaque source et une empreinte de
l’arbre. Le SHA de l’archive est écrit dans le fichier `.zip.sha256` adjacent.
Le contenu est trié et les horodatages ZIP sont fixes pour un empaquetage
répétable. La vérification d’intégrité n’est pas une signature d’identité, une
validation scientifique ou la preuve d’un dépôt antérieur.

Le journal `validation/LOCAL-VALIDATION.json` documente précisément les contrôles
exécutés et leurs limites. Les vérifications logicielles et synthétiques ne
sont pas des confirmations biologiques d’E3/H1-H3. Docker et les autres versions
Node de la matrice CI doivent être contrôlés dans un environnement adapté.

## Mise en dépôt

L’URL GitHub historique garde son nom v3.1.0 ; elle ne certifie pas la version
des octets présents. Après revue du diff, pousser la candidate sur une branche,
exécuter la CI Node 20/22 et Docker, créer un tag et une release immuables,
attacher archive et empreintes, puis inscrire le commit réellement publié.
Le champ `remote_commit_verified` reste null tant que cette publication n’est
pas vérifiée. Aucun faux commit distant, DOI ou enregistrement n’est ajouté.
