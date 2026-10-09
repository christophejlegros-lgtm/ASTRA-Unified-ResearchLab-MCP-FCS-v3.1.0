/**
 * ASTRA × FCS — Pareto stratification of the neurochemical taxonomy
 * ═════════════════════════════════════════════════════════════════
 * Document IV §2, "La règle d'agrégation : dominance, et ordre partiel".
 *
 * THE RULE
 * A total order over ordinal criteria lacking a common scale IS an aggregation,
 * and document II (§1.4, after Okasha 2011 on Arrow's impossibility theorem
 * applied to theory choice) holds such aggregation formally problematic; the
 * series' negative heuristic forbids it (prohibition 4). The rule adopted is
 * an explicit conservative policy: Pareto dominance. Arrow's theorem does not
 * establish its universal uniqueness; its application requires stated axioms.
 *
 *   A dominates B  ⟺  A is at least as close to the carrier as B on all three
 *                     sub-criteria, and strictly closer on at least one.
 *
 * The result is a PARTIAL order presented in strata: stratum 1 gathers the
 * pairs no other dominates; stratum k, those no remaining pair dominates once
 * the previous strata are removed. Two pairs in the same stratum are
 * incomparable or equivalent; document IV does not order them, and neither
 * does this module.
 *
 * ⚠ NO SCORE IS PRODUCED. A stratum index is an ordinal label. Subtracting
 * two stratum indices, averaging them, or treating them as a distance is
 * exactly the aggregation prohibition 4 forbids. See ./negative-heuristic.ts,
 * which lints for it at runtime.
 *
 * © 2026 Christophe Jean Legros — Geneva · Assistance Multi IA
 */

import { PAIRS, type SpeciesFunctionPair } from './taxonomy.js';

// ── 1. Ordinalisation of the time constant ────────────────────────

/**
 * Document IV publishes τ as a RANGE of decimal exponents per pair, and states
 * what the criterion is for: τ "decides whether a class can individuate a
 * conscious episode, of the order of a hundred milliseconds on level-IV
 * signatures (Dehaene & Changeux 2011; Koch et al. 2016)".
 *
 * Pareto dominance needs an ordinal comparison, so the range must be reduced to
 * a rank. The reduction used here is DECLARED, not read off the document:
 *
 *   rank 0 — the range reaches down to or below 10⁻¹ s (100 ms):
 *            the class can act within the window of an episode.
 *   rank 1 — the range starts above 10⁻¹ s but at or below 10⁰ s:
 *            the class straddles the window.
 *   rank 2 — the range starts above 10⁰ s:
 *            the class cannot individuate an episode; it sets the carrier's form.
 *
 * The reduction takes the range's LOWER bound, because the question is whether
 * the class CAN act inside the episode window, not whether it always does.
 *
 * EPISTEMIC STATUS OF THIS CHOICE — normative, declared, and load-bearing.
 * Document IV v1.2 published the τ ranges and the strata without the reduction
 * linking them. This reduction was RECONSTRUCTED as the one that reproduces the
 * published strata, and document IV v1.3 (§2, 06·10·2026) now declares it.
 * Reproducing the strata is therefore a consistency check of the transcription,
 * NOT an independent validation of the cuts: inferring the correctness of a
 * reduction from its fit to the published order would be the move prohibition 3
 * forbids. The choice is load-bearing — of the alternatives in
 * `ALTERNATIVE_ORDINALISATIONS` (upper bound, midpoint, raw exponent, shifted or
 * fewer cuts), none reproduces the eight strata; `ordinalisationSensitivity()`
 * reports it. The dominance engine is unaffected by the choice.
 */
export interface TauOrdinalisation {
  /** Decimal-exponent cuts, ascending, applied to the chosen point of the range. */
  cutsLog10: readonly number[];
  /** Point of the τ range that is ordinalised. Default 'lower'. */
  bound?: 'lower' | 'upper' | 'midpoint';
  /** When true, the chosen point itself is used as the ordinal value (no cuts). */
  raw?: boolean;
  basisFr: string;
  basisEn: string;
}

