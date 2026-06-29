# Architecture notes — non-obvious decisions

> Specific things that future Claude sessions would otherwise re-derive
> or get wrong. Read this before refactoring `useDocumentSearch` or
> `highlight.ts`.

## Document search — re-find inside the layout effect

**The bug**: `findMatches` returns references to `Text` nodes. If those
references are captured in a `useEffect` (which runs after paint) and then
a `useLayoutEffect` calls `clearHighlights` (which calls `parent.normalize()`
on the parent, merging adjacent text nodes), the captured `Text` objects
become stale — the original node is detached from the DOM or shorter than
expected. Calling `node.splitText(offset)` on a stale node throws
`IndexSizeError`.

**The rule**: `findMatches` must run in the **same** `useLayoutEffect` body
that calls `clearHighlights`, **after** clearing. This way the references
are always valid for the subsequent `splitAndWrap` calls.

The order inside the effect is non-negotiable:

```ts
useLayoutEffect(() => {
  clearHighlights(container)              // 1. drop old marks + normalize
  const fresh = findMatches(container, q) // 2. fresh refs, valid against clean DOM
  setMatches(fresh)                       // 3. update state
  if (fresh.length > 0) {
    highlightMatches(container, fresh)   // 4. uses refs from step 2
  }
}, [debounced, containerRef, content])
```

The `setState` in the effect is the one place the `react-hooks/set-state-in-effect`
lint is suppressed (with a comment). It's required because we read from
the DOM (external system) and the result drives UI state. Not derivable
during render.

A second `useLayoutEffect` handles `setActiveMatch` + `scrollToMatch` when
`activeIndex` changes — that one does NOT re-find matches, it only re-toggles
the active class on the existing marks.

## Highlighting — non-overlapping matches only

`findMatches` uses `String.prototype.matchAll` with the `g` flag, which
naturally returns **non-overlapping** matches. For input `"aaaa"` searching
`"aa"`, `matchAll` returns matches at offset 0 and 2 (not 0, 1, 2). This
avoids the offset-corruption problem you get with manual regex loops.

**Consequence**: searching for `"aa"` in `"aaaa"` highlights 2 marks, not 3.
This matches Chrome's find-in-page behavior on non-overlapping sets, and
keeps `splitAndWrap` simple. If you ever need overlapping matches, you'd
need to deduplicate by node reference at the highlight step (not at find
time) — but no user has asked for this.

## Document search re-runs on `content` change, not on tab switch

`useDocumentSearch(ref, content)` takes `content: string | null` as an
argument. When the active tab's `content` changes (e.g., file re-read,
different tab activated), the layout effect re-runs and re-highlights.
This is why the dep array includes `content` even though `content` doesn't
directly drive the search — it signals "the underlying DOM has changed."

The `containerRef` is stable across tabs (it points to the ReaderView's
scrolling `<div>`, which React keeps mounted while the tab store swaps the
content prop). So we don't need to re-find the ref — just react to the
content change.

## Theme persistence — read on mount, write on toggle

- Renderer reads initial theme via `await window.api.getTheme()` in a
  mount effect, applies `.dark` class to `documentElement`.
- Renderer persists via `await window.api.setTheme('dark' | 'light')` from
  the toggle handler.
- Main menu `View → Toggle Theme` flips the config and pushes
  `theme:changed` to all windows via `webContents.send`. Renderer's
  `onThemeChanged` listener updates state + class.
- One source of truth (`userData/config.json`) and three write paths
  (toolbar button, menu item, programmatic) — all funnel through
  `ConfigProvider.set`.

## Single-instance lock — Windows/Linux only

- `app.requestSingleInstanceLock()` is called before `app.whenReady()`.
  If not the primary, `app.quit()` immediately.
- The `second-instance` event re-focusses the existing window and, if the
  second instance was launched with a `.md` argv, re-reads that file and
  sends `file:opened` to the primary's webContents.
- macOS does NOT need this — file associations go through `open-file`.

## Preload — single `window.api`, nothing else

`preload/index.ts` exposes exactly one global: `window.api`. The previous
scaffold pattern (exposing `window.electron` with `ipcRenderer` access
via `@electron-toolkit/preload`) was removed because it violated CLAUDE.md's
"never expose raw `ipcRenderer`" rule. If you add a new IPC channel, you
need to touch THREE places:

1. `shared/ipc.ts` — channel constant + types.
2. `src/main/ipc/handlers.ts` — `ipcMain.handle` (or a `webContents.send`
   for push events).
3. `src/preload/index.ts` + `src/preload/index.d.ts` — the new `api`
   method. The `.d.ts` must mirror the implementation or the renderer
   loses types.
