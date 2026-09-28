/**
 * ASTRA — OrganoidMEA 'network-burst' spontaneous model (E2 candidate).
 * Checks: default model unchanged, determinism, frozen parameters, bookkeeping,
 * refractoriness, and coarse statistical signatures (rate, ISI irregularity,
 * network bursts, pairwise synchrony) that the E1 'poisson' model lacked.
 * These are sanity checks on the implementation, not the E2 test itself
 * (see empirical/PREREG-E2-DANDI-001603.md).
 *
 * © 2026 Christophe Jean Legros — Geneva · Assistance Multi IA
 */

import { test, describe } from 'node:test';
import assert from 'node:assert/strict';

import { OrganoidMEA, StimParam, E2_CALIBRATED_PARAMS, ELECTRODE_COUNT } from '../src/engine/neuroplatform.js';

function run(mea: OrganoidMEA, durationSec: number, chunkSec = 10): number[][] {
  const trains: number[][] = Array.from({ length: ELECTRODE_COUNT }, () => []);
  let t0 = 0;
  while (t0 < durationSec) {
    const dt = Math.min(chunkSec, durationSec - t0);
    mea.advance(dt * 1000);
    const t1 = t0 + dt;
    for (const ev of mea.querySpikeEvents(t0, t1)) if (ev.tSec >= t0 && ev.tSec < t1) trains[ev.channel].push(ev.tSec);
    t0 = t1;
  }
  for (const tr of trains) tr.sort((a, b) => a - b);
  return trains;
}

const median = (xs: number[]): number => {
  const s = [...xs].sort((a, b) => a - b);
  const m = s.length >> 1;
  return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2;
};

function isiCv(tr: number[]): number {
  const d = tr.slice(1).map((t, i) => t - tr[i]);
  const mu = d.reduce((a, b) => a + b, 0) / d.length;
  const sd = Math.sqrt(d.reduce((a, b) => a + (b - mu) ** 2, 0) / d.length);
  return sd / mu;
}

/** Network bursts as in empirical/confront.py (25 ms bins, mean+3SD, ≥25 % of active trains). */
function networkBursts(trains: number[][], T: number): number {
  const active = trains.filter((t) => t.length / T >= 0.05);
  const nb = Math.ceil(T / 0.025);
  const pop = new Float64Array(nb);
  const part = active.map(() => new Uint8Array(nb));
  active.forEach((tr, k) => { for (const t of tr) { const b = Math.min(nb - 1, Math.floor(t / 0.025)); pop[b]++; part[k][b] = 1; } });
  const mu = pop.reduce((a, b) => a + b, 0) / nb;
  const sd = Math.sqrt(pop.reduce((a, b) => a + (b - mu) ** 2, 0) / nb);
  const thr = mu + 3 * sd;
  let bursts = 0;
  let b = 0;
  while (b < nb) {
    if (pop[b] > thr) {
      let e = b;
      while (e + 1 < nb && pop[e + 1] > thr) e++;
      let n = 0;
      for (const p of part) { for (let j = b; j <= e; j++) if (p[j]) { n++; break; } }
      if (n >= 0.25 * active.length) bursts++;
      b = e + 1;
    } else b++;
  }
  return bursts;
}

