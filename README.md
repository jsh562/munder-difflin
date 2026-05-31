<div align="center">

<img src="./docs/logo.svg" alt="Munder Difflin Inc — Multi-Agent Harness" width="340">

# Munder Difflin

**Local multi-agent harness for [Claude Code](https://claude.com/claude-code).**
Autonomous agents that message, route, and remember — coordinated by a **GOD** orchestrator
you talk to, and visualized as avatars at work on a shared office floor.

<p>
  <em>Electron · React · TypeScript · Pixi.js · xterm.js · node-pty</em>
</p>

<p>
  <a href="./LICENSE"><img alt="License: MIT" src="https://img.shields.io/badge/license-MIT-F4D35E.svg?style=flat-square&labelColor=6E1423"></a>
  <img alt="Status: prototype" src="https://img.shields.io/badge/status-working%20prototype-F4F1EA.svg?style=flat-square&labelColor=6E1423">
  <img alt="Platform: macOS" src="https://img.shields.io/badge/platform-macOS-F4F1EA.svg?style=flat-square&labelColor=6E1423">
  <a href="./CONTRIBUTING.md"><img alt="PRs welcome" src="https://img.shields.io/badge/PRs-welcome-F4D35E.svg?style=flat-square&labelColor=6E1423"></a>
</p>

</div>

---

> [!NOTE]
> **The world's best agents. The world's worst paper company.**
> Munder Difflin takes the `claude` CLI sessions you already run in your terminal and turns them
> into a self-coordinating team: each agent gets long-term memory, a mailbox, and a desk on a 2D
> office floor — and a **GOD orchestrator agent** routes work between them while you watch.

## What it is

Munder Difflin is a desktop app that wraps **real Claude Code terminals** as fully-capable agents,
wires them into a **hive mind**, and puts a **GOD orchestration agent** in charge — the one agent
*you* talk to in order to get things done. Under the hood it runs the **fastest memory layer in the
world** so every agent remembers what it learns and recalls it instantly.

- **Every terminal is an agent.** Each `claude` session runs as a real process in a pseudo-terminal
  (`node-pty`), byte-for-byte authentic, rendered with xterm.js.
- **Every agent is an avatar.** Sessions appear as characters on a Pixi.js office floor — they walk
  to stations as they work, and envelopes fly desk-to-desk when they message each other.
- **The hive coordinates them.** Agents read their memory and drain a mailbox; the router moves
  messages between inboxes; the GOD agent adjudicates, assigns, and escalates only when it needs you.
- **Memory that's instant.** A markdown-first memory layer with a semantic recall index means agents
  remember across sessions and recall in milliseconds.

## How it works

```
            you ── talk to ──►  ┌─────────────┐
                                │  GOD agent  │  orchestrator / supervisor
                                │ (Michael's  │  roster · routing · adjudication
                                │   office)   │  blackboard · task ledger
                                └──────┬──────┘
                                       │ assigns · routes · escalates
              ┌────────────────────────┼────────────────────────┐
              ▼                         ▼                         ▼
        ┌───────────┐            ┌───────────┐            ┌───────────┐
        │  agent A  │  message   │  agent B  │  message   │  agent C  │
        │  claude   │ ─────────► │  claude   │ ─────────► │  claude   │
        │  + memory │            │  + memory │            │  + memory │
        └───────────┘            └───────────┘            └───────────┘
              └──────── shared hive: memory · mailbox · blackboard · log ───────┘
```

1. **You spawn agents** — each is a normal `claude` process with its own working directory,
   identity, and hook lifecycle.
2. **Agents collaborate through the hive** — a local git repo of plain files. They write to their own
   `outbox/`; the harness's router delivers into recipients' `inbox/`. No agent ever touches git
   (single-committer design avoids `index.lock` corruption).
3. **The GOD agent runs the floor** — it reads every request, resolves routine ones itself (keeping
   the system fully autonomous), and only escalates *critical* items (spend, destructive ops, scope
   changes) into an approvals queue you act on.
4. **Everything is visible** — you watch avatars move, envelopes fly, and the live terminal stream;
   you can type back into any session, browse its files, and read its git history.

See [`HIVE.md`](./HIVE.md) for the full multi-agent design, [`SPEC.md`](./SPEC.md) for the
terminal/event plane, and [`DESIGN.md`](./DESIGN.md) for the visual system.

## Features

| Area | What works today |
|---|---|
| **Real terminals** | Spawn any command (default: `claude`) in a `node-pty` PTY. Full read/write/resize/kill, live streaming over IPC, multi-agent. |
| **The hive** | On-disk multi-agent layer: per-agent identity + long-term memory, atomic-file mailboxes, a shared blackboard, append-only event log, single-committer git. |
| **GOD orchestrator** | An always-on supervisor agent that adjudicates traffic, routes tasks, scribes the blackboard, and escalates only critical items to you. |
| **Memory layer** | Markdown-first long-term memory per agent, mined into a shared semantic palace for instant recall; searchable from the UI. Degrades gracefully when the index isn't installed. |
| **Office floor** | Pixi.js scene with a Tiled office map, camera, recolored cast, pathfinding, seat assignment, and tool-bubble overlays. |
| **Message handoffs** | When the hive routes a message, an envelope flies from sender to recipient (tinted by speech-act; escalations fly to the door) and pops an arrival sparkle. |
| **Per-agent panel** | Live terminal, command bar to type back, fullscreen terminal, sandboxed file browser + CodeMirror editor, and a git tab (status, log, commit graph, branches). |
| **Approvals & memory panels** | Human-in-the-loop approval queue for escalations; a memory search panel over the shared palace. |
| **Onboarding wizard** | First-run setup: harness home, registered repos, default command, auto-mode. |
| **Design system** | Fully tokenized SNES / Animal-Crossing aesthetic — pixel panels, buttons, badges, hand-drawn icons. See [`DESIGN.md`](./DESIGN.md). |

> [!IMPORTANT]
> **Status: working prototype.** The Electron shell, office floor, real PTY terminals, the hive
> (memory/mailbox/router/GOD agent), and the file/git tooling are functional. Wiring avatar movement
> fully to real Claude Code tool events is the headline next milestone (today it falls back to a
> synthetic event loop where hooks aren't attached).

## Getting started

### Prerequisites

- **macOS** (macOS-first; Windows/Linux untested).
- **Node.js 18+** and npm.
- A **C/C++ toolchain** for `node-pty`'s native addon — on macOS, install Xcode Command Line Tools:
  ```bash
  xcode-select --install
  ```
- **[Claude Code](https://claude.com/claude-code)** on your `PATH` so agents can run `claude`
  (the default command). Any other command works too.
- *Optional:* the semantic memory index for instant cross-session recall (the app works without it —
  markdown memory still functions).

### Install & run

```bash
git clone https://github.com/chaitanyagiri/munder-difflin.git
cd munder-difflin
npm install        # postinstall rebuilds node-pty against Electron's ABI
npm run dev        # launches the Electron app with hot reload
```

On first launch you'll go through the onboarding wizard, then land on the floor. Use **Add agent** to
spawn your first session — the GOD agent seats itself in Michael's office automatically.

### Other scripts

```bash
npm run build      # production build via electron-vite
npm run preview    # preview the production build
npm run typecheck  # type-check the node (main/preload) and web (renderer) projects
```

> If `node-pty` fails to load after an Electron upgrade, re-run `npm install` (the `postinstall` hook
> runs `electron-rebuild` against the current Electron ABI).

## Architecture

Two data planes feed one renderer:

```
┌───────────────────────────────────────────────────────────────┐
│                     Electron Renderer (React)                  │
│   ┌──────────────────┐    ┌──────────────────────────────┐    │
│   │ Office Floor      │    │ Terminal + Command Bar       │    │
│   │ (Pixi.js)        │    │ Files + Git tabs (xterm.js)  │    │
│   └─────────▲────────┘    └────────────▲─────────────────┘    │
│             │ avatar state             │ pty bytes / fs / git  │
└─────────────┼──────────────────────────┼───────────────────────┘
              │ IPC (contextBridge: window.cth)
       ┌──────┴──────────┐        ┌──────┴─────────────┐
       │  Event Plane    │        │  Terminal Plane    │
       │  hooks / hive   │        │  node-pty PTYs     │
       │  router + GOD   │        │  + fs + git        │
       └────────▲────────┘        └──────▲─────────────┘
                │ hook payloads          │ stdin / stdout
                └─────────┬──────────────┘
                   ┌──────┴──────────────┐
                   │  claude (or any cmd)│
                   └─────────────────────┘
```

- **Terminal plane.** The main process owns a `PtyManager` that spawns each agent as a `node-pty`
  process and streams output over per-id IPC (`pty:data:<id>`). The renderer talks only through a
  typed `window.cth` bridge ([`src/preload/index.ts`](./src/preload/index.ts)), which also exposes
  sandboxed filesystem and git helpers.
- **Hive / event plane.** `hive.ts` is the on-disk multi-agent layer; `hooks.ts` runs a Unix-socket
  server that the per-agent `cth-hook` shim POSTs Claude Code hook payloads to (`PreToolUse`,
  `PostToolUse`, `Stop`, …); `memory.ts` wraps the semantic memory CLI. The router delivers messages,
  the GOD agent adjudicates, and a `Stop`-loop keeps idle agents draining their inboxes.

## Project structure

```
src/
  main/                      Electron main process (Node)
    index.ts                 window, IPC handlers, quit guard
    pty.ts                   node-pty manager (spawn/write/resize/kill/stream)
    hive.ts                  on-disk multi-agent layer (memory, mailboxes, router)
    hooks.ts                 UDS hook server + cth-hook shim + Stop-loop
    memory.ts                semantic memory layer (CLI wrapper, degrade-to-noop)
    config.ts                harness config persistence + home setup
    fs.ts / git.ts           sandboxed filesystem + git bridges
  preload/                   contextBridge → typed window.cth API
  renderer/src/
    App.tsx                  top-level layout + wiring
    design/                  tokens.css / tokens.ts / global.css (design source of truth)
    components/              PixelPanel, AgentDetailPanel, CommandBar, ApprovalsPanel, MemoryPanel, …
    scene/office/            Pixi office floor: OfficeFloor, Character, Camera, cast, pathfinding, …
    store/ · hooks/          zustand store, event loop, PTY parser, typewriter
    assets/                  tilesets, maps, character sheets (see ATTRIBUTION.md)
docs/                        logo, banner, and the landing page (GitHub Pages → munderdiffl.in)
docs/media/                  landing-page posters + rendered Remotion clips
landing-remotion/            Remotion project that renders the landing page's "how it works" clips
HIVE.md · SPEC.md · DESIGN.md   multi-agent · terminal/event · visual design
```

## Design system

The aesthetic is **Animal Crossing × Earthbound × SNES menu UI** — pixel-snapped, chunky, friendly.
[`DESIGN.md`](./DESIGN.md) is canonical; every component derives from its tokens. The Munder Difflin
brand layers a **Dunder-Mifflin maroon** (`#6E1423`) and **gold** (`#F4D35E`) on top for logo and
chrome. The 15 avatars are the cast of *The Office*, differentiated by hair/skin/shirt recipes.

## Roadmap

- [ ] **Full real event plane** — every avatar move driven by Claude Code hook events.
- [ ] **Add-agent flow** — command picker + per-project hook-install consent.
- [ ] **Config drawer** — per-agent goal, model, permission mode, skills, MCP.
- [ ] **Memory reflection** — summarize/bound per-agent `memory.md` over time.
- [ ] **Persistence** — durable agents/layout/command history (SQLite).
- [ ] **Packaging** — signed `.dmg`; revisit Linux/Windows later.

## Contributing

Contributions are welcome — this is an early prototype with a lot of surface area. Start with
[`CONTRIBUTING.md`](./CONTRIBUTING.md). The short version: fork, `npm install && npm run dev`, keep
`npm run typecheck` green, and **derive any new UI from [`DESIGN.md`](./DESIGN.md) tokens**. Good
first areas: wiring real hook events, the add-agent flow, the config drawer, and cross-platform work.

## License

> [!IMPORTANT]
> **Asset licensing.** The bundled pixel art (tilesets, maps, and the base character sheets the
> Office cast is recolored from) comes from [LimeZu](https://limezu.itch.io/) via
> [`shahar061/the-office`](https://github.com/shahar061/the-office) under the **LimeZu FREE VERSION
> license — non-commercial use only**. The recolored sprites inherit that restriction. See
> [`src/renderer/src/assets/ATTRIBUTION.md`](./src/renderer/src/assets/ATTRIBUTION.md). **To
> commercialize, replace these assets or obtain a paid LimeZu license.**

The **source code** is licensed under the **MIT License** — see [`LICENSE`](./LICENSE). The MIT grant
covers the code only; the non-commercial asset restriction above is carved out in the `LICENSE` scope
note. *Munder Difflin* is an affectionate parody and is not affiliated with NBC's *The Office* or
Dunder Mifflin.

## Acknowledgements

- [LimeZu](https://limezu.itch.io/) — pixel-art tilesets and character base sheets.
- [`shahar061/the-office`](https://github.com/shahar061/the-office) — office tileset/map vendoring.
- [Pixi.js](https://pixijs.com/) · [xterm.js](https://xtermjs.org/) · [node-pty](https://github.com/microsoft/node-pty) · [electron-vite](https://electron-vite.org/) · [CodeMirror](https://codemirror.net/) — the libraries this is built on.
- [Remotion](https://www.remotion.dev/) — the landing page's animated "how it works" clips (`landing-remotion/`).
- *The Office* (US) — for Munder Difflin, Inc.
