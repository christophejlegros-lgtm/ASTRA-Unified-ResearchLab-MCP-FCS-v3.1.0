# Couche FCS — fonctionnalisme contraint par le substrat

> **Rectificatif v3.2 :** Pareto est un choix méthodologique, pas une unicité universelle démontrée par Arrow. Les canaux du magasin d'état sont simulés même en mode live. Un nombre fourni par l'appelant est rapporté, pas mesuré par défaut. Les verdicts de réalisation organoïde sont des hypothèses taxonomiques. Voir [rectificatif](docs/CORRECTIONS-THEORIQUES.fr.md).

**ASTRA v3.2.0-rc.1 · outils `fcs_*` (8) · ressources `astra://fcs/*` (4) · prompts (2)**

Implémentation, dans ASTRA, des valeurs de la série :

| Document | Titre | Version |
|---|---|---|
| I | Fonctionnalisme contraint par le substrat | v1.5 |
| II | Complément métaphysique | v1.4 |
| IV | L'implémentation neurochimique | v1.3 · 06·10·2026 (table inchangée depuis la v1.2) |
| S | Synthèse illustrée | S-1.6 · 06·10·2026 |

© Genève 2026 Christophe Jean Legros · Assistance Multi IA

---

## 1. Ce que la couche n'est pas

Elle ne produit **aucun score**. C'est une contrainte d'architecture, non une
retenue de style : l'heuristique négative de la série interdit en quatrième
position les scores agrégés sur des critères ordinaux dépourvus d'échelle
commune (document II §1.4, d'après Okasha 2011 — le théorème d'Arrow appliqué
au choix de théorie).

La politique adoptée est la **dominance au sens de
Pareto**, qui produit un ordre *partiel*. Deux couples incomparables le
restent. `mayAggregate()` refuse à l'exécution toute combinaison de critères
ordinaux, et `refuseAggregate()` renvoie un scalaire retenu portant son motif
plutôt qu'un nombre.

Cette discipline prolonge `tcai/phenomenal-guard.ts`, qui encode déjà la
distinction accès/phénoménal de Block dans le système de types : il n'existe
pas de constructeur de revendication phénoménale, et il n'existe pas davantage
de constructeur de score de conformité.

---

## 2. Le cadre à quatre niveaux et la couverture d'ASTRA

| Niveau | Contenu | Statut | Réalisé par | Module ASTRA |
|---|---|---|---|---|
| **I** Substrat | flux ioniques transmembranaires, champs endogènes, couplage éphaptique | Établi (existence) · Modélisé (hypothèse du champ) | MEA organoïde | `engine/neuroplatform.ts` |
| **II** Proto-conscience kinesthésique | boucle efférence–réafférence, soi minimal | Modélisé · Contesté | SNN silicium, MEA | `tcai/self-model.ts`, `second-order.ts` |
| **III** Inférence hiérarchique | codage prédictif, a priori descendants | Modélisé | SNN silicium | `world-model.ts`, `tcai/active-inference.ts` |
| **IV** Conscience d'accès | ignition, diffusion globale | Établi (signatures) · Contesté (suffisance) | SNN silicium | `tcai/global-workspace.ts` |

**Noyau** — individuation par un profil fonctionnel ; contrainte de substrat au
sens *faible* (dans le vivant, le profil est réalisé **de fait** par une classe
restreinte de dynamiques ioniques transmembranaires) ; émergence faible ;
recevabilité polynomiale.

**Ceinture** — l'**hypothèse du champ** : le champ endogène est une voie de
couplage causalement efficace et non un épiphénomène de mesure. Depuis la v1.5
du document I, la contrainte de substrat (noyau) et l'hypothèse du champ
(ceinture) sont distinguées ; les confondre est l'erreur que cette version
existe pour lever.

### Ce que la couche établit sur ASTRA

Le réseau LIF+STDP en silicium **ne réalise aucun couple constitutif**.
L'équation LIF nomme un potentiel de membrane et une conductance, mais rien ne
traverse de membrane : les variables sont celles du modèle, non celles du
substrat. Sous la contrainte de substrat, le porteur de niveau I y est absent,
quel que soit le profil montré aux niveaux III et IV — ce qui reste compatible
avec la réalisabilité multiple *en principe* affirmée par le noyau.

