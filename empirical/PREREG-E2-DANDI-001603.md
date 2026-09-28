# Pré-enregistrement E2 — Un simulateur révisé (bouffées de réseau) face à des organoïdes jamais vus
# Preregistration E2 — A revised simulator (network bursts) against unseen organoids

**Fixé le / Fixed on : 28 septembre 2026, 16:00 CEST, avant tout accès aux données de test /
before any access to the test data.**
Ce fichier devient public par un commit du dépôt **avant** le téléchargement des fichiers
de test. Il ne sera jamais modifié : les écarts éventuels seront déclarés dans
`empirical/RESULTS-E2.md`. Son empreinte SHA-256 est calculée sur le contenu normalisé en
fins de ligne LF.
This file is made public by a repository commit **before** the test files are downloaded.
It will never be modified: any deviation will be declared in `empirical/RESULTS-E2.md`.
Its SHA-256 is computed on the LF-normalised content.

© Genève 2026 Christophe Jean Legros · Assistance Multi IA

---

## 1. Question

L'épreuve E1 ([`PREREG-DANDI-001603.md`](PREREG-DANDI-001603.md),
[`RESULTS-E1.md`](RESULTS-E1.md)) a jugé **INADÉQUAT** le modèle spontané par défaut
d'`OrganoidMEA` (Poisson indépendants) et localisé l'échec : il est structurel (aucun
couplage entre électrodes). Un modèle candidat, `spontaneousModel: 'network-burst'`, a été
construit et calibré **sur les trois organoïdes d'E1 seulement**.

**Question E2 :** ce candidat, gelé, est-il empiriquement adéquat pour les statistiques
S1–S5 de l'activité spontanée d'organoïdes humains **qui n'ont servi ni à le concevoir ni
à le calibrer** ?

**E2 question:** is this frozen candidate empirically adequate for the S1–S5 statistics of
the spontaneous activity of human organoids **that were used neither to design nor to
calibrate it**?

Hors portée, comme pour E1 : l'activité évoquée, les proxys de conscience, les hypothèses
FCS de niveau I.

## 2. Données de test / Test data

- **Source :** DANDI Archive, dandiset **001603**, version `0.260923.0623`, CC-BY-4.0,
  doi:10.48324/dandi.001603/0.260923.0623 ; Van der Molen et al. (2025), *Nature
  Neuroscience*, doi:10.1038/s41593-025-02111-0.
- **Règle de sélection (fixée sur les seules métadonnées du listing public, sans ouvrir
  aucun fichier) :** pour chacun des organoïdes humains `sub-HO1` à `sub-HO5`, le fichier
  de la **même session de traitement** que les fichiers d'entraînement (horodatage
  `ses-20250924T0021xx`, fichiers sans suffixe `_ecephys`, comme `sub-HO6/7/8`) :

  | Fichier de test | Taille annoncée |
  |---|---|
  | `sub-HO1/sub-HO1_ses-20250924T002125.nwb` | 24 Mo |
  | `sub-HO2/sub-HO2_ses-20250924T002113.nwb` | 31,5 Mo |
  | `sub-HO3/sub-HO3_ses-20250924T002116.nwb` | 14,7 Mo |
  | `sub-HO4/sub-HO4_ses-20250924T002126.nwb` | 22,5 Mo |
  | `sub-HO5/sub-HO5_ses-20250924T002125.nwb` | 185,7 Mo |

- **Données d'entraînement (déjà vues, exclues du test) :** `sub-HO6_ses-20250924T002106`,
  `sub-HO7_ses-20250924T002328`, `sub-HO8_ses-20250924T002134` (SHA-256 dans
  `RESULTS-E1.md` §5).
