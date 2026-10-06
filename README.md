# ASTRA — Unified Research Lab + MCP Server

**Agent-orchestrated Simulation Testbed for Research on Awareness**

[![DOI](https://zenodo.org/badge/DOI/10.5281/zenodo.23196959.svg)](https://doi.org/10.5281/zenodo.23196959)

> **Data provenance.** All biological and physiological data produced by this server
> are **simulated**. No living tissue, organoid, human subject or Koniku hardware is
> connected: the NeuroPlatform bridge is instantiated in simulate mode, the OVOMIND live
> adapter is an unimplemented stub, and the sensory encoders are untrained
> re-implementations inspired by V-JEPA 2 / A-JEPA. The consciousness-related indices
> are **computed proxies, not measurements**, and ASTRA makes **no claim of sentience**
> (the acronym's former expansion, *Autonomous Sentient Thoughtful Reasoning Agent*, is
> withdrawn — see `src/engine/tcai/phenomenal-guard.ts`).

> **First empirical test (E1).** The organoid surrogate's spontaneous activity was
> confronted with three real human brain organoids (DANDI 001603) under a preregistration
> made public *before* the data were received. Verdict: **INADEQUATE** — the real
> organoids burst and synchronise, the surrogate emits independent Poisson trains; the
> failure is structural, not parametric. Protocol, results and replay:
> [`empirical/`](empirical/RESULTS-E1.md).
>
> **Second test (E2, preregistered).** A candidate revision
> (`spontaneousModel: 'network-burst'`: shared network bursts + locally clustered
> background, 9 parameters calibrated on the three E1 organoids only) was frozen, made
> public, then confronted with five **unseen** organoids (sub-HO1…HO5), with the E1 model
> as negative control. Verdict: **PARTIALLY ADEQUATE** (0 incompatible, 2 compatible,
> 3 marginal; the a-priori prediction "adequate" is refuted; the control stays
> INADEQUATE). The structural E1 failure is fixed, but the calibration does not transfer
> across organoids, notably to older (7-month) ones. The default model stays `'poisson'`.
> [`empirical/RESULTS-E2.md`](empirical/RESULTS-E2.md).

[![License: MIT](https://img.shields.io/badge/License-MIT-cyan.svg)](LICENSE)
[![CI](https://github.com/christophejlegros-lgtm/ASTRA-Unified-ResearchLab-MCP-FCS-v3.1.0/actions/workflows/ci.yml/badge.svg)](https://github.com/christophejlegros-lgtm/ASTRA-Unified-ResearchLab-MCP-FCS-v3.1.0/actions)
[![MCP Spec](https://img.shields.io/badge/MCP_Spec-2025--11--25-blue.svg)](https://modelcontextprotocol.io/specification/2025-11-25)
[![MCP SDK](https://img.shields.io/badge/MCP_SDK-1.12+-blueviolet.svg)](https://modelcontextprotocol.io)
[![Node.js](https://img.shields.io/badge/Node.js-≥20-green.svg)](https://nodejs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue.svg)](https://typescriptlang.org)

Production-grade [Model Context Protocol](https://modelcontextprotocol.io) server exposing the ASTRA bio-hybrid neuromorphic simulation pipeline to AI assistants. Built with the official `@modelcontextprotocol/sdk`, it integrates a layered SNN LIF+STDP engine, consciousness proxy assessment, bio-computing platform telemetry, and an IRB ethics monitor — all queryable as MCP tools, resources, and prompts from **Claude Desktop**, **Cursor**, **VS Code**, and any MCP-compatible client.

## 🆕 v3.1.1 — Coherence corrections (audit of 6 October 2026)

Five corrections from a critical audit of v3.1.0. Each one fixes a point where the
server contradicted its own FCS series or its own empirical results.

1. **Calcium is no longer bound to class 1.** ASTRA's `eth.ca` is *intracellular* free
   Ca²⁺ in nM (`ethics.ts`): the second messenger, which document IV §2 and synthesis
   S-1.6 place outside class 1. v3.1.0 bound it to class 1 as "extracellular Ca²⁺ at
   the MEA bath", a category error, and one of scale too: bath Ca²⁺ is about 1–2 mM.
   Class 1 now reads only an extracellular value in mM (`extracellularCalciumMm`,
   supplied by the caller), and is `withheld()` otherwise. `eth.ca` is reported and
   bound to no pair.
2. **No consciousness scale anywhere; every payload is screened.** `get_acm_score`
   binned its weighted composite into six labels, ABSENT…FULL. That is a quantified
   degree of consciousness (prohibition 1) built from an aggregate (prohibition 4).
   The labels and `decisionClass` are removed. The composite remains, but only as a
   declared engineering index (`aggregationStatus`).
   - **New `src/lint-guard.ts`.** Every tool and resource payload passes `lintClaim`
     and `lintFcs`; v3.1.0 screened only 20 of 70 tools. `fcs_lint` is exempt because
     it echoes the text it screens.
   - **Linter fixes.** The P3 rule's ungrouped alternation fired on any sentence
     containing "mécanisme". A year in parentheses no longer exempts an assertion, and
     naming a prohibition no longer exempts a sentence that asserts a value. Common
     paraphrases are now caught ("consciousness level 0.7", "71 % conscious", "Phi
     equals phenomenal experience"). An ordinal unit label no longer makes two ranks
     commensurable under P4.
3. **The τ ordinalisation is published, and the strata are put in their place.**
   - **Document IV v1.3.** `FCS v1.5/Implementation Neurochimique FCS v1.3.html` §2
     declares the reduction that links the τ ranges to the strata. Matching the
     published strata checks the transcription; it does not validate the cuts. Of ten
     plausible reductions, only the declared one reproduces the strata
     (`ordinalisationSensitivity()`).
   - **The dominance relation itself.** `fcs_stratify` now returns 93 comparable pairs
     out of 136 and the Hasse diagram.
   - **What strata do not order.** 28 of the 121 cross-stratum pairs are incomparable.
   - **Context dependence.** Removing the ion shifts the other sixteen pairs, so a
     stratum is a label of the peeling, not a property of the pair. `fcs_compare` says
     so when two incomparable pairs sit in different strata.
4. **Welfare thresholds recalibrated on DANDI 001603.** The firing-rate range was
   15–45 Hz, with ≤ 5 Hz critical. Every real organoid confronted in E1/E2 (median
   per-unit rate 0.14–0.62 Hz) would have been reported in distress. `eth.fr` is now
   the median per-unit rate:
   - normal 0.14–0.63 Hz (observed range of the eight organoids);
   - stress within a factor 2 of that range;
   - distress beyond.

   This is a descriptive reference interval from one dataset, not a validated welfare
   criterion.
5. **Aligned on synthesis S-1.6, counts and licensing corrected.**
   - **S-1.6 belt extension.** `src/engine/fcs/optogenetics.ts` encodes:
     - what each intervention dissociates, with a check that no intervention both
       breaks the generative dependence and satisfies the P5 clause;
     - the astrocytic anchoring, decomposed onto pairs already in the table;
     - a candidate astrocytic pair that is equivalent to class 8 and adds no
       distinction.

     `fcs_report` and `astra://fcs/framework` carry this extension.
   - **Counts.** References updated to IV v1.3 and S-1.6.
   - **Licensing.** `package.json` declares `MIT AND LicenseRef-TCAI-NonCommercial`
     and ships `THIRD_PARTY_NOTICES.md` and the upstream licence. `CITATION.cff` points
     to the licensing statement instead of declaring MIT for the whole.
   - **Dependencies.** `npm audit fix` brings vulnerabilities back to 0.

Test suite 331 → **354 tests · 66 suites** (`tests/lint-guard.test.ts` added; FCS
69 → 86). Not addressed here and still open:
- the organoid realisation verdicts for myelin (11) and genomic hormones (9a), which
  the culture protocol should decide;
- the read-only annotation of `get_acm_score`, whose `assess()` updates `acm.*`;
- the M2 asymmetry in `withdrawal.ts`.

---

## v3.1.0 — FCS layer: substrate-constrained functionalism

Implements the values of the FCS series (documents I v1.5, II v1.4, IV v1.3 — table
as in v1.2 —, synthesis S-1.6) inside ASTRA as `fcs_*` tools — **not** as a scoring
module.

- **The stratification is computed, never hard-coded.** The seventeen
  species–function pairs are ordered by **Pareto dominance** over three ordinal
  sub-criteria (causal distance to the carrier, time constant, ablation effect),
  peeled into a partial order. `tests/fcs.test.ts` asserts that the result
  reproduces the **eight strata published in document IV §3** exactly — the only
  way to know the transcription is right.
- **No aggregate score exists, anywhere in the layer.** The series' negative
  heuristic forbids aggregating ordinal criteria lacking a common scale
  (prohibition 4, after Okasha 2011). `mayAggregate()` refuses such a
  combination at runtime; `refuseAggregate()` returns a withheld scalar carrying
  its reason instead of a number.
- **The IRB welfare biomarkers are bound to the taxonomy.** ATP/ADP is class 7,
  firing rate is the class-3 generator signature, viability stands proxy for class
  2b. (v3.1.0 also bound `eth.ca` to class 1; corrected in v3.1.1 — see above.) A drifting biomarker
  becomes a statement about which pair has left its operating range. A silent
  channel yields `withheld()`, never zero.
- **The silicon SNN realises no constitutive pair**, and the audit says so:
  under the substrate constraint the level-I carrier is absent there, whatever
  the level-III/IV profile shows.
- **Two linters gate every payload** — `lintClaim` (Block's access/phenomenal
  distinction) and `lintFcs` (the five prohibitions), the latter distinguishing
  use from mention so that stating a prohibition or citing a title does not fire it.
  (In v3.1.0, the FCS, Orch OR and OVOMIND families only; server-wide since v3.1.1.)
- MCP surface: 62 → **70 tools** (`fcs_*` ×8); resources 11 → 15, prompts 8 → 10.
  Test suite 241 → **317 tests** (69 in `tests/fcs.test.ts`, 7 in `tests/annotations.test.ts`).
- **MCP tool annotations** on all 70 tools (title + read-only / destructive / idempotent /
  open-world hints), classified from each handler's code — see [MCP Tools](#mcp-tools-70).
- **Corrections before dissemination.** Acronym re-expanded without "Sentient"; data
  provenance stated up front; encoder labels now read "…-inspired (untrained)";
  `get_acm_score` retitled as a composite proxy; every stochastic component draws from one
  **seeded** generator (`ASTRA_SEED`, reported by `get_system_status`, `export_snapshot`
  and `/health`); third-party article copies replaced by a DOI bibliography;
  [`THIRD_PARTY_NOTICES.md`](THIRD_PARTY_NOTICES.md), [`CITATION.cff`](CITATION.cff),
  [`PREREGISTRATION.md`](PREREGISTRATION.md) and [`REVIEW.md`](REVIEW.md) added.
  Test suite **323 tests** (6 in `tests/reproducibility.test.ts`).
- **Dependencies hardened.** `express` 4 → 5 (the MCP SDK already ran on Express 5; the
  project's `@types/express` were already v5) and `tsx` → 4.23 (bundles a patched
  `esbuild`): `npm audit` reports **0 vulnerabilities** (previously 11, of which 7 in
  runtime dependencies). No code change was needed; the 12 transport tests pass unchanged.
- **New console:** `dashboard/ASTRA-FCS-Dashboard.html` — self-contained,
  bilingual FR/EN, recomputing the partial order in the browser and reporting
  whether it reproduces the published strata.

→ [FCS-INTEGRATION.en.md](FCS-INTEGRATION.en.md) · [FCS-INTEGRATION.fr.md](FCS-INTEGRATION.fr.md)

---

## 🆕 v3.0.1 — Transport-layer audit: blocking fix + integration suite

A code audit of the v3.0 tree found that **both HTTP transports were inoperative at
runtime** despite a fully green test suite. `express.json()` consumes the request
stream, and the MCP SDK requires the already-parsed body to be handed back
(`handleRequest(req, res, req.body)` / `handlePostMessage(req, res, req.body)`);
without it the SDK re-read an empty stream and every client→server POST hung until
timeout. The 229 tests never exercised the transports, so the defect survived them.

- **Fix**: parsed body forwarded at all four call sites (`http-server.ts` ×3,
  `sse-server.ts` ×1). Verified end-to-end: `initialize` → `tools/list` (62) → `DELETE`.
- **Session-leak guard**: a POST without a session that is not a valid `initialize`
  now returns a JSON-RPC `-32000` (HTTP 400) instead of silently constructing an
  orphaned server instance.
- **Version unified**: `src/version.ts` is the single source of truth. The MCP server
  previously announced `2.2.0` to clients, while `/health` reported `2.0.0` (SSE) and
  `2.9.0` (HTTP).
- **Bind address**: both transports default to `127.0.0.1`; containers set `0.0.0.0`
  explicitly. See [Environment Variables](#environment-variables).
- **Lint restored**: ESLint ≥ 9 requires a flat config, which the repo lacked — `npm run
  lint` failed outright and CI tolerated it via `continue-on-error`. `eslint.config.js`
  is now wired and lint is a **blocking** CI gate.
- **New suite**: `tests/transports.test.ts` — 12 integration tests over both HTTP
  transports (session lifecycle, tool-count contract, CORS preflight, guards, and
  named regression tests under a hard timeout so a re-introduced hang fails loudly
  rather than freezing the run). Total: **241 tests**.

Testability required a small refactor: `createHttpApp()` and `createSseApp()` are now
exported factories bound to ephemeral ports by the tests, while an `import.meta.url`
entry-point guard preserves direct `node dist/*-server.js` execution.

## 🆕 v3.0 — Unified release: OVOMIND bridge + Orch OR criterion layer + CI fix

v3.0 = the full v2.9 core (unchanged) **plus** the affective exteroception
bridge and the Orch OR substrate-criterion layer, wired and passing:

- `src/engine/ovomind.ts` — OVOMIND adapter (sim by default; the live adapter is
  a deliberate stub pending a vendor API contract), Russell→PAD lift (dominance
  is never estimated from peripheral physiology), gated closed-loop controller
  (ships disarmed; refuses to arm without a protocol reference).
- `src/engine/tcai/phenomenal-guard.ts` — epistemic tiers (`access`/`functional`
  only — no constructor for a phenomenal claim), Argonov ledger, Metzinger gate,
  claim linter. All 12 new tools route their output through it.
- `src/engine/tcai/orch-or.ts` — Penrose criterion τ=ℏ/E_G with the displacement
  scale exposed as the free parameter it is, decoherence budget (verdict:
  UNRESOLVED), per-substrate verdicts, and a classical surrogate gate (temporal
  signature only — explicitly NOT an implementation of Orch OR).
- MCP surface: 50 → **62 tools** (`ovo_*` ×6, `orch_*` ×6); resources and
  prompts unchanged (11 · 8). The stdio smoke test asserts the new count.

Docs: `OVOMIND-INTEGRATION.md` (FR) · `ORCH-OR-INTEGRATION.fr.md` / `.en.md`.

**CI fix shipped in this release.** The previous lockfile pinned
`safe-stable-stringify@2.9.0` — a version that does not exist on the npm
registry (both matrix jobs failed at `npm ci` with E404 in ~17 s). The lockfile
now pins 2.5.0, which satisfies pino's `^2.3.1`. `ci.yml` also gains the
Python + numpy setup that `golden:check` silently required, bumps actions to
v5 (ends the Node 20 deprecation warnings), and updates the tool-count
assertion to 62.

Note: the separate `ASTRA-3.0-` repository (CL1 ↔ Unreal Engine UDP bridge,
Python) is a **companion system**, not a version of this MCP server, and is
not merged here.

## 🆕 v2.9 — Setpoint regulation + real production loop

ASTRA v2.9 makes the continuous controller **non-degenerate**: instead of ramping the substrate to maximum, it **regulates toward a configurable setpoint** (homeostatic drive cost ⇒ interior optimum; the realised feature tracks the setpoint). The closed loop can now run **through the shared production SNN** (read + write) via `setProductionLoop`, genuinely closing on the deployed network — off by default to avoid contention with `snn_step`. The two active-inference roles are made explicit (discrete core = perception/F; continuous controller = control), with `controllerSetpoint`/`controllerModelError` surfaced in telemetry and `setpoint`/`productionLoop` exposed on `tcai_cycle`. *Still a linear forward model over a synthetic SNN-firing proxy.* See **[SECOND-ORDER-LOOP-INTEGRATION.md](SECOND-ORDER-LOOP-INTEGRATION.md)**.

## 🆕 v2.2 — `the_consciousness_ai` (ACM) Integration

ASTRA v2.2 integrates **[tlcdv/the_consciousness_ai](https://github.com/tlcdv/the_consciousness_ai)** — the Artificial Consciousness Module research codebase — at two levels:

- **Native TypeScript port** (`src/engine/tcai/`): Global Neuronal Workspace with sigmoid ignition & reverberation, Kuramoto/AKOrN oscillatory binding, PAD emotional processing & reward shaping, attention-gated emotional memory, self-representation core + attention schema, and a metrics suite (GNW · Effective Information · Φ̃-RIIU) — all fed live from the SNN/world-model state and exposed as **8 new MCP tools** (`tcai_cycle`, `tcai_workspace_state`, `tcai_emotion_appraise`, `tcai_memory_store`, `tcai_memory_retrieve`, `tcai_self_model`, `tcai_metrics`, `tcai_reset`).
- **Full vendored Python codebase** (`python/the_consciousness_ai/`, 291 files — distributed under its own **non-commercial** licence, see [License](#license) and [`THIRD_PARTY_NOTICES.md`](THIRD_PARTY_NOTICES.md)): the complete upstream ACM project for reference and PyTorch-based reproduction.

See **[TCAI-INTEGRATION.md](TCAI-INTEGRATION.md)** for the complete Python → TypeScript mapping and architecture coupling. All consciousness-related metrics remain **computational proxies**, not measurements.

## 🆕 v2.2 — FinalSpark NeuroPlatform v2 Integration

ASTRA v2.2 also integrates the **[FinalSpark NeuroPlatform v2](https://finalspark-np.github.io/np-docs/np_core/doc_v2.html)** wetware control API — the closed-loop interface to living neural organoids on a 128-electrode MEA — at two levels:

- **Native TypeScript port + integration-test surrogate** (`src/engine/neuroplatform.ts`): faithful port of the NeuroPlatform controller surface (`StimParam` with charge-balance checking, `IntanController`, `TriggerController`, `DatabaseController`, `CameraController`) backed by a seeded `OrganoidMEA` model — exposed as **9 new MCP tools** (`np_status`, `np_configure_stim`, `np_send_trigger`, `np_count_spikes`, `np_query_spike_count`, `np_query_spike_events`, `np_query_triggers`, `np_camera_capture`, `np_closed_loop`). The MEA's 128 electrodes couple one-to-one with the ASTRA SNN's 128 neurons.
- **Live Python bridge** (`python/neuroplatform/astra_np_bridge.py`): runs a homeostatic closed loop against the physical platform via the genuine `neuroplatformv2` SDK, streaming couplings to ASTRA over JSON-RPC.
- **Standalone dashboard** (`dashboard/ASTRA-NeuroPlatform-Dashboard.html`): live MEA raster, spike scope, `StimParam` editor with charge-balance readout, trigger generator and closed-loop telemetry.

See **[NEUROPLATFORM-INTEGRATION.md](NEUROPLATFORM-INTEGRATION.md)** for the complete API → TypeScript mapping. With no hardware attached the server runs in **simulate mode** (deterministic Poisson surrogate), **not** living-tissue measurements. The surrogate's spontaneous activity was confronted with real human brain organoids (DANDI 001603) under a public preregistration and found **inadequate** (no network bursts, no synchrony) — see [`empirical/RESULTS-E1.md`](empirical/RESULTS-E1.md).

```
FinalSpark (800K neurons) ──┐
Cortical Labs CL1 ──────────┼─→ Spike Encoders → SNN (LIF+STDP, 128 neurons) → ACM Proxies
Koniku Kore ────────────────┘         │                    │
                                      │              ┌─────┴─────┐
                                      │              │  Φ̃  GW̃  PAD̃  │
                                      │              └─────┬─────┘
                                      ├─→ TCAI/ACM Layer (GNW · AKOrN · PAD · Φ̃-RIIU · EI)
                                      ├─→ NeuroPlatform v2 Bridge (MEA ↔ SNN · StimParam · closed loop)
                                      ├─→ Ethics IRB Monitor (mode-aware)
                                      └─→ MCP Server (70 tools · 15 resources · 10 prompts)
```

> **Note on data mode:** In the default `sim` mode, all bio-platform data is synthetically generated. The server is designed to connect to live platforms in `live` mode, but this requires hardware access and appropriate IRB approval.

---

## What's New in v2

- **Layered SNN architecture:** Configurable feed-forward + recurrent topology (default: 32→64→16→16 = 128 neurons) replacing the flat random network
- **Event-driven STDP:** O(spikes × fan-out) instead of O(N²) per timestep
- **Ring buffer:** O(1) spike history eviction replacing O(n) `Array.shift()`
- **Sparse weight storage:** Adjacency lists instead of dense N×N matrix
- **Honest ACM naming:** Proxies clearly labelled as `integrationProxy`, `broadcastProxy`, `arousalProxy` with methodological basis strings — no false IIT/GWT/PAD claims
- **Bounds-checked parameters:** `set_parameter` rejects implausible values (NaN, Infinity, out-of-range)
- **Mode-aware ethics:** Reports distinguish simulated vs live data with explicit disclaimers
- **CI pipeline:** GitHub Actions for build, test, and Docker smoke-test
- **Repo hygiene:** `dist/` excluded from VCS, `.gitignore` added, deployment script removed

---

## Quick Start

```bash
git clone https://github.com/christophejlegros-lgtm/ASTRA-Unified-ResearchLab-MCP-FCS-v3.1.0.git
cd ASTRA-Unified-ResearchLab-MCP-FCS-v3.1.0

# Install & build
npm install
npm run build

# Run (stdio — for Claude Desktop / Cursor)
node dist/index.js

# Or dev mode (no build needed)
npm run dev
```

## Transports

| Transport | Command | Port | Clients |
|---|---|---|---|
| **stdio** | `node dist/index.js` | — | Claude Desktop, Cursor, VS Code |
| **SSE** | `node dist/sse-server.js` | 9002 | Web clients, remote agents |
| **Streamable HTTP** | `node dist/http-server.js` | 9003 | Modern MCP clients (spec 2025-11-25) |

---

## Client Configuration

### Claude Desktop

Edit `~/Library/Application Support/Claude/claude_desktop_config.json` (macOS) or `%APPDATA%\Claude\claude_desktop_config.json` (Windows):

```json
{
  "mcpServers": {
    "astra": {
      "command": "node",
      "args": ["/absolute/path/to/dist/index.js"],
      "env": { "ASTRA_LOG_LEVEL": "info" }
    }
  }
}
```

### Cursor

Add to `.cursor/mcp.json` (project) or `~/.cursor/mcp.json` (global):

```json
{
  "mcpServers": {
    "astra": {
      "command": "node",
      "args": ["/absolute/path/to/dist/index.js"]
    }
  }
}
```

### VS Code

Add to `.vscode/settings.json`:

```json
{
  "mcp": {
    "servers": {
      "astra": {
        "type": "stdio",
        "command": "node",
        "args": ["${workspaceFolder}/dist/index.js"]
      }
    }
  }
}
```

### Docker (remote SSE + HTTP)

```bash
docker compose up -d
# SSE: http://host:9002/sse
# HTTP: http://host:9003/mcp
```

---

## MCP Tools (70)

Counts below are asserted by the CI stdio smoke test, not maintained by hand.
Every tool declares a title and the four MCP
[tool annotations](https://modelcontextprotocol.io/specification/2025-11-25/server/tools)
(`readOnlyHint`, `destructiveHint`, `idempotentHint`, `openWorldHint`), from a single table:
[`src/tool-annotations.ts`](src/tool-annotations.ts). The classification follows each
handler's code, not its name — e.g. `wm_encode` is **not** read-only (it feeds the history
`wm_surprise` reads), `tcai_curiosity` trains its predictor, `np_count_spikes` advances the
simulated MEA clock. Only `ovo_read`, `ovo_cycle` and `orch_cycle` are open-world (OVOMIND
live API when configured). `tests/annotations.test.ts` asserts that the table and
`tools/list` match exactly. Hints are advisory, not a security boundary.

**Core (12)**

| Tool | Title | Annotations |
|---|---|---|
| `get_system_status` | ASTRA System Status | 📖 read-only |
| `get_metrics` | Real-time Metrics | 📖 read-only |
| `get_snn_state` | SNN Engine State | 📖 read-only |
| `snn_step` | Advance SNN Simulation | ✏️ additive |
| `snn_reset` | Reset SNN Engine | ⚠️ destructive · idempotent |
| `inject_spikes` | Spike Injection | ✏️ additive |
| `get_acm_score` | ACM Proxy Engineering Index (not a measurement) | 📖 read-only |
| `check_ethics` | IRB Neural Welfare Check | 📖 read-only |
| `set_parameter` | Modify State Parameter | ⚠️ destructive · idempotent · bounds-checked |
| `get_platform_status` | Bio-Computing Platforms | 📖 read-only |
| `export_snapshot` | Full State Snapshot | 📖 read-only |
| `simulation_control` | Simulation Control | ✏️ non-destructive · idempotent |

**Domain families (58)**

| Family | Count | Scope | Guide |
|---|---|---|---|
| `wm_*` | 6 | JEPA World Model: encode, predict, plan (CEM), train, surprise | [WORLD-MODEL.md](WORLD-MODEL.md) |
| `sensor_*` | 6 | Untrained encoders inspired by V-JEPA 2 · A-JEPA · Koniku Kore (simulated) · cross-modal fusion | — |
| `tcai_*` | 17 | ACM cycle, workspace, emotion, memory, self-model, metrics, second-order loop | [TCAI-INTEGRATION.md](TCAI-INTEGRATION.md) · [SECOND-ORDER-LOOP-INTEGRATION.md](SECOND-ORDER-LOOP-INTEGRATION.md) |
| `np_*` | 9 | NeuroPlatform v2: status, stim config, triggers, spike queries, camera, closed loop | [NEUROPLATFORM-INTEGRATION.md](NEUROPLATFORM-INTEGRATION.md) |
| `ovo_*` | 6 | OVOMIND affective exteroception bridge (sim by default; live adapter is a stub) | [OVOMIND-INTEGRATION.md](OVOMIND-INTEGRATION.md) |
| `orch_*` | 6 | Orch OR substrate criterion, decoherence budget, classical surrogate gate | [ORCH-OR-INTEGRATION.en.md](ORCH-OR-INTEGRATION.en.md) · [.fr.md](ORCH-OR-INTEGRATION.fr.md) |
| `fcs_*` | 8 | Substrate-constrained functionalism: 4-level framework, 17 species–function pairs in Pareto strata, per-substrate conformance audit, withdrawal conditions, negative-heuristic linter | [FCS-INTEGRATION.en.md](FCS-INTEGRATION.en.md) · [.fr.md](FCS-INTEGRATION.fr.md) |

## MCP Resources (15)

| URI | Description |
|---|---|
| `astra://metrics/realtime` | Live metrics from all subsystems |
| `astra://snn/topology` | **Actual** network architecture (reflects engine config) |
| `astra://acm/state` | Current consciousness proxy assessment vector |
| `astra://ethics/welfare` | IRB compliance and welfare report (mode-aware) |
| `astra://snapshot/current` | Complete state dump |
| `astra://wm/latent` | World Model latent embedding (current) |
| `astra://wm/predictions` | World Model rollout predictions |
| `astra://sensors/state` | Multimodal sensor pipeline state (visual · audio · olfactory · fusion) |
| `astra://tcai/state` | TCAI/ACM workspace, emotion, self-model & metrics |
| `astra://tcai/second-order` | Second-order self-evidencing loop telemetry (setpoint, model error) |
| `astra://neuroplatform/state` | NeuroPlatform bridge state (MEA activity, viability, coupling) |
| `astra://fcs/framework` | FCS four-level framework, core/belt partition and ASTRA coverage |
| `astra://fcs/taxonomy` | 17 species–function pairs in their Pareto strata |
| `astra://fcs/conformance` | Per-substrate FCS conformance audit against live biomarkers |
| `astra://fcs/references` | Verified-DOI bibliography of the FCS series |

## MCP Prompts (10)

Pre-built workflow templates that orchestrate multi-tool sequences:

| Prompt | Description |
|---|---|
| `system-health-report` | Orchestrates multiple tools into a comprehensive system report |
| `snn-experiment` | Controlled SNN experiment: reset → stimulate → observe STDP → assess proxies |
| `ethics-stress-test` | Progressive biomarker degradation: NORMAL → STRESS → DISTRESS → recovery |
| `wm-experiment` | World Model experiment: encode → predict → compare → plan |
| `multimodal-experiment` | Full multimodal sensor experiment: visual + audio + olfactory → fused → WM |
| `tcai-consciousness-cycle` | Guided ACM cycle: specialists → binding → ignition → broadcast → qualia → metrics |
| `tcai-second-order-loop` | Probe the second-order self-evidencing loop (setpoint regulation) |
| `neuroplatform-experiment` | Guided closed-loop protocol: read MEA → configure charge-balanced stim → trigger → observe |
| `fcs-substrate-audit` | Audit ASTRA's three substrates against the FCS taxonomy (no conformance score — prohibition 4) |
| `fcs-belt-review` | Review the protective belt against current strand outcomes and the declared revision order |

---

## Architecture

```
.github/workflows/
└── ci.yml                # GitHub Actions: build, test, Docker smoke-test

src/
├── index.ts              # stdio transport entry point
├── sse-server.ts         # SSE transport (Express) — exports createSseApp() for tests
├── http-server.ts        # Streamable HTTP transport (Express) — exports createHttpApp()
├── version.ts            # ASTRA_VERSION — single source of truth, consumed by all transports
├── lint-guard.ts         # Server-wide claim guard: lintClaim + lintFcs on every tool/resource payload
├── tool-annotations.ts   # MCP annotations for all 70 tools (single table, test-enforced)
├── bridge-state.ts       # Typed state contract shared by the wm/sensor/tcai/np tool families
├── server.ts             # MCP server factory (70 tools + 10 prompts + 15 resources)
│   ├── server-wm-tools.ts            # World Model JEPA (6 tools + 2 resources + 1 prompt)
│   ├── server-sensor-tools.ts        # Multimodal sensors (6 tools + 1 resource + 1 prompt)
│   ├── server-tcai-tools.ts          # TCAI/ACM (17 tools + 2 resources + 2 prompts, incl. closed-loop active inference)
│   ├── server-neuroplatform-tools.ts # NeuroPlatform v2 (9 tools + 1 resource + 1 prompt)
│   ├── server-ovomind-tools.ts       # OVOMIND affective bridge (6 tools)
│   ├── server-orch-tools.ts          # Orch OR criterion layer (6 tools)
│   └── server-fcs-tools.ts           # FCS layer (8 tools + 4 resources + 2 prompts)
├── engine/
│   ├── state.ts          # Reactive state store + parameter bounds registry
│   ├── snn.ts            # Layered SNN LIF+STDP engine (Map-indexed sparse weights, event-driven)
│   ├── acm.ts            # Consciousness proxy module (Φ̃ + GW̃ + PAD̃)
│   ├── ethics.ts         # IRB ethics monitor (mode-aware, biomarker thresholds)
│   ├── world-model.ts    # JEPA World Model engine (LeWM adapted)
│   ├── wm-simulation.ts  # WM simulation manager (replay buffer, auto-train)
│   ├── multimodal-sensors.ts # V-JEPA 2- / A-JEPA- / Koniku-inspired encoders (untrained) + fusion
│   ├── neuroplatform.ts  # FinalSpark NeuroPlatform v2 port + OrganoidMEA simulator
│   ├── ovomind.ts        # OVOMIND adapter (sim default; live adapter is a declared stub)
│   ├── simulation.ts     # Background tick loop
│   ├── fcs/              # FCS: taxonomy, levels, stratification (Pareto, dominance relation,
│   │                     #   sensitivity), conformance, negative-heuristic linter, withdrawal
│   │                     #   conditions, optogenetics (S-1.6 belt extension), references
│   └── tcai/             # ACM native port: global-workspace, oscillatory-binding, emotion,
│                         #   emotional-memory, self-model, second-order, active-inference,
│                         #   metrics, acm-bridge, orch-or, phenomenal-guard, types
└── utils/
    ├── logger.ts         # Structured logging (pino → stderr)
    └── rng.ts            # Global seeded PRNG (mulberry32, ASTRA_SEED)

tests/                    # 354 tests · 66 suites
├── astra.test.ts             # Unit: state, bounds, SNN, ACM, ethics, security
├── world-model.test.ts       # World Model: encoder, predictor, SIGReg, CEM, surprise
├── wm-simulation.test.ts     # WM simulation: buffer, training, planning, lifecycle
├── multimodal-sensors.test.ts # Sensors: V-JEPA, A-JEPA, Koniku, fusion, pipeline
├── tcai.test.ts              # TCAI/ACM: binding, GNW, memory, emotion, self-model, metrics
├── neuroplatform.test.ts     # NeuroPlatform: StimParam, OrganoidMEA, controllers, bridge
├── neuroplatform-e2.test.ts  # E2 'network-burst' spontaneous model (frozen parameters)
├── second-order.test.ts      # Second-order loop: setpoint regulation, production loop
├── aif-equivalence.test.ts   # TS↔NumPy active-inference golden equivalence
├── integration.test.ts       # Client SDK: tools, resources, prompts, workflow
├── transports.test.ts        # HTTP/SSE transport layer: session lifecycle, guards, regressions
├── fcs.test.ts               # FCS: strata, dominance relation, sensitivity, calcium binding, linters, S-1.6
├── lint-guard.test.ts        # Server-wide claim guard: blocking, exemption, every payload screened
├── annotations.test.ts       # MCP annotations: table ≡ tools/list, classification invariants
└── reproducibility.test.ts   # Seeded streams: same seed ⇒ same SNN and encoder outputs

configs/                  # Ready-to-use client configurations
```

> **Extracted to separate repositories:** The v1 HTML dashboard (4 669 lines) and the legacy Node.js bridge config have been removed from this repo to keep it focused on the MCP server. See [ASTRA-Unified-ResearchLab-MCP-](https://github.com/christophejlegros-lgtm/ASTRA-Unified-ResearchLab-MCP-) for the original dashboard.

### SNN Engine

**Layered LIF+STDP** — Configurable layered architecture. Default: 32 (input) → 64 (hidden_1) → 16 (hidden_2) → 16 (output) = **128 neurons**.

Connectivity: feed-forward between adjacent layers (30%) + sparse recurrent within layers (10%). Weights stored as sparse adjacency lists, not dense matrices.

Biophysical parameters: τ_m = 20ms, V_th = −50mV, V_reset = −70mV, refractory = 2ms. Background noise range [10, 22] mV produces ~2 spikes/step at steady state with all neurons active. STDP: A+ = 0.01, A− = 0.012, τ± = 20ms, event-driven (processes only spiking neurons per timestep).

The SNN topology resource (`astra://snn/topology`) dynamically reports the **actual** engine configuration, including layer sizes, synapse count, connectivity parameters, and weight storage type (Map-indexed sparse adjacency lists).

### ACM — Consciousness Proxy Module

> ⚠ **Methodological disclaimer:** The metrics below are **computational proxies** inspired by the referenced theories. They are **not** faithful implementations. See source code comments for full details.

Composite engineering index: `ACM = α·Φ̃ + β·GW̃ + γ·PAD̃` (default: α=0.40, β=0.35, γ=0.25).
Conventional weights over three heterogeneous proxies lacking a common scale: **no class,
level or label is derived from it** (FCS prohibitions 1 and 4; the ABSENT…FULL scale of
≤ v3.1.0 is withdrawn), and every payload carries this status in `aggregationStatus`.

| Component | Basis | Inspired by | What it actually measures |
|---|---|---|---|
| `integrationProxy` (Φ̃) | Active fraction + mean firing rate + synaptic heterogeneity | IIT (Tononi) | Network participation and complexity proxy. True Φ is NP-hard to compute. |
| `broadcastProxy` (GW̃) | Cross-layer firing rate synchrony (CV-based) | GWT (Baars) | Uniform activation across layers. Does not model competitive coalitions or ignition. |
| `arousalProxy` (PAD̃) | Spike rate + bio coupling + energy | PAD (Mehrabian) | Arousal dimension only. Pleasure and Dominance are not computed. |

### Ethics IRB Monitor

IRB compliance level **N3** (100K–1M neurons). Four biomarkers with three-state classification.

**Mode-aware:** In `sim` mode, reports include explicit disclaimers that data is synthetic and `irbRequired` is `false`. In `live` mode, DISTRESS triggers mandatory IRB notification.

| Biomarker | Normal | Stress | Critical |
|---|---|---|---|
| Cell viability | ≥ 90% | 80–90% | < 80% |
| Firing rate (median per unit) | 0.14–0.63 Hz | 0.07–0.14 or 0.63–1.3 Hz | < 0.07 or > 1.3 Hz |
| ATP/ADP | ≥ 3.0 | 2.0–3.0 | < 2.0 |
| Intracellular free Ca²⁺ | < 100 nM | 100–200 nM | ≥ 200 nM |

The firing-rate interval is the observed range of the eight DANDI 001603 organoids
confronted in `empirical/` (E1, E2), with the factor-2 band of the preregistrations; it
is a descriptive reference interval from one dataset, not a validated welfare criterion
(v3.1.1; the former 15–45 Hz range classed every one of those organoids as in distress).
Intracellular Ca²⁺ is a second messenger: it is bound to no FCS pair.

### Parameter Bounds

The `set_parameter` tool validates all numeric inputs against a bounds registry to prevent injection of absurd values (negative percentages, Infinity, NaN). Bounds are defined per parameter path — see `src/engine/state.ts` for the complete registry.

---

## Testing

```bash
# Full suite
npm test

# Unit tests only
node --import tsx --test tests/astra.test.ts

# Integration tests only (Client SDK)
node --import tsx --test tests/integration.test.ts

# Targeted suites
npm run test:tcai          # TCAI/ACM
npm run test:np            # NeuroPlatform v2
npm run test:so            # second-order loop
npm run test:wm            # World Model
npm run test:sensors       # multimodal sensors
npm run test:transports    # HTTP + SSE transport layer
npm run test:fcs           # FCS layer
npm run test:annotations   # MCP tool annotations
npm run test:repro         # seeded reproducibility
npm run test:guard         # server-wide claim guard

# Static gates
npm run build              # tsc strict (Node16 ESM)
npm run lint               # ESLint 9 flat config
npm run golden:check       # TS↔NumPy active-inference golden (requires python3 + numpy)

# MCP Inspector
npm run inspect
```

> **Full suite: 354/354 passing** (230 engine/integration + 8 E2 model + 12 transport-layer + 86 FCS + 7 annotations + 6 reproducibility + 5 claim guard), 0 TypeScript errors
> (strict, Node16 ESM), 0 ESLint errors. Verified on Node 20 and Node 22 in CI.

## Development

```bash
npm run dev        # stdio (no build)
npm run dev:sse    # SSE on :9002
npm run dev:http   # HTTP on :9003
npm run watch      # TypeScript watch mode
```

## Environment Variables

| Variable | Default | Description |
|---|---|---|
| `ASTRA_LOG_LEVEL` | `info` | `debug`, `info`, `warn`, `error`, `silent` |
| `ASTRA_SSE_PORT` | `9002` | SSE transport port |
| `ASTRA_SSE_HOST` | `127.0.0.1` | SSE bind address |
| `ASTRA_HTTP_PORT` | `9003` | Streamable HTTP port |
| `ASTRA_HTTP_HOST` | `127.0.0.1` | Streamable HTTP bind address |
| `ASTRA_CORS_ORIGIN` | `*` | CORS allowed origin |
| `ASTRA_SEED` | `20260923` | Seed of the global PRNG (unsigned 32-bit). Same seed ⇒ same random streams; wall-clock-driven ticks still interleave differently — for bit-level replay keep the simulation loop stopped and drive it with `snn_step`. |

> **Bind address defaults to loopback.** Both HTTP transports bind `127.0.0.1` so a
> local server is not exposed to the network by default (the permissive CORS default
> would otherwise widen the attack surface). The Dockerfile and `docker-compose.yml`
> set `ASTRA_*_HOST=0.0.0.0` explicitly, since a container must accept traffic from
> outside its own namespace. Set it yourself for any non-container remote deployment —
> and set `ASTRA_CORS_ORIGIN` to a concrete origin when you do.

---

## Scaling Notes

The default 128-neuron configuration is designed for interactive demonstration. To scale toward the aspirational 256→512→256→128 (1 152 neurons) architecture:

1. Pass custom layers to `SNNEngine`: `new SNNEngine({ layers: [{ name: 'input', size: 256 }, ...] })`
2. Event-driven STDP scales as O(spikes × average fan-out), not O(N²)
3. Map-indexed adjacency lists provide O(1) weight lookup per synapse
4. Sparse storage keeps memory proportional to actual synapses (~18 KB at 128 neurons vs 64 KB dense)
5. Consider increasing `intervalMs` in the simulation loop for larger networks
6. For >10K neurons, a Rust/WASM or Lava SDK backend is recommended

---

## License

MIT — © 2026 Christophe Jean Legros, Geneva — applies to everything in this repository
**except** the directory below.

> **Third-party code under a different licence.** `python/the_consciousness_ai/` is vendored
> from [tlcdv/the_consciousness_ai](https://github.com/tlcdv/the_consciousness_ai) and remains
> under its own **Non-Commercial Open Source License** (see
> [`python/the_consciousness_ai/LICENSE.md`](python/the_consciousness_ai/LICENSE.md)):
> non-commercial use only, attribution to tlcdv required, no sublicensing. The MIT licence
> above does **not** extend to it. Nine files of `src/engine/tcai/` port parts of that
> project to TypeScript; pending a legal assessment they are treated **conservatively** as
> subject to its non-commercial terms. Details, file list and status:
> [`THIRD_PARTY_NOTICES.md`](THIRD_PARTY_NOTICES.md).

**Citing and reviewing.** Releases are archived on Zenodo. Cite the version you used:
v3.1.1 is [doi:10.5281/zenodo.23196960](https://doi.org/10.5281/zenodo.23196960); the
concept DOI [doi:10.5281/zenodo.23196959](https://doi.org/10.5281/zenodo.23196959) covers
all versions and resolves to the latest. Metadata: [`CITATION.cff`](CITATION.cff). External review is invited through
[`REVIEW.md`](REVIEW.md); substrate-level predictions are drafted for preregistration in
[`PREREGISTRATION.md`](PREREGISTRATION.md).

**Assistance Multi IA** · [Assistant-Multi-IA@proton.me](mailto:Assistant-Multi-IA@proton.me)

## References

- [Model Context Protocol](https://modelcontextprotocol.io) · [Spec 2025-11-25](https://modelcontextprotocol.io/specification/2025-11-25)
- [MCP TypeScript SDK](https://github.com/modelcontextprotocol/typescript-sdk)
- [FinalSpark](https://finalspark.com) · [Cortical Labs](https://corticallabs.com) · [Koniku](https://koniku.com)
- [Intel Lava / Loihi 2](https://lava-nc.org)
- Gerstner & Kistler (2002) "Spiking Neuron Models"
- Tononi (2004) "An information integration theory of consciousness" — *BMC Neuroscience*
- Baars (1988) "A Cognitive Theory of Consciousness" — Cambridge University Press
- Mehrabian (1996) "Pleasure-Arousal-Dominance: A General Framework" — *Current Psychology*
