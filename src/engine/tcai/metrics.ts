/**
 * ASTRA × the_consciousness_ai — Consciousness Metrics Suite
 * ═══════════════════════════════════════════════════════════
 * TypeScript port of:
 *   models/evaluation/gnw_metrics.py            → GNWMetrics
 *   models/evaluation/effective_information.py  → computeEffectiveInformation
 *   models/evaluation/phi_riiu.py               → RIIUPhi (covariance surrogate)
 *
 * ⚠ DISCLAIMER — Φ̃-RIIU here replaces the upstream learned low-rank
 *   surrogate (AutoPhiSurrogate, PyTorch) with an analytical covariance
 *   absolute-covariance ratio over a sliding latent buffer. Transition
 *   information is estimated observationally, uniformly over visited rows.
 *   All values are research proxies, not measurements of consciousness.
 *
 * © 2026 Christophe Jean Legros — Geneva · Assistance Multi IA
 * Upstream Python: © tlcdv/the_consciousness_ai (vendored in /python)
 */

import { type GNWMetricsReport } from './types.js';

// ── GNW Metrics (gnw_metrics.py) ──────────────────────────────────

export class GNWMetrics {
  private ignitionEvents = 0;
  private ignitionSum = 0;
  private broadcastSteps = 0;
  private reuseEvents = 0;
  private steps = 0;
  private threshold: number;

  constructor(ignitionThreshold = 0.5) { this.threshold = ignitionThreshold; }

  /** Port of update_workspace_status(): one call per workspace step. */
  update(ignition: number, broadcastActive: boolean): void {
    this.steps++;
    this.ignitionSum += ignition;
    if (ignition >= this.threshold) this.ignitionEvents++;
    if (broadcastActive) this.broadcastSteps++;
  }

  /** Port of log_event_reuse(): broadcast content reused by another module. */
  logReuse(): void { this.reuseEvents++; }

  report(): GNWMetricsReport {
    return {
      ignitionEvents: this.ignitionEvents,
      ignitionRate: this.steps ? this.ignitionEvents / this.steps : 0,
      meanIgnition: this.steps ? this.ignitionSum / this.steps : 0,
      broadcastAvailability: this.steps ? this.broadcastSteps / this.steps : 0,
      reuseEvents: this.reuseEvents,
      steps: this.steps,
    };
  }

  reset(): void {
    this.ignitionEvents = 0; this.ignitionSum = 0;
    this.broadcastSteps = 0; this.reuseEvents = 0; this.steps = 0;
  }
}

// ── Effective Information (effective_information.py) ──────────────

/** Port of discretize_continuous(): scalar trajectory → state indices. */
export function discretizeContinuous(values: number[], numStates = 8): number[] {
  validateStateCount(numStates);
  if (values.some((v) => !Number.isFinite(v))) throw new RangeError('Trajectory must be finite.');
  if (values.length === 0) return [];
  const lo = Math.min(...values);
  const hi = Math.max(...values);
  const span = hi - lo || 1;
  if (!Number.isFinite(span)) throw new RangeError('Trajectory range overflows.');
  return values.map((v) => Math.min(numStates - 1, Math.floor(((v - lo) / span) * numStates)));
}

function entropyRow(row: number[]): number {
  let h = 0;
  for (const p of row) if (p > 1e-12) h -= p * Math.log2(p);
  return h;
}

/**
 * Port of compute_effective_information():
 *   EI = H(⟨row⟩) − ⟨H(row)⟩  over the transition probability matrix
 * built from discretized observed trajectories. Returns bits, conditional on
 * visited rows; this does not identify an interventional causal TPM.
 * Legacy numerical adapter: unavailable estimates map to 0 for control code.
 * Public telemetry MUST use estimateTransitionInformation(), preserving null.
 */
export function computeEffectiveInformation(stateTrajectory: number[], numStates = 8): number {
  return estimateTransitionInformation(stateTrajectory, numStates).value ?? 0;
}

function validateStateCount(numStates: number): void {
  if (!Number.isInteger(numStates) || numStates < 2 || numStates > 256) {
    throw new RangeError('numStates must be an integer in [2,256].');
  }
}

export interface ProxyEstimate {
  value: number | null;
  status: 'available' | 'unavailable';
  reason: string;
  samples: number;
  construct: string;
  provenance: 'endogenous';
  validatedForConsciousness: false;
}

export interface TransitionInformationEstimate extends ProxyEstimate {
  numStates: number;
  visitedRows: number;
  transitions: number;
  rowCoverage: number;
  rowWeighting: 'uniform-over-visited-rows';
  causalIdentification: false;
}

