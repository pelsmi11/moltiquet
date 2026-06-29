import ReactMarkdown from 'react-markdown'
import { remarkPlugins, rehypePlugins, markdownComponents } from '../lib/markdown'

interface MarkdownViewProps {
  content: string
}

export function MarkdownView({ content }: MarkdownViewProps): React.JSX.Element {
  return (
    <article className="prose prose-lg prose-zinc mx-auto max-w-[72ch] px-8 py-10">
      <ReactMarkdown
        remarkPlugins={remarkPlugins}
        rehypePlugins={rehypePlugins}
        components={markdownComponents}
      >
        {content}
      </ReactMarkdown>
    </article>
  )
}
