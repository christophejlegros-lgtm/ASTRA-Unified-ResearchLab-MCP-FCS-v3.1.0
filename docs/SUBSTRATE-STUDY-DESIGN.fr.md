# Opérationnalisation de H1-H3 - dossier de préparation

La version consolidée fournit un plan machine-lisible et un contrôle de
complétude. Les paramètres qui dépendent d’une préparation réelle, d’un
laboratoire et de ses autorisations restent **non résolus** : aucune valeur
biologique ou validation institutionnelle n’est inventée.

`SUBSTRATE-STUDY-DESIGN.json` donne, pour chaque hypothèse, observable,
contraste, direction, confondants et correspondance vers `fcs_withdrawal`.
`python3 scripts/check-study-readiness.py docs/SUBSTRATE-STUDY-DESIGN.json`
renvoie une erreur tant que les champs nécessaires sont absents et le dossier
n’est pas déclaré enregistré. Même un contrôle réussi ne serait qu’un contrôle
de complétude ; un tiers doit authentifier les références fournies.

## Règles d’interprétation

1. Un succès H1/H2 établit au plus une efficacité de propagation dans la
   préparation étudiée. Il ne démontre pas une nécessité pour la conscience.
2. H3a : covariation seule non discriminante. H3b : intervention exigeant
   composition ionique, excitabilité globale et effets non spécifiques contrôlés.
3. Définir les signatures de niveau IV avant les données, avec mesure,
   erreur instrumentale et modèles alternatifs. Une signature d’accès n’est
   pas une mesure de phénoménalité.
4. Fixer, avant dépôt, l’effet minimal intéressant, l’incertitude acceptable,
   le modèle statistique, les exclusions, l’unité biologique, les contrastes
   et la règle d’arrêt. Une valeur p ne remplace ni taille d’effet ni incertitude.
5. Documenter toute révision de la ceinture par une nouvelle prédiction et
   une épreuve future ; conserver échecs et indéterminations dans le registre.
6. Comparateurs : propagation synaptique résiduelle, excitabilité générale,
   source commune et artefact de mesure. Déclarer quelles observations
   distingueraient ces mécanismes du couplage éphaptique spécifique.
7. Une référence de comité éthique ou de registre n’est validée qu’après
   vérification externe. Les labels N3/NORMAL/STRESS/DISTRESS du démonstrateur
   logiciel ne constituent aucune autorisation ni diagnostic de bien-être.

Le brouillon initial `PREREGISTRATION.md` reste un brouillon ; les comptes
rendus E1/E2 ne lui confèrent ni dépôt ni confirmation.