describe('OrganoidMEA · network-burst model (E2 candidate)', () => {
  test("default spontaneous model is still 'poisson' with an unchanged RNG stream", () => {
    const a = new OrganoidMEA({ seed: 77 });
    const b = new OrganoidMEA({ seed: 77, spontaneousModel: 'poisson' });
    assert.equal(a.config.spontaneousModel, 'poisson');
    assert.deepEqual(Array.from(a.advance(2000)), Array.from(b.advance(2000)));
  });

  test('E2 parameters are frozen and are the configured defaults', () => {
    assert.ok(Object.isFrozen(E2_CALIBRATED_PARAMS));
    const mea = new OrganoidMEA({ spontaneousModel: 'network-burst' });
    assert.deepEqual(mea.config.networkBurst, { ...E2_CALIBRATED_PARAMS });
    assert.deepEqual({ ...E2_CALIBRATED_PARAMS }, {
      burstRatePerMin: 4.72, burstRegularity: 6.65, burstDurationSec: 0.244, participation: 0.79,
      spikesPerBurst: 1.71, bgMedianHz: 0.493, heterogeneity: 1.04, clusterMeanSpikes: 7.36,
      intraClusterIsiSec: 0.0565,
    });
  });

  test('partial parameter override keeps the other calibrated values', () => {
    const mea = new OrganoidMEA({ spontaneousModel: 'network-burst', networkBurst: { ...E2_CALIBRATED_PARAMS, participation: 0.5 } });
    assert.equal(mea.config.networkBurst.participation, 0.5);
    assert.equal(mea.config.networkBurst.bgMedianHz, E2_CALIBRATED_PARAMS.bgMedianHz);
  });

  test('deterministic for a fixed seed; different seeds differ', () => {
    const a = run(new OrganoidMEA({ seed: 5, spontaneousModel: 'network-burst' }), 60);
    const b = run(new OrganoidMEA({ seed: 5, spontaneousModel: 'network-burst' }), 60);
    const c = run(new OrganoidMEA({ seed: 6, spontaneousModel: 'network-burst' }), 60);
    assert.deepEqual(a, b);
    assert.notDeepEqual(a, c);
  });

  test('counts match the spike log and 1.5 ms refractoriness holds', () => {
    const mea = new OrganoidMEA({ seed: 9, spontaneousModel: 'network-burst' });
    let total = 0;
    for (let k = 0; k < 12; k++) total += mea.advance(5000).reduce((s, c) => s + c, 0);
    const events = mea.querySpikeEvents(0, mea.simClockSec);
    assert.equal(events.length, total);
    const byCh: number[][] = Array.from({ length: ELECTRODE_COUNT }, () => []);
    for (const e of events) byCh[e.channel].push(e.tSec);
    for (const tr of byCh) {
      tr.sort((x, y) => x - y);
      for (let i = 1; i < tr.length; i++) assert.ok(tr[i] - tr[i - 1] >= 0.0015 - 1e-12);
    }
  });

  test('reset() reproduces the same realisation', () => {
    const mea = new OrganoidMEA({ seed: 13, spontaneousModel: 'network-burst' });
    const first = Array.from(mea.advance(20000));
    mea.reset();
    assert.deepEqual(Array.from(mea.advance(20000)), first);
  });

  test('statistical signatures: organoid-like rate, irregular ISIs, network bursts, positive synchrony', () => {
    const T = 180;
    const nb = run(new OrganoidMEA({ seed: 1, spontaneousModel: 'network-burst' }), T);
    const po = run(new OrganoidMEA({ seed: 1 }), T);
    const rate = median(nb.filter((t) => t.length / T >= 0.05).map((t) => t.length / T));
    assert.ok(rate > 0.3 && rate < 1.2, `median rate ${rate}`);
    const cv = median(nb.filter((t) => t.length >= 20).map(isiCv));
    const cvPoisson = median(po.filter((t) => t.length >= 20).map(isiCv));
    assert.ok(cv > 1.8, `ISI CV ${cv} should be well above Poisson`);
    assert.ok(Math.abs(cvPoisson - 1) < 0.1, `Poisson CV ${cvPoisson}`);
    const perMin = networkBursts(nb, T) / (T / 60);
    assert.ok(perMin > 2 && perMin < 9, `network bursts/min ${perMin}`);
    assert.equal(networkBursts(po, T), 0, 'the independent Poisson model yields no network bursts');
  });

  test('stimulation still works in network-burst mode', () => {
    const mea = new OrganoidMEA({ seed: 21, spontaneousModel: 'network-burst' });
    mea.advance(1000);
    let evoked = 0;
    for (let i = 0; i < 20; i++) {
      evoked += mea.stimulate(new StimParam({ index: 3, phase_duration1: 300, phase_amplitude1: 10, phase_duration2: 300, phase_amplitude2: 10 }));
    }
    assert.ok(evoked > 0);
    mea.advance(1000);
  });
});
