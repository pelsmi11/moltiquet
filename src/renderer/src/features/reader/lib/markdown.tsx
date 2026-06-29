import type { Components } from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeSlug from 'rehype-slug'
import rehypeHighlight from 'rehype-highlight'

export const remarkPlugins = [remarkGfm]
export const rehypePlugins = [rehypeSlug, rehypeHighlight]

export const markdownComponents: Components = {
  // Scope heading anchors to in-page navigation only
  a: ({ href, children, ...props }) => (
    <a
      href={href}
      {...props}
      {...(href?.startsWith('#') ? {} : { target: '_blank', rel: 'noreferrer' })}
    >
      {children}
    </a>
  )
}