export const EPISODE_WINDOW_ORDINALISATION: TauOrdinalisation = Object.freeze({
  cutsLog10: Object.freeze([-1, 0]),
  basisFr:
    'Borne inférieure de la plage, découpée à 10⁻¹ s — la fenêtre de l\'épisode conscient nommée ' +
    'par le document IV — puis à 10⁰ s. Reconstruction déclarée : elle reproduit exactement les ' +
    'huit strates publiées, la source IV v1.3 §2 la déclare ; cet accord ne valide pas les coupes.',
  basisEn:
    'Lower bound of the range, cut at 10⁻¹ s — the conscious-episode window named by document IV — ' +
    'then at 10⁰ s. Reconstructed as the reduction that reproduces the eight published strata, and ' +
    'declared by document IV v1.3 §2. Reproduction checks the transcription; it does not validate the cuts.',
});

/** Ordinal rank of a pair's τ under a given reduction. Lower = closer to the carrier. */
export function tauRank(
  pair: SpeciesFunctionPair,
  ord: TauOrdinalisation = EPISODE_WINDOW_ORDINALISATION,
): number {
  const [lo, hi] = pair.tauLog10;
  const point = ord.bound === 'upper' ? hi : ord.bound === 'midpoint' ? (lo + hi) / 2 : lo;
  if (ord.raw) return point;
  let rank = 0;
  for (const cut of ord.cutsLog10) if (point > cut) rank++;
  return rank;
}

/**
 * Plausible alternative reductions of the τ range, for the sensitivity report.
 * Each is a reading a careful reader of document IV v1.2 could have made.
 */
export const ALTERNATIVE_ORDINALISATIONS: ReadonlyArray<{ id: string; ord: TauOrdinalisation }> = Object.freeze([
  { id: 'lower-cuts[-1,0] (declared)', ord: EPISODE_WINDOW_ORDINALISATION },
  { id: 'lower-cuts[-1]', ord: { cutsLog10: [-1], basisFr: '', basisEn: 'Single cut at the episode window.' } },
  { id: 'lower-cuts[-2,0]', ord: { cutsLog10: [-2, 0], basisFr: '', basisEn: 'First cut one decade earlier.' } },
  { id: 'lower-cuts[-1,1]', ord: { cutsLog10: [-1, 1], basisFr: '', basisEn: 'Second cut one decade later.' } },
  { id: 'lower-cuts[-1,0,2]', ord: { cutsLog10: [-1, 0, 2], basisFr: '', basisEn: 'An extra cut at 10² s.' } },
  { id: 'lower-raw', ord: { cutsLog10: [], raw: true, basisFr: '', basisEn: 'Lower-bound exponent used as is.' } },
  { id: 'upper-cuts[-1,0]', ord: { cutsLog10: [-1, 0], bound: 'upper', basisFr: '', basisEn: 'Upper bound, declared cuts.' } },
  { id: 'upper-raw', ord: { cutsLog10: [], bound: 'upper', raw: true, basisFr: '', basisEn: 'Upper-bound exponent used as is.' } },
  { id: 'midpoint-raw', ord: { cutsLog10: [], bound: 'midpoint', raw: true, basisFr: '', basisEn: 'Range midpoint used as is.' } },
  { id: 'midpoint-cuts[-1,0]', ord: { cutsLog10: [-1, 0], bound: 'midpoint', basisFr: '', basisEn: 'Midpoint, declared cuts.' } },
]);

// ── 2. Pareto dominance ───────────────────────────────────────────

export interface DominanceVerdict {
  dominates: boolean;
  /** Per-criterion comparison, for inspection. -1 = a closer, 0 = equal, 1 = b closer. */
  byCriterion: { d: -1 | 0 | 1; tau: -1 | 0 | 1; ablation: -1 | 0 | 1 };
}

const cmp = (x: number, y: number): -1 | 0 | 1 => (x < y ? -1 : x > y ? 1 : 0);

/**
 * Does `a` Pareto-dominate `b`? At least as close on all three sub-criteria,
 * strictly closer on at least one.
 */
