import { spawn } from 'node:child_process';
import { existsSync } from 'node:fs';
import { resolveCommand, userShellPath } from './shellEnv';

/**
 * Michael's silent prep assistant.
 *
 * Runs a one-shot, headless `claude -p` session (Sonnet, 1M context) that NEVER
 * appears on the office floor or in the agent list. Given a short, possibly
 * vague instruction the user parked for Michael, it locates the relevant project
 * directory (it starts in Michael's home and can read every registered repo),
 * gathers concrete context read-only, and rewrites the instruction into a
 * single self-contained prompt Michael can execute autonomously.
 *
 * The result text replaces the queued message, so the existing queue→PTY flush
 * delivers the enriched prompt to Michael with no extra plumbing.
 */

/** Sonnet with the 1M-token context window — chosen for cheap, large-context
 *  context-gathering that won't compete with Michael's own (Opus) session. */
const ASSISTANT_MODEL = 'claude-sonnet-4-6[1m]';

const DEFAULT_TIMEOUT_MS = 180_000;

export interface EnrichRequest {
  /** The raw instruction the user wants enriched. */
  message: string;
  /** Michael's working directory — the assistant's default cwd. */
  cwd: string;
  /** Registered project repos the assistant may read to gather context. */
  repos?: string[];
  /** Base claude command from config (only its binary name is used). */
  command?: string;
  /** Model override; defaults to Sonnet 1M. */
  model?: string;
  /** Hard cap so a runaway run can't wedge the queue. */
  timeoutMs?: number;
  /** Extra env merged over the resolved shell env (e.g. the shared MemPalace). */
  env?: Record<string, string>;
}

export interface EnrichResult {
  ok: boolean;
  /** The enriched, self-contained prompt for Michael. */
  prompt?: string;
  error?: string;
}

function buildTaskPrompt(message: string, cwd: string, repos: string[]): string {
  const repoList = repos.length
    ? repos.map((r) => `  - ${r}`).join('\n')
    : '  (none registered — work from the home directory above)';
  return [
    "You are Michael's silent prep assistant inside the Munder Difflin agent harness.",
    'Michael is the orchestrator who will act on the prompt you produce — autonomously, with no human in the loop.',
    'You are NOT visible to the user and you do NOT perform the task yourself. Your only job is to turn a short,',
    'possibly vague instruction into a single, self-contained, context-rich prompt that Michael can execute immediately.',
    '',
    `Your working directory is Michael's home: ${cwd}`,
    'Project repositories you may read to gather context (cd into the relevant one):',
    repoList,
    '',
    'Do this:',
    '1. Decide which project/directory this instruction concerns and cd into the most relevant repo',
    '   (or stay in the home directory if it is a hive/coordination task).',
    '2. Explore READ-ONLY to gather the concrete context Michael needs: exact file paths, current state,',
    '   relevant code, conventions, the active branch, and any constraints or gotchas. NEVER modify, create,',
    '   or delete files, and never run destructive or write commands.',
    "3. Rewrite the instruction into ONE clear prompt for Michael. Preserve the user's original intent exactly —",
    '   do not invent new scope. State the target directory, the specific files/symbols involved, the concrete',
    '   goal, and anything you discovered that Michael should know before starting.',
    '',
    'Output ONLY the final prompt text for Michael. No preamble, no explanation, no markdown code fences,',
    'no "Here is the prompt". Just the prompt itself.',
    '',
    '--- ORIGINAL INSTRUCTION FROM THE USER ---',
    message
  ].join('\n');
}

/** Pull the final assistant text out of `claude -p --output-format json`. */
function parsePrompt(stdout: string): string | null {
  const raw = stdout.trim();
  if (!raw) return null;
  try {
    const obj = JSON.parse(raw) as { result?: unknown; text?: unknown };
    const text = typeof obj.result === 'string' ? obj.result
      : typeof obj.text === 'string' ? obj.text
      : null;
    if (text && text.trim()) return text.trim();
  } catch { /* not JSON — fall back to the raw stdout below */ }
  return raw;
}

export function enrichMessage(req: EnrichRequest): Promise<EnrichResult> {
  return new Promise((resolve) => {
    const message = (req.message ?? '').trim();
    if (!message) { resolve({ ok: false, error: 'empty message' }); return; }
    if (!req.cwd || !existsSync(req.cwd)) {
      resolve({ ok: false, error: `working directory does not exist: ${req.cwd}` });
      return;
    }

    const binary = (req.command || 'claude').trim().split(/\s+/)[0] || 'claude';
    const exe = resolveCommand(binary);
    const repos = (req.repos ?? []).filter((r) => r && existsSync(r) && r !== req.cwd);
    const taskPrompt = buildTaskPrompt(message, req.cwd, req.repos ?? []);

    // We build the flag set ourselves (rather than reusing config's command
    // string) so the assistant's behaviour is fixed regardless of the user's
    // autoMode / defaultCommand: headless print mode, Sonnet 1M, read-only.
    const args = [
      '-p', taskPrompt,
      '--model', req.model || ASSISTANT_MODEL,
      '--output-format', 'json',
      '--permission-mode', 'bypassPermissions',
      // Context gathering only — the assistant must never mutate a repo. These
      // are passed as separate args because the CLI flag is variadic (<tools...>).
      '--disallowedTools', 'Edit', 'Write', 'NotebookEdit'
    ];
    // --add-dir comes last so it terminates the variadic --disallowedTools list.
    for (const r of repos) { args.push('--add-dir', r); }

    let child;
    try {
      child = spawn(exe, args, {
        cwd: req.cwd,
        env: {
          ...process.env,
          PATH: userShellPath(),
          ...(req.env ?? {})
        } as Record<string, string>,
        stdio: ['ignore', 'pipe', 'pipe']
      });
    } catch (e) {
      resolve({ ok: false, error: e instanceof Error ? e.message : String(e) });
      return;
    }

    let stdout = '';
    let stderr = '';
    let settled = false;
    const finish = (r: EnrichResult) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      resolve(r);
    };

    const timer = setTimeout(() => {
      try { child.kill('SIGKILL'); } catch { /* noop */ }
      finish({ ok: false, error: 'enrichment timed out' });
    }, req.timeoutMs ?? DEFAULT_TIMEOUT_MS);

    child.stdout?.on('data', (d) => { stdout += d.toString(); });
    child.stderr?.on('data', (d) => { stderr += d.toString(); });
    child.on('error', (e) => finish({ ok: false, error: e.message }));
    child.on('close', (code) => {
      const prompt = parsePrompt(stdout);
      if (prompt) { finish({ ok: true, prompt }); return; }
      finish({ ok: false, error: stderr.trim() || `assistant exited ${code ?? '?'} with no output` });
    });
  });
}
