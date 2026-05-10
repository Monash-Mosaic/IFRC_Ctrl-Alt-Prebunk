import { readFile } from 'node:fs/promises';
import { dirname, resolve as pathResolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import dotenv from 'dotenv';
import { build } from 'esbuild';
import { createPathResolver } from './path-resolver.mjs';
import { transformMdxToModule } from './mdx-transform.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = pathResolve(__dirname, '..', '..');
const dotenvPath = pathResolve(projectRoot, '.env');
const resolveImportPath = createPathResolver({ projectRoot });

const aliasFromConfigPlugin = {
  name: 'alias-from-jsconfig',
  setup(buildContext) {
    buildContext.onResolve({ filter: /.*/ }, (args) => {
      const resolvedPath = resolveImportPath(args.path);
      if (!resolvedPath) {
        return null;
      }

      return { path: resolvedPath };
    });
  },
};

const customMdxPlugin = {
  name: 'custom-mdx-transform',
  setup(buildContext) {
    buildContext.onLoad({ filter: /\.mdx$/ }, async (args) => {
      const source = await readFile(args.path, 'utf8');
      const contents = await transformMdxToModule({
        filePath: args.path,
        source,
      });

      return {
        loader: 'js',
        contents,
      };
    });
  },
};

const envFilePlugin = {
  name: 'load-dotenv',
  setup(buildContext) {
    buildContext.onStart(() => {
      const result = dotenv.config({ path: dotenvPath });
      if (result.error && result.error.code !== 'ENOENT') {
        throw result.error;
      }
    });
  },
};

await build({
  entryPoints: [pathResolve(__dirname, 'index.mjs')],
  outdir: pathResolve(__dirname, 'dist'),
  format: 'esm',
  platform: 'node',
  target: ['node22'],
  bundle: true,
  splitting: true,
  sourcemap: true,
  entryNames: '[name]',
  chunkNames: 'chunks/[name]-[hash]',
  // Native bindings and some CJS runtime packages should stay runtime-resolved in Node.
  external: ['sqlite3', 'better-sqlite3', 'wrangler', 'dotenv'],
  logLevel: 'info',
  plugins: [aliasFromConfigPlugin, customMdxPlugin, envFilePlugin],
});
