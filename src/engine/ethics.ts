/**
 * ASTRA IRB Ethics Monitor — Neural Welfare Assessment
 * © 2026 Christophe Jean Legros — Geneva
 *
 * Continuous biomarker monitoring for biological neural substrates.
 * Synthetic threshold demonstrator; no IRB approval or validated welfare diagnosis.
 *
 * v2 — Mode-aware: distinguishes between simulated and live data.
 *       Reports explicitly whether biomarkers are synthetic or from
 *       biological substrates, per IRB disclosure requirements.
 *
 * Biomarkers:
 *   - Cell viability (%)
 *   - Firing rate (Hz) — MEDIAN PER-UNIT spontaneous rate (statistic S1 of
 *     empirical/confront.py), referenced to DANDI 001603 (v3.1.1, see below)
 *   - ATP/ADP ratio — minimum 3.0
 *   - Intracellular free calcium (nM) — maximum 100 nM. A second-messenger
 *     quantity: FCS document IV §2 and synthesis S-1.6 place it OUTSIDE class 1
 *     (mobile charge), so no FCS pair is bound to this channel.
 *
 * v3.1.1 — FIRING-RATE THRESHOLDS RECALIBRATED. Up to v3.1.0 the normal range
 * was 15–45 Hz and ≤ 5 Hz was critical: every real organoid of DANDI 001603
 * analysed in empirical/ (median per-unit rate 0.14–0.62 Hz, n = 8) would have
 * been reported in DISTRESS. The range is now the observed reference interval
 * of those eight organoids, rounded outward to two significant figures, with
 * the same factor-2 band the E1/E2 preregistrations use for "marginal":
 *   NORMAL    0.14–0.63 Hz   (observed range, HO1–HO8)
 *   STRESS    0.07–0.14 or 0.63–1.3 Hz
 *   DISTRESS  < 0.07 or > 1.3 Hz
 * This is a DESCRIPTIVE reference interval from one dataset (two ages, ~100 d
 * and ~7 mo; spontaneous activity; Van der Molen et al. 2025, Nat. Neurosci.,
 * doi:10.1038/s41593-025-02111-0), not a validated welfare criterion.
 */

import { state } from './state.js';
import { random } from '../utils/rng.js';

// ── Types ─────────────────────────────────────────────────────────

export type WelfareStatus = 'NORMAL' | 'STRESS' | 'DISTRESS';
export type AlertSeverity = 'info' | 'warning' | 'critical';
export type DataSource = 'simulated' | 'live' | 'replay';

export interface BiomarkerAlert {
  metric: string;
  value: number;
  threshold?: number;
  range?: string;
  severity: AlertSeverity;
}

export interface WelfareReport {
  status: WelfareStatus;
  dataSource: DataSource;
  disclaimer: string;
  irbLevel: string;
  irbRequired: boolean;
  biomarkers: {
    viability: number;
    firingRateHz: number;
    atpAdp: number;
    calciumNm: number;
  };
  alerts: BiomarkerAlert[];
  recommendation: string;
  timestamp: string;
  requestedMode: string;
  welfareValidation: 'not-validated';
  statusMeaning: string;
}

// ── Thresholds ────────────────────────────────────────────────────

const THRESHOLDS = {
  viability: { normal: 90, critical: 80 },
  /** DANDI 001603 reference interval (see header); stress band = factor 2. */
  firingRate: { min: 0.14, max: 0.63, criticalLow: 0.07, criticalHigh: 1.3 },
  atpAdp: { normal: 3.0, critical: 2.0 },
  calcium: { normal: 100, critical: 200 },
} as const;

// ── Data Source Disclaimers ───────────────────────────────────────

const DISCLAIMERS: Record<DataSource, string> = {
  simulated: 'SIMULATED DATA — Biomarkers are synthetically generated. '
    + 'This report does NOT reflect biological substrate conditions. '
    + 'Do not use for IRB compliance decisions.',
  live: 'LIVE DATA — Biomarkers sourced from biological neural substrates. '
    + 'This report is subject to IRB compliance review.',
  replay: 'REPLAY DATA — Biomarkers from recorded experimental session. '
    + 'This report reflects historical conditions only.',
};