Le niveau III est le seul où ASTRA **remplit** la condition de recevabilité du
noyau plutôt que de l'approcher : la famille d'approximations est déclarée —
encodeur joint-embedding, régularisation SIGReg, planification CEM à horizon
borné.

---

## 3. La taxonomie neurochimique

Treize classes moléculaires, **dix-sept couples espèce–fonction**, cinq rôles
causaux, trois sous-critères ordinaux, **huit strates**.

Le classement porte sur des **fonctions**, non sur des substances : le glutamate
est générateur en classe 3 et métabolite en classe 13 ; le calcium est porteur de
charge en classe 1 et, comme second messager, relève des cascades de
signalisation et non du porteur.

### Les trois sous-critères

| Sous-critère | Définition | Codé |
|---|---|---|
| **d** | distance causale au porteur, en étapes médiées par une entité distincte ; charge mobile = 0 ; coefficient des équations du porteur = 1 | `pair.d` |
| **τ** | la plus longue de deux durées — action sur le porteur, variation physiologique propre ; décide si la classe peut individuer un épisode (~100 ms) | `pair.tauLog10` |
| **ablation** | effet sur les signatures de niveau IV, en quatre degrés ordonnés | `pair.ablation` |

### L'ordinalisation de τ — déclarée par le document IV v1.3

Le document IV v1.2 publiait τ comme une **plage**, et les strates, sans la
réduction qui les relie. La réduction employée dans `EPISODE_WINDOW_ORDINALISATION`
a été reconstruite comme celle qui reproduit les strates publiées ; **le document
IV v1.3 (§2, 06·10·2026) la déclare désormais** :

```
rang 0 — la plage descend à 10⁻¹ s ou en deçà : la classe agit dans la fenêtre de l'épisode
rang 1 — la plage démarre au-dessus de 10⁻¹ s, jusqu'à 10⁰ s : elle chevauche la fenêtre
rang 2 — la plage démarre au-dessus de 10⁰ s : elle ne peut pas individuer d'épisode
```

La réduction **reproduit exactement les huit strates publiées** (§3 du document
IV), et `tests/fcs.test.ts` le vérifie à chaque exécution. Cet accord est un
**contrôle de cohérence de la transcription, non une validation des coupes** :
conclure de l'accord à la justesse de la réduction serait l'inférence que
proscrit l'interdiction 3. Le choix porte du poids — sur dix réductions
plausibles (`ALTERNATIVE_ORDINALISATIONS` : borne supérieure, point médian,
exposant brut, coupes décalées ou moins nombreuses), **seule la réduction
déclarée** reproduit les strates ; les autres déplacent d'un à quatorze couples.
`ordinalisationSensitivity()` le rapporte, et `fcs_stratify` le renvoie.

```ts
const result = canonicalStratification();
result.reproducesPublished; // true
result.divergences;         // []
result.strata.length;       // 8
```

### Les huit strates

| Strate | Couples | Lecture |
|---|---|---|
| S1 | 1 | l'ion comme charge mobile |
| S2 | 2a | canaux, récepteurs ionotropes, connexines |
| S3 | 2b · 3 · 4 · 11 | quatre couples ; 4 et 11 équivalents, les autres incomparables |
| S4 | 5 · 6 · 10a · 12a | quatre couples ; 10a et 12a équivalents, les autres incomparables |
| S5 | 9b · 10b | deux couples incomparables |
| S6 | 7 · 8 | deux couples incomparables |
| S7 | 9a | hormones, voie génomique |
| S8 | 12b · 13 | équivalents sur les trois sous-critères |

L'incomparabilité est un **résultat**, non une lacune : `fcs_compare` la
rapporte explicitement, avec le motif — les départager exigerait l'agrégation
que l'interdiction 4 refuse.

### Ce que l'indice de strate ne dit pas (v3.1.1)

