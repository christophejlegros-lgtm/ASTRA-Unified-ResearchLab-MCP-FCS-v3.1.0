#!/usr/bin/env python3
"""Design completeness only: never certifies ethics approval or registration."""
import argparse,json
from pathlib import Path

def check(obj,path=''):
    missing=[]
    if isinstance(obj,dict):
        for key,v in obj.items(): missing.extend(check(v,path+'.'+key if path else key))
    elif isinstance(obj,list):
        for i,v in enumerate(obj): missing.extend(check(v,path+f'[{i}]'))
    elif obj is None or obj=='': missing.append(path)
    return missing

def main():
    ap=argparse.ArgumentParser(description=__doc__)
    ap.add_argument('design',type=Path)
    a=ap.parse_args();p=json.loads(a.design.read_text())
    missing=check(p)
    status_ok=p.get('status')=='registered'
    print(json.dumps({'complete':not missing,'status_registered':status_ok,
       'registration_authenticated':False,'ethics_approval_authenticated':False,'unresolved':missing},indent=2))
    if missing or not status_ok: raise SystemExit(2)
if __name__=='__main__': main()
