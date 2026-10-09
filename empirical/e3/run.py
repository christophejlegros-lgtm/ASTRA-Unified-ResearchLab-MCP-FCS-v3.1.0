#!/usr/bin/env python3
"""Run E3 on a prepared manifest; no access to test spikes until protocol checks pass."""
from __future__ import annotations
import argparse
import json
import sys
from pathlib import Path
import numpy as np

HERE = Path(__file__).resolve().parent
sys.path.insert(0, str(HERE.parent))
import confront as C
from analysis import JointPredictor, KEYS, energy_scores, cluster_summary, describe_predictions
from protocol import validate, payload_digest, digest, ANALYSIS_FILES, ROOT


def extract(path, window=180.0):
    """Explicit observation interval; no duration inferred from firing rate."""
    import h5py
    with h5py.File(path,'r') as f:
        u = f['units']
        for field in ['spike_times', 'spike_times_index', 'obs_intervals']:
            if field not in u: raise ValueError('required units/' + field + ' missing')
        oi = np.asarray(u['obs_intervals'][()], float)
        if oi.ndim != 2 or oi.shape[1] != 2 or not len(oi) or not np.isfinite(oi).all():
            raise ValueError('obs_intervals must contain contiguous [start,end] intervals')
        if not np.allclose(oi, oi[0], atol=1e-9, rtol=0) or oi[0,1]-oi[0,0] < window:
            raise ValueError('need same single observation interval for all units, >=180s')
        start = oi[0,0]
        times = np.asarray(u['spike_times'][()], float)
        index = np.asarray(u['spike_times_index'][()])
        if index.ndim != 1 or not len(index) or not np.issubdtype(index.dtype, np.integer): raise ValueError('invalid ragged indices')
        if times.ndim != 1 or not np.isfinite(times).all() or np.any(np.diff(index)<0) or index[0]<0 or index[-1]!=len(times): raise ValueError('invalid spike table')
        starts = np.concatenate([[0],index[:-1]])
        trains = []
        for lo,hi in zip(starts,index):
            t = times[lo:hi]
            if np.any(np.diff(t)<0): raise ValueError('unsorted spike train')
            trains.append(t[(t>=start)&(t<start+window)]-start)
    rec = C.Recording(Path(path).name, trains, window, float(oi[0,1]-start), 'explicit contiguous obs_intervals', len(trains))
    stats = C.statistics(rec)
    if stats['n_active'] < 20: raise ValueError('fewer than 20 active curated units')
    if any(not np.isfinite(stats[k]) for k in KEYS): raise ValueError('incomplete S1-S5; no imputation')
    return stats


def evaluate(train, train_ages, observed, ages, donors, draws=200, seed=20261009, resamples=2000):
    age = JointPredictor(True).fit(train,train_ages)
    base = JointPredictor(False).fit(train,train_ages)
    # Both models use the same training-defined output coordinates.
    predictions, scores = {}, {}
    for label, model in [('joint-age',age),('joint-intercept',base)]:
        z = model.draws(ages,draws,seed)
        score = energy_scores(z,model.target(observed))
        scores[label] = score
        predictions[label] = {'joint_energy_scores': score.tolist(),
            'donor_summary': cluster_summary(score, donors,seed,resamples),
            'statistics': describe_predictions(model.original(z), np.asarray(observed))}
    difference = scores['joint-age']-scores['joint-intercept']
    return {'models': predictions, 'primary_difference': cluster_summary(difference,donors,seed,resamples),
            'primary_direction': 'negative favours joint-age; not a global adequacy or consciousness verdict'}


def main():
    ap=argparse.ArgumentParser(description=__doc__)
    ap.add_argument('manifest',type=Path)
    ap.add_argument('--out',type=Path,required=True)
    ap.add_argument('--exploratory',action='store_true')
    a=ap.parse_args()
    if a.out.exists(): raise SystemExit('Output already exists; use a new run path. Historical results cannot be overwritten.')
    p=json.loads(a.manifest.read_text())
    errors=validate(p,strict=not a.exploratory)
    if errors: raise SystemExit('E3 blocked before spike access:\n'+'\n'.join(errors))
    groups=[]
    provenance=[]
    for split in ['training','test']:
        group=[]
        for row in p[split]:
            path=(a.manifest.parent/row['path']).resolve()
            if digest(path)!=row['sha256']: raise SystemExit('Raw recording hash mismatch: '+row['organoid_id'])
            try: stats=extract(path)
            except Exception as exc: raise SystemExit('Quality gate failure, no silent exclusion: '+row['organoid_id']+': '+str(exc))
            group.append([stats[k] for k in KEYS])
            provenance.append({**row,'split':split,'statistics':stats})
        groups.append(group)
    donors=[r['lab_id']+':'+r['donor_id'] for r in p['test']]
    cfg=p['analysis']
    result=evaluate(groups[0],[r['age_days'] for r in p['training']],groups[1],[r['age_days'] for r in p['test']],donors,cfg['draws'],cfg['seed'],cfg['bootstrap_resamples'])
    # Also report stratified errors rather than hiding age dependence in a mean.
    stratified={}
    ages=np.asarray([r['age_days'] for r in p['test']])
    for lo,hi in cfg['age_bands_days']:
        selected=np.flatnonzero((ages>=lo)&(ages<=hi))
        if len(selected):
            vals=np.array(result['models']['joint-age']['joint_energy_scores'])[selected]
            stratified[f'{lo}-{hi}']=cluster_summary(vals,[donors[i] for i in selected],cfg['seed'],cfg['bootstrap_resamples'])
    report={'status':'exploratory' if a.exploratory else 'protocol-attested-unverified-registration',
            'registration_authenticated':False,'phenomenal_or_welfare_inference':False,
            'manifest_sha256':digest(a.manifest),'protocol_payload_sha256':payload_digest(p),
            'code_sha256':{f:digest(ROOT/f) for f in ANALYSIS_FILES}, 'keys':KEYS,
            'recordings':provenance, 'analysis':result,'age_stratified':stratified}
    a.out.parent.mkdir(parents=True,exist_ok=True)
    with a.out.open('x') as fh: json.dump(report,fh,indent=2,allow_nan=False)
    print(json.dumps({'status':report['status'],'primary':result['primary_difference']},indent=2))

if __name__=='__main__': main()