Les strates **présentent** l'ordre partiel ; elles ne sont pas l'ordre. Deux faits
sont calculés, non affirmés (`stratification.ts` §4, tests dans `tests/fcs.test.ts`) :

- **Deux couples de strates différentes ne sont pas nécessairement comparables.**
  Sur les 121 paires que les strates séparent, **28** ne sont ordonnées par aucune
  dominance — ainsi le milieu extracellulaire (S3) et les neuromodulateurs (S4).
  Lire l'indice comme un rang rétablirait l'ordre total que l'interdiction 4
  retire. `fcs_compare` le signale désormais lorsque deux couples incomparables
  occupent des strates différentes.
- **La strate dépend du contexte.** Retirer l'ion (classe 1) fait remonter d'une
  strate les seize autres couples ; six retraits sur dix-sept déplacent au moins un
  autre couple. L'indice étiquette l'épluchage ; cette dépendance ne prouve pas
  une violation de l'indépendance des préférences d'Arrow. La dominance de deux
  couples ne change pas par retrait d'un tiers.

L'objet fidèle au §2 du document IV est la **relation de dominance** — 93 paires
ordonnées sur 136 — et son diagramme de Hasse. `fcs_stratify` rend les deux
(`dominance.hasse`, `incomparableAcrossStrata`, `contextDependence`).

---

## 4. L'audit de conformité

`fcs_conformance` répond, pour chacun des trois substrats, à une question que la
contrainte de substrat rend bien posée : **quels couples ce substrat réalise-t-il,
et par quel canal ASTRA l'observe-t-il ?**

Quatre verdicts : `realised` · `simulated` · `absent` · `undetermined`.

### Les biomarqueurs IRB sont déjà des observations de classes

C'est le point où la couche cesse d'être une table et devient une intégration :

