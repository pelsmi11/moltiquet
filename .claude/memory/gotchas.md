# Gotchas and traps

> Concrete "don't do this, it breaks" notes. Read before touching the
> highlighted areas.

## React 19 / TypeScript 5.9 / eslint 9

- **`useRef<T>()`** (no argument) is now an error in strict mode. Always
  pass an initial value: `useRef<T | undefined>(undefined)`. The
  `useDocumentSearch` debounce timer uses this pattern.
- **`@typescript-eslint/no-empty-function`** fires on empty constructors
  in mocks. Use a single `// eslint-disable-next-line` comment, or, in
  `vitest.setup.ts`, replace the whole `IntersectionObserver` mock with
  a fully-typed cast (`as unknown as { new (...): IntersectionObserver }`).
- **`react-hooks/set-state-in-effect`** is enforced. The one allowed
  exception in this codebase is `useDocumentSearch` calling
  `setMatches(fresh)` inside a layout effect, where the comment explains
  that the state is read from the DOM (external system). Don't add more
  exceptions without a comment explaining why.

## `splitText` and stale text node references

If you ever add a new `findMatches`-like function returning `Text`
references, those references MUST be used in the same synchronous task
in which they were created. Any intervening layout effect, `normalize()`,
or React reconciliation will detach them. See `architecture.md` for the
full explanation.

The pattern that fails: `useEffect(() => findMatches(...))` → store refs in
state → `useLayoutEffect(() => use refs)`. By the time the layout effect
runs, the DOM has changed.

The pattern that works: `useLayoutEffect(() => { clear, find, use })` —
all in one synchronous flow.

## `useRef` from the hook signature

`useDocumentSearch(containerRef, content)` expects a real `RefObject`
from the caller. The container is the ReaderView's scrolling `<div>`,
which is the SAME DOM node across tab switches (React keeps it mounted,
just swaps the `content` prop on its child). Don't pass a freshly-created
`useRef(null)` per render — that creates a new ref every render and
defeats the hook's dependency tracking.

## DevTools shortcut on macOS

`@electron-toolkit/utils`'s `optimizer.watchWindowShortcuts` only
registers `CmdOrCtrl+Shift+I`. It does **not** register `Cmd+Opt+I` (the
macOS standard). The custom menu entry with `role: 'toggleDevTools'`
and `accelerator: 'CmdOrCtrl+Alt+I'` is the one that actually works.
Don't trust the CLAUDE.md claim that "⌘+⌥+I" works out of the box — it
doesn't, that was the original scaffold and it's been overridden.

## Highlight.js theme switching

`useHighlightTheme(isDark)` swaps a `<link>` element in `index.html`
between `github` and `github-dark` highlight.js stylesheets. The light
theme variable is `--color-foreground` etc. from `globals.css`. If you
add a new theme, also add the corresponding `hljs` link in
`src/renderer/index.html`.

## `setAppUserModelId`

Windows taskbar grouping uses the AUMID. It's `com.moltiquet.desktop`
currently. Changing it changes the Windows taskbar group. Don't
"clean up" the value to a different one without confirming.

## Vitest + jsdom + IntersectionObserver

The `IntersectionObserver` mock in `vitest.setup.ts` is intentionally a
full class implementation with all read-only fields the real interface
has (`root`, `rootMargin`, `thresholds`, `takeRecords`). Empty constructor
is suppressed because `no-empty-function` fires. Don't simplify the
mock — the real `useActiveHeading.test.ts` exercises it.

## Tooling gotchas

- **Node warnings in pnpm scripts**: `electron_mirror`,
  `electron_builder_binaries_mirror`, `shamefully-hoist` in `.npmrc`
  produce npm warnings on every script. They're harmless; the project
  inherited them.
- **No coverage threshold on `main/lib/i18n-resources.d.ts`** etc. —
  those are declaration files. The 80% threshold in `vitest.config.ts`
  applies to the actual code.
