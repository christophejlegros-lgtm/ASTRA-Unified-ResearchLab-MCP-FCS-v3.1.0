# Résultats E2 — Le simulateur révisé (bouffées de réseau) face à des organoïdes jamais vus
# Results E2 — The revised simulator (network bursts) against unseen organoids

**Pré-enregistrement / Preregistration :** [`PREREG-E2-DANDI-001603.md`](PREREG-E2-DANDI-001603.md),
SHA-256 `bc5a3d5c9a757afef1a8160272583e72d66a26536cb3fd296e77c47897e6bf54` (contenu LF).
Il a été rendu public par le commit `1905da1` (28·09·2026, vers 16:38 CEST), **avant** le
téléchargement des fichiers de test. Il n'a pas été modifié depuis. Les empreintes du
pré-enregistrement et du code gelé ont été vérifiées sur la copie publique GitHub au commit
`1905da1`.

**Données de test reçues :** 28·09·2026, vers 17:01 CEST.
**Analyse :** 17:02 à 17:03 CEST, `python3 empirical/run_e2.py` (code gelé vérifié : aucune
dérive). Résultats bruts : [`results/E2.json`](results/E2.json) et
[`results/E2_control_poisson.json`](results/E2_control_poisson.json).

© Genève 2026 Christophe Jean Legros · Assistance Multi IA

---

## 1. Verdict pré-enregistré / Preregistered verdict

# **PARTIELLEMENT ADÉQUAT · PARTIALLY ADEQUATE** (épreuve valide)

Aucune statistique n'est incompatible ; 2 sont compatibles et 3 marginales. La règle ADÉQUAT
(aucune incompatible et au moins 3 compatibles) n'est pas satisfaite. La règle INADÉQUAT
(au moins 2 incompatibles) non plus.
No statistic is incompatible; 2 are compatible and 3 marginal. Neither the ADEQUATE rule
(no incompatible and at least 3 compatible) nor the INADEQUATE rule (at least 2
incompatible) holds.

**La prédiction a priori (« ADÉQUAT ») est démentie.**
**The a-priori prediction ("ADEQUATE") is refuted.**

| # | Statistique | Candidat `network-burst` (médiane) | Organoïdes de test [min, max] | Verdict |
|---|---|---|---|---|
| S1 | Taux médian (Hz) | 0,618 | [0,144 ; 0,569] | marginal (trop élevé) |
| S2 | CV des ISI | 2,903 | [1,142 ; 2,601] | marginal (trop élevé) |
| S3 | Bouffées de réseau (/min) | 5,01 | [2,20 ; 19,76] | compatible |
| S4 | Part des spikes en bouffées | 0,170 | [0,245 ; 0,429] | marginal (trop faible) |
| S5 | STTC médian | 0,059 | [0,013 ; 0,346] | compatible |

**Conditions de validité (pré-enregistrement §6) :**
- (a) 5 organoïdes exploitables sur 5, aucune exclusion ;
- (b) contrôle non ADÉQUAT ;
- (c) code gelé inchangé.

L'épreuve est **valide**.

### Contrôle négatif : modèle d'E1 (`'poisson'`) → **INADÉQUAT**

| # | S1 | S2 | S3 | S4 | S5 |
|---|---|---|---|---|---|
| Valeur | 1,917 | 0,992 | 0 | 0 | −0,0004 |
| Verdict | **incompatible** | marginal | **incompatible** | **incompatible** | marginal |

Le banc discrimine donc sur ces données. Sur les mêmes organoïdes, le candidat passe de
3 incompatibles à 0. Le défaut structurel constaté dans E1 (ni bouffées ni synchronie) est
corrigé. En revanche, le **calibrage ne se transfère pas** aux organoïdes de test.

### Par organoïde / Per organoid