- **Exclusion :** un fichier sans table `units` exploitable est exclu, avec sa raison
  (règle d'E1, inchangée). **Aucune autre exclusion.**
- **Fenêtre :** `T = min(durée, 600 s)`, durée déterminée comme dans E1 (`obs_intervals`,
  sinon premier → dernier spike ; règle de repli déclarée dans `RESULTS-E1.md` §4.1).
- **Nombre minimal :** au moins **3** organoïdes de test exploitables ; sinon E2 est
  déclarée **non concluante**.

Aucun de ces cinq fichiers n'a été téléchargé ni ouvert par l'auteur ou par l'auditeur à
la date de ce document. Seuls les noms et tailles du listing public DANDI ont été lus.

## 3. Modèle éprouvé (gelé) / Model under test (frozen)

`OrganoidMEA({ seed, spontaneousModel: 'network-burst' })`, paramètres par défaut
`E2_CALIBRATED_PARAMS` (`src/engine/neuroplatform.ts`), activité spontanée seule, exporté
par `empirical/sim_export.ts --model=network-burst` en tranches de 10 s, **graines 1 à
10**, pour la même durée `T` que chaque organoïde de test. Valeur simulée : **médiane sur
les 10 graines**, puis médiane sur les organoïdes (exactement comme dans E1).

**Structure.** (i) Bouffées de réseau : débuts selon un processus de renouvellement à
intervalles gamma (moyenne 60/`burstRatePerMin` s, forme `burstRegularity`) ; chaque
électrode y participe avec la probabilité `participation` et émet Poisson(`spikesPerBurst`
· wᵢ) spikes placés à début + D·u^1,5. (ii) Fond : par électrode, amas locaux dont les
débuts suivent un Poisson de taux `bgMedianHz`·wᵢ / m ; chaque amas contient
Géométrique(moyenne m = `clusterMeanSpikes`) spikes séparés par des intervalles
exponentiels de moyenne `intraClusterIsiSec`. (iii) wᵢ log-normaux (σ = `heterogeneity`),
normalisés par leur médiane. (iv) Réfractarité absolue 1,5 ms ; taux proportionnels à la
viabilité relative à sa valeur initiale.

| Paramètre | Valeur gelée |
|---|---|
| `burstRatePerMin` | 4,72 |
| `burstRegularity` | 6,65 |
| `burstDurationSec` | 0,244 |
| `participation` | 0,79 |
| `spikesPerBurst` | 1,71 |
| `bgMedianHz` | 0,493 |
| `heterogeneity` | 1,04 |
| `clusterMeanSpikes` | 7,36 |
| `intraClusterIsiSec` | 0,0565 |

**Code gelé** (SHA-256 sur contenu normalisé LF ; `run_e2.py` refuse de s'exécuter si l'un
d'eux diffère, sauf option `--allow-code-drift`, qui rend alors l'épreuve non concluante) :

| Fichier | SHA-256 |
|---|---|
| `src/engine/neuroplatform.ts` | `e529bf16221fe1d296fb097ce6b81faaeace1a4890cee87588820fa8a99ef7f1` |
| `empirical/sim_export.ts` | `17186253ae6e1ac2d03f5b71c99599ff32c9691fc9267f7d33efafe0767c2de7` |
| `empirical/confront.py` | `2e674ebaf34a31e56b3a0baabab3e4d5094fe6a51efb47faa8832fddb735a7ee` |
| `empirical/run_e2.py` | `1c802ba160f407ce31d0dff4b3705f35b49d856d5872b3f3f0fbb8bde82c2e85` |
| `empirical/e2_calibrate.py` | `9b4495443efdb3004b463f8fc0c2d4bc0072d78903e8d27136bb7af3075ca5ef` |
| `empirical/results/E2_calibration.json` | `2d2c11bf952af6dbfb99ce3bb3a177b50fd809b3bd7e9673a7bcffd94cd9c72a` |
| `empirical/results/E2_insample_training.json` | `f7690b62a5ada7663bd449d4ddd874ec6578825bb6acc004f6ca8c94694e2c2f` |

`confront.py` ne diffère de la version d'E1 que par un argument optionnel `prereg` de
`run()`, qui inscrit le nom du pré-enregistrement dans le rapport ; les fonctions de calcul
de S1–S5 et des verdicts sont inchangées.

## 4. Historique de calibration (déclaration des degrés de liberté) / Calibration history

Tout ce qui suit a été fait sur les **seuls** organoïdes d'entraînement HO6–HO8.

1. **Version 1 (7 paramètres, fond poissonien).** Recherche aléatoire (160 points) puis
   raffinement local (160 points) : S1, S3, S4, S5 dans les plages d'entraînement, mais
   **S2 = 1,34** contre [1,97 ; 3,46]. La structure a donc été jugée insuffisante.
2. **Examen des intervalles inter-spikes d'entraînement** : environ 30 % des ISI < 50 ms et
   ISI médian de 77 à 133 ms pour un taux médian d'environ 0,6 Hz, ce qui indique des
   amas de spikes locaux, propres à chaque unité.
3. **Version 2 (retenue, 9 paramètres).** Le fond poissonien est remplacé par des amas
   locaux (2 paramètres de plus). Recherche aléatoire (120 points, graine 1) puis
   raffinement (120 points), avec une fonction de coût faite des carrés des log-rapports
   aux moyennes d'entraînement pour S1–S4 et de ((S5 − cible)/0,03)². Les paramètres sont
   arrondis à 3 chiffres significatifs, puis vérifiés sur 10 graines.
4. **Vérification TS ↔ Python** : sur 10 graines et 599,9 s, l'implémentation TypeScript
   donne S1 0,582, S2 2,85, S3 4,85/min, S4 0,176 et S5 0,066. Le prototype Python donnait
   0,601, 2,84, 5,00, 0,179 et 0,065.
5. **Ajustement en échantillon** (`E2_insample_training.json`) : **5/5 compatibles** sur
   HO6–HO8. **Ce résultat n'est pas une preuve** : avec 9 paramètres pour 5 statistiques,
   il est attendu par construction. Seule l'épreuve hors échantillon compte.

## 5. Statistiques et règles / Statistics and rules

**Identiques à E1** (`PREREG-DANDI-001603.md` §4–§5), calculées par le même code
(`confront.py`, haché ci-dessus) :
- S1 : taux médian ;
- S2 : CV des ISI ;
- S3 : bouffées de réseau par minute ;
- S4 : part des spikes en bouffées ;
- S5 : STTC médian.

L'intervalle de référence est R = [min, max] sur les **organoïdes de test** exploitables.
- **Marginal :** [min/2, 2·max] pour S1–S4 ; ± 0,05 pour S5.
- **Verdict ADÉQUAT :** aucune statistique incompatible et au moins 3 compatibles.
- **Verdict INADÉQUAT :** au moins 2 statistiques incompatibles.
- **Verdict PARTIELLEMENT ADÉQUAT :** tous les autres cas.

## 6. Contrôle et conditions de validité / Control and validity conditions

- **Contrôle négatif :** le modèle d'E1 (`'poisson'`, configuration par défaut) est
  confronté aux mêmes organoïdes de test, par le même code.
- **E2 est valide si et seulement si :**
  - (a) au moins 3 organoïdes de test sont exploitables ;
  - (b) le contrôle n'est **pas** jugé ADÉQUAT (sinon le banc ne discrimine pas sur ces
    données) ;
  - (c) le code gelé est inchangé.
