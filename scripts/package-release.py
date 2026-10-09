#!/usr/bin/env python3
"""Deterministic source ZIP; no publish, remote commit or DOI is fabricated."""
from __future__ import annotations
import argparse
import hashlib
import json
from pathlib import Path
import subprocess
import zipfile

ROOT=Path(__file__).resolve().parents[1]
EXCLUDED={'.git','node_modules','dist','__pycache__','.venv','venv','coverage','.cache','.pytest_cache'}


def source_files():
    files=[]
    for p in ROOT.rglob('*'):
        if not p.is_file(): continue
        rel=p.relative_to(ROOT)
        if any(part in EXCLUDED for part in rel.parts): continue
        if p.name.startswith('.env') or p.suffix in {'.pyc','.log','.zip','.nwb','.pem','.key'}: continue
        if rel.as_posix()=='validation/release-manifest.json': continue
        if p.name.endswith('.sim.json'): continue
        files.append(p)
    return sorted(files,key=lambda p:p.relative_to(ROOT).as_posix())


def main():
    ap=argparse.ArgumentParser(description=__doc__)
    ap.add_argument('--out',type=Path,default=ROOT.parent/('ASTRA-FCS-v'+json.loads((ROOT/'package.json').read_text())['version']+'.zip'))
    a=ap.parse_args()
    for cmd in [['node','scripts/check-version.mjs'],['python3','scripts/check-evidence.py']]:
        subprocess.run(cmd,cwd=ROOT,check=True)
    validation=json.loads((ROOT/'validation/LOCAL-VALIDATION.json').read_text())
    if validation.get('software_checks_passed') is not True: raise SystemExit('No successful local validation record.')
    for name,want in validation.get('checked_code_sha256',{}).items():
        if hashlib.sha256((ROOT/name).read_bytes()).hexdigest()!=want: raise SystemExit('Code changed since validation: '+name)
    files=source_files()
    sums={p.relative_to(ROOT).as_posix():hashlib.sha256(p.read_bytes()).hexdigest() for p in files}
    version=json.loads((ROOT/'package.json').read_text())['version']
    snapshot=hashlib.sha256(json.dumps(sums,sort_keys=True,separators=(',',':')).encode()).hexdigest()
    manifest={'schema_version':1,'version':version,'status':'local-candidate-not-published',
      'upstream_repository':'https://github.com/christophejlegros-lgtm/ASTRA-Unified-ResearchLab-MCP-FCS-v3.1.0',
      'remote_commit_verified':None,'source_tree_sha256':snapshot,'file_sha256':sums,
      'source_archive_sha256':json.loads((ROOT/'validation/historical-evidence.json').read_text())['source_archive_sha256'],
      'archive_convention':'sorted paths; 2026-10-09T00:00:00 fixed ZIP timestamps; files 0644; source only; manifest excludes itself',
      'historical_remote_precedence_authenticated':False}
    mp=ROOT/'validation/release-manifest.json'
    mp.write_text(json.dumps(manifest,indent=2,ensure_ascii=False)+'\n')
    files.append(mp);files.sort(key=lambda p:p.relative_to(ROOT).as_posix())
    a.out.parent.mkdir(parents=True,exist_ok=True)
    with zipfile.ZipFile(a.out,'w',zipfile.ZIP_DEFLATED,compresslevel=9) as z:
        for p in files:
            rel=f'ASTRA-FCS-v{version}/'+p.relative_to(ROOT).as_posix()
            info=zipfile.ZipInfo(rel,date_time=(2026,10,9,0,0,0))
            info.create_system=3; info.external_attr=0o100644<<16;info.compress_type=zipfile.ZIP_DEFLATED
            z.writestr(info,p.read_bytes(),compress_type=zipfile.ZIP_DEFLATED,compresslevel=9)
    sha=hashlib.sha256(a.out.read_bytes()).hexdigest()
    a.out.with_suffix('.zip.sha256').write_text(sha+'  '+a.out.name+'\n')
    print(json.dumps({'archive':str(a.out.resolve()),'sha256':sha,'files':len(files),'source_tree_sha256':snapshot},indent=2))

if __name__=='__main__': main()