| Organoïde | Âge (métadonnée NWB, lue après l'analyse) | Unités (actives) | T (s) | S1 | S2 | S3 | S4 | S5 |
|---|---|---|---|---|---|---|---|---|
| sub-HO1 | P7M | 131 (125) | 179,19 | 0,569 | 1,313 | 19,76 | 0,245 | 0,257 |
| sub-HO2 | P7M | 173 (173) | 179,61 | 0,145 | 1,142 | 10,36 | 0,311 | 0,308 |
| sub-HO3 | P7M | 80 (80) | 176,70 | 0,252 | 1,316 | 16,30 | 0,429 | 0,346 |
| sub-HO4 | P7M | 123 (123) | 179,99 | 0,144 | 1,194 | 9,00 | 0,356 | 0,220 |
| sub-HO5 | P100D | 308 (308) | 599,98 | 0,353 | 2,601 | 2,20 | 0,252 | 0,013 |
| *rappel : HO6–HO8 (entraînement)* | *P100D* | *30–50* | *≈ 600* | *0,51–0,62* | *1,97–3,46* | *4,1–6,4* | *0,105–0,261* | *0,030–0,089* |

Graines du candidat, toutes organoïdes confondus (dispersion, pré-enregistrement §7.3) :
- S1 ∈ [0,54 ; 0,70] ;
- S2 ∈ [2,60 ; 3,05] ;
- S3 ∈ [4,0 ; 6,4] ;
- S4 ∈ [0,151 ; 0,223] ;
- S5 ∈ [0,045 ; 0,083].

La variabilité entre graines est faible devant l'écart aux organoïdes de test. Le verdict ne
tient donc pas au hasard du tirage.

## 2. Analyses secondaires pré-déclarées / Preregistered secondary analyses

**§7.1 — Écart standardisé** z = (candidat − moyenne des organoïdes de test) / écart-type :

| S1 | S2 | S3 | S4 | S5 |
|---|---|---|---|---|
| +1,84 | **+2,27** | −0,96 | −1,95 | −1,30 |

Le critère strict (tous les |z| ≤ 2) **échoue sur S2**. Avec n = 5, ces z sont très
imprécis ; ils restent descriptifs.

**§7.2 — Homogénéité du lot.** Les plages de test recouvrent mal celles d'entraînement :

| | S1 | S2 | S3 | S4 | S5 |
|---|---|---|---|---|---|
| Entraînement (HO6–8) | 0,51–0,62 | 1,97–3,46 | 4,1–6,4 | 0,105–0,261 | 0,030–0,089 |
| Test (HO1–5) | 0,14–0,57 | 1,14–2,60 | 2,2–19,8 | 0,245–0,429 | 0,013–0,346 |

Conformément à la règle d'interprétation pré-déclarée, l'échec s'interprète **d'abord
comme une variabilité inter-organoïdes non capturée** par un modèle calibré sur trois
organoïdes seulement.

## 3. Constat post hoc : l'âge des organoïdes (sans incidence sur le verdict)
## Post hoc finding: organoid age (no bearing on the verdict)

**FR.** Après l'analyse, la lecture des métadonnées NWB (`subject/description`) révèle un
fait que la règle de sélection ignorait :
- les organoïdes d'entraînement HO6–HO8 et le test HO5 sont décrits comme **P100D**
  (environ 100 jours) ;
- les tests HO1 à HO4 sont décrits comme **P7M** (environ 7 mois).

Les quatre P7M se séparent nettement des quatre P100D sur toutes les statistiques :

| | S1 | S2 | S3 | S4 | S5 |
|---|---|---|---|---|---|
| P7M (HO1–4) | 0,14–0,57 | 1,14–1,32 | 9,0–19,8 | 0,245–0,429 | 0,22–0,35 |
| P100D (HO5–8) | 0,35–0,62 | 1,97–3,46 | 2,2–6,4 | 0,105–0,261 | 0,013–0,089 |

Les P7M montrent des bouffées de réseau plus fréquentes et une synchronie bien plus forte.
Cela concorde avec la maturation des réseaux décrite chez l'organoïde cortical (Trujillo et
al. 2019). L'épreuve a donc mis le candidat au défi d'une **généralisation à un autre stade
de maturation**, plus exigeante que la « même session de traitement » visée.

**Erreur de conception, déclarée.** L'âge n'apparaissait pas dans le listing public, et la
règle de sélection (§2) ne portait que sur le lot de traitement. Un pré-enregistrement plus
soigneux aurait inspecté les métadonnées de sujet, sans lire les données de spikes, et
stratifié par âge. Cette limite relève de l'auditeur, pas du modèle.

**Nuance.** L'âge n'explique pas tout. HO5, seul organoïde de test de même âge que
l'entraînement, s'écarte aussi du candidat :
- S1 : 0,35 contre 0,58 simulé pour sa durée ;
- S3 : 2,2/min contre 4,9 ;
- S5 : 0,013 contre 0,066.

Il reste proche du candidat sur S2 (2,60 contre 2,85) et S4 (0,252 contre 0,176). Même à âge
égal, la variabilité entre organoïdes dépasse ce que trois organoïdes d'entraînement
permettent d'estimer.

**EN.** Post hoc, the NWB subject metadata show that HO1–HO4 are **7-month** organoids,
whereas the training organoids HO6–HO8 and the test organoid HO5 are **100-day**
organoids. The two age groups separate on every statistic: the older ones burst more often
and are far more synchronous, in line with the network maturation reported in cortical
organoids (Trujillo et al. 2019). E2 therefore tested generalisation across maturation
stages, which the selection rule did not intend. This is a **design error of the auditor**,
declared here: the rule should have stratified by age using subject metadata. Age does not
explain everything, however: HO5, the only age-matched test organoid, also departs from the
candidate on S1, S3 and S5.

## 4. Écarts et précisions / Deviations and clarifications

