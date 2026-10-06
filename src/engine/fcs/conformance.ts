/**
 * ASTRA × FCS — Substrate conformance audit
 * ═════════════════════════════════════════
 * Answers, for each substrate ASTRA runs on, a question the substrate constraint
 * makes well-posed: WHICH of the seventeen species–function pairs does this
 * substrate actually realise, and through which channel does ASTRA observe it?
 *
 * ⚠ NO CONFORMANCE SCORE IS PRODUCED, and none may be derived. Strata are
 * ordinal labels over three ordinal sub-criteria lacking a common scale;
 * aggregating them is prohibition 4. What this module returns is a PROFILE —
 * a per-pair verdict with its provenance — which is strictly more informative
 * than a number and cannot be ranked against another substrate's.
 *
 * WHAT MAKES THIS MORE THAN A TABLE. Some of ASTRA's IRB welfare biomarkers are
 * observations of FCS neurochemical classes: the ATP/ADP ratio is class 7, the
 * median per-unit firing rate is the generator signature of class 3, and
 * viability stands proxy for class 2b. The audit binds those live channels to
 * the taxonomy, so a drifting biomarker becomes a statement about which pair
 * has left its operating range — not merely an ethics flag.
 *
 * CALCIUM (corrected in v3.1.1). ASTRA's `eth.ca` is INTRACELLULAR free Ca²⁺ in
 * nM (ethics.ts) — the second messenger, which document IV §2 and synthesis
 * S-1.6 place outside class 1. Up to v3.1.0 it was bound to class 1 as
 * "extracellular Ca²⁺ at the MEA bath", an error of category (and of scale:
 * bath Ca²⁺ is of the order of 1–2 mM, not 10–100 nM). Class 1 now reads only
 * an extracellular calcium channel in mM, which ASTRA does not have unless a
 * caller supplies one; `eth.ca` is reported and bound to no pair.
 *
 * © 2026 Christophe Jean Legros — Geneva · Assistance Multi IA
 */

import { tagged, withheld, SUBSTRATES, type SubstrateKind, type TaggedScalar } from '../tcai/phenomenal-guard.js';
import { PAIRS, type CausalRole, type SpeciesFunctionPair } from './taxonomy.js';
import { canonicalStratification } from './stratification.js';
import { LEVELS, levelProfile, type FcsLevel, type SubstrateLevelProfile } from './levels.js';

// ── 1. Per-pair realisation verdict ───────────────────────────────

export type RealisationVerdict =
  /** The species is physically present in this substrate and performs this function. */
  | 'realised'
  /** A functional analogue exists, but not the species — a simulation of the role. */
  | 'simulated'
  /** The species is absent from this substrate. */
  | 'absent'
  /** ASTRA has no channel that determines this. Reported, never guessed. */
  | 'undetermined';

export interface PairConformance {
  pairId: string;
  labelEn: string;
  role: CausalRole;
  stratum: number;
  verdict: RealisationVerdict;
  /** The ASTRA channel that grounds the verdict, or null when undetermined. */
  channel: string | null;
  /** Live reading from that channel, epistemically tagged. */
  reading: TaggedScalar;
  basisEn: string;
}

/**
 * Live biomarker inputs the audit consumes. Every field is optional: a missing
 * field yields `undetermined`, never a default standing in for a measurement.
 */
export interface BiomarkerInputs {
  /**
   * INTRACELLULAR free calcium, nM — ASTRA `eth.ca`. A second-messenger
   * quantity: reported by the audit, bound to NO species–function pair.
   */
  calciumNm?: number;
  /**
   * EXTRACELLULAR calcium at the bath, mM — the mobile-charge reading class 1
   * requires. ASTRA has no such channel; supplied only by an external caller.
   */
  extracellularCalciumMm?: number;
  /** Median per-unit spontaneous firing rate, Hz — ASTRA `eth.fr`. */
  firingRateHz?: number;
  /** ATP/ADP ratio — ASTRA `eth.atp`. */
  atpAdpRatio?: number;
  /** Culture viability, % — ASTRA `eth.viab`. */
  viabilityPct?: number;
  /** MEA field-potential channel is live and returning signal. */
  meaFieldActive?: boolean;
}

// ── 2. Channel bindings ───────────────────────────────────────────

