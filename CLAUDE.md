# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

> Project context for Claude Code. Read this fully before making changes. Keep edits to this file in sync with the codebase.

## What Moltiquet is

Moltiquet is an open-source desktop application: a fast, modern **reader for Markdown documents** — think "Adobe Reader, but for `.md` files." It is built with Electron and ships cross-platform (Windows, macOS, Linux).

The name is invented and unique; treat it as a brand. Sub-product naming convention for later phases: `Moltiquet Desktop`, `Moltiquet Convert`, `Moltiquet AI`, etc.

### Mission

Make Markdown a first-class format for reading technical documentation and AI-generated documents, with a user experience as polished and frictionless as a native PDF reader — while staying fully open and editable.

### Vision (long-term, NOT this milestone)

Grow from a reader into an ecosystem for documentation and AI: document converters (PDF/Word/PowerPoint/OCR → Markdown), local RAG and semantic search with configurable AI providers, and a third-party plugin system. **None of that is in scope for MVP 1.** It is recorded here only so architectural decisions don't paint us into a corner.

## License

MIT. Keep it permissive and contribution-friendly. Every new source file does not need a license header, but do not introduce dependencies with copyleft licenses (GPL/AGPL) that would conflict with MIT distribution.

---

## MVP 1 scope — build ONLY this

MVP 1 is a **read-only Markdown viewer**. The goal is a genuinely pleasant reading experience shipped quickly.

In scope:

- Open `.md` / `.markdown` files via a file dialog **and** via OS file association (double-click a `.md` file → opens in Moltiquet).
- Render Markdown to a clean, readable view (GitHub-flavored Markdown: tables, task lists, strikethrough).
- Render Mermaid diagrams from fenced code blocks.
- Render math with KaTeX.
- Syntax highlighting for fenced code blocks.
- Auto-generated, clickable table of contents from headings.
- In-document find (search current file, highlight matches, jump between them).
- Tabs (open multiple files at once).
- Light and dark themes, plus persisted user preference (theme, recent files).

Explicitly OUT of scope for MVP 1 (do not build, even if asked offhandedly — flag it instead):

- Any export (PDF, HTML).
- Any converter (PDF→MD, Word→MD, OCR, etc.).
- Any AI feature (chat, summaries, RAG, embeddings, provider config).
- Plugin system, CLI, SDK.
- Editing Markdown (this is a reader, not an editor).
- Code signing / notarization (will come later; unsigned builds are fine for now).

If a request implies one of these, build the MVP-appropriate seam for it but stop short of the feature, and say so.

---

## Tech stack

Scaffolded with `@quick-start/electron` (the `electron-vite` starter). Core stack:

- **Electron** + **electron-vite** (three-process build: main, preload, renderer).
- **React 19** + **TypeScript** (strict).
- **Tailwind CSS v4** + **shadcn/ui** — already configured (see setup notes below).
- **Zustand** for renderer app state (open tabs, active file, theme).
- **pnpm** as the package manager (v11+; see gotcha below).
- **Vitest** + **@testing-library/react** for tests.
- **electron-builder** for packaging, **electron-updater** wired for future GitHub-Releases auto-update.
- **ESLint** + **Prettier** (configs come from `@electron-toolkit/*`).

### Tailwind + shadcn setup (already configured)

- `@tailwindcss/vite` plugin is wired into the renderer in `electron.vite.config.ts`.
- `@` alias resolves to `src/renderer/src` in both `electron.vite.config.ts` and `tsconfig.web.json`.
- `src/renderer/src/styles/globals.css` — Tailwind v4 import + shadcn zinc/new-york CSS variables (imported first in `main.tsx`).
- `src/renderer/src/lib/utils.ts` — `cn()` helper (clsx + tailwind-merge).
- `components.json` at repo root — shadcn config pointing at `src/renderer/src`.
- `.mcp.json` at repo root — registers the shadcn MCP server for component discovery inside Claude Code.
- Add components with: `pnpm dlx shadcn@latest add <component>` — they land in `src/renderer/src/components/ui`.

### Markdown rendering packages

