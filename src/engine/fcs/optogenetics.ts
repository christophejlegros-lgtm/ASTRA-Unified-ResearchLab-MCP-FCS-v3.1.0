/**
 * ASTRA × FCS — The optogenetic extension of the belt (synthesis S-1.6)
 * ═════════════════════════════════════════════════════════════════════
 * Synthesis S-1.6 (06·10·2026), "L'optogénétique dans la ceinture". Documents
 * I (v1.5) and II (v1.4) mention neither optogenetics, nor the engram, nor
 * astrocytes: what follows is an extension of the belt, not a revision of the
 * core. The published table is unchanged — seventeen pairs, eight strata.
 *
 * Three things are encoded, each as data that can be contested in isolation:
 *   1. what each intervention DISSOCIATES on the Duhemian axis (field vs spiking
 *      under their generative dependence), and whether it satisfies the clause
 *      of prohibition 5 (modifies the class without removing the general
 *      conditions of operation);
 *   2. the decomposition of the astrocytic anchoring onto pairs ALREADY in the
 *      table — a cell type is not a species–function pair;
 *   3. the results that bear on belt theses without meeting their withdrawal
 *      conditions.
 *
 * Two claims of S-1.6 are checked by computation rather than restated:
 *   · "the two columns do not overlap" — no intervention both breaks the
 *     generative dependence and satisfies the P5 clause;
 *   · a candidate astrocytic pair would carry exactly class 8's ordinal
 *     coordinates, hence add no distinction to the partial order.
 *
 * © 2026 Christophe Jean Legros — Geneva · Assistance Multi IA
 */

import { PAIR_BY_ID, type SpeciesFunctionPair } from './taxonomy.js';
import { dominates, tauRank } from './stratification.js';

// ── 1. What each intervention dissociates ─────────────────────────

export type InterventionId =
  | 'osmotic'
  | 'opto-gain'
  | 'activity-tagging'
  | 'astrocytic'
  | 'electrical'
  | 'synaptic-blockade'
  | 'opto-loss'
  | 'pharmacological-ablation';

export interface Intervention {
  id: InterventionId;
  labelFr: string;
  labelEn: string;
  dissociatesFr: string;
  dissociatesEn: string;
  /** Acts on the current → field edge itself (breaks the generative dependence). */
  breaksDependence: boolean;
  /** Modifies the class without removing the general conditions of operation (P5 clause). */
  satisfiesP5Clause: boolean;
}

