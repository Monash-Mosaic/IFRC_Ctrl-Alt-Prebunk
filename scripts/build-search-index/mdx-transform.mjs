import { existsSync } from 'node:fs';
import { dirname, resolve as pathResolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const DEFAULT_MODULE_SOURCE = `export default {};
export const title = '';
export const subtitle = '';
export const tableOfContents = [];
export const component = null;
`;

const projectRoot = pathResolve(dirname(fileURLToPath(import.meta.url)), '..', '..');
const defaultConfigPath = pathResolve(projectRoot, 'scripts', 'build-search-index', 'mdx.config.mjs');

let transformerPromise = null;

async function loadCustomTransformer() {
  if (transformerPromise) {
    return transformerPromise;
  }

  transformerPromise = (async () => {
    const envConfigPath = process.env.SEARCH_INDEX_MDX_CONFIG?.trim();
    const candidates = [];

    if (envConfigPath) {
      candidates.push(pathResolve(projectRoot, envConfigPath));
    }

    candidates.push(defaultConfigPath);

    for (const configPath of candidates) {
      if (!existsSync(configPath)) {
        continue;
      }

      const loadedModule = await import(pathToFileURL(configPath).href);
      if (typeof loadedModule.transformMdxModule === 'function') {
        return loadedModule.transformMdxModule;
      }
      if (typeof loadedModule.default === 'function') {
        return loadedModule.default;
      }
    }

    return null;
  })();

  return transformerPromise;
}

export async function transformMdxToModule({ filePath, source }) {
  const customTransformer = await loadCustomTransformer();
  if (!customTransformer) {
    return DEFAULT_MODULE_SOURCE;
  }

  const output = await customTransformer({
    filePath,
    source,
    defaultModuleSource: DEFAULT_MODULE_SOURCE,
  });

  if (typeof output !== 'string') {
    throw new TypeError(
      '[build-search-index] MDX transformer must return a JavaScript module string.'
    );
  }

  return output;
}