- `react-markdown` — render Markdown as React components.
- `remark-gfm` — GitHub-flavored Markdown.
- `remark-math` + `rehype-katex` + `katex` — math rendering. Remember to import KaTeX CSS.
- `rehype-highlight` — code syntax highlighting (highlight.js). (Shiki via `rehype-pretty-code` is the planned upgrade path; do not introduce it in MVP 1 unless highlight quality becomes a blocker.)
- `rehype-slug` — stable `id`s on headings (required for TOC anchor links).
- `mermaid` — diagrams. Render via a custom React component that intercepts fenced ` ```mermaid ` blocks and calls `mermaid.render` on the client; do NOT pipe Mermaid through a rehype plugin.

Sanitization: if raw HTML inside Markdown is ever enabled, it MUST be sanitized (`rehype-sanitize`). For MVP 1, prefer NOT allowing raw HTML.

---

## Architecture

Electron splits the app into three processes. Respect the boundaries — most bugs and all security holes come from crossing them.

```
 Main process  ──IPC──  Preload (bridge)  ──exposed API──  Renderer (UI)
 Node.js + OS            contextBridge                     React, sandboxed
```

- **Main** (`src/main`): the only process with Node.js / OS access. Owns the app lifecycle, creates windows, reads files from disk, registers file associations, persists config. One per app.
- **Preload** (`src/preload`): the secure bridge. Uses `contextBridge.exposeInMainWorld` to expose a small, **typed** API to the renderer. Never expose raw `ipcRenderer` or Node modules.
- **Renderer** (`src/renderer`): a normal Vite + React app, sandboxed. No direct Node access. Talks to main only through the preload API.

### Security rules (non-negotiable)

- `contextIsolation: true`, `nodeIntegration: false`, `sandbox: true` on every `BrowserWindow`. Never weaken these "to make something easier."
- All privileged work (reading a file, opening a dialog) happens in main and is requested from the renderer via IPC.
- IPC uses the request/response pattern: `ipcRenderer.invoke` ↔ `ipcMain.handle`. Reserve `send`/`on` for genuine fire-and-forget events (e.g. "file opened via double-click" pushed from main).

### Main-process organization: service providers

The main process is organized as a small set of **single-responsibility provider classes** registered in a central container (inspired by Zettlr's architecture). This is what keeps later phases (converters, AI) pluggable without rewrites.

- `ConfigProvider` — read/write persisted settings (theme, recent files).
- `WindowProvider` — create and manage `BrowserWindow`s.
- `FileProvider` — read Markdown files from disk, resolve relative asset paths.
- `FileAssociationProvider` — handle `open-file` (macOS) and `argv`-based file opens (Windows/Linux).

For later phases, new capabilities arrive as new providers behind an interface (e.g. `AIProvider`, `ConverterProvider`) registered in the same container. **Do not** add those interfaces yet — just keep the container pattern clean so they slot in later.

### The IPC contract is shared and typed

Main and renderer must agree on the shape of every IPC call. Define those types once in `shared/` and import them on both sides. The preload `index.d.ts` types `window.api` from the same contract. A new IPC channel is added in three coordinated places: the shared type, the main `handle`, and the preload-exposed method.

### Keep logic out of Electron

Push all real logic into **pure, framework-free modules** that can be imported and tested without spinning up Electron or a DOM:

- TOC extraction from headings → pure function.
- In-document search (find matches, ranges) → pure function.
- Any Markdown pre/post-processing → pure function.

Electron- and React-specific code should be a thin shell around these. This is the single most important rule for testability.

---

## Folder structure

```
moltiquet/
├── src/
│   ├── main/
│   │   ├── index.ts                  # app lifecycle, bootstraps the container
│   │   ├── service-container.ts      # registers + resolves providers
│   │   ├── providers/
│   │   │   ├── config-provider.ts
│   │   │   ├── window-provider.ts
│   │   │   ├── file-provider.ts
│   │   │   └── file-association-provider.ts
│   │   ├── ipc/
│   │   │   └── handlers.ts           # ipcMain.handle registrations
│   │   └── lib/                      # pure, testable helpers
│   ├── preload/
│   │   ├── index.ts                  # contextBridge.exposeInMainWorld('api', …)
│   │   └── index.d.ts                # types for window.api
│   └── renderer/
│       ├── index.html
│       └── src/
│           ├── main.tsx
│           ├── App.tsx
│           ├── components/
│           │   ├── ui/               # shadcn/ui components (generated via shadcn add)
│           │   ├── MarkdownView.tsx
│           │   ├── MermaidBlock.tsx
│           │   ├── TableOfContents.tsx
│           │   ├── SearchBar.tsx
│           │   └── TabBar.tsx
│           ├── lib/
│           │   ├── utils.ts          # cn() helper — already present
│           │   ├── markdown.tsx      # react-markdown config (plugins, components)
│           │   ├── toc.ts            # heading extraction (PURE — unit tested)
│           │   └── search.ts         # in-document search (PURE — unit tested)
│           ├── store/                # zustand stores (tabs, theme)
│           ├── hooks/
│           └── styles/
│               └── globals.css       # Tailwind v4 + shadcn CSS variables — already present
├── shared/
│   └── ipc.ts                        # IPC contract types (main <-> renderer)
├── tests/                            # cross-cutting tests (or colocate *.test.ts)
├── electron.vite.config.ts
├── vitest.config.ts
├── electron-builder.yml
├── components.json                   # shadcn config — already present
├── .mcp.json                         # shadcn MCP server for Claude Code — already present
├── pnpm-workspace.yaml               # holds allowBuilds approval — already committed
├── CLAUDE.md
├── README.md
└── LICENSE
```

---

## Testing with Vitest

Philosophy: test the pure logic exhaustively, test components at the seams, and don't try to test Electron itself.

Layers:

1. **Pure unit tests (most of the suite).** `toc.ts`, `search.ts`, and any Markdown transforms are plain functions — test them directly with fast, DOM-free Vitest tests. Aim for high coverage here; this is where the real logic lives.
2. **Renderer component tests.** Use `@testing-library/react` in a `jsdom` (or `happy-dom`) environment. Mock the preload bridge by stubbing `window.api` so components can be tested without a real main process.
3. **Provider logic tests.** Test the _logic_ inside providers by extracting it into pure helpers in `main/lib` and testing those. Do NOT boot Electron to test a handler.
4. **E2E (Playwright) — out of scope for MVP 1.**

Setup expectations:

- A dedicated `vitest.config.ts` that mirrors the renderer's `@/*` alias and uses the React plugin, with `environment: 'jsdom'` for component tests.
- `@vitest/coverage-v8` for coverage.
- Co-locate small unit tests as `*.test.ts` next to the code; put broader tests in `tests/`.
- Write tests alongside features in the same change. A feature PR without tests for its pure logic is incomplete.

---

## Commands

```bash
pnpm dev            # run the app in development with hot reload
pnpm build          # type-check + build all three processes
pnpm typecheck      # type-check only (no build) — useful in CI
pnpm test           # run vitest
pnpm test:coverage  # run vitest with coverage
pnpm lint           # eslint
pnpm format         # prettier
pnpm build:mac      # package for macOS via electron-builder
pnpm build:win      # package for Windows
pnpm build:linux    # package for Linux
```

---

## Conventions

- TypeScript strict mode; no `any` without a written reason. Prefer explicit types on exported functions and IPC contracts.
- Name things clearly; prefer a slightly longer descriptive name over an abbreviation.
- Functional React components with hooks. Keep components focused; push logic into `lib/` and `store/`.
- Conventional Commits (`feat:`, `fix:`, `refactor:`, `test:`, `docs:`, `chore:`).
- This is an open-source project: write code a first-time contributor could read. Favor simple, working solutions over clever ones.

---

## Environment gotchas

- **pnpm 11 build approval.** `pnpm-workspace.yaml` already has `allowBuilds` for `electron`, `electron-winstaller`, and `esbuild` — commit this file so contributors get it automatically. If adding a new native dep, run `pnpm approve-builds` and commit the updated `pnpm-workspace.yaml`.
- **Stale `pnpm` field in `package.json`.** The `"pnpm": { "onlyBuiltDependencies": [...] }` field is ignored by pnpm 11 — it has been removed. Do not re-add it.
- **DevTools on macOS:** `⌘ + ⌥ + I` (there is no F12 on the MacBook Pro layout by default).
- **macOS file-open semantics:** file associations arrive via the `open-file` app event, not `argv`. Windows/Linux pass the path in `process.argv`. `FileAssociationProvider` must handle both, including the cold-start case (app launched _by_ opening a file) and the already-running case.