// ── Ethics Monitor ────────────────────────────────────────────────

export class EthicsMonitor {
  private _assessmentCount: number = 0;
  private _lastReport: WelfareReport | null = null;
  private _history: Array<{ timestamp: string; status: WelfareStatus; dataSource: DataSource }> = [];
  private readonly maxHistory: number = 1000;

  /**
   * Run a full welfare assessment against current state.
   * Automatically determines data source from system mode.
   */
  assess(): WelfareReport {
    this._assessmentCount++;
    const snapshot = state.snapshot;
    const s = snapshot.eth;
    // The store supplies synthetic values in EVERY mode. A mode flag cannot
    // authenticate an instrument or turn a generated value into an observation.
    const dataSource: DataSource = 'simulated';

    const viab = s.viab;
    const fr = s.fr;
    const atp = s.atp;
    const ca = s.ca;

    const alerts: BiomarkerAlert[] = [];

    // Viability check
    if (viab <= THRESHOLDS.viability.critical) {
      alerts.push({
        metric: 'viability', value: +viab.toFixed(1),
        threshold: THRESHOLDS.viability.critical, severity: 'critical',
      });
    } else if (viab <= THRESHOLDS.viability.normal) {
      alerts.push({
        metric: 'viability', value: +viab.toFixed(1),
        threshold: THRESHOLDS.viability.normal, severity: 'warning',
      });
    }

    // Firing rate check — median per-unit rate vs the DANDI 001603 reference interval
    const F = THRESHOLDS.firingRate;
    if (fr < F.min || fr > F.max) {
      alerts.push({
        metric: 'firing_rate', value: +fr.toFixed(2),
        range: `${F.min}–${F.max} Hz (DANDI 001603 reference interval)`,
        severity: fr < F.criticalLow || fr > F.criticalHigh ? 'critical' : 'warning',
      });
    }

    // ATP/ADP check
    if (atp <= THRESHOLDS.atpAdp.critical) {
      alerts.push({
        metric: 'atp_adp', value: +atp.toFixed(1),
        threshold: THRESHOLDS.atpAdp.critical, severity: 'critical',
      });
    } else if (atp <= THRESHOLDS.atpAdp.normal) {
      alerts.push({
        metric: 'atp_adp', value: +atp.toFixed(1),
        threshold: THRESHOLDS.atpAdp.normal, severity: 'warning',
      });
    }

    // Calcium check
    if (ca >= THRESHOLDS.calcium.critical) {
      alerts.push({
        metric: 'calcium_nm', value: Math.round(ca),
        threshold: THRESHOLDS.calcium.critical, severity: 'critical',
      });
    } else if (ca >= THRESHOLDS.calcium.normal) {
      alerts.push({
        metric: 'calcium_nm', value: Math.round(ca),
        threshold: THRESHOLDS.calcium.normal, severity: 'warning',
      });
    }

    // Determine overall status
    const hasCritical = alerts.some(a => a.severity === 'critical');
    const hasWarning = alerts.some(a => a.severity === 'warning');
    const status: WelfareStatus = hasCritical ? 'DISTRESS' : hasWarning ? 'STRESS' : 'NORMAL';

    // Mode-aware recommendations
    const recommendation = this.buildRecommendation(status, dataSource);

    const report: WelfareReport = {
      status,
      dataSource,
      disclaimer: DISCLAIMERS[dataSource] ?? DISCLAIMERS.simulated,
      irbLevel: 'unassigned',
      irbRequired: snapshot.mode === 'live', // planned live use requires external review
      requestedMode: snapshot.mode,
      welfareValidation: 'not-validated',
      statusMeaning: 'Conventional threshold alert on synthetic inputs; NORMAL/STRESS/DISTRESS are demo labels, not diagnoses of distress, suffering or welfare.',
      biomarkers: {
        viability: +viab.toFixed(1),
        firingRateHz: +fr.toFixed(2),
        atpAdp: +atp.toFixed(1),
        calciumNm: Math.round(ca),
      },
      alerts,
      recommendation,
      timestamp: new Date().toISOString(),
    };

    // Archive
    this._lastReport = report;
    this._history.push({ timestamp: report.timestamp, status, dataSource });
    while (this._history.length > this.maxHistory) this._history.shift();

    return report;
  }