export const INTERVENTIONS: readonly Intervention[] = Object.freeze([
  {
    id: 'osmotic', labelFr: 'Manipulation osmotique', labelEn: 'Osmotic manipulation',
    dissociatesFr: 'Le rapport entre courant et champ : un même courant transmembranaire engendre un champ différent selon la fraction volumique.',
    dissociatesEn: 'The ratio of current to field: the same transmembrane current generates a different field depending on volume fraction.',
    breaksDependence: true, satisfiesP5Clause: false,
  },
  {
    id: 'opto-gain', labelFr: 'Optogénétique, gain de fonction', labelEn: 'Optogenetics, gain of function',
    dissociatesFr: 'Le type cellulaire et l\'ensemble, non le champ de la décharge. La channelrhodopsine appartient à la classe 2a et entraîne directement le courant transmembranaire.',
    dissociatesEn: 'Cell type and ensemble, not field from spiking. Channelrhodopsin belongs to class 2a and drives the transmembrane current directly.',
    breaksDependence: false, satisfiesP5Clause: true,
  },
  {
    id: 'activity-tagging', labelFr: 'Marquage dépendant de l\'activité', labelEn: 'Activity-dependent tagging',
    dissociatesFr: 'Les cellules actives pendant l\'apprentissage de celles qui ne l\'étaient pas ; orthogonal à l\'axe duhémien.',
    dissociatesEn: 'The cells active during learning from those that were not; orthogonal to the Duhemian axis.',
    breaksDependence: false, satisfiesP5Clause: true,
  },
  {
    id: 'astrocytic', labelFr: 'Manipulation astrocytaire', labelEn: 'Astrocytic manipulation',
    dissociatesFr: 'Le contrôleur endogène du gain de couplage, de ses effets de réseau : fraction volumique et tamponnage du K⁺.',
    dissociatesEn: 'The endogenous controller of the coupling gain, from its network effects: volume fraction and K⁺ buffering.',
    breaksDependence: false, satisfiesP5Clause: true,
  },
  {
    id: 'electrical', labelFr: 'Stimulation électrique', labelEn: 'Electrical stimulation',
    dissociatesFr: 'Rien, sur l\'axe duhémien : la variable indépendante n\'est pas isolable.',
    dissociatesEn: 'Nothing, on the Duhemian axis: the independent variable is not isolable.',
    breaksDependence: false, satisfiesP5Clause: true,
  },
  {
    id: 'synaptic-blockade', labelFr: 'Blocage synaptique', labelEn: 'Synaptic blockade',
    dissociatesFr: 'La voie rivale : la matrice de champ cesse d\'être dérivable de la matrice synaptique et reste dérivable de la matrice de décharge.',
    dissociatesEn: 'The rival route: the field matrix ceases to be derivable from the synaptic matrix and remains derivable from the spiking matrix.',
    breaksDependence: false, satisfiesP5Clause: false,
  },
  {
    id: 'opto-loss', labelFr: 'Optogénétique, perte de fonction', labelEn: 'Optogenetics, loss of function',
    dissociatesFr: 'Le type cellulaire ; mais l\'inhibition est une ablation du porteur dans la population ciblée, si étroite soit-elle.',
    dissociatesEn: 'Cell type; but silencing is an ablation of the carrier in the targeted population, however narrow.',
    breaksDependence: false, satisfiesP5Clause: false,
  },
  {
    id: 'pharmacological-ablation', labelFr: 'Ablation pharmacologique', labelEn: 'Pharmacological ablation',
    dissociatesFr: 'Rien de propre : intervention à main lourde par construction (Craver, 2007 ; Baumgartner & Gebharter, 2016).',
    dissociatesEn: 'Nothing of its own: fat-handed by construction (Craver, 2007; Baumgartner & Gebharter, 2016).',
    breaksDependence: false, satisfiesP5Clause: false,
  },
]);

export const INTERVENTION_BY_ID: ReadonlyMap<InterventionId, Intervention> =
  new Map(INTERVENTIONS.map((i) => [i.id, i]));

/** S-1.6: "Les deux colonnes ne se recouvrent pas." Returns the overlapping interventions (expected: none). */
export function columnsOverlap(): Intervention[] {
  return INTERVENTIONS.filter((i) => i.breaksDependence && i.satisfiesP5Clause);
}

export const DUHEMIAN_NOTE = Object.freeze({
  fr: 'Ce qui rompt la dépendance générative n\'épargne pas les conditions générales de fonctionnement, et ce qui les épargne ne rompt pas la dépendance. Sur l\'axe duhémien, l\'optogénétique occupe la position déjà assignée à la stimulation électrique : sa précision est de ciblage, non de dissociation.',
  en: 'What breaks the generative dependence does not spare the general conditions of operation, and what spares them does not break the dependence. On the Duhemian axis, optogenetics occupies the position already assigned to electrical stimulation: its precision is one of targeting, not of dissociation.',
  status: 'Normatif / Normative',
});

export const P5_INSTRUMENT_NOTE = Object.freeze({
  fr: 'Un gain de fonction optogénétique satisfait la clause de l\'interdiction 5 : il n\'ôte pas la vanne, il en ajoute une pilotable par une variable — la lumière — qui n\'appartient pas au système. Une perte de fonction ne la satisfait pas. L\'inférence reste recevable en conjonction avec les deux autres sous-critères, pour le seul couple atteint, et jamais pour le porteur de niveau I lorsque la portée de l\'intervention est le pont.',
  en: 'An optogenetic gain of function satisfies the clause of prohibition 5: it does not remove the valve, it adds one controlled by a variable — light — that does not belong to the system. A loss of function does not satisfy it. The inference remains admissible in conjunction with the two other sub-criteria, for the single pair reached, and never for the level-I carrier when the intervention\'s reach is the bridge.',
  status: 'Normatif / Normative',
});

// ── 2. The astrocytic anchoring, decomposed onto existing pairs ───

export interface AstrocyticFunction {
  functionFr: string;
  functionEn: string;
  pairId: string;
  /** True when the function is the one the pair EXCLUDES (Ca²⁺ as second messenger vs class 1). */
  excludedFromPair: boolean;
  whyFr: string;
  whyEn: string;
}

