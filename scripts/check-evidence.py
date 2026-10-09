#!/usr/bin/env python3
"""Raw-byte historical evidence integrity, not remote chronology verification."""
import hashlib,json
from pathlib import Path
root=Path(__file__).resolve().parents[1]
lock=json.loads((root/'validation/historical-evidence.json').read_text())
errors=[]
for name,want in lock['files'].items():
    p=root/name
    if not p.is_file() or hashlib.sha256(p.read_bytes()).hexdigest()!=want: errors.append(name)
print(json.dumps({'historical_integrity':not errors,'files':len(lock['files']),'changed':errors,'remote_chronology_authenticated':False},indent=2))
if errors: raise SystemExit(1)
