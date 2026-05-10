import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkMdx from 'remark-mdx';
import { visit } from 'unist-util-visit';
import GithubSlugger from 'github-slugger';

const slugger = new GithubSlugger();

const parser = unified().use(remarkParse).use(remarkMdx);

function stripPosition(node) {
  if (!node || typeof node !== 'object') {
    return node;
  }

  if (Array.isArray(node)) {
    return node.map(stripPosition);
  }

  const output = {};
  for (const [key, value] of Object.entries(node)) {
    if (key === 'position' || key === 'estree') {
      continue;
    }
    output[key] = stripPosition(value);
  }

  return output;
}

function extractStringExport(source, exportName) {
  const pattern = new RegExp(
    String.raw`export\s+const\s+${exportName}\s*=\s*(['"\`])([\s\S]*?)\1\s*;?`,
    'm'
  );
  const match = source.match(pattern);
  return match?.[2]?.trim() ?? '';
}

function extractTableOfContents(tree) {
  const toc = [];

  visit(tree, 'heading', (node) => {
    const textParts = [];
    visit(node, (child) => {
      if (child && (child.type === 'text' || child.type === 'inlineCode')) {
        textParts.push(child.value);
      }
    });

    const text = textParts.join(' ').replace(/\s+/g, ' ').trim();
    if (!text) {
      return;
    }

    const id = slugger.slug(text);

    toc.push({
      depth: node.depth,
      value: text,
      id,
    });
  });

  return toc;
}

/**
 * Convert MDX source into a JS module that exposes a Remark AST.
 *
 * @param {Object} args
 * @param {string} args.filePath
 * @param {string} args.source
 * @returns {string}
 */
export function transformMdxModule({ source }) {
  const parsedTree = parser.parse(source);
  const tree = stripPosition(parsedTree);
  const tableOfContents = extractTableOfContents(tree);
  const title = extractStringExport(source, 'title');
  const subtitle = extractStringExport(source, 'subtitle');

  return `
const remarkAst = ${JSON.stringify(tree)};
export default remarkAst;
export const title = ${JSON.stringify(title)};
export const subtitle = ${JSON.stringify(subtitle)};
export const tableOfContents = ${JSON.stringify(tableOfContents)};
`;
}
