# E3 - prédiction jointe au niveau de l’organoïde

**BROUILLON NON DÉPOSÉ - aucun résultat biologique E3 disponible.**

Le candidat implémenté est une régression bayésienne multivariée de S1-S5,
avec covariance résiduelle complète et âge log-transformé ; le contrôle est
le même modèle sans âge. Il prédit des statistiques, pas des trains de spikes
ni un mécanisme de conscience. L’adjonction de ce candidat n’altère pas le
simulateur TypeScript gelé d’E2.

L’organoïde est l’observation ; le donneur est le groupe de réplication pour
la synthèse et le bootstrap. Un fichier par culture. Les organoïdes du jeu
001603 sont déjà vus et ne sont jamais admis comme nouveau test E3 ; le banc
bloque aussi les empreintes de fichiers E1/E2, les donneurs présents dans les
deux lots et, pour l’objectif externe, les laboratoires communs. Les identités
biologiques déclarées doivent être vérifiées par le responsable des données.

## Plan fixé dans la version candidate

- Fenêtre de 180 s identique, explicitement enregistrée dans `obs_intervals`,
  contiguë et commune aux unités. Sans ces intervalles : arrêt, aucune durée
  déduite du premier et du dernier spike. Au moins 20 unités actives curées.
- S1-S5 : calcul du banc historique inchangé ; top 50 unités pour STTC selon
  le banc. Les effectifs d’unités restent exposés comme confondant ; ce
  candidat ne prétend pas supprimer l’asymétrie unités/électrodes.
- Transformations : log(1+x) pour S1-S4 ; atanh(STTC) avec saturation numérique
  à ±0,999999. Centre/échelle appris exclusivement sur l’entraînement.
- Prior conjoint dans ces coordonnées : B|Σ ~ MN(0,I,Σ), Σ ~ IW(7,I), cinq
  sorties. Le prior est conditionné par les transformations de l’entraînement :
  il ne constitue pas une croyance biologique indépendante de ces données.
- 200 tirages prédictifs conjoints, graine 20261009, avec incertitude des
  coefficients et variabilité résiduelle. Les tirages ne sont pas des sujets.
- Critère primaire : différence appariée du score énergétique joint, candidat
  moins contrôle, moyenne à poids égaux des donneurs. Une différence négative
  favorise le candidat ; aucune catégorie globale « adéquat » n’est définie.
- Secondaires : erreur absolue par statistique, intervalles prédictifs 90 %,
  couverture, largeur, résultats par âge. Deux groupes d’âge [1,150] et
  [151,365] jours ; effectifs minimaux proposés dans protocol.json.
- Bootstrap de 2000 rééchantillonnages des donneurs ; intervalle descriptif,
  sans garantie asymptotique pour petits effectifs. Moins de trois donneurs :
  pas d’intervalle. Aucun décompte de cinq statistiques comme preuves indépendantes.
- Aucune exclusion silencieuse. Toute défaillance du contrôle qualité arrête
  le banc. Toute modification impose un nouveau protocole et une nouvelle
  empreinte ; aucun ajustement sur les données de test.

## À résoudre avant un test confirmatoire

Le responsable doit sélectionner des données réellement nouvelles sur
métadonnées, vérifier cultures/donneurs/laboratoires et préparation, justifier
les effectifs par une étude de précision ou de puissance, fixer l’arrêt et les
exclusions, compléter `training`, `test` et `design`, puis geler tous les codes.
Les nombres proposés ne sont pas une analyse de puissance achevée.

`python3 empirical/e3/protocol.py empirical/e3/protocol.json` échoue tant que
ces points ne sont pas réglés. `--print-hashes` fournit des empreintes sans
simuler un dépôt. Le dépôt horodaté doit inclure le payload canonique
(hors bloc registration), le code et les données de sélection. Renseigner son
URL/date/empreinte ne l’authentifie pas : un tiers doit contrôler l’antériorité.

```bash
python3 -m pip install -r empirical/requirements.txt
python3 empirical/e3/protocol.py empirical/e3/protocol.json
python3 empirical/e3/run.py empirical/e3/protocol.json --out /chemin/nouveau-resultat-E3.json
```

`--exploratory` autorise seulement un travail explicitement exploratoire et
ne désactive ni la prévention des fuites ni les contrôles de qualité. Aucun
résultat ne doit être appelé corroboration de H1-H3, mesure de conscience,
détresse, ou preuve du monisme métaphysique.
