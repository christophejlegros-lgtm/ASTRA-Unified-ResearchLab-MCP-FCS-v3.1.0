# Demande de revue externe · External review request

**ASTRA-FCS v3.1.1** · <https://github.com/christophejlegros-lgtm/ASTRA-Unified-ResearchLab-MCP-FCS-v3.1.0>
Version archivée / Archived release : [doi:10.5281/zenodo.23196960](https://doi.org/10.5281/zenodo.23196960)
Christophe Jean Legros · Assistance Multi IA, Genève · Assistant-Multi-IA@proton.me

---

## FR — Objet

ASTRA-FCS est un serveur *Model Context Protocol* qui expose 70 outils de simulation
et d'analyse à des assistants d'IA, et qui rend exécutable le programme de recherche du
fonctionnalisme contraint par le substrat (FCS). Le code, la théorie et leur vérification
procèdent d'un même auteur, assisté d'outils d'IA ; **aucun n'a encore été examiné de
l'extérieur**. Cette demande sollicite deux relectures indépendantes, l'une en
neurosciences computationnelles, l'autre en philosophie de l'esprit.

Toutes les données biologiques produites sont simulées ; les indices liés à la
conscience sont des proxys calculés, non des mesures. La revue porte sur la
**recevabilité** de ce que l'instrument permet d'affirmer, non sur une prétention
empirique qu'il ne formule pas.

Une exception, circonscrite : le simulateur d'organoïde a été confronté, sous
pré-enregistrements publics, à des enregistrements réels d'organoïdes cérébraux humains
(DANDI 001603). L'épreuve E1 l'a jugé **inadéquat** ; un modèle révisé, calibré sur trois
organoïdes puis gelé, a été jugé **partiellement adéquat** sur cinq organoïdes non vus
(E2). Ces deux épreuves font partie de l'objet de la revue (A6, A7).

## EN — Purpose

ASTRA-FCS is a *Model Context Protocol* server exposing 70 simulation and analysis tools
to AI assistants, and making the research programme of substrate-constrained
functionalism (FCS) executable. The code, the theory and their verification come from a
single author, assisted by AI tools; **none has yet been examined externally**. This
request seeks two independent reviews, one in computational neuroscience, one in
philosophy of mind.

All biological data produced are simulated; consciousness-related indices are computed
proxies, not measurements. The review bears on the **admissibility** of what the
instrument lets one claim, not on an empirical claim it does not make.

One bounded exception: the organoid simulator was confronted, under public
preregistrations, with real human brain-organoid recordings (DANDI 001603). Test E1 found
it **inadequate**; a revised model, calibrated on three organoids and then frozen, was
found **partially adequate** on five unseen organoids (E2). Both tests are within the
scope of the review (A6, A7).

---

## Relecture A — Neurosciences computationnelles · Review A — Computational neuroscience

Couches 1 et 2 (modèles, proxys) · Layers 1 and 2 (models, proxies)

| # | Question | Fichiers / Files |
|---|---|---|
| A1 | Le moteur LIF+STDP (128 neurones, STDP événementielle) est-il correctement implémenté et ses paramètres plausibles ? · Is the LIF+STDP engine correctly implemented and are its parameters plausible? | `src/engine/snn.ts` |
| A2 | Le cœur d'inférence active calcule-t-il bien l'énergie libre variationnelle ? La référence NumPy est-elle indépendante ? · Does the active-inference core compute variational free energy correctly? Is the NumPy reference independent? | `src/engine/tcai/active-inference.ts`, `python/second_order/` |
| A3 | Les proxys Φ̃, GW̃, PAD̃ et l'ignition GNW sont-ils décrits sans surinterprétation ? · Are the Φ̃, GW̃, PAD̃ proxies and GNW ignition described without over-interpretation? | `src/engine/acm.ts`, `src/engine/tcai/` |
| A4 | Le modèle spontané révisé (`spontaneousModel: 'network-burst'`, bouffées de réseau et amas locaux) est-il un générateur phénoménologique raisonnable, et son implémentation est-elle fidèle au prototype de calibration ? · Is the revised spontaneous model (network bursts and local clusters) a reasonable phenomenological generator, and is its implementation faithful to the calibration prototype? | `src/engine/neuroplatform.ts`, `empirical/e2_calibrate.py`, `tests/neuroplatform-e2.test.ts` |
| A5 | La classification des 70 outils (lecture seule, additif, destructif) est-elle juste ? · Is the classification of the 70 tools correct? | `src/tool-annotations.ts` |
| A6 | Les statistiques S1–S5 (taux, CV des intervalles, bouffées de réseau, part en bouffées, STTC) et les règles de verdict des épreuves E1/E2 sont-elles appropriées et correctement codées ? La comparaison unités triées / électrodes simulées biaise-t-elle le verdict ? · Are the S1–S5 statistics and the E1/E2 decision rules appropriate and correctly coded? Does comparing sorted units with simulated electrodes bias the verdict? | `empirical/confront.py`, `empirical/test_confront.py`, `empirical/PREREG-*.md` |
| A7 | Le verdict d'E2 et son interprétation sont-ils recevables, compte tenu du contrôle négatif, de l'erreur de sélection déclarée (âge des organoïdes) et de l'historique de calibration ? Que devrait exiger une épreuve E3 ? · Are the E2 verdict and its interpretation admissible, given the negative control, the declared selection error (organoid age) and the calibration history? What should a test E3 require? | `empirical/RESULTS-E1.md`, `empirical/RESULTS-E2.md`, `empirical/results/` |

## Relecture B — Philosophie de l'esprit · Review B — Philosophy of mind

Couches 2 à 4 (proxys, cadre normatif, exclusion phénoménale) · Layers 2 to 4

| # | Question | Fichiers / Files |
|---|---|---|
| B1 | La distinction accès/phénoménal (Block 1995) est-elle correctement inscrite dans le garde-fou, et le linter distingue-t-il bien usage et mention ? · Is the access/phenomenal distinction correctly encoded, and does the linter separate use from mention? | `src/engine/tcai/phenomenal-guard.ts`, `src/engine/fcs/negative-heuristic.ts` |
| B2 | La partition noyau/ceinture et l'ordre de révision sont-ils cohérents avec une méthodologie lakatosienne ? · Are the hard-core/belt partition and revision order consistent with a Lakatosian methodology? | `src/engine/fcs/withdrawal.ts`, `FCS-INTEGRATION.*.md` |
| B3 | Le refus d'agréger des critères ordinaux (Okasha 2011) est-il fondé, et l'ordre partiel de Pareto est-il la bonne alternative ? · Is refusing ordinal aggregation well founded, and is the Pareto partial order the right alternative? | `src/engine/fcs/stratification.ts` |
| B4 | L'ordinalisation de τ, déclarée comme reconstruction, introduit-elle un degré de liberté qui affaiblit la reproduction des strates publiées ? · Does the τ ordinalisation, declared as a reconstruction, introduce a degree of freedom that weakens the reproduction of the published strata? | `src/engine/fcs/stratification.ts` (`EPISODE_WINDOW_ORDINALISATION`), `tests/fcs.test.ts` |
| B5 | Le pré-enregistrement proposé rend-il les hypothèses de niveau I réellement réfutables ? · Does the proposed preregistration make the level-I hypotheses genuinely falsifiable? | `PREREGISTRATION.md` |

---

## Modalités · Practicalities

- **Reproduire / Reproduce :** `npm ci && npm run build && npm test` (Node ≥ 20 ; Python 3 + numpy pour `npm run golden:check`). Graine fixée par défaut ; `ASTRA_SEED` pour la changer. Épreuves empiriques : `python3 empirical/test_confront.py`, puis `empirical/run_e1.py` et `empirical/run_e2.py` sur les fichiers DANDI 001603 indiqués dans les rapports (Python 3 + numpy + h5py ; fichiers non redistribués).
- **Répondre / Respond :** une *issue* GitHub par question (préfixe `[A1]`, `[B3]`…), ou un rapport à l'adresse ci-dessus. Les relectures seront publiées avec l'accord de leurs auteurs, et leurs objections citées telles quelles.
- **Conflits d'intérêts / Conflicts of interest :** à déclarer par chaque relecteur. **Auteur :** aucun lien financier, contractuel ni de collaboration avec les entreprises citées (FinalSpark, OVOMIND, Koniku). L'auteur est aussi l'auteur de la série FCS que la couche FCS transcrit ; le code a été développé et audité avec l'assistance d'outils d'IA. · Each reviewer declares their own. **Author:** no financial, contractual or collaborative ties with the companies named (FinalSpark, OVOMIND, Koniku). The author also wrote the FCS series that the FCS layer transcribes; the code was developed and audited with the assistance of AI tools.
- **Documents d'appui / Supporting documents :** analyse épistémologique de diffusion ; série FCS (dossier `FCS v1.5/`).
