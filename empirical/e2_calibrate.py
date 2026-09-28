#!/usr/bin/env python3
"""
E2 — Calibration of the network-burst spontaneous model on the E1 (TRAINING)
organoids only: sub-HO6, sub-HO7, sub-HO8 of DANDI 001603.

The test organoids of E2 are never read by this script.

Model (mirrors src/engine/neuroplatform.ts, spontaneousModel = 'network-burst'):
  * network burst onsets: renewal process, gamma-distributed intervals with
    mean 60/burstRatePerMin s and shape burstRegularity (1 = Poisson);
  * each burst lasts burstDurationSec; each electrode joins with probability
    participation; a participating electrode fires Poisson(spikesPerBurst * w_i)
    spikes at onset + D·u^1.5 (front-loaded);
  * background: independent clustered process per electrode, mean rate
    bgRate_i = bgMedianHz · w_i, w_i log-normal (sigma = heterogeneity), shared by
    background and bursts; cluster onsets Poisson at bgRate_i / clusterMeanSpikes,
    each cluster holds Geometric(1/clusterMeanSpikes) spikes separated by
    Exp(intraClusterIsiSec) intervals (local bursting, per electrode);
  * 1.5 ms absolute refractoriness per electrode.

Objective: squared log-ratios to the mean of the three training organoids for
S1–S4, plus ((S5 − target) / 0.03)². Computed with empirical/confront.py.

Usage: python3 empirical/e2_calibrate.py <train1.nwb> <train2.nwb> <train3.nwb>
"""
import json
import os
import sys

import numpy as np

sys.path.insert(0, os.path.dirname(__file__))
import confront as C  # noqa: E402

N_ELEC = 128
REFRACT = 0.0015
PARAM_NAMES = ["burstRatePerMin", "burstRegularity", "burstDurationSec", "participation",
               "spikesPerBurst", "bgMedianHz", "heterogeneity", "clusterMeanSpikes", "intraClusterIsiSec"]


def simulate(p: dict, T: float, seed: int) -> list:
    rng = np.random.default_rng(seed)
    w = np.exp(rng.normal(0, p["heterogeneity"], N_ELEC))
    w /= np.median(w)
    m = p["clusterMeanSpikes"]
    trains = []
    for wi in w:
        # clustered background: cluster onsets Poisson at bg_i / m, each cluster
        # holds Geometric(1/m) spikes (mean m) separated by Exp(intraClusterIsiSec).
        n_cl = rng.poisson(p["bgMedianHz"] * wi * T / m)
        onsets = rng.uniform(0, T, n_cl)
        tr = []
        for t0 in onsets:
            k = rng.geometric(1.0 / m) if m > 1 else 1
            tr.extend(t0 + np.concatenate(([0.0], np.cumsum(rng.exponential(p["intraClusterIsiSec"], k - 1)))))
        trains.append(tr)
    mean_ibi = 60.0 / p["burstRatePerMin"]
    k = p["burstRegularity"]
    t = rng.gamma(k, mean_ibi / k)
    while t < T:
        for i in range(N_ELEC):
            if rng.random() < p["participation"]:
                n = rng.poisson(p["spikesPerBurst"] * w[i])
                trains[i].extend(t + p["burstDurationSec"] * rng.random(n) ** 1.5)
        t += rng.gamma(k, mean_ibi / k)
    out = []
    for tr in trains:
        a = np.sort(np.asarray(tr))
        a = a[a < T]
        if a.size > 1 and np.any(np.diff(a) < REFRACT):
            a = _drop_refractory(a)
        out.append(a)
    return out


def _drop_refractory(a):
    keep = [a[0]]
    for x in a[1:]:
        if x - keep[-1] >= REFRACT:
            keep.append(x)
    return np.asarray(keep)


def sim_stats(p, T, seeds):
    rows = [C.statistics(C.Recording("s", simulate(p, T, s), T, T, "sim", N_ELEC)) for s in seeds]
    return {k: float(np.median([r[k] for r in rows])) for k in C.STAT_KEYS}


def loss(sim, target):
    l = 0.0
    for k in ["S1_rate_hz", "S2_isi_cv", "S3_bursts_per_min", "S4_frac_in_bursts"]:
        if sim[k] <= 0 or not np.isfinite(sim[k]):
            return 1e9
        l += np.log(sim[k] / target[k]) ** 2
    l += ((sim["S5_sttc"] - target["S5_sttc"]) / 0.03) ** 2
    return float(l)


TRAINING_PREFIXES = ("sub-HO6_", "sub-HO7_", "sub-HO8_")


def main(paths):
    if len(paths) != 3 or not all(os.path.basename(p).startswith(TRAINING_PREFIXES) for p in paths):
        sys.exit("e2_calibrate.py reads the three E1 training organoids (sub-HO6/7/8) and nothing else.")
    recs = [C.load_nwb_units(p) for p in paths]
    train = [C.statistics(r) for r in recs]
    target = {k: float(np.mean([t[k] for t in train])) for k in C.STAT_KEYS}
    T = float(np.median([r.window_s for r in recs]))
    print("training target:", {k: round(v, 4) for k, v in target.items()})

    lo = np.array([2.0, 1.0, 0.05, 0.1, 0.5, 0.1, 0.2, 1.0, 0.01])
    hi = np.array([10.0, 8.0, 0.6, 0.9, 6.0, 0.8, 1.5, 8.0, 0.12])
    rng = np.random.default_rng(2026)
    seeds_fast = [1]
    best = None
    # stage 1 — random search over the box
    for it in range(120):
        x = lo + (hi - lo) * rng.random(len(lo))
        p = dict(zip(PARAM_NAMES, x))
        s = sim_stats(p, T, seeds_fast)
        l = loss(s, target)
        if best is None or l < best[0]:
            best = (l, p, s)
    # stage 2 — local refinement around the best point
    scale = (hi - lo) * 0.15
    for it in range(120):
        x = np.clip(np.array([best[1][n] for n in PARAM_NAMES]) + scale * rng.normal(size=len(lo)), lo, hi)
        p = dict(zip(PARAM_NAMES, x))
        s = sim_stats(p, T, seeds_fast)
        l = loss(s, target)
        if l < best[0]:
            best = (l, p, s)
        if it % 30 == 29:
            scale *= 0.6
    # confirm on 10 seeds
    final = sim_stats(best[1], T, list(range(1, 11)))
    rounded = {k: float(f"{v:.3g}") for k, v in best[1].items()}
    confirm = sim_stats(rounded, T, list(range(1, 11)))
    out = {"training_files": [os.path.basename(p) for p in paths], "target": target,
           "params": rounded, "loss_search_seed1": best[0], "stats_10seeds": confirm,
           "training_per_organoid": train}
    os.makedirs(os.path.join(os.path.dirname(__file__), "results"), exist_ok=True)
    with open(os.path.join(os.path.dirname(__file__), "results", "E2_calibration.json"), "w") as fh:
        json.dump(out, fh, indent=2)
    print("params:", rounded)
    print("stats (10 seeds):", {k: round(v, 4) for k, v in confirm.items()})


if __name__ == "__main__":
    main(sys.argv[1:])