export const ASTROCYTIC_DECOMPOSITION: readonly AstrocyticFunction[] = Object.freeze([
  {
    functionFr: 'Ca²⁺ comme second messager', functionEn: 'Ca²⁺ as second messenger',
    pairId: '1', excludedFromPair: true,
    whyFr: 'Le document IV sépare les deux fonctions du calcium : porteur de charge en classe 1, second messager relevant des cascades de signalisation. La signalisation calcique astrocytaire est la seconde ; elle ne touche pas le porteur de niveau I.',
    whyEn: 'Document IV separates calcium\'s two functions: charge carrier in class 1, second messenger belonging to signalling cascades. Astrocytic calcium signalling is the second; it does not touch the level-I carrier.',
  },
  {
    functionFr: 'Volume cellulaire et fraction volumique', functionEn: 'Cell volume and volume fraction',
    pairId: '4', excludedFromPair: false,
    whyFr: 'La classe 4 fixe le gain du couplage éphaptique par la résistivité du milieu ; les astrocytes en sont le contrôleur endogène, de la seconde à la minute.',
    whyEn: 'Class 4 sets the ephaptic coupling gain through the medium\'s resistivity; astrocytes are its endogenous controller, on a seconds-to-minutes scale.',
  },
  {
    functionFr: 'Tamponnage du K⁺ extracellulaire', functionEn: 'Buffering of extracellular K⁺',
    pairId: '5', excludedFromPair: false,
    whyFr: 'La classe 5 fixe les forces électromotrices ; le tamponnage du potassium est ce que le volet osmotique doit contrôler, et figure parmi ses confondants déclarés.',
    whyEn: 'Class 5 sets the electromotive forces; potassium buffering is what the osmotic strand must control, and is among its declared confounds.',
  },
  {
    functionFr: 'Entrée noradrénergique', functionEn: 'Noradrenergic input',
    pairId: '6', excludedFromPair: false,
    whyFr: 'Le marquage astrocytaire exige l\'entrée des neurones de l\'engramme et celle des neurones noradrénergiques ; le processus est en aval de la classe 6.',
    whyEn: 'Astrocytic tagging requires engram-neuron and noradrenergic input; the process is downstream of class 6.',
  },
  {
    functionFr: 'Trace multijour', functionEn: 'Multiday trace',
    pairId: '8', excludedFromPair: false,
    whyFr: 'La classe 8 porte τ de 10² à 10⁶ s et l\'effet « aucun effet dans la fenêtre ; dérive lente » : la trace astrocytaire multijour tombe dans cette plage, hors de la fenêtre de l\'épisode.',
    whyEn: 'Class 8 carries τ from 10² to 10⁶ s and the effect "no effect within the window; slow drift": the multiday astrocytic trace falls in that range, outside the episode window.',
  },
]);

/**
 * The candidate pair a reviewer might propose — the astrocytic ensemble as a
 * trace carrier — with the coordinates S-1.6 assigns it.
 */
export const CANDIDATE_ASTROCYTIC_PAIR: SpeciesFunctionPair = Object.freeze({
  id: 'astro*',
  labelFr: 'Ensemble astrocytaire (couple candidat, hors table)',
  labelEn: 'Astrocytic ensemble (candidate pair, not in the table)',
  role: 'modulatory',
  d: 3,
  tauLog10: [2, 6] as const,
  ablation: 3,
  ablationNoteFr: 'aucun effet dans la fenêtre ; dérive lente',
  ablationNoteEn: 'no effect within window; slow drift',
  status: 'Normatif / Normative (candidat)',
  publishedStratum: 6,
});

/**
 * Computed check of S-1.6's sharpest argument against introducing the pair:
 * it would carry exactly class 8's ordinal coordinates — equivalent to it, and
 * therefore adding no distinction to the partial order.
 */
