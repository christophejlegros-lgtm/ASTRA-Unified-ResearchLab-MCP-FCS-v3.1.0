#!/usr/bin/env python3
"""
E2 — one-command run of the preregistered test (empirical/PREREG-E2-DANDI-001603.md).

  python3 empirical/run_e2.py path/to/sub-HO1_ses-20250924T002125.nwb \\
      path/to/sub-HO2_ses-20250924T002113.nwb path/to/sub-HO3_ses-20250924T002116.nwb \\
      path/to/sub-HO4_ses-20250924T002126.nwb path/to/sub-HO5_ses-20250924T002125.nwb

Steps (PREREG-E2 §3–§6):
  0. check that the frozen code (simulator, export, analysis) is byte-identical,
     after CRLF→LF normalisation, to the hashes fixed in the preregistration;
  1. for each test file: window T, export the E2 candidate ('network-burst',
     E2_CALIBRATED_PARAMS) and the E1 model ('poisson', negative control),
     seeds 1–10, same T;
  2. S1–S5 and verdicts with empirical/confront.py (rules unchanged from E1);
  3. write empirical/results/E2.json (primary) and
     empirical/results/E2_control_poisson.json (control), print the summary.

Requires: Node ≥ 20 (npx tsx), Python 3 with numpy and h5py.
"""
import hashlib
import json
import os
import subprocess
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(HERE)
sys.path.insert(0, HERE)
import confront as C  # noqa: E402

PREREG = "empirical/PREREG-E2-DANDI-001603.md"

# SHA-256 of the frozen files, LF-normalised (PREREG-E2 §3). Never edited after the
# preregistration was made public.
FROZEN = {
    "src/engine/neuroplatform.ts": "e529bf16221fe1d296fb097ce6b81faaeace1a4890cee87588820fa8a99ef7f1",
    "empirical/sim_export.ts": "17186253ae6e1ac2d03f5b71c99599ff32c9691fc9267f7d33efafe0767c2de7",
    "empirical/confront.py": "2e674ebaf34a31e56b3a0baabab3e4d5094fe6a51efb47faa8832fddb735a7ee",
}

TEST_PREFIXES = ("sub-HO1_", "sub-HO2_", "sub-HO3_", "sub-HO4_", "sub-HO5_")


def lf_sha256(path: str) -> str:
    with open(path, "rb") as fh:
        return hashlib.sha256(fh.read().replace(b"\r\n", b"\n")).hexdigest()


def check_frozen() -> dict:
    drift = {}
    for rel, want in FROZEN.items():
        got = lf_sha256(os.path.join(ROOT, rel))
        if got != want:
            drift[rel] = {"expected": want, "found": got}
    return drift


def export(model: str, T: float, out: str) -> None:
    env = dict(os.environ, TSX_TSCONFIG_PATH="tsconfig.test.json")
    subprocess.run(["npx", "tsx", "empirical/sim_export.ts", f"--model={model}", repr(T), out, "1-10"],
                   cwd=ROOT, check=True, env=env, shell=(os.name == "nt"))


def summary(title: str, rep: dict) -> None:
    print(f"\n{title}: {rep['global_verdict']}")
    for k, v in rep.get("verdicts", {}).items():
        lo, hi = rep["real_range"][k]
        print(f"  {k:<20} sim={rep['sim_value'][k]:.4g}   real=[{lo:.4g}, {hi:.4g}]   → {v}")


def main(argv):
    allow_drift = "--allow-code-drift" in argv
    paths = [a for a in argv if not a.startswith("--")]
    if not paths:
        sys.exit(__doc__)
    if not all(os.path.basename(p).startswith(TEST_PREFIXES) for p in paths):
        sys.exit("E2 runs on the preregistered test organoids sub-HO1…HO5 only (PREREG-E2 §2).")

    drift = check_frozen()
    if drift and not allow_drift:
        sys.exit("Frozen code differs from the preregistered hashes:\n" + json.dumps(drift, indent=2)
                 + "\nRe-run from the preregistered commit, or pass --allow-code-drift (the drift is then"
                 + " recorded in the results and must be declared as a deviation).")

    res = os.path.join(HERE, "results")
    os.makedirs(res, exist_ok=True)
    nb_sims, po_sims = [], []
    for p in paths:
        try:
            T = C.load_nwb_units(p).window_s
        except Exception:  # excluded by confront.run with its reason (PREREG-E2 §2)
            T = 1.0
        for model, bucket in (("network-burst", nb_sims), ("poisson", po_sims)):
            out = os.path.join(res, f"{os.path.basename(p)}.{model}.sim.json")
            export(model, T, out)
            bucket.append(out)

    primary = C.run(paths, nb_sims, os.path.join(res, "E2"), prereg=PREREG)
    control = C.run(paths, po_sims, os.path.join(res, "E2_control_poisson"), prereg=PREREG)

    n_ok = len(primary["real"])
    validity = {
        "usable_test_organoids": n_ok,
        "enough_organoids (≥3)": n_ok >= 3,
        "control_not_adequate": control["global_verdict"] != "ADEQUATE",
        "code_drift": drift,
    }
    validity["valid"] = validity["enough_organoids (≥3)"] and validity["control_not_adequate"] and not drift
    primary["validity"] = validity
    primary["control_global_verdict"] = control["global_verdict"]
    with open(os.path.join(res, "E2.json"), "w") as fh:
        json.dump(primary, fh, indent=2, default=float)

    summary("E2 primary — network-burst candidate", primary)
    summary("E2 control — E1 poisson model", control)
    print("\nValidity:", json.dumps(validity, ensure_ascii=False))
    if not validity["valid"]:
        print("→ E2 is NOT CONCLUSIVE under PREREG-E2 §6, whatever the primary verdict.")


if __name__ == "__main__":
    main(sys.argv[1:])