type Binding = {
  channel: string;
  basisEn: string;
  read: (b: BiomarkerInputs) => TaggedScalar;
};

/**
 * Which ASTRA channel, if any, bears on each pair for an organoid substrate.
 * Pairs absent from this map are not instrumented: the audit says so rather
 * than inventing a reading.
 */
const ORGANOID_BINDINGS: Record<string, Binding> = {
  '1': {
    channel: 'extracellular Ca²⁺ at the bath, mM (external input; ASTRA has no such channel)',
    basisEn:
      'Class 1 is the ion AS MOBILE CHARGE, read extracellularly in mM. ASTRA\'s eth.ca is intracellular free ' +
      'Ca²⁺ in nM — the second messenger, which belongs to signalling cascades and not to the carrier ' +
      '(document IV §2; synthesis S-1.6) — and is therefore NOT bound here.',
    read: (b) => b.extracellularCalciumMm === undefined
      ? withheld(
          'No extracellular calcium channel. ASTRA\'s eth.ca is intracellular free Ca²⁺ (nM), a second-messenger ' +
          'quantity outside class 1; reading it as mobile charge would be the category error document IV §2 forbids.')
      : tagged(b.extracellularCalciumMm, 'access', 'measured', 'Extracellular Ca²⁺, mM, at the bath (externally supplied).'),
  },
  '2b': {
    channel: 'eth.viab (culture viability, %)',
    basisEn:
      'Viability stands PROXY for the pump: sustained Na⁺/K⁺-ATPase activity is a precondition of membrane ' +
      'integrity, and a viability collapse is the non-selective failure the permissive role predicts. The ' +
      'pump itself is not assayed — this is a derived indicator, not a measurement of class 2b.',
    read: (b) => b.viabilityPct === undefined
      ? withheld('Viability channel not reporting.')
      : tagged(b.viabilityPct, 'access', 'derived', 'Culture viability, %, as a permissive-role proxy for Na⁺/K⁺-ATPase.'),
  },
  '3': {
    channel: 'eth.fr (median per-unit spontaneous firing rate, Hz)',
    basisEn:
      'The firing rate is the generator signature: glutamatergic and GABAergic currents command the ' +
      'dominant component of the measured field. The transmitters are not assayed; their generator ROLE is ' +
      'inferred from the discharge they drive. Reference interval: DANDI 001603, 0.14–0.63 Hz (ethics.ts).',
    read: (b) => b.firingRateHz === undefined
      ? withheld('Firing-rate channel not reporting.')
      : tagged(b.firingRateHz, 'access', 'derived', 'Median per-unit firing rate, Hz, as the class-3 generator signature.'),
  },
  '7': {
    channel: 'eth.atp (ATP/ADP ratio)',
    basisEn:
      'Direct index of the energy metabolites of class 7. Permissive: its fall predicts non-selective failure, ' +
      'and prohibition 5 blocks reading a constitutive role off that failure.',
    read: (b) => b.atpAdpRatio === undefined
      ? withheld('ATP/ADP channel not reporting.')
      : tagged(b.atpAdpRatio, 'access', 'measured', 'ATP/ADP ratio — class-7 energy metabolites.'),
  },
};

/** Pairs an organoid culture realises whether or not ASTRA instruments them. */
const ORGANOID_REALISED = new Set([
  '1', '2a', '2b', '3', '4', '5', '6', '7', '8', '9b', '10a', '10b', '11', '12a', '12b', '13',
]);
/** Genomic hormone signalling requires an endocrine axis a dissociated culture lacks. */
const ORGANOID_ABSENT = new Set(['9a']);

// ── 3. The audit ──────────────────────────────────────────────────

export interface CarrierVerdict {
  /** Does this substrate carry a transmembrane ionic current at all? */
  carrierPresent: boolean;
  /** Does ASTRA observe the field the carrier generates? */
  fieldObserved: TaggedScalar;
  statementEn: string;
  statementFr: string;
}

export interface SubstrateConformance {
  substrate: SubstrateKind;
  label: string;
  isomorphismCaveat: string;
  levels: SubstrateLevelProfile;
  carrier: CarrierVerdict;
  pairs: PairConformance[];
  /** Counts by verdict — a tally, not a score. Tallies do not order substrates. */
  tally: Record<RealisationVerdict, number>;
  /**
   * Explicit refusal, carried in the payload so that a consumer looking for a
   * conformance number finds this instead of inventing one.
   */
  aggregateRefusal: TaggedScalar;
  notesEn: string[];
}