export function dominates(
  a: SpeciesFunctionPair,
  b: SpeciesFunctionPair,
  ord: TauOrdinalisation = EPISODE_WINDOW_ORDINALISATION,
): DominanceVerdict {
  const byCriterion = {
    d: cmp(a.d, b.d),
    tau: cmp(tauRank(a, ord), tauRank(b, ord)),
    ablation: cmp(a.ablation, b.ablation),
  };
  const all = [byCriterion.d, byCriterion.tau, byCriterion.ablation];
  const atLeastAsClose = all.every((c) => c <= 0);
  const strictlyCloser = all.some((c) => c < 0);
  return { dominates: atLeastAsClose && strictlyCloser, byCriterion };
}

// ── 3. Stratification by iterative peeling ────────────────────────

export interface Stratum {
  /** Ordinal label. NOT a magnitude: no arithmetic may be performed on it. */
  index: number;
  pairIds: string[];
  pairs: SpeciesFunctionPair[];
}

export interface StratificationResult {
  strata: Stratum[];
  /** Stratum index by pair id. */
  byPair: Record<string, number>;
  ordinalisation: TauOrdinalisation;
  /** True when every computed stratum equals the one published in document IV §3. */
  reproducesPublished: boolean;
  divergences: Array<{ pairId: string; published: number; computed: number }>;
  rule: { fr: string; en: string };
}

/**
 * Peel the partial order: stratum k is the set of pairs no remaining pair
 * dominates, once strata 1…k−1 have been removed.
 */
export function stratify(
  pairs: readonly SpeciesFunctionPair[] = PAIRS,
  ord: TauOrdinalisation = EPISODE_WINDOW_ORDINALISATION,
): StratificationResult {
  let remaining = [...pairs];
  const strata: Stratum[] = [];
  const byPair: Record<string, number> = {};
  let index = 1;

  while (remaining.length > 0) {
    const layer = remaining.filter(
      (a) => !remaining.some((b) => b.id !== a.id && dominates(b, a, ord).dominates),
    );
    // Guard against a cycle — impossible for a strict partial order, but a
    // malformed external table could produce one, and an infinite loop inside
    // an MCP tool is worse than an exception.
    if (layer.length === 0) {
      throw new Error(
        'FCS stratification: no non-dominated pair among the remainder. ' +
        'The dominance relation is not a strict partial order — check the table.',
      );
    }
    const ids = new Set(layer.map((p) => p.id));
    strata.push({ index, pairIds: layer.map((p) => p.id), pairs: layer });
    for (const p of layer) byPair[p.id] = index;
    remaining = remaining.filter((p) => !ids.has(p.id));
    index++;
  }

  const divergences = pairs
    .filter((p) => byPair[p.id] !== p.publishedStratum)
    .map((p) => ({ pairId: p.id, published: p.publishedStratum, computed: byPair[p.id] }));

  return {
    strata,
    byPair,
    ordinalisation: ord,
    reproducesPublished: divergences.length === 0,
    divergences,
    rule: {
      fr: 'Dominance au sens de Pareto sur trois sous-critères ordinaux — distance causale au porteur, ' +
          'constante de temps, effet d\'ablation. Ordre partiel, sans agrégation numérique.',
      en: 'Pareto dominance on three ordinal sub-criteria — causal distance to the carrier, time constant, ' +
          'ablation effect. A partial order, with no numerical aggregation.',
    },
  };
}

/** Memoised default stratification — the engine's canonical partial order. */
let _cached: StratificationResult | null = null;
export function canonicalStratification(): StratificationResult {
  if (_cached === null) _cached = stratify();
  return _cached;
}

// ── 4. The dominance relation itself, and what the strata add to it ──

/**
 * WHY THIS SECTION EXISTS (v3.1.1). The strata are a PRESENTATION of the
 * partial order — each pair labelled by the peeling round that removes it — not
 * the order. Two facts follow, and both are computed here rather than asserted:
 *
 *  1. Pairs in different strata need not be comparable. A stratum index places
 *     the extracellular medium (3) "above" the neuromodulators (4) although
 *     neither dominates the other. Reading strata as ranks re-introduces the
 *     total order prohibition 4 removed.
 *  2. A pair's stratum depends on which other pairs are present: removing one
 *     pair can shift others. The index is a context-dependent label. Pairwise
 *     dominance is unchanged by removal of a third pair; label dependence alone
 *     does not demonstrate failure of Arrovian independence of preferences.
 *
 * The object faithful to document IV §2 is the dominance relation; its Hasse
 * diagram (cover relation) is the minimal exact description of it.
 */
