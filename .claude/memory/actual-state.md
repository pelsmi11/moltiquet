# Actual state of the project

> Last touched after the MVP1 search/highlight + security hardening work.
> Read this when starting any new session — the plan in `/CLAUDE.md` is
> aspirational, this file is **what is on disk**.

## What exists vs the plan

The original `CLAUDE.md` (top-level) describes an aspirational folder layout
with a `service-container.ts`, `WindowProvider`, `MermaidBlock.tsx`, math
support, etc. **None of those exist yet.** The real structure is simpler and
incomplete in a few specific places.

### Not implemented (explicit gaps in MVP1)

- **`MermaidBlock.tsx`** — does not exist. `mermaid` not in `package.json`.
- **Math / KaTeX** — `remark-math`, `rehype-katex`, `katex` not installed.
- **`service-container.ts`** — does not exist. Providers are instantiated
  inline in `src/main/index.ts`. `WindowProvider` does not exist.
- **`WindowProvider`** — does not exist. The `BrowserWindow` is created
  directly in `createWindow()` inside `src/main/index.ts`.
- **MDX/sidecar assets** — FileProvider reads `.md`/`.markdown` only.

### What does exist

- Open via dialog + file association (macOS `open-file`, Win/Linux `argv`).
- GFM (tables, task lists, strikethrough) via `remark-gfm`.
- Code syntax highlighting via `rehype-highlight` + `highlight.js`.
- Stable heading IDs via `rehype-slug` (powers TOC anchors).
- Tabs (multi-file) via Zustand store.
- Light/dark theme, persisted via `ConfigProvider` to `userData/config.json`.
- Document search — see `architecture.md`.
- Resizable TOC panel via `react-resizable-panels`.
- i18n (en/es) — `i18next` + `react-i18next`, namespaces in `locales/{en,es}/*.json`.
- Single-instance lock on Windows/Linux with `second-instance` forwarding
  argv paths to the running instance.
- DevTools toggle via `View → Toggle Developer Tools` menu (`Cmd/Ctrl+Alt+I`).

## Security posture (as of now)

- `BrowserWindow`: `sandbox: true`, `contextIsolation: true`,
  `nodeIntegration: false` — explicit, do not weaken.
- Preload exposes ONLY `window.api` via `contextBridge`. `window.electron`
  is **not** exposed. `@electron-toolkit/preload` is not used.
- `setWindowOpenHandler` validates URL scheme (`http:` / `https:`) before
  `shell.openExternal` to avoid delegating `file:` / `javascript:` / etc.
- `will-navigate` on the webContents is prevented.
- `AppUserModelId` is `com.moltiquet.desktop` (was scaffold-default `com.electron`).

## Renderer organization

Feature-sliced under `src/renderer/src/features/`:

- `reader/` — MarkdownView, ReaderView, SearchBar, hooks, search/highlight libs.
- `tabs/` — TabBar + Zustand store lives at `src/renderer/src/store/tabs.ts`.
- `toc/` — TableOfContents + heading extractor.
- `toolbar/` — Toolbar (open, file name, search button, theme toggle).
- `settings/` — essentially empty; the only file is the languages constant.
- `reader/utils/{constants,functions}/` and similar sibling folders per feature
  are scaffold placeholders with `.gitkeep` — **most are empty**, do not add
  new code there. Use the feature's `lib/` and `hooks/` instead.

Cross-cutting (not under `features/`):
- `src/renderer/src/store/tabs.ts` — Zustand tab store.
- `src/renderer/src/hooks/useActiveHeading.ts` — IntersectionObserver for TOC.
- `src/renderer/src/hooks/useHighlightTheme.ts` — swaps highlight.js theme.
- `src/renderer/src/lib/` — `cn()`, `i18n`, `i18n-resources.d.ts`.

## IPC channels (shared/ipc.ts is the source of truth)

Read on every `CLAUDE.md` edit — drift here breaks both sides.

- `settings:get-language` / `settings:set-language` (response: `string` or
  `SetLanguageResult`)
- `file:open-dialog` / `file:read` / `file:opened` (push)
- `theme:get` / `theme:set` / `theme:changed` (push)
- `tab:close` (push from main menu Cmd+W)
- `language:changed` (push)

**Removed**: `find:in-page`, `find:stop`, `found:in-page` — the document
search is now pure JS in the renderer, not Electron native `webContents.findInPage`.
Do not re-introduce the native one; it can't be scoped to the reader container.