1. **Aucun écart de procédure.**
   - Mêmes fichiers, mêmes règles, même code (hachés).
   - Aucune exclusion.
   - Aucun recalage du modèle sur les organoïdes de test.
2. **Durées.** Les enregistrements HO1–HO4 durent environ 3 min (T de 176,7 à 180,0 s),
   contre 10 min pour HO5–HO8. La règle `T = min(durée, 600 s)` s'applique sans ambiguïté,
   et chaque simulation est appariée à la durée de son organoïde. Des fenêtres plus courtes
   rendent S3 et S5 plus bruités pour HO1–HO4.
3. **Granularité.** Il y a 80 à 308 unités triées par organoïde de test, contre 128
   électrodes simulées. L'asymétrie était déclarée ; elle est ici moins marquée que dans E1.
4. **Métadonnées d'âge.** Elles n'ont été lues qu'après l'analyse (§3). Elles ne modifient
   pas le verdict.

## 5. Données et reproductibilité / Data and reproducibility

| Fichier de test (DANDI 001603, v0.260923.0623) | SHA-256 |
|---|---|
| `sub-HO1_ses-20250924T002125.nwb` | `fcf777c3f2b37cf5303034f9405ab6add4585136a7920d5db807d5dfaafadb9b` |
| `sub-HO2_ses-20250924T002113.nwb` | `346a1b12118ce9bde242cfcb215cb8d726a79d6082e35baefe3dbf284c030b9a` |
| `sub-HO3_ses-20250924T002116.nwb` | `e8bf96df1f8f07b71cb700f24fb51c0c48148402093ca57a4e5eea2ecf26105f` |
| `sub-HO4_ses-20250924T002126.nwb` | `88627424dd5ba99fce7062fc05f5e13aa21b6514500809ea897d5d3e974b5988` |
| `sub-HO5_ses-20250924T002125.nwb` | `994089b04fee86bd987709e45826386d153f3c1ab6e54f7752f733865cfd84e7` |

Rejouer / Replay :

```bash
python3 empirical/run_e2.py sub-HO1_ses-20250924T002125.nwb sub-HO2_ses-20250924T002113.nwb \
    sub-HO3_ses-20250924T002116.nwb sub-HO4_ses-20250924T002126.nwb sub-HO5_ses-20250924T002125.nwb
```

Les fichiers ne sont pas redistribués. Pour que le rejeu reste possible, les fichiers gelés
(`src/engine/neuroplatform.ts`, `sim_export.ts`, `confront.py`, `run_e2.py`) ne doivent pas
être modifiés. Toute évolution du simulateur se fera dans un commit ultérieur ; E2 se rejoue
alors depuis `1905da1`.

## 6. Conséquences pour ASTRA / Consequences for ASTRA

- **Statut du modèle `'network-burst'`** : *partiellement adéquat* (E2).
  - Il corrige le défaut structurel d'E1 : il produit bouffées et synchronie, et aucune
    statistique n'est incompatible.
  - Son calibrage sur trois organoïdes de 100 jours ne se transfère pas à des organoïdes
    plus âgés, ni pleinement à un quatrième organoïde de même âge.
  - Il reste une **option non par défaut**. Le modèle par défaut reste `'poisson'`, comme
    prévu (§9 du pré-enregistrement).
- **Formulation recevable** : « générateur phénoménologique de trains à bouffées de réseau,
  calibré sur trois organoïdes humains de 100 jours (DANDI 001603). Il reproduit
  l'existence des bouffées et d'une synchronie faible, mais pas la variabilité
  inter-organoïdes ni l'évolution avec la maturation ».
- **Piste E3 (non engagée).**
  - Le modèle devrait représenter explicitement la variabilité entre organoïdes, par
    exemple des paramètres tirés par organoïde (modèle hiérarchique), voire leur dépendance
    à l'âge.
  - Il faudrait le calibrer sur des organoïdes des deux âges, et l'éprouver sur des données
    encore jamais vues, idéalement issues d'un autre jeu de données.
  - HO1–HO5 ont désormais été vus : ils ne peuvent plus servir de test.

## Références / References

- Cutts, C. S. & Eglen, S. J. (2014). Detecting pairwise correlations in spike trains: an
  objective comparison of methods and application to the study of retinal waves. *Journal
  of Neuroscience*, 34(43), 14288–14303. doi:10.1523/JNEUROSCI.2767-14.2014
- Trujillo, C. A. et al. (2019). Complex oscillatory waves emerging from cortical organoids
  model early human brain network development. *Cell Stem Cell*, 25(4), 558–569.
  doi:10.1016/j.stem.2019.08.002
- Van der Molen, T. et al. (2025). *Nature Neuroscience*. doi:10.1038/s41593-025-02111-0 ;
  données : DANDI 001603, doi:10.48324/dandi.001603/0.260923.0623 (CC-BY-4.0).
