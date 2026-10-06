/**
 * ASTRA — Server-wide claim guard (v3.1.1)
 * ════════════════════════════════════════
 * Up to v3.1.0 only the `fcs_*`, `orch_*` and `ovo_*` families (20 of 70 tools)
 * passed their payloads through the linters. The other fifty — `get_acm_score`
 * among them — emitted unscreened text, so the server as a whole could make the
 * very moves the FCS negative heuristic forbids.
 *
 * `installLintGuard(server)` wraps `server.tool` and `server.resource` BEFORE
 * any registration, so that every text payload of every tool and resource
 * passes BOTH linters:
 *   · `lintClaim` — Block's access/phenomenal distinction (phenomenal-guard.ts)
 *   · `lintFcs`   — the five prohibitions of the FCS series (negative-heuristic.ts)
 *
 * A payload that fails is not emitted: the client receives a LINT_FAILED error
 * naming the tool and the findings, exactly as the FCS layer already did.
 *
 * Scope and limits, stated rather than implied: the linters are pattern
 * heuristics. They catch the formulations they encode, not every paraphrase;
 * they are a gate on ASTRA's own output, not a proof that no payload can carry
 * a forbidden claim. `fcs_lint` is exempt because echoing the screened string
 * back to the caller is its function.
 *
 * © 2026 Christophe Jean Legros — Geneva · Assistance Multi IA
 */

import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { lintClaim } from './engine/tcai/phenomenal-guard.js';
import { lintFcs, type FcsLintFinding } from './engine/fcs/negative-heuristic.js';

/** Tools whose function is to echo screened text back to the caller. */
export const LINT_EXEMPT_TOOLS: ReadonlySet<string> = new Set(['fcs_lint']);

export interface LintVerdict {
  admissible: boolean;
  claimPatterns: string[];
  fcsFindings: FcsLintFinding[];
}

/** Screen one string against both linters. */
export function screen(text: string): LintVerdict {
  const claimPatterns = lintClaim(text);
  const fcsFindings = lintFcs(text);
  return { admissible: claimPatterns.length === 0 && fcsFindings.length === 0, claimPatterns, fcsFindings };
}

interface TextItem { type: 'text'; text: string }
interface ToolResultLike { content?: unknown[]; isError?: boolean }
interface ResourceResultLike { contents?: Array<{ uri?: string; text?: unknown }> }

function isTextItem(x: unknown): x is TextItem {
  return typeof x === 'object' && x !== null
    && (x as { type?: unknown }).type === 'text'
    && typeof (x as { text?: unknown }).text === 'string';
}

function lintFailure(origin: string, v: LintVerdict): string {
  return JSON.stringify({
    error: 'LINT_FAILED',
    origin,
    claimPatterns: v.claimPatterns,
    fcsProhibitions: v.fcsFindings,
    note: 'The payload asserts something ASTRA is not permitted to assert (Block\'s access/phenomenal ' +
          'distinction; FCS prohibitions 1–5). Nothing was emitted.',
  }, null, 2);
}

/** Screen a tool result; returns it unchanged when admissible. */
export function guardToolResult<T>(toolName: string, result: T): T {
  if (LINT_EXEMPT_TOOLS.has(toolName)) return result;
  const r = result as unknown as ToolResultLike;
  if (!r || !Array.isArray(r.content)) return result;
  for (const item of r.content) {
    if (!isTextItem(item)) continue;
    const v = screen(item.text);
    if (!v.admissible) {
      return { content: [{ type: 'text', text: lintFailure(`tool:${toolName}`, v) }], isError: true } as unknown as T;
    }
  }
  return result;
}

/** Screen a resource result; a failing item is replaced by the failure report. */
export function guardResourceResult<T>(resourceName: string, result: T): T {
  const r = result as unknown as ResourceResultLike;
  if (!r || !Array.isArray(r.contents)) return result;
  const contents = r.contents.map((c) => {
    if (typeof c.text !== 'string') return c;
    const v = screen(c.text);
    return v.admissible ? c : { ...c, text: lintFailure(`resource:${resourceName}`, v) };
  });
  return { ...r, contents } as unknown as T;
}

type AnyFn = (...args: unknown[]) => unknown;

/**
 * Install the guard on a server instance. Must be called before the first
 * `server.tool` / `server.resource` registration.
 */
export function installLintGuard(server: McpServer): void {
  const target = server as unknown as { tool: AnyFn; resource: AnyFn };
  const originalTool = target.tool.bind(server) as AnyFn;
  const originalResource = target.resource.bind(server) as AnyFn;

  target.tool = (...args: unknown[]) => {
    const name = String(args[0]);
    const cb = args[args.length - 1];
    if (typeof cb === 'function') {
      args[args.length - 1] = async (...cbArgs: unknown[]) =>
        guardToolResult(name, await (cb as AnyFn)(...cbArgs));
    }
    return originalTool(...args);
  };

  target.resource = (...args: unknown[]) => {
    const name = String(args[0]);
    const cb = args[args.length - 1];
    if (typeof cb === 'function') {
      args[args.length - 1] = async (...cbArgs: unknown[]) =>
        guardResourceResult(name, await (cb as AnyFn)(...cbArgs));
    }
    return originalResource(...args);
  };
}
