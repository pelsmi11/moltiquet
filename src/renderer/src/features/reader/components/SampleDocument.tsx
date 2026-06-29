// ponytail: static TSX stand-in for rendered Markdown. Swap for react-markdown
// + remark-gfm when wiring the real MarkdownView; the heading ids stay the TOC contract.
import { sampleHeadings } from '../utils/constants/sample-headings'

export function SampleDocument(): React.JSX.Element {
  void sampleHeadings // imported to keep the contract visible in this file
  return (
    <article className="mx-auto max-w-3xl px-10 py-8 text-[15px] leading-7 text-foreground">
      <h1 className="mb-2 text-4xl font-bold tracking-tight">Moltiquet</h1>
      <p className="mb-8 text-muted-foreground">
        A fast, modern reader for Markdown documents — Adobe Reader, but for{' '}
        <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-sm">.md</code> files.
      </p>

      <h2
        id="introduction"
        className="mt-10 mb-3 scroll-mt-6 border-b border-border pb-2 text-2xl font-semibold"
      >
        Introduction
      </h2>
      <p className="mb-4">
        Moltiquet renders GitHub-flavored Markdown into a clean, readable view with tables, task
        lists, math, diagrams, and syntax-highlighted code. It is built with Electron and ships on
        Windows, macOS, and Linux.
      </p>
      <blockquote className="my-4 border-l-4 border-primary/50 pl-4 italic text-muted-foreground">
        Make Markdown a first-class format for reading technical documentation — as polished as a
        native PDF reader, while staying fully open.
      </blockquote>

      <h2
        id="installation"
        className="mt-10 mb-3 scroll-mt-6 border-b border-border pb-2 text-2xl font-semibold"
      >
        Installation
      </h2>
      <p className="mb-4">Clone the repository and start the development build:</p>
      <pre className="mb-4 overflow-x-auto rounded-lg bg-muted p-4 font-mono text-sm">
        <code>{`pnpm install\npnpm dev`}</code>
      </pre>

      <h2
        id="features"
        className="mt-10 mb-3 scroll-mt-6 border-b border-border pb-2 text-2xl font-semibold"
      >
        Features
      </h2>
      <ul className="mb-4 space-y-2">
        <li className="flex items-start gap-2">
          <input type="checkbox" checked readOnly className="mt-1.5 accent-primary" />
          <span>GitHub-flavored Markdown rendering</span>
        </li>
        <li className="flex items-start gap-2">
          <input type="checkbox" checked readOnly className="mt-1.5 accent-primary" />
          <span>Auto-generated table of contents</span>
        </li>
        <li className="flex items-start gap-2">
          <input type="checkbox" readOnly className="mt-1.5 accent-primary" />
          <span>Mermaid diagrams &amp; KaTeX math</span>
        </li>
      </ul>

      <h3 id="keyboard-shortcuts" className="mt-8 mb-3 scroll-mt-6 text-xl font-semibold">
        Keyboard shortcuts
      </h3>
      <table className="mb-4 w-full border-collapse text-left text-sm">
        <thead>
          <tr className="border-b border-border">
            <th className="py-2 pr-4 font-semibold">Action</th>
            <th className="py-2 font-semibold">Shortcut</th>
          </tr>
        </thead>
        <tbody className="text-muted-foreground">
          <tr className="border-b border-border/60">
            <td className="py-2 pr-4">Find in document</td>
            <td className="py-2 font-mono">⌘ F</td>
          </tr>
          <tr className="border-b border-border/60">
            <td className="py-2 pr-4">New tab</td>
            <td className="py-2 font-mono">⌘ T</td>
          </tr>
          <tr>
            <td className="py-2 pr-4">Toggle theme</td>
            <td className="py-2 font-mono">⌘ ⇧ L</td>
          </tr>
        </tbody>
      </table>

      <h2
        id="configuration"
        className="mt-10 mb-3 scroll-mt-6 border-b border-border pb-2 text-2xl font-semibold"
      >
        Configuration
      </h2>
      <p className="mb-4">
        Preferences such as theme and recent files persist automatically. See the{' '}
        <a
          className="text-primary underline underline-offset-4 hover:opacity-80"
          href="#introduction"
        >
          project documentation
        </a>{' '}
        for details.
      </p>
    </article>
  )
}
