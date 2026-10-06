/**
 * ASTRA — Server-wide claim guard (v3.1.1)
 * © 2026 Christophe Jean Legros — Geneva · Assistance Multi IA
 *
 * Every tool and resource payload passes lintClaim + lintFcs. These tests check
 * (1) that the guard blocks a forbidden claim from ANY tool, not only fcs_*;
 * (2) that fcs_lint, whose job is to echo screened text, is exempt;
 * (3) that ASTRA's own payloads — every tool callable without arguments, and
 *     every resource — pass the guard as shipped.
 */

import { describe, it, before, after } from 'node:test';
import assert from 'node:assert/strict';

import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { InMemoryTransport } from '@modelcontextprotocol/sdk/inMemory.js';
import { z } from 'zod';
import { createAstraServer } from '../src/server.js';
import { stopSimulation } from '../src/engine/simulation.js';
import { installLintGuard, guardToolResult, LINT_EXEMPT_TOOLS } from '../src/lint-guard.js';

type TextResult = { content: Array<{ type: string; text: string }>; isError?: boolean };

async function connect(server: McpServer): Promise<Client> {
  const client = new Client({ name: 'lint-guard-test', version: '1.0.0' });
  const [c, s] = InMemoryTransport.createLinkedPair();
  await Promise.all([server.connect(s), client.connect(c)]);
  return client;
}

describe('Server-wide claim guard — mechanism', () => {
  it('blocks a forbidden claim emitted by an arbitrary tool', async () => {
    const server = new McpServer({ name: 'guard-probe', version: '0.0.0' });
    installLintGuard(server);
    server.tool('probe', 'probe', {}, async () => ({
      content: [{ type: 'text' as const, text: '{"verdict":"ASTRA is conscious; consciousness level 0.9"}' }],
    }));
    server.tool('probe_args', 'probe with args', { x: z.number() }, async ({ x }) => ({
      content: [{ type: 'text' as const, text: `{"x": ${x}, "note": "plain telemetry"}` }],
    }));
    const client = await connect(server);

    const blocked = (await client.callTool({ name: 'probe', arguments: {} })) as TextResult;
    assert.equal(blocked.isError, true);
    const body = JSON.parse(blocked.content[0].text);
    assert.equal(body.error, 'LINT_FAILED');
    assert.equal(body.origin, 'tool:probe');

    const ok = (await client.callTool({ name: 'probe_args', arguments: { x: 3 } })) as TextResult;
    assert.ok(!ok.isError);
    assert.equal(JSON.parse(ok.content[0].text).x, 3, 'arguments still reach the wrapped handler');
  });

  it('fcs_lint is exempt: echoing the screened string is its function', () => {
    assert.ok(LINT_EXEMPT_TOOLS.has('fcs_lint'));
    const r = { content: [{ type: 'text', text: 'the degree of consciousness is 0.9' }] };
    assert.equal(guardToolResult('fcs_lint', r), r);
    assert.equal((guardToolResult('get_metrics', r) as TextResult).isError, true);
  });
});

describe('Server-wide claim guard — ASTRA payloads as shipped', () => {
  let client: Client;
  before(async () => { client = await connect(createAstraServer()); });
  after(() => stopSimulation());

  it('every tool callable without arguments clears the guard', async () => {
    const { tools } = await client.listTools();
    const callable = tools.filter((t) => !(t.inputSchema.required ?? []).length && t.name !== 'simulation_control');
    assert.ok(callable.length >= 30, `only ${callable.length} argument-free tools`);
    const blocked: string[] = [];
    for (const t of callable) {
      const r = (await client.callTool({ name: t.name, arguments: {} })) as TextResult;
      const text = r.content?.[0]?.text ?? '';
      if (text.includes('"LINT_FAILED"')) blocked.push(`${t.name}: ${text.slice(0, 300)}`);
    }
    assert.deepEqual(blocked, []);
  });

  it('every resource clears the guard', async () => {
    const { resources } = await client.listResources();
    assert.equal(resources.length, 15);
    for (const res of resources) {
      const r = await client.readResource({ uri: res.uri });
      for (const c of r.contents) {
        assert.ok(!String((c as { text?: string }).text ?? '').includes('"LINT_FAILED"'), `${res.uri} blocked`);
      }
    }
  });

  it('get_acm_score carries no consciousness class or label', async () => {
    const r = (await client.callTool({ name: 'get_acm_score', arguments: {} })) as TextResult;
    const d = JSON.parse(r.content[0].text);
    assert.ok(!('classLabel' in d) && !('decisionClass' in d));
    assert.match(d.aggregationStatus, /Not a degree of consciousness/);
  });
});