function verdictFor(substrate: SubstrateKind, pair: SpeciesFunctionPair): RealisationVerdict {
  switch (substrate) {
    case 'organoid-mea':
      if (ORGANOID_ABSENT.has(pair.id)) return 'absent';
      return ORGANOID_REALISED.has(pair.id) ? 'realised' : 'undetermined';

    case 'silicon-snn':
      // No transmembrane ionic dynamics of any kind. The LIF equation names a
      // membrane potential and a conductance, but nothing crosses a membrane:
      // the variables are the model's, not the substrate's.
      if (pair.role === 'constitutive' || pair.role === 'parametric') return 'absent';
      // STDP and the neuromodulatory gain terms simulate the modulatory role.
      if (pair.role === 'modulatory' || pair.role === 'generator') return 'simulated';
      return 'absent';

    case 'human-wearable':
      // The subject realises every pair. ASTRA's channel carries effector-side
      // autonomic correlates at 1 Hz and determines none of them.
      return 'undetermined';
  }
}

function carrierVerdict(substrate: SubstrateKind, bio: BiomarkerInputs): CarrierVerdict {
  switch (substrate) {
    case 'organoid-mea':
      return {
        carrierPresent: true,
        fieldObserved: bio.meaFieldActive
          ? tagged(1, 'access', 'measured', 'MEA extracellular field potential channel is live.')
          : withheld('MEA field channel inactive — carrier present, field not currently observed.'),
        statementEn:
          'Transmembrane ionic currents are present and their field is measurable at the electrode. What the ' +
          'MEA does NOT measure is extracellular volume fraction or resistivity, so the field-hypothesis ' +
          'question — autonomous coupling route vs measurement epiphenomenon — is not decided by this channel.',
        statementFr:
          'Les courants ioniques transmembranaires sont présents et leur champ est mesurable à l\'électrode. Ce que ' +
          'la MEA ne mesure PAS, c\'est la fraction volumique ni la résistivité : la question de l\'hypothèse du ' +
          'champ — voie de couplage autonome ou épiphénomène de mesure — n\'est pas tranchée par ce canal.',
      };
    case 'silicon-snn':
      return {
        carrierPresent: false,
        fieldObserved: withheld('No transmembrane ionic current exists in this substrate; there is no field to observe.'),
        statementEn:
          'The substrate constraint is not satisfied. The LIF+STDP network realises a functional profile at ' +
          'levels III and IV; under the core\'s weak substrate constraint that is compatible with multiple ' +
          'realisability in principle and says nothing about the carrier, which is absent here.',
        statementFr:
          'La contrainte de substrat n\'est pas satisfaite. Le réseau LIF+STDP réalise un profil fonctionnel aux ' +
          'niveaux III et IV ; sous la contrainte faible du noyau, cela reste compatible avec la réalisabilité ' +
          'multiple en principe et ne dit rien du porteur, qui est ici absent.',
      };
    case 'human-wearable':
      return {
        carrierPresent: true,
        fieldObserved: withheld(
          'The subject carries the full level-I dynamics. ASTRA\'s channel is peripheral autonomic physiology ' +
          'at 1 Hz and observes no field quantity whatsoever.',
        ),
        statementEn:
          'The carrier is present in the subject and entirely outside ASTRA\'s channel. Autonomic signals are ' +
          'effector-side correlates of affect in a human being, not states of ASTRA and not observations of the carrier.',
        statementFr:
          'Le porteur est présent chez le sujet et entièrement hors du canal d\'ASTRA. Les signaux autonomes sont ' +
          'des corrélats effecteurs de l\'affect chez un humain, non des états d\'ASTRA ni des observations du porteur.',
      };
  }
}

/**
 * Audit one substrate against the seventeen species–function pairs.
 *
 * @param bio live biomarker readings; omit a field and the audit reports
 *            `undetermined` for the pairs it would have grounded
 */
