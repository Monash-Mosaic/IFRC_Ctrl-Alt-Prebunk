#!/usr/bin/env node

import { writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import process from 'node:process';

const PUBLIC_ENV_KEYS = [
  'NEXT_PUBLIC_GA_ID',
  'NEXT_PUBLIC_SITE_URL',
  'NEXT_PUBLIC_CF_BEACON_TOKEN',
  'NEXT_PUBLIC_GIT_TAG',
];

const outPath = resolve(process.cwd(), '.env.production.local');

const lines = PUBLIC_ENV_KEYS.filter((key) => {
  const value = process.env[key];
  return typeof value === 'string' && value.length > 0;
}).map((key) => `${key}=${JSON.stringify(process.env[key])}`);

if (lines.length === 0) {
  process.stdout.write(
    '[inject-public-env] No NEXT_PUBLIC_* values set; skipping .env.production.local\n',
  );
  process.exit(0);
}

writeFileSync(outPath, `${lines.join('\n')}\n`, 'utf8');

process.stdout.write(
  `[inject-public-env] Wrote ${lines.length} variable(s) to .env.production.local: ${PUBLIC_ENV_KEYS.filter((k) => process.env[k]).join(', ')}\n`,
);
