#!/usr/bin/env node
/**
 * Installs deps for `scripts/build-search-index`, builds its bundle, and runs the indexer
 * against D1 via Wrangler (requires SEARCH_DB in wrangler.jsonc and CI secrets).
 */
import { spawnSync } from 'node:child_process';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const prefix = 'scripts/build-search-index';

function runNpm(args) {
  const result = spawnSync('npm', args, {
    cwd: root,
    stdio: 'inherit',
    shell: process.platform === 'win32',
    env: process.env,
  });
  if (result.error) {
    console.error(result.error);
    process.exit(1);
  }
  const code = result.status ?? 1;
  if (code !== 0) {
    process.exit(code);
  }
}

runNpm(['ci', '--prefix', prefix]);
runNpm(['run', 'start:esbuild', '--prefix', prefix]);