export function auditSubstrate(
  substrate: SubstrateKind,
  bio: BiomarkerInputs = {},
): SubstrateConformance {
  const strat = canonicalStratification();
  const descriptor = SUBSTRATES[substrate];

  const pairs: PairConformance[] = PAIRS.map((pair) => {
    const binding = substrate === 'organoid-mea' ? ORGANOID_BINDINGS[pair.id] : undefined;
    const verdict = verdictFor(substrate, pair);
    const reading = binding
      ? binding.read(bio)
      : withheld(
          substrate === 'human-wearable'
            ? 'No ASTRA channel determines this pair in a human subject; the wearable carries autonomic correlates only.'
            : 'Pair not instrumented on this substrate.',
        );
    return {
      pairId: pair.id,
      labelEn: pair.labelEn,
      role: pair.role,
      stratum: strat.byPair[pair.id],
      verdict,
      channel: binding?.channel ?? null,
      reading,
      basisEn: binding?.basisEn ?? `${pair.labelEn}: ${verdict} on ${descriptor.label}.`,
    };
  });

  const tally: Record<RealisationVerdict, number> = { realised: 0, simulated: 0, absent: 0, undetermined: 0 };
  for (const p of pairs) tally[p.verdict]++;

  const notesEn: string[] = [];
  const constitutiveRealised = pairs.filter((p) => p.role === 'constitutive' && p.verdict === 'realised').length;
  if (constitutiveRealised === 0) {
    notesEn.push(
      'No constitutive pair is realised on this substrate. Under the substrate constraint the level-I carrier ' +
      'is absent, whatever the level-III and level-IV profile shows.',
    );
  }
  const permissiveOnly = pairs.filter((p) => p.role === 'permissive' && p.reading.value !== null);
  if (permissiveOnly.length > 0 && constitutiveRealised === 0) {
    notesEn.push(
      'Permissive-role channels are reporting while no constitutive pair is realised. Prohibition 5 blocks ' +
      'reading a constitutive role off any failure these channels register.',
    );
  }
  if (substrate === 'organoid-mea' && bio.calciumNm !== undefined) {
    notesEn.push(
      `Intracellular free Ca²⁺ (eth.ca = ${bio.calciumNm} nM) is reported but bound to no pair: as second ` +
      'messenger it is excluded from class 1 (document IV §2; synthesis S-1.6), and it is not a carrier quantity.',
    );
  }
  if (substrate === 'human-wearable') {
    notesEn.push(
      'Every verdict is `undetermined` by design. The subject realises the full taxonomy; ASTRA\'s 1 Hz ' +
      'autonomic channel determines none of it, and recording that is the audit\'s result, not its failure.',
    );
  }

  return {
    substrate,
    label: descriptor.label,
    isomorphismCaveat: descriptor.isomorphismCaveat,
    levels: levelProfile(substrate),
    carrier: carrierVerdict(substrate, bio),
    pairs,
    tally,
    aggregateRefusal: withheld(
      'No conformance score. Strata are ordinal labels over three ordinal sub-criteria lacking a common ' +
      'scale; aggregating them is prohibition 4 (document II §1.4, after Okasha 2011). The per-pair profile ' +
      'above is the result.',
    ),
    notesEn,
  };
}

/** Audit all three substrates in one pass. */
export function auditAll(bio: BiomarkerInputs = {}): SubstrateConformance[] {
  return (Object.keys(SUBSTRATES) as SubstrateKind[]).map((s) => auditSubstrate(s, bio));
}

// ── 4. Level-wise view across substrates ──────────────────────────

export interface LevelCoverage {
  level: FcsLevel;
  nameEn: string;
  realisedBy: SubstrateKind[];
  simulatedBy: SubstrateKind[];
  astraModules: string[];
  gapEn: string;
}

/** Which substrate covers which level — the framework read column-wise. */
export function levelCoverage(): LevelCoverage[] {
  const all = (Object.keys(SUBSTRATES) as SubstrateKind[]);
  return (['I', 'II', 'III', 'IV'] as FcsLevel[]).map((level) => {
    const d = LEVELS[level];
    return {
      level,
      nameEn: d.nameEn,
      realisedBy: all.filter((s) => levelProfile(s).realises.includes(level)),
      simulatedBy: all.filter((s) => levelProfile(s).simulates.includes(level)),
      astraModules: d.astraModules,
      gapEn: d.astraGapEn,
    };
  });
}
