/**
 * E1 — Export spontaneous spike trains from ASTRA's OrganoidMEA simulator.
 *
 * Usage:
 *   npx tsx empirical/sim_export.ts <durationSec> <outFile.json> [seedFrom-seedTo] [baselineRateHz]
 *   npx tsx empirical/sim_export.ts --model=network-burst <durationSec> <outFile.json> [seedFrom-seedTo]
 *
 * Runs the simulator (no stimulation) for each seed and writes one spike train
 * per electrode, in seconds, as JSON:
 *   { model, durationSec, runs: [{ seed, trains: number[][] }] }
 *
 * Without --model: default configuration ('poisson'), as preregistered for E1
 * (empirical/PREREG-DANDI-001603.md §3). With --model=network-burst: the frozen
 * E2 candidate (E2_CALIBRATED_PARAMS), as preregistered for E2.
 * © 2026 Christophe Jean Legros — Geneva · Assistance Multi IA
 */

import { writeFileSync } from 'node:fs';
import { OrganoidMEA, ELECTRODE_COUNT, E2_CALIBRATED_PARAMS, type SpontaneousModel } from '../src/engine/neuroplatform.js';

const CHUNK_SEC = 10;

function runOnce(seed: number, durationSec: number, model: SpontaneousModel, baselineRateHz?: number): number[][] {
  const mea = new OrganoidMEA(baselineRateHz === undefined ? { seed, spontaneousModel: model } : { seed, spontaneousModel: model, baselineRateHz });
  const trains: number[][] = Array.from({ length: ELECTRODE_COUNT }, () => []);
  let t0 = 0;
  while (t0 < durationSec) {
    const dt = Math.min(CHUNK_SEC, durationSec - t0);
    mea.advance(dt * 1000);
    const t1 = t0 + dt;
    // querySpikeEvents is inclusive on both ends; keep [t0, t1) to avoid double counting.
    for (const ev of mea.querySpikeEvents(t0, t1)) {
      if (ev.tSec >= t0 && ev.tSec < t1) trains[ev.channel].push(ev.tSec);
    }
    t0 = t1;
  }
  for (const tr of trains) tr.sort((a, b) => a - b);
  return trains;
}

const argv = process.argv.slice(2);
const modelFlag = argv.find((a) => a.startsWith('--model='));
const model: SpontaneousModel = modelFlag ? (modelFlag.slice('--model='.length) as SpontaneousModel) : 'poisson';
if (model !== 'poisson' && model !== 'network-burst') {
  console.error(`unknown model: ${model}`);
  process.exit(2);
}
const [durArg, outFile, seedArg, rateArg] = argv.filter((a) => !a.startsWith('--'));
// Optional 4th argument: baselineRateHz override — EXPLORATORY use only (not part of PREREG §3).
const baselineRateHz = rateArg === undefined ? undefined : Number(rateArg);
const durationSec = Number(durArg);
if (!Number.isFinite(durationSec) || durationSec <= 0 || !outFile) {
  console.error('usage: npx tsx empirical/sim_export.ts [--model=poisson|network-burst] <durationSec> <outFile.json> [seedFrom-seedTo] [baselineRateHz]');
  process.exit(2);
}
let [from, to] = [1, 10];
if (seedArg) [from, to] = seedArg.split('-').map(Number);

const runs = [];
for (let seed = from; seed <= to; seed++) runs.push({ seed, trains: runOnce(seed, durationSec, model, baselineRateHz) });
const label = model === 'network-burst'
  ? `OrganoidMEA (network-burst, E2_CALIBRATED_PARAMS ${JSON.stringify(E2_CALIBRATED_PARAMS)})`
  : baselineRateHz === undefined ? 'OrganoidMEA (default config, spontaneous)' : `OrganoidMEA (baselineRateHz=${baselineRateHz}, EXPLORATORY)`;
writeFileSync(outFile, JSON.stringify({ model: label, durationSec, runs }));
console.log(`wrote ${runs.length} runs × ${ELECTRODE_COUNT} trains, ${durationSec} s → ${outFile}`);