export interface DominanceRelation {
  /** All ordered pairs (a dominates b). */
  dominates: Array<[string, string]>;
  /** Cover relation: a dominates b with no c such that a > c > b. */
  hasse: Array<[string, string]>;
  /** Unordered pairs with identical ordinal coordinates. */
  equivalent: Array<[string, string]>;
  comparableCount: number;
  unorderedPairCount: number;
}

export function dominanceRelation(
  pairs: readonly SpeciesFunctionPair[] = PAIRS,
  ord: TauOrdinalisation = EPISODE_WINDOW_ORDINALISATION,
): DominanceRelation {
  const dom: Array<[string, string]> = [];
  const equivalent: Array<[string, string]> = [];
  const key = (p: SpeciesFunctionPair) => `${p.d}|${tauRank(p, ord)}|${p.ablation}`;
  for (let i = 0; i < pairs.length; i++) {
    for (let j = 0; j < pairs.length; j++) {
      if (i === j) continue;
      if (dominates(pairs[i], pairs[j], ord).dominates) dom.push([pairs[i].id, pairs[j].id]);
      if (i < j && key(pairs[i]) === key(pairs[j])) equivalent.push([pairs[i].id, pairs[j].id]);
    }
  }
  const has = new Set(dom.map(([a, b]) => `${a}>${b}`));
  const ids = pairs.map((p) => p.id);
  const hasse = dom.filter(([a, b]) => !ids.some((c) => c !== a && c !== b && has.has(`${a}>${c}`) && has.has(`${c}>${b}`)));
  const n = pairs.length;
  return { dominates: dom, hasse, equivalent, comparableCount: dom.length, unorderedPairCount: (n * (n - 1)) / 2 };
}

/** Pairs placed in different strata that the dominance relation does NOT order. */
export function incomparableAcrossStrata(
  pairs: readonly SpeciesFunctionPair[] = PAIRS,
  ord: TauOrdinalisation = EPISODE_WINDOW_ORDINALISATION,
): { pairs: Array<{ a: string; b: string; strata: [number, number] }>; crossStratumCount: number } {
  const { byPair } = stratify(pairs, ord);
  const out: Array<{ a: string; b: string; strata: [number, number] }> = [];
  let cross = 0;
  for (let i = 0; i < pairs.length; i++) {
    for (let j = i + 1; j < pairs.length; j++) {
      const a = pairs[i], b = pairs[j];
      if (byPair[a.id] === byPair[b.id]) continue;
      cross++;
      if (!dominates(a, b, ord).dominates && !dominates(b, a, ord).dominates) {
        out.push({ a: a.id, b: b.id, strata: [byPair[a.id], byPair[b.id]] });
      }
    }
  }
  return { pairs: out, crossStratumCount: cross };
}

/** For each pair removed from the table, the other pairs whose stratum changes. */
export function stratumContextDependence(
  pairs: readonly SpeciesFunctionPair[] = PAIRS,
  ord: TauOrdinalisation = EPISODE_WINDOW_ORDINALISATION,
): Array<{ removed: string; shifted: Array<{ id: string; from: number; to: number }> }> {
  const full = stratify(pairs, ord).byPair;
  const out: Array<{ removed: string; shifted: Array<{ id: string; from: number; to: number }> }> = [];
  for (const x of pairs) {
    const rest = pairs.filter((p) => p.id !== x.id);
    const s = stratify(rest, ord).byPair;
    const shifted = rest.filter((p) => s[p.id] !== full[p.id]).map((p) => ({ id: p.id, from: full[p.id], to: s[p.id] }));
    if (shifted.length > 0) out.push({ removed: x.id, shifted });
  }
  return out;
}

