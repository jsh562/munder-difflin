import { existsSync, readdirSync, readFileSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { estimateCostUsd, normalizeModel } from './pricing';

/** Resolve the Claude Code transcript directory for a given working directory.
 *  Claude Code stores per-project transcripts under ~/.claude/projects, keying
 *  each project by its absolute cwd with the leading slash dropped and every
 *  remaining slash turned into a dash (e.g. /Users/me/app → Users-me-app). */
export function projectDir(cwd: string): string {
  return path.join(os.homedir(), '.claude/projects', cwd.replace(/^\//, '').replaceAll('/', '-'));
}

export interface AgentUsage {
  inputTokens: number;
  outputTokens: number;
  cacheReadTokens: number;
  cacheWriteTokens: number;
  estimatedCostUsd: number;
  /** The most-recently-seen model id (normalized, e.g. `claude-opus-4-8`), or
   *  undefined if no priced record was found. Lets the UI label the row. */
  model?: string;
}

function zero(): AgentUsage {
  return { inputTokens: 0, outputTokens: 0, cacheReadTokens: 0, cacheWriteTokens: 0, estimatedCostUsd: 0 };
}

export interface ReadUsageOptions {
  /** When set, only transcripts whose records carry this `sessionId` are summed.
   *  This is how the co-located-agents double-count (bug #2) is avoided: two
   *  agents sharing a cwd each filter to their own session instead of summing
   *  every `.jsonl` under the shared project dir. When unset, all are summed
   *  (the legacy behavior, used when the agent's session id isn't yet known). */
  sessionId?: string;
}

/** Sum real token usage across Claude Code transcripts for `cwd`, pricing each
 *  assistant record by ITS OWN model (fixes cost bug #1 — no more Sonnet for
 *  everyone) via the fallback price table. Optionally filtered to one session
 *  (fixes bug #2). Resilient by design: any unreadable file or malformed line is
 *  skipped, and any unexpected failure yields a zeroed result rather than
 *  throwing into the IPC handler. This is the OFFLINE reconciler / fallback —
 *  the live source is the OTel collector (`telemetry.ts`). */
export function readAgentUsage(cwd: string, opts: ReadUsageOptions = {}): AgentUsage {
  const usage = zero();
  try {
    const dir = projectDir(cwd);
    if (!existsSync(dir)) return usage;
    const files = readdirSync(dir).filter((f) => f.endsWith('.jsonl'));
    let lastModel: string | undefined;
    for (const file of files) {
      try {
        const text = readFileSync(path.join(dir, file), 'utf8');
        for (const line of text.split('\n')) {
          const trimmed = line.trim();
          if (!trimmed) continue;
          let rec: {
            type?: unknown;
            sessionId?: unknown;
            message?: { model?: unknown; usage?: Record<string, unknown> };
          };
          try {
            rec = JSON.parse(trimmed);
          } catch {
            continue;
          }
          if (rec.type !== 'assistant') continue;
          // Session filter: skip records that aren't this agent's session.
          if (opts.sessionId && rec.sessionId !== opts.sessionId) continue;
          const u = rec.message?.usage;
          if (!u) continue;
          const model = typeof rec.message?.model === 'string' ? normalizeModel(rec.message.model) : undefined;
          if (model) lastModel = model;
          const rIn = num(u.input_tokens);
          const rOut = num(u.output_tokens);
          const rCacheWrite = num(u.cache_creation_input_tokens);
          const rCacheRead = num(u.cache_read_input_tokens);
          usage.inputTokens += rIn;
          usage.outputTokens += rOut;
          usage.cacheWriteTokens += rCacheWrite;
          usage.cacheReadTokens += rCacheRead;
          // Price THIS record by its own model, then accumulate — so a mixed-model
          // agent (rare) is still costed correctly rather than at one flat rate.
          usage.estimatedCostUsd += estimateCostUsd(model, {
            inputTokens: rIn,
            outputTokens: rOut,
            cacheReadTokens: rCacheRead,
            cacheWriteTokens: rCacheWrite
          });
        }
      } catch {
        // Skip this file; keep accumulating across the rest.
      }
    }
    if (lastModel) usage.model = lastModel;
    return usage;
  } catch {
    return zero();
  }
}

function num(v: unknown): number {
  return typeof v === 'number' && Number.isFinite(v) ? v : 0;
}
