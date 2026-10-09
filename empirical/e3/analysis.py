#!/usr/bin/env python3
"""E3 candidate: joint Bayesian prediction of five summaries, not spike generation.

Conjugate matrix-normal / inverse-Wishart regression with an age covariate,
compared to an intercept-only baseline. Full residual covariance keeps S1-S5
joint. Repeated simulation draws are never counted as biological replicates.
Only training data determines transforms/scales, posterior and calibration.
"""
from __future__ import annotations
import math
import numpy as np

KEYS = ['S1_rate_hz', 'S2_isi_cv', 'S3_bursts_per_min', 'S4_frac_in_bursts', 'S5_sttc']


def transform(rows):
    y = np.asarray(rows, dtype=float)
    if y.ndim != 2 or y.shape[1] != 5 or not np.isfinite(y).all():
        raise ValueError('Need complete finite organoid-level S1-S5 rows.')
    if (y[:, :4] < 0).any() or (y[:, 3] > 1).any() or (np.abs(y[:, 4]) > 1).any():
        raise ValueError('Statistics outside their domain.')
    out = y.copy()
    out[:, :4] = np.log1p(y[:, :4])
    out[:, 4] = np.arctanh(np.clip(y[:, 4], -0.999999, 0.999999))
    return out


def inverse(z):
    y = np.asarray(z, dtype=float).copy()
    y[..., :4] = np.maximum(0, np.expm1(np.clip(y[..., :4], -700, 700)))
    y[..., 3] = np.minimum(1, y[..., 3])
    y[..., 4] = np.tanh(y[..., 4])
    return y


class JointPredictor:
    """Bayesian shrinkage regression in training-standardised coordinates.

    Prior: B|Sigma ~ MN(0,I,Sigma), Sigma ~ IW(7,I), d=5.
    No learned prior selection on test data. Draws include coefficient uncertainty,
    residual inter-organoid variability and full cross-statistic covariance.
    """
    def __init__(self, age_model=True):
        self.age_model = age_model

    def fit(self, rows, ages):
        y = transform(rows)
        a = np.asarray(ages, dtype=float)
        if len(y) < 3 or len(a) != len(y) or not np.isfinite(a).all() or (a <= 0).any():
            raise ValueError('At least three training organoids with positive ages required.')
        if self.age_model and len(set(a.tolist())) < 2:
            raise ValueError('Age model requires at least two training ages.')
        self.location = y.mean(axis=0)
        self.scale = np.maximum(y.std(axis=0, ddof=1), 0.05)
        self.age_location = float(np.log(a).mean())
        self.age_scale = max(float(np.log(a).std(ddof=1)), 0.05)
        x = self.design(a)
        z = (y - self.location) / self.scale
        p = x.shape[1]
        precision = np.eye(p) + x.T @ x
        self.v = np.linalg.inv(precision)
        self.b = self.v @ x.T @ z
        self.s = np.eye(5) + z.T @ z - self.b.T @ precision @ self.b
        self.s = (self.s + self.s.T) / 2
        self.nu = 7 + len(y)
        return self

    def design(self, ages):
        a = np.asarray(ages, dtype=float)
        if not np.isfinite(a).all() or (a <= 0).any():
            raise ValueError('Ages must be finite and positive.')
        intercept = np.ones(len(a))
        return np.column_stack([intercept, (np.log(a) - self.age_location) / self.age_scale]) if self.age_model else intercept[:, None]

    def draws(self, ages, count=200, seed=20261009):
        if not isinstance(count, int) or count < 20:
            raise ValueError('At least 20 predictive draws required.')
        rng = np.random.default_rng(seed)
        x = self.design(ages)
        d, p = 5, self.b.shape[0]
        chol_inv_s = np.linalg.cholesky(np.linalg.inv(self.s))
        chol_v = np.linalg.cholesky(self.v)
        out = []
        for _ in range(count):
            # Bartlett decomposition: W~Wishart(nu,S^-1), Sigma=W^-1.
            a = np.zeros((d, d))
            for i in range(d):
                a[i, i] = math.sqrt(rng.chisquare(self.nu - i))
                a[i, :i] = rng.normal(size=i)
            factor = chol_inv_s @ a
            sigma = np.linalg.inv(factor @ factor.T)
            chol = np.linalg.cholesky((sigma + sigma.T) / 2)
            b = self.b + chol_v @ rng.normal(size=(p, d)) @ chol.T
            z = x @ b + rng.normal(size=(len(x), d)) @ chol.T
            out.append(z)
        return np.asarray(out)

    def target(self, rows):
        return (transform(rows) - self.location) / self.scale

    def original(self, z):
        return inverse(np.asarray(z) * self.scale + self.location)


def energy_scores(draws, target):
    """Joint energy score (lower is better), one score per held-out organoid."""
    z = np.asarray(draws)
    y = np.asarray(target)
    if z.ndim != 3 or y.shape != z.shape[1:] or not np.isfinite(z).all() or not np.isfinite(y).all():
        raise ValueError('Invalid predictive draws or targets.')
    first = np.linalg.norm(z - y[None, :, :], axis=2).mean(axis=0)
    # Off-diagonal U-statistic avoids the downward bias of self-pairs.
    n = len(z)
    if n < 2:
        raise ValueError('Need at least two draws.')
    pair = np.zeros(z.shape[1])
    for i in range(n):
        pair += np.linalg.norm(z[i+1:] - z[i], axis=2).sum(axis=0)
    return first - pair / (n * (n - 1))


def describe_predictions(original_draws, observed):
    q05, med, q95 = np.quantile(original_draws, [0.05, 0.5, 0.95], axis=0)
    return {'median': med.tolist(), 'q05': q05.tolist(), 'q95': q95.tolist(),
            'absolute_errors': np.abs(med - observed).tolist(), 'interval_width': (q95-q05).tolist(),
            'covered_90pct': ((observed >= q05) & (observed <= q95)).tolist(),
            'interval_meaning': 'posterior-predictive-interval-not-min-max-compatibility'}


def cluster_summary(values, donors, seed=20261009, resamples=2000):
    """Equal-weight donor means; bootstrap donors, never seeds or electrodes."""
    v = np.asarray(values, float)
    if len(v) != len(donors) or not np.isfinite(v).all():
        raise ValueError('Invalid cluster scores.')
    ids = sorted(set(donors))
    means = np.array([v[np.array(donors) == d].mean() for d in ids])
    if not len(means):
        raise ValueError('Empty evaluation.')
    ci = None
    if len(means) >= 3:
        rng = np.random.default_rng(seed)
        boot = means[rng.integers(0, len(means), (resamples, len(means)))].mean(axis=1)
        ci = np.quantile(boot, [0.025, 0.975]).tolist()
    return {'mean_donor_weighted': float(means.mean()), 'donor_clusters': len(ids),
            'organoid_observations': len(v), 'bootstrap_95pct': ci,
            'bootstrap_note': 'descriptive; small-cluster uncertainty not certified; no CI below three donors'}