/** How many published strata each alternative τ reduction would reproduce. */
export function ordinalisationSensitivity(
  pairs: readonly SpeciesFunctionPair[] = PAIRS,
): Array<{ id: string; strataCount: number; divergenceCount: number; reproducesPublished: boolean }> {
  return ALTERNATIVE_ORDINALISATIONS.map(({ id, ord }) => {
    const r = stratify(pairs, ord);
    return { id, strataCount: r.strata.length, divergenceCount: r.divergences.length, reproducesPublished: r.reproducesPublished };
  });
}

// ── 5. Pairwise explanation ───────────────────────────────────────

export interface ComparisonReport {
  a: string;
  b: string;
  relation: 'a-dominates-b' | 'b-dominates-a' | 'incomparable' | 'equivalent';
  detail: { d: [number, number]; tauRank: [number, number]; ablation: [number, number] };
  /** Strata of a and b — ordinal labels of the peeling, NOT an order between them. */
  strata: [number, number];
  noteFr: string;
  noteEn: string;
}

/**
 * Compare two pairs and say why they are ordered — or why they are not.
 * Incomparability is a RESULT, not a failure: a partial order has it by design,
 * and reporting it is the whole point of refusing a total order.
 */
export function comparePairs(
  aId: string,
  bId: string,
  ord: TauOrdinalisation = EPISODE_WINDOW_ORDINALISATION,
): ComparisonReport {
  const a = PAIRS.find((p) => p.id === aId);
  const b = PAIRS.find((p) => p.id === bId);
  if (!a || !b) throw new Error(`Unknown pair id: ${!a ? aId : bId}`);

  const ab = dominates(a, b, ord).dominates;
  const ba = dominates(b, a, ord).dominates;
  const same = a.d === b.d && tauRank(a, ord) === tauRank(b, ord) && a.ablation === b.ablation;

  const relation: ComparisonReport['relation'] =
    ab ? 'a-dominates-b' : ba ? 'b-dominates-a' : same ? 'equivalent' : 'incomparable';

  const notes: Record<ComparisonReport['relation'], { fr: string; en: string }> = {
    'a-dominates-b': {
      fr: `${aId} domine ${bId} : au moins aussi proche du porteur sur les trois sous-critères, strictement plus proche sur l'un d'eux.`,
      en: `${aId} dominates ${bId}: at least as close to the carrier on all three sub-criteria, strictly closer on one.`,
    },
    'b-dominates-a': {
      fr: `${bId} domine ${aId} : au moins aussi proche du porteur sur les trois sous-critères, strictement plus proche sur l'un d'eux.`,
      en: `${bId} dominates ${aId}: at least as close to the carrier on all three sub-criteria, strictly closer on one.`,
    },
    equivalent: {
      fr: `${aId} et ${bId} portent les mêmes valeurs ordinales sur les trois sous-critères. Le document ne les ordonne pas.`,
      en: `${aId} and ${bId} carry the same ordinal values on all three sub-criteria. The document does not order them.`,
    },
    incomparable: {
      fr: `${aId} et ${bId} sont incomparables : chacun devance l'autre sur au moins un sous-critère. ` +
          `Les départager exigerait une agrégation sur des critères ordinaux dépourvus d'échelle commune — interdiction 4.`,
      en: `${aId} and ${bId} are incomparable: each leads the other on at least one sub-criterion. ` +
          `Separating them would require aggregating ordinal criteria lacking a common scale — prohibition 4.`,
    },
  };

  const strat = stratify(PAIRS, ord).byPair;
  const strata: [number, number] = [strat[aId], strat[bId]];
  const acrossStrata = relation === 'incomparable' && strata[0] !== strata[1]
    ? {
        fr: ` Ils occupent des strates différentes (${strata[0]} et ${strata[1]}) : l'indice de strate n'ordonne pas deux couples incomparables.`,
        en: ` They sit in different strata (${strata[0]} and ${strata[1]}): a stratum index does not order two incomparable pairs.`,
      }
    : { fr: '', en: '' };

  return {
    a: aId,
    b: bId,
    relation,
    strata,
    detail: {
      d: [a.d, b.d],
      tauRank: [tauRank(a, ord), tauRank(b, ord)],
      ablation: [a.ablation, b.ablation],
    },
    noteFr: notes[relation].fr + acrossStrata.fr,
    noteEn: notes[relation].en + acrossStrata.en,
  };
}