export function estimateTransitionInformation(stateTrajectory: number[], numStates = 8): TransitionInformationEstimate {
  validateStateCount(numStates);
  if (stateTrajectory.some((v) => !Number.isInteger(v) || v < 0 || v >= numStates)) {
    throw new RangeError('State indices must be integers inside the declared state space.');
  }
  const base = {
    samples: stateTrajectory.length, numStates,
    transitions: Math.max(0, stateTrajectory.length - 1),
    construct: 'observational-transition-information-bits',
    provenance: 'endogenous' as const, validatedForConsciousness: false as const,
    rowWeighting: 'uniform-over-visited-rows' as const, causalIdentification: false as const,
  };
  if (stateTrajectory.length < 3) {
    return { ...base, value: null, status: 'unavailable', reason: 'insufficient-transitions', visitedRows: new Set(stateTrajectory.slice(0, -1)).size, rowCoverage: new Set(stateTrajectory.slice(0, -1)).size / numStates };
  }
  // _build_tpm
  const tpm: number[][] = Array.from({ length: numStates }, () => new Array(numStates).fill(0));
  for (let t = 0; t + 1 < stateTrajectory.length; t++) {
    const s = stateTrajectory[t], sn = stateTrajectory[t + 1];
    if (s >= 0 && s < numStates && sn >= 0 && sn < numStates) tpm[s][sn] += 1;
  }
  const validRows: number[][] = [];
  for (const row of tpm) {
    const total = row.reduce((a, v) => a + v, 0);
    if (total > 0) validRows.push(row.map((v) => v / total));
  }

  const avgRow = new Array<number>(numStates).fill(0);
  for (const row of validRows) for (let j = 0; j < numStates; j++) avgRow[j] += row[j] / validRows.length;

  const hAvg = entropyRow(avgRow);
  const avgH = validRows.reduce((a, row) => a + entropyRow(row), 0) / validRows.length;
  return {
    ...base, value: Math.max(0, hAvg - avgH), status: 'available',
    reason: 'conditional-on-observed-rows-no-interventions',
    visitedRows: validRows.length, rowCoverage: validRows.length / numStates,
  };
}

// ── Φ̃-RIIU Surrogate (phi_riiu.py) ───────────────────────────────

export interface RIIUConfig {
  bufferSize: number;     // sliding window of latent vectors, default 64
  warmup: number;         // min samples before compute, default 8
}

export class RIIUPhi {
  readonly config: RIIUConfig;
  private buffer: number[][] = [];

  constructor(config?: Partial<RIIUConfig>) {
    this.config = Object.freeze({ bufferSize: 64, warmup: 8, ...config });
    if (!Number.isInteger(this.config.warmup) || !Number.isInteger(this.config.bufferSize) ||
        this.config.warmup < 2 || this.config.bufferSize < this.config.warmup) {
      throw new RangeError('Require integer bufferSize >= warmup >= 2.');
    }
  }

  /** Port of push(): append a latent vector z to the sliding buffer. */
  push(z: number[]): void {
    if (!z.length || z.some((v) => !Number.isFinite(v))) throw new RangeError('Latents must be nonempty and finite.');
    if (this.buffer.length && z.length !== this.buffer[0].length) throw new RangeError('Latent dimension changed; reset first.');
    this.buffer.push([...z]);
    if (this.buffer.length > this.config.bufferSize) this.buffer.shift();
  }

  isWarm(): boolean { return this.buffer.length >= this.config.warmup; }
  size(): number { return this.buffer.length; }
  reset(): void { this.buffer = []; }

  /**
   * Compatibility adapter for internal control diagnostics, not telemetry.
   * Returns zero when unavailable; use estimate() to distinguish missing from 0.
   */
  computeValue(): number {
    return this.estimate().value ?? 0;
  }

  /**
   * Absolute covariance ratio, NOT covariance energy or a fraction of variance:
   * sum(a!=b)|C_ab| / sum(a,b)|C_ab|. No certified approximation to IIT Phi.
   * Sensitive to common input, coordinate scaling and choice of representation.
   */
  estimate(): ProxyEstimate & { dimensions: number } {
    const base = {
      samples: this.buffer.length, dimensions: this.buffer[0]?.length ?? 0,
      construct: 'absolute-covariance-ratio', provenance: 'endogenous' as const,
      validatedForConsciousness: false as const,
    };
    if (!this.isWarm()) return { ...base, value: null, status: 'unavailable', reason: 'warmup' };
    const n = this.buffer.length;
    const d = this.buffer[0].length;
    const mean = new Array<number>(d).fill(0);
    for (const z of this.buffer) for (let j = 0; j < d; j++) mean[j] += z[j] / n;

    let diag = 0, off = 0;
    for (let a = 0; a < d; a++) {
      for (let b = a; b < d; b++) {
        let c = 0;
        for (const z of this.buffer) c += (z[a] - mean[a]) * (z[b] - mean[b]);
        c /= n;
        if (a === b) diag += Math.abs(c);
        else off += 2 * Math.abs(c);
      }
    }
    const total = diag + off;
    if (!Number.isFinite(total)) return { ...base, value: null, status: 'unavailable', reason: 'numerical-overflow' };
    if (total <= 1e-12) return { ...base, value: null, status: 'unavailable', reason: 'zero-or-negligible-covariance' };
    return { ...base, value: off / total, status: 'available', reason: 'descriptive-latent-dependence' };
  }
}
