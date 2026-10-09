/** Synthetic and metamorphic controls: mathematical behaviour, not consciousness validation. */
import { describe, test } from 'node:test';
import assert from 'node:assert/strict';
import { RIIUPhi, estimateTransitionInformation, discretizeContinuous } from '../src/engine/tcai/metrics.js';
import { TCAIConsciousnessSystem } from '../src/engine/tcai/acm-bridge.js';
const measure = (rows: number[][]) => {
  const m = new RIIUPhi({ warmup: 4 });
  rows.forEach((r) => m.push(r));
  return m.estimate();
};
const orthogonal = [[1,1], [1,-1], [-1,1], [-1,-1]];
const common = [[1,1], [2,2], [3,3], [4,4]];
describe('Proxy validity controls', () => {
  test('missing, constant and genuinely zero covariance are distinct', () => {
    const cold = new RIIUPhi();
    assert.equal(cold.estimate().value, null);
    assert.equal(measure([[1,1],[1,1],[1,1],[1,1]]).value, null);
    assert.equal(measure(orthogonal).value, 0);
  });
  test('common input creates a high ratio without recurrent interactions', () => {
    assert.equal(measure(common).value, 0.5);
    assert.equal(measure(orthogonal).value, 0);
    assert.equal(measure(common).validatedForConsciousness, false);
  });
  test('permutation, translation and common scaling preserve the ratio', () => {
    const rows = [[1,2,0], [2,-1,1], [3,4,1], [4,2,2]];
    const a = measure(rows).value!;
    const b = measure(rows.map(([x,y,z]) => [7*z+10,7*x+12,7*y+15])).value!;
    assert.ok(Math.abs(a-b) < 1e-12);
  });
  test('independent coordinate rescaling changes the ratio and must be declared', () => {
    assert.ok(measure(common.map(([x,y]) => [100*x,y])).value! < 0.03);
  });
  test('invalid configuration or changing dimensions cannot silently produce NaN', () => {
    assert.throws(() => new RIIUPhi({ bufferSize: 2, warmup: 8 }), RangeError);
    const m = new RIIUPhi(); m.push([1,2]);
    assert.throws(() => m.push([1]), RangeError);
    assert.throws(() => m.push([NaN,1]), RangeError);
    assert.throws(() => m.push([]), RangeError);
  });
  test('observed two-state cycle gives one bit conditional on 2/8 visited rows', () => {
    const e = estimateTransitionInformation([0,1,0,1,0,1], 8);
    assert.equal(e.value, 1); assert.equal(e.rowCoverage, 0.25);
    assert.equal(e.transitions, 5); assert.equal(e.causalIdentification, false);
    assert.equal(e.rowWeighting, 'uniform-over-visited-rows');
  });
  test('empty transitions remain missing while observed constant transitions give zero', () => {
    assert.equal(estimateTransitionInformation([]).value, null);
    assert.equal(estimateTransitionInformation([0,0,0,0]).value, 0);
    assert.throws(() => estimateTransitionInformation([0,0.2,1]), RangeError);
    assert.throws(() => estimateTransitionInformation([0,8,1]), RangeError);
    assert.throws(() => discretizeContinuous([0,Infinity]), RangeError);
    assert.throws(() => discretizeContinuous([0,1],0), RangeError);
  });
  test('fresh and reset public telemetry never imputes a measured zero', () => {
    const sys = new TCAIConsciousnessSystem();
    for (const rep of [sys.report(), (sys.reset(), sys.report())]) {
      assert.equal(rep.phiRIIUProxy, null); assert.equal(rep.effectiveInformation, null);
      assert.equal(rep.composite, null); assert.equal(rep.gnwAvailability, 'unavailable');
    }
    const cycle = sys.runCycle({ signals: { vision: [1,2,3] } });
    assert.equal(cycle.phiRIIU, null); assert.equal(cycle.phiEstimate.reason, 'warmup');
  });
});
