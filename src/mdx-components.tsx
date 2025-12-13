import type { MDXComponents } from 'mdx/types';

// Parameter required by MDX but intentionally unused to disable custom components
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function useMDXComponents(_components: MDXComponents): MDXComponents {
  return {
    // Only elements supported on social media platforms (Facebook, Instagram, X/Twitter, WhatsApp, Reddit)
    // Plain text paragraphs
    p: ({ children, ...props }) => <p className="text-sm leading-relaxed text-[#0D1B3E]" {...props}>{children}</p>,
    // Line breaks
    br: (props) => <br {...props} />,
    // Bold text (supported on most platforms)
    strong: ({ children, ...props }) => (
      <strong className="font-semibold text-[#0D1B3E]" {...props}>
        {children}
      </strong>
    ),
    // Italic text (supported on some platforms)
    em: ({ children, ...props }) => (
      <em className="italic text-[#0D1B3E]" {...props}>
        {children}
      </em>
    ),
    // Strikethrough text
    del: ({ children, ...props }) => (
      <del className="line-through text-[#0D1B3E]/60" {...props}>
        {children}
      </del>
    ),
    s: ({ children, ...props }) => (
      <s className="line-through text-[#0D1B3E]/60" {...props}>
        {children}
      </s>
    ),
    // Monospace text (inline code)
    code: ({ children, ...props }) => (
      <code className="rounded bg-[#E8E9ED] px-1.5 py-0.5 text-xs font-mono text-[#0D1B3E]" {...props}>
        {children}
      </code>
    ),
    // Links (URLs are auto-detected on social media, but links can be styled)
    a: ({ children, ...props }) => (
      <a className="text-[#2FE89F] underline hover:text-[#2FE89F]/80" {...props}>
        {children}
      </a>
    ),
    // Headings
    h1: ({ children, ...props }) => <h1 className="text-2xl font-bold text-[#0D1B3E]" {...props}>{children}</h1>,
    h2: ({ children, ...props }) => <h2 className="text-xl font-semibold text-[#0D1B3E]" {...props}>{children}</h2>,
    h3: ({ children, ...props }) => <h3 className="text-lg font-semibold text-[#0D1B3E]" {...props}>{children}</h3>,
    h4: ({ children, ...props }) => <h4 className="text-base font-semibold text-[#0D1B3E]" {...props}>{children}</h4>,
    h5: ({ children, ...props }) => <h5 className="text-sm font-semibold text-[#0D1B3E]" {...props}>{children}</h5>,
    h6: ({ children, ...props }) => <h6 className="text-xs font-semibold text-[#0D1B3E]" {...props}>{children}</h6>,
    // Lists
    ul: ({ children, ...props }) => (
      <ul className="list-disc space-y-1 pl-5 text-sm text-[#0D1B3E]" {...props}>
        {children}
      </ul>
    ),
    ol: ({ children, ...props }) => (
      <ol className="list-decimal space-y-1 pl-5 text-sm text-[#0D1B3E]" {...props}>
        {children}
      </ol>
    ),
    li: ({ children, ...props }) => (
      <li className="text-sm leading-relaxed text-[#0D1B3E]" {...props}>
        {children}
      </li>
    ),
    // Code blocks
    pre: ({ children, ...props }) => (
      <pre className="overflow-x-auto rounded-lg bg-[#E8E9ED] p-4 text-sm" {...props}>
        {children}
      </pre>
    ),
    // Blockquotes
    blockquote: ({ children, ...props }) => (
      <blockquote className="border-l-4 border-[#2FE89F] pl-4 italic text-[#0D1B3E]" {...props}>
        {children}
      </blockquote>
    ),
    // Horizontal rules (supported on Reddit)
    hr: (props) => <hr className="my-4 border-[#E8E9ED]" {...props} />,
    // Superscript (supported on Reddit)
    sup: ({ children, ...props }) => (
      <sup className="text-xs leading-none text-[#0D1B3E]" {...props}>
        {children}
      </sup>
    ),
    // Tables (supported on Reddit)
    table: ({ children, ...props }) => (
      <div className="overflow-x-auto">
        <table className="min-w-full border-collapse border border-[#E8E9ED]" {...props}>
          {children}
        </table>
      </div>
    ),
    thead: ({ children, ...props }) => (
      <thead className="bg-[#E8E9ED]" {...props}>
        {children}
      </thead>
    ),
    tbody: ({ children, ...props }) => (
      <tbody {...props}>
        {children}
      </tbody>
    ),
    tr: ({ children, ...props }) => (
      <tr className="border-b border-[#E8E9ED]" {...props}>
        {children}
      </tr>
    ),
    th: ({ children, ...props }) => (
      <th className="border border-[#E8E9ED] px-4 py-2 text-left text-sm font-semibold text-[#0D1B3E]" {...props}>
        {children}
      </th>
    ),
    td: ({ children, ...props }) => (
      <td className="border border-[#E8E9ED] px-4 py-2 text-sm text-[#0D1B3E]" {...props}>
        {children}
      </td>
    ),
    // Images and custom elements are disabled
  };
}
