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
- Tabs (multi-file) via Zustand store. Single merged top-bar row (tabs +
  actions in one 44px row, not two stacked rows). Tab overflow handled by real
  horizontal scroll (`overflow-x-auto`, fixed 138px tabs) plus a "show all
  tabs" search `Popover`; a `+` button next to the last tab opens another file.
  Active tab uses the warm `brand` accent token.
- Toolbar collapsed to a `⌘F` search hint (text, no button) + a single options
  `DropdownMenu` (open file, theme toggle). No file name / search / theme icons.
- Light/dark theme, persisted via `ConfigProvider` to `userData/config.json`.
- **Session restore** — open tab paths + active path persist to `config.json`
  (`session:get`/`session:set`); on launch tabs are re-read fresh from disk
  (missing files skipped) and the active tab reselected. Logic in
  `features/tabs/hooks/useSessionRestore.ts`.
- Document search — see `architecture.md`.
- Resizable TOC panel via `react-resizable-panels`; auto-collapses under 760px
  window width. `BrowserWindow` has `minWidth: 520`.
- shadcn `dropdown-menu.tsx` + `popover.tsx` added under `components/ui/`.
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

Feature-sliced under `src/renderer/src/features/`, **screen architecture**
(see `CLAUDE.md`): `App.tsx` is a thin `TooltipProvider` + `<ReaderScreen />`
shell — no state, effects, or composition. Everything else lives in a feature.

- `reader/` — `screen/ReaderScreen.tsx` (the composed app shell), MarkdownView,
  ReaderView, SearchBar, hooks, search/highlight libs.
- `tabs/` — TabBar; `hooks/useTabSync.ts` (file-open dialog + `onFileOpened`/
  `onTabClose` IPC), `hooks/useSessionRestore.ts`; Zustand store at
  `src/renderer/src/store/tabs.ts`.
- `toc/` — TableOfContents + heading extractor; `hooks/useTocPanel.ts`
  (collapse state, <760px auto-collapse, expand/collapse).
- `toolbar/` — Toolbar (search hint + options dropdown menu).
- `settings/` — essentially empty; the only file is the languages constant.
- `screen/`, `hooks/`, `services/`, `lib/` under a feature are now first-class
  homes for code (NOT off-limits scaffold anymore). Empty ones still hold
  `.gitkeep`; delete it when you add real code.

Cross-cutting (not under `features/`), in `src/renderer/src/hooks/`:
- `useActiveHeading.ts` — IntersectionObserver for TOC.
- `useHighlightTheme.ts` — swaps highlight.js theme.
- `useTheme.ts` — isDark state + load + `onThemeChanged` sync + toggle.
- `useLanguageSync.ts` — `onLanguageChanged` → i18next.
- `src/renderer/src/store/tabs.ts` — Zustand tab store.
- `src/renderer/src/lib/` — `cn()`, `i18n`, `i18n-resources.d.ts`.

## IPC channels (shared/ipc.ts is the source of truth)

Read on every `CLAUDE.md` edit — drift here breaks both sides.

- `settings:get-language` / `settings:set-language` (response: `string` or
  `SetLanguageResult`)
- `file:open-dialog` / `file:read` / `file:opened` (push)
- `theme:get` / `theme:set` / `theme:changed` (push)
- `tab:close` (push from main menu Cmd+W)
- `language:changed` (push)
- `session:get` / `session:set` (open tab paths + active path for restore;
  `SessionState = { openFiles: string[]; activeFile: string | null }`)

**Removed**: `find:in-page`, `find:stop`, `found:in-page` — the document
search is now pure JS in the renderer, not Electron native `webContents.findInPage`.
Do not re-introduce the native one; it can't be scoped to the reader container.