  /**
   * Build mode-aware recommendation string.
   */
  private buildRecommendation(status: WelfareStatus, source: DataSource): string {
    const prefix = source === 'simulated' ? '[SIM] ' : source === 'replay' ? '[REPLAY] ' : '';

    if (status === 'DISTRESS') {
      return source === 'live'
        ? 'HALT — Immediate protocol review required. Consider reducing stimulation or pausing experiment. IRB notification mandatory.'
        : `${prefix}DISTRESS detected in ${source} data. In live mode, this would trigger a HALT recommendation.`;
    }
    if (status === 'STRESS') {
      return source === 'live'
        ? 'MONITOR — Increase observation frequency. Review stimulation parameters. IRB review recommended.'
        : `${prefix}STRESS detected in ${source} data. In live mode, this would trigger increased monitoring.`;
    }
    return `${prefix}CONTINUE — All biomarkers within normal range.`;
  }

  /**
   * Simulate biomarker drift for demo/sim mode.
   * Call this on each tick to add realistic noise.
   */
  simulateDrift(): void {
    const s = state.snapshot.eth;

    const newViab = s.viab + (95 - s.viab) * 0.01 + (random() - 0.5) * 0.3;
    state.set('eth.viab', Math.max(70, Math.min(100, newViab)));

    // Median per-unit rate drifting around the DANDI 001603 reference interval.
    const newFR = s.fr + (0.4 - s.fr) * 0.02 + (random() - 0.5) * 0.02;
    state.set('eth.fr', Math.max(0.02, Math.min(3, newFR)));

    const newATP = s.atp + (3.5 - s.atp) * 0.015 + (random() - 0.5) * 0.1;
    state.set('eth.atp', Math.max(1.5, Math.min(5, newATP)));

    const newCa = s.ca + (65 - s.ca) * 0.02 + (random() - 0.5) * 3;
    state.set('eth.ca', Math.max(20, Math.min(300, newCa)));
  }

  /** Last welfare report */
  get lastReport(): WelfareReport | null { return this._lastReport; }

  /** Assessment count */
  get assessmentCount(): number { return this._assessmentCount; }

  /** Status history */
  get history(): ReadonlyArray<{ timestamp: string; status: WelfareStatus; dataSource: DataSource }> {
    return this._history;
  }
}

/** Singleton ethics monitor */
export const ethicsMonitor = new EthicsMonitor();

// ── Adapter methods for server.ts compatibility ──

const _ethicsAdapter = {
  /** server.ts calls ethics.update(snn, mode) */
  update(_snn?: unknown, _mode?: string): WelfareReport {
    ethicsMonitor.simulateDrift();
    return ethicsMonitor.assess();
  },

  /** server.ts calls ethics.getReport(mode) */
  getReport(_mode?: string): WelfareReport {
    return ethicsMonitor.assess();
  },

  /** server.ts calls ethics.getBiomarkers() */
  getBiomarkers(): { viability: number; firingRate: number; atpAdp: number; calcium: number } {
    const r = ethicsMonitor.lastReport ?? ethicsMonitor.assess();
    return {
      viability: r.biomarkers.viability,
      firingRate: r.biomarkers.firingRateHz,
      atpAdp: r.biomarkers.atpAdp,
      calcium: r.biomarkers.calciumNm,
    };
  },
};

export { _ethicsAdapter as ethicsAdapter };