export function candidatePairAddsNoDistinction(): { equivalentTo: string; addsDistinction: boolean } {
  const c8 = PAIR_BY_ID.get('8');
  if (!c8) throw new Error('class 8 missing from the taxonomy');
  const same = CANDIDATE_ASTROCYTIC_PAIR.d === c8.d
    && tauRank(CANDIDATE_ASTROCYTIC_PAIR) === tauRank(c8)
    && CANDIDATE_ASTROCYTIC_PAIR.ablation === c8.ablation
    && !dominates(CANDIDATE_ASTROCYTIC_PAIR, c8).dominates
    && !dominates(c8, CANDIDATE_ASTROCYTIC_PAIR).dominates;
  return { equivalentTo: '8', addsDistinction: !same };
}

export const ASTROCYTIC_PREDICTION = Object.freeze({
  fr: 'Si aucune fonction astrocytaire ne relève d\'un couple constitutif, l\'engagement astrocytaire agit sur la récupérabilité — propriété d\'accès de niveau IV — sans individuer d\'épisode conscient, et ne touche le porteur que par la voie paramétrique (fraction volumique, potassium).',
  en: 'If no astrocytic function belongs to a constitutive pair, astrocytic engagement acts on retrievability — a level-IV access property — without individuating a conscious episode, and touches the carrier only by the parametric route (volume fraction, potassium).',
  refutedByFr: 'Une manipulation astrocytaire qui supprimerait ou déformerait les signatures de niveau IV dans la fenêtre de l\'épisode, à composition ionique et fraction volumique contrôlées.',
  refutedByEn: 'An astrocytic manipulation abolishing or deforming level-IV signatures within the episode window, with ionic composition and volume fraction controlled.',
  status: 'Modélisé / Modelled',
});

// ── 3. Results that bear on theses without making them yield ──────

export interface BearingResult {
  resultFr: string;
  resultEn: string;
  bearsOn: 'M2' | 'M3' | 'bridge-auxiliary';
  meetsWithdrawalCondition: false;
  whyNotEn: string;
}

export const RESULTS_BEARING_WITHOUT_WITHDRAWAL: readonly BearingResult[] = Object.freeze([
  {
    resultFr: 'Géométrie représentationnelle de la valence (amygdale basolatérale)',
    resultEn: 'Representational geometry of valence (basolateral amygdala)',
    bearsOn: 'M2', meetsWithdrawalCondition: false,
    whyNotEn: 'M2\'s withdrawal condition requires a variance partition in humans against a report-based similarity matrix; mice do not report. The result belongs to the bridge auxiliary.',
  },
  {
    resultFr: 'Inversion de valence d\'un engramme hippocampique',
    resultEn: 'Valence switch of a hippocampal engram',
    bearsOn: 'M3', meetsWithdrawalCondition: false,
    whyNotEn: 'M3\'s withdrawal condition concerns boundary shifts better predicted by imposed synchrony or field topology than by closure; the experiment does not manipulate operational closure. It constrains M3\'s ontological reading.',
  },
  {
    resultFr: 'Astrocytes de l\'amygdale basolatérale (rappel et extinction)',
    resultEn: 'Basolateral-amygdala astrocytes (recall and extinction)',
    bearsOn: 'bridge-auxiliary', meetsWithdrawalCondition: false,
    whyNotEn: 'It supplies the in vivo form of the local intervention the bridge requires, on the endogenous controller of volume fraction; the strand remains to be run with the ephaptic coupling coefficient measured.',
  },
]);

/** One consolidated view, for fcs_report and the framework resource. */
export function beltExtensionS16() {
  return {
    source: 'Synthèse illustrée S-1.6 (06·10·2026) — extension de la ceinture / belt extension',
    interventions: INTERVENTIONS,
    columnsOverlap: columnsOverlap().map((i) => i.id),
    duhemianNote: DUHEMIAN_NOTE,
    p5Instrument: P5_INSTRUMENT_NOTE,
    astrocyticDecomposition: ASTROCYTIC_DECOMPOSITION,
    candidatePair: {
      coordinates: { d: CANDIDATE_ASTROCYTIC_PAIR.d, tauLog10: CANDIDATE_ASTROCYTIC_PAIR.tauLog10, ablation: CANDIDATE_ASTROCYTIC_PAIR.ablation },
      ...candidatePairAddsNoDistinction(),
    },
    prediction: ASTROCYTIC_PREDICTION,
    resultsBearingWithoutWithdrawal: RESULTS_BEARING_WITHOUT_WITHDRAWAL,
    tableUnchangedEn: 'The published table is unchanged: seventeen pairs, eight strata.',
  };
}
