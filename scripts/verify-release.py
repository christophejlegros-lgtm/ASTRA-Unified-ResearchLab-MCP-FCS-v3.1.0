#!/usr/bin/env python3
"""Check packaged sources against the embedded manifest, without extracting."""
import argparse,hashlib,json,zipfile
ap=argparse.ArgumentParser();ap.add_argument('archive');a=ap.parse_args()
with zipfile.ZipFile(a.archive) as z:
    if z.testzip() is not None: raise SystemExit('ZIP CRC failure')
    manifests=[name for name in z.namelist() if name.endswith('/validation/release-manifest.json')]
    if len(manifests)!=1: raise SystemExit('Expected one release manifest')
    name=manifests[0];m=json.loads(z.read(name));prefix=name[:-len('validation/release-manifest.json')]
    sums=m['file_sha256']
    if set(z.namelist())!={prefix+p for p in sums}|{name}: raise SystemExit('Unlisted or missing source file')
    for path,want in sums.items():
        if hashlib.sha256(z.read(prefix+path)).hexdigest()!=want: raise SystemExit('Digest mismatch: '+path)
    tree=hashlib.sha256(json.dumps(sums,sort_keys=True,separators=(',',':')).encode()).hexdigest()
    if tree!=m['source_tree_sha256']: raise SystemExit('Source tree digest mismatch')
    print(json.dumps({'valid':True,'version':m['version'],'verified_files':len(sums),'publication_authenticated':False},indent=2))