| Canal ASTRA | Couple | Rôle | Provenance |
|---|---|---|---|
| *entrée externe* — Ca²⁺ extracellulaire, mM | **1** — ions | constitutif | mesuré (ASTRA n'a pas ce canal) |
| `eth.ca` — Ca²⁺ libre **intracellulaire**, nM | *aucun couple* — second messager, hors classe 1 | — | rapporté, non lié |
| `eth.fr` — fréquence de décharge médiane par unité, Hz | **3** — acides aminés transmetteurs | générateur | proxy, provenance par canal |
| `eth.atp` — rapport ATP/ADP | **7** — métabolites énergétiques | permissif | provenance par canal |
| `eth.viab` — viabilité, % | **2b** — Na⁺/K⁺-ATPase | permissif | proxy, provenance par canal |

**Calcium, corrigé en v3.1.1.** Jusqu'à la v3.1.0, `eth.ca` était lié à la classe 1
comme « Ca²⁺ extracellulaire au bain de la MEA ». Or `ethics.ts` le définit comme
le Ca²⁺ libre *intracellulaire* (seuils 100/200 nM) — le second messager que le
document IV §2 et la synthèse S-1.6 placent explicitement hors de la classe 1 — et
le Ca²⁺ du bain se compte en millimoles, non en nanomoles. Le seul canal attaché à
un couple constitutif reposait sur l'erreur de catégorie que la série interdit.
La classe 1 ne lit plus qu'une valeur extracellulaire en mM, fournie par
l'appelant (`extracellularCalciumMm`) ; à défaut, elle est `withheld()`.

**Fréquence de décharge, recalibrée en v3.1.1.** `eth.fr` est la fréquence
spontanée médiane par unité (statistique S1 d'`empirical/confront.py`), rapportée
aux huit organoïdes de DANDI 001603 analysés en E1/E2 : normal 0,14–0,63 Hz,
stress à un facteur 2 près, détresse au-delà. L'ancienne plage de 15–45 Hz aurait
déclaré en détresse chacun de ces organoïdes réels. C'est un intervalle de
référence descriptif tiré d'un seul jeu de données, non un critère de bien-être
validé.

Un biomarqueur qui dérive devient ainsi l'énoncé « tel couple a quitté sa plage
de fonctionnement », et non plus seulement un drapeau d'éthique. Un canal muet
ne renvoie **pas zéro** : le couple passe à `withheld()`. Une mesure absente
n'est pas une mesure nulle.

### Le substrat humain

Chaque verdict est `undetermined` **par construction**. Le sujet réalise toute la
taxonomie ; le canal autonome à 1 Hz n'en détermine rien, et l'enregistrer est le
résultat de l'audit, non son échec.

---

## 5. Les conditions de retrait

`fcs_withdrawal` évalue la ceinture contre des issues de volets. Une issue non
réglée reste `undetermined` et **ne bascule jamais au négatif**.

**Ordre de révision déclaré**, commun aux documents I, II et IV :

```
1 procédure d'inférence et auxiliaires de mesure
2 auxiliaire de pont
3 hypothèse de grain (M2)
4 critère d'individuation (M3)
5 thèse kinesthésique
6 hypothèse du champ
```

Le déclarer d'avance est ce qui empêche une réfutation d'être absorbée par
l'auxiliaire le moins coûteux à sacrifier après coup.

### L'asymétrie du biais

Le biais méthodologique du volet humain favorise le champ. L'évaluateur la
reproduit : `fieldBeyondFiringInHumans: true` laisse M2 **indéterminée**, car
l'issue favorable ne discrimine pas. Seule `false` — l'issue contraire au biais —
retire M2.

De même, la covariation seule ne tranche pas l'auxiliaire de pont : la
composition ionique varie avec l'état (Ding et al., 2016) et une cause commune
neuromodulatrice peut agir en amont. C'est l'intervention locale qui porte la
valeur du volet.

### Le noyau

Il ne figure pas dans l'évaluation. Sa révision serait l'abandon du programme,
non un mouvement en son sein — et `evaluateWithdrawal()` refuse de le coter.

---

## 6. L'heuristique négative, appliquée

| # | Interdiction | Application |
|---|---|---|
| P1 | quantifier un degré de proto-conscience ou d'expérience | `lintFcs()` |
| P2 | identifier une mesure à la phénoménalité | `lintFcs()` |
| P3 | inférer un mécanisme d'un succès d'ajustement | `lintFcs()` |
| P4 | scores agrégés sur des critères ordinaux sans échelle commune | `mayAggregate()` · `refuseAggregate()` |
| P5 | inférer un rôle constitutif d'un effet d'ablation permissif | `mayInferConstitutive()` |

Toute charge utile passe par **deux** linters — `lintClaim` (distinction de
Block) et `lintFcs` (les cinq interdictions). Une charge qui échoue à l'un est
renvoyée en erreur, non émise avec une réserve en note. **Depuis la v3.1.1, cela
vaut pour tout le serveur**, et non plus pour la seule couche FCS :
`src/lint-guard.ts` enveloppe chaque outil et chaque ressource (seul `fcs_lint`
est exempté, puisqu'il renvoie la chaîne examinée). Jusqu'à la v3.1.0, cinquante
des soixante-dix outils — dont `get_acm_score`, qui classait alors son composite
en « niveaux de conscience » ABSENT…FULL — n'étaient pas filtrés. Cette échelle
est retirée.

**Ce que sont les linters.** Des heuristiques par motifs : ils attrapent les
formulations qu'ils encodent (la v3.1.1 ajoute les paraphrases courantes —
« consciousness level 0.7 », « Consciousness: 0.7 », « 71 % conscious »,
« Phi equals phenomenal experience »), non toute formulation possible. Ils
filtrent la sortie d'ASTRA ; ils ne prouvent pas qu'aucune charge ne puisse
porter une revendication interdite.

**Usage et mention.** Les unités bibliographiques sont exemptées au niveau de
l'unité — un DOI, ou une unité qui s'ouvre sur une liste d'auteurs (« Casali,
A. G., … (2013). ») — afin qu'un titre reste attaché à son repère ; une année
entre parenthèses à la fin d'une assertion ne l'exempte plus (v3.1.1). Les
mentions d'une interdiction sont exemptées par **phrase**, et non lorsque la
phrase affirme aussi une valeur (« selon l'interdiction 4, le degré de conscience
vaut 0,71 » fait le mouvement). Corrigé en v3.1.1 : l'alternative finale de la
règle P3 n'était pas groupée et se déclenchait sur toute phrase contenant
« mécanisme ». Le principe demeure : les segments qui *mentionnent* une
interdiction ou qui sont bibliographiques ne sont pas des assertions — « Interdiction de quantifier un degré de proto-conscience »
énonce le mouvement pour l'interdire, et Casali et al. (2013) s'intitule
*A theoretically based index of consciousness* que la formule plaise ou non. Un
linter qui se déclenche sur lui-même finit désactivé, donc sans effet.

> **Note d'implémentation.** Sans le drapeau `u`, `\b` de JavaScript est ASCII :
> dans « phénoménalité. », le « é » final et le « . » sont tous deux des
> non-mots, il n'y a donc aucune frontière entre eux et un `\b` terminal ne se
> déclenche jamais. Les règles françaises se terminent par le lookahead `EOW`.

---

## 7. Surface MCP

| Outil | Objet |
|---|---|
| `fcs_report` | vue consolidée : cadre, noyau/ceinture, strates, substrats, interdictions, ordre de révision |
| `fcs_taxonomy` | les 17 couples, filtrables par rôle, strate ou identifiant |
| `fcs_stratify` | recalcule l'ordre partiel ; les coupes de τ sont exposées en paramètre |
| `fcs_compare` | pourquoi deux couples sont ordonnés — ou pourquoi ils sont incomparables |
| `fcs_levels` | les quatre niveaux, leur statut, les modules ASTRA et l'écart non comblé |
| `fcs_conformance` | audit par substrat, branché sur les biomarqueurs IRB vivants |
| `fcs_withdrawal` | tenue de la ceinture sous des issues de volets ; ordre de révision |
| `fcs_lint` | crible d'une chaîne, d'une agrégation ou d'une inférence constitutive |

**Ressources** — `astra://fcs/framework` · `astra://fcs/taxonomy` ·
`astra://fcs/conformance` · `astra://fcs/references`

**Prompts** — `fcs-substrate-audit` · `fcs-belt-review`

---

## 8. Console

`dashboard/ASTRA-FCS-Dashboard.html` — page autonome, bilingue FR/EN,
fonctionnant hors ligne sur la table embarquée et se branchant au transport HTTP
(`http://localhost:9003/mcp`) lorsqu'il est disponible.

La console **recalcule l'ordre partiel dans le navigateur** à partir des trois
sous-critères et affiche si elle reproduit les huit strates publiées : elle
démontre la règle au lieu d'en afficher un résultat gelé. Sept sections — cadre,
strates (diagramme de Hasse, relation de couverture), carte des classes (plages
de τ sur axe logarithmique, fenêtre de l'épisode marquée), conformité, retrait
(pupitre des volets), heuristique négative (linter vivant), sources.

---

## 9. Tests

```bash
npm run test:fcs     # 86 tests de la couche FCS
npm test             # suite complète — 354 tests
```

Le test porteur est `reproduces the eight published strata exactly`. Il
recalcule l'ordre par dominance et le compare aux strates du §3 du document IV.
C'est le seul moyen de savoir qu'une transcription est juste.

---

## 10. Appareil

Chaque entrée de `engine/fcs/references.ts` porte la mention **(v)** des
documents sources : DOI résolu, lors de la rédaction ou le 19 septembre 2026,
contre le système Handle de la DOI Foundation ou contre les métadonnées
Crossref. ASTRA n'a ni forgé ni reconstruit de DOI ; une entrée que les
documents sources ne portent pas ne figure pas dans le fichier.

Appuis principaux : Chiang et al. (2019) · Traynelis & Dingledine (1989) ·
Dudek et al. (1990) · Ding et al. (2016) · Dehaene & Changeux (2011) ·
Koch et al. (2016) · Casali et al. (2013) · Okasha (2011) · Craver (2007) ·
Baumgartner & Gebharter (2016) · Aru et al. (2012) · de Graaf et al. (2012).
