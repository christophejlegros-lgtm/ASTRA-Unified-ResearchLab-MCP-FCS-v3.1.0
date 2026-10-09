#!/usr/bin/env python3
"""Protocol readiness and leakage checks; no invented registration or result."""
from __future__ import annotations
import hashlib
import json
from pathlib import Path
import math
import re

ROOT = Path(__file__).resolve().parents[2]
ANALYSIS_FILES = ['empirical/e3/analysis.py', 'empirical/e3/protocol.py', 'empirical/e3/run.py', 'empirical/confront.py', 'empirical/requirements.txt']


def digest(path):
    return hashlib.sha256(Path(path).read_bytes()).hexdigest()


def payload_digest(protocol):
    core = {k: v for k, v in protocol.items() if k != 'registration'}
    return hashlib.sha256(json.dumps(core, sort_keys=True, separators=(',', ':'), allow_nan=False).encode()).hexdigest()


def seen_hashes():
    seen = set()
    for name in ['E1', 'E2']:
        rows = json.loads((ROOT / 'empirical/results' / (name + '.json')).read_text())['real']
        seen.update(row['sha256'] for row in rows)
    return seen


def validate(p, strict=True):
    errors = []
    if p.get('schema_version') != 1:
        errors.append('unsupported schema version')
    analysis, design = p.get('analysis', {}), p.get('design', {})
    fixed = {'models': ['joint-age', 'joint-intercept'], 'primary': 'donor-weighted-paired-energy-score-difference-age-minus-intercept',
             'adequacy_verdict': 'not-defined-no-global-adequacy-claim'}
    for k, v in fixed.items():
        if analysis.get(k) != v:
            errors.append('unsupported analysis setting: ' + k)
    if not isinstance(analysis.get('draws'), int) or not 20 <= analysis.get('draws', 0) <= 2000:
        errors.append('draws must be integer in [20,2000]')
    if not isinstance(analysis.get('bootstrap_resamples'), int) or not 100 <= analysis.get('bootstrap_resamples', 0) <= 100000:
        errors.append('bootstrap_resamples must be integer in [100,100000]')
    for k in ['seed', 'min_training_organoids', 'min_test_donors', 'min_training_per_age_band']:
        if not isinstance(analysis.get(k), int) or analysis[k] < (0 if k == 'seed' else 1):
            errors.append('invalid integer: ' + k)
    if design.get('recording_window_seconds') != 180 or design.get('minimum_active_units') != 20:
        errors.append('window/unit settings differ from implemented extraction')
    bands = analysis.get('age_bands_days')
    if bands != [[1,150],[151,365]]:
        errors.append('unsupported age bands')
    if p.get('exclusions', []) != []:
        errors.append('exclusions not implemented; any failed quality gate stops the run')
    train, test = p.get('training', []), p.get('test', [])
    if not isinstance(train, list) or not isinstance(test, list) or any(not isinstance(r, dict) for r in train + test):
        return errors + ['training/test must be arrays of recording objects']
    identities, hashes = set(), set()
    known = seen_hashes()
    fields = ['path', 'sha256', 'dataset_id', 'organoid_id', 'culture_id', 'donor_id', 'lab_id', 'preparation', 'age_days']
    for split, rows in [('training', train), ('test', test)]:
        for row in rows:
            if not all(row.get(k) is not None and row.get(k) != '' for k in fields):
                errors.append(split + ': missing recording identity/provenance')
                continue
            key = (row['dataset_id'], row['culture_id'])
            if key in identities or row['sha256'] in hashes:
                errors.append('repeated culture or identical recording across rows')
            identities.add(key); hashes.add(row['sha256'])
            if not isinstance(row['age_days'], int) or isinstance(row['age_days'], bool) or row['age_days'] < 1 or row['age_days'] > 365:
                errors.append('age outside protocol bands [1,365]')
            if len(str(row['sha256'])) != 64 or any(c not in '0123456789abcdef' for c in str(row['sha256'])):
                errors.append('invalid raw SHA-256')
            if split == 'test' and (row['sha256'] in known or re.search(r'(?<![0-9])001603(?![0-9])', str(row['dataset_id'])) is not None):
                errors.append('E1/E2 dataset/recording already seen: prohibited as new E3 test')
    donor = lambda r: (r.get('lab_id'), r.get('donor_id'))
    if {donor(r) for r in train} & {donor(r) for r in test}:
        errors.append('donor leakage across training and test')
    if design.get('external_lab_required') and {r.get('lab_id') for r in train} & {r.get('lab_id') for r in test}:
        errors.append('external laboratory requirement not met')
    if errors:
        return errors
    if strict:
        if len(train) < analysis.get('min_training_organoids', 10): errors.append('insufficient training organoids')
        if len({donor(r) for r in test}) < analysis.get('min_test_donors',5): errors.append('insufficient independent test donors')
        for lo, hi in [[1,150],[151,365]]:
            n = sum(isinstance(r.get('age_days'), (int,float)) and lo <= r['age_days'] <= hi for r in train)
            if n < analysis.get('min_training_per_age_band',3): errors.append(f'insufficient training in age band {lo}-{hi}')
            if not any(isinstance(r.get('age_days'), (int,float)) and lo <= r['age_days'] <= hi for r in test): errors.append(f'no test in age band {lo}-{hi}')
        for k in ['power_or_precision_justification', 'selection_and_exclusions_fixed_before_spikes', 'stopping_rule']:
            if not design.get(k): errors.append('unresolved design field: ' + k)
        if p.get('status') != 'registered': errors.append('protocol not marked registered')
        reg = p.get('registration', {})
        if not str(reg.get('url') or '').startswith('https://'): errors.append('missing registration URL')
        if not reg.get('registered_at'): errors.append('missing registration date')
        if reg.get('registered_payload_sha256') != payload_digest(p): errors.append('registration payload digest missing or different')
        for name in ANALYSIS_FILES:
            if p.get('code_sha256', {}).get(name) != digest(ROOT/name): errors.append('analysis code not frozen: ' + name)
    return errors


def main():
    import argparse
    ap = argparse.ArgumentParser(description=__doc__)
    ap.add_argument('manifest', type=Path)
    ap.add_argument('--print-hashes', action='store_true', help='Print hashes only; does not claim registration.')
    a = ap.parse_args()
    p = json.loads(a.manifest.read_text())
    if a.print_hashes:
        print(json.dumps({'code_sha256': {f: digest(ROOT/f) for f in ANALYSIS_FILES}, 'payload_sha256': payload_digest(p)}, indent=2))
        return
    errors = validate(p)
    print(json.dumps({'ready': not errors, 'errors': errors, 'registration_authenticated': False}, indent=2))
    if errors: raise SystemExit(2)

if __name__ == '__main__': main()