- **Si l'une de ces conditions manque, E2 est déclarée non concluante**, quel que soit le
  verdict du candidat.

## 7. Analyses secondaires pré-déclarées (sans incidence sur le verdict) / Secondary analyses

1. **Écart standardisé :** pour chaque statistique, z = (valeur simulée − moyenne des
   organoïdes de test) / écart-type. Critère strict, descriptif : tous les |z| ≤ 2.
2. **Homogénéité du lot :** les plages de test recouvrent-elles celles d'entraînement ?
   Si les organoïdes de test s'écartent nettement de HO6–HO8, un échec du candidat
   s'interprète d'abord comme une **variabilité inter-organoïdes non capturée**.
3. **Dispersion entre graines** du candidat, pour chaque statistique.

## 8. Prédictions a priori / A-priori predictions

- **Candidat `'network-burst'` : ADÉQUAT.** Les statistiques les plus à risque sont S2 et
  S5, qui varient le plus d'un organoïde d'entraînement à l'autre (S2 de 1,97 à 3,46 ; S5 de
  0,030 à 0,089). La prédiction peut échouer, notamment si HO1–HO5 diffèrent de HO6–HO8 par
  le taux, la fréquence des bouffées ou la synchronie.
- **Contrôle `'poisson'` : INADÉQUAT** (S3 = S4 = 0 par construction).

## 9. Portée des issues possibles / What each outcome licenses

- **ADÉQUAT (et valide).** Le candidat est **descriptivement adéquat** pour S1–S5 sur des
  organoïdes non vus **du même jeu de données et du même lot de traitement**. Statut
  épistémique : *Modélisé*, pas *Établi*.
  - Le modèle est phénoménologique : il ne dit rien des mécanismes (pas de synapses, pas
    de topologie), de l'activité évoquée, ni d'autres laboratoires ou protocoles.
  - La généralisation hors de ce jeu exigerait une épreuve E3 sur un autre jeu de données.
- **PARTIELLEMENT ADÉQUAT.** Les statistiques en échec sont nommées. **Aucun recalage sur
  les organoïdes de test** n'est admis : toute révision ultérieure devra être éprouvée sur
  des données encore jamais vues.
- **INADÉQUAT.** Le candidat est réfuté sur ces données. Il reste une option non par
  défaut, documentée comme telle.
- **Dans tous les cas** :
  - le modèle par défaut d'`OrganoidMEA` reste `'poisson'`, pour la compatibilité des tests
    d'intégration ;
  - la documentation cite E2 avec son verdict exact.

## 10. Exécution / Execution

```bash
python3 empirical/run_e2.py sub-HO1_ses-20250924T002125.nwb sub-HO2_ses-20250924T002113.nwb \
    sub-HO3_ses-20250924T002116.nwb sub-HO4_ses-20250924T002126.nwb sub-HO5_ses-20250924T002125.nwb
```

Sorties : `empirical/results/E2.json` (verdict principal et validité) et
`empirical/results/E2_control_poisson.json`. Les résultats, l'analyse secondaire et les
éventuels écarts seront consignés dans `empirical/RESULTS-E2.md`.
