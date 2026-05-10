import { readFile, writeFile } from 'node:fs/promises';
import { dirname, resolve as pathResolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { applyEdits, findNodeAtLocation, modify, parseTree, printParseErrorCode } from 'jsonc-parser';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = pathResolve(__dirname, '..', '..');
const wranglerConfigPath = pathResolve(projectRoot, 'wrangler.jsonc');

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

const DB_PATH = ['d1_databases', 0, 'database_id'];
const DB_REMOTE_PATH = ['d1_databases', 0, 'remote'];

function requireEnv(name) {
  const value = process.env[name]?.trim();
  if (!value) {
    throw new Error(`Missing required env var: ${name}`);
  }
  return value;
}

function assertUuid(name, value) {
  if (!UUID_REGEX.test(value)) {
    throw new Error(`Invalid UUID format for ${name}`);
  }
}

function assertJsoncPathExists(tree, path) {
  if (!findNodeAtLocation(tree, path)) {
    throw new Error(`Expected JSONC path not found in ${wranglerConfigPath}: ${path.join('.')}`);
  }
}

function applyJsoncUpdate(configRaw, path, value) {
  const edits = modify(configRaw, path, value, {
    formattingOptions: {
      insertSpaces: false,
      tabSize: 2,
      eol: '\n',
    },
  });

  if (!edits.length) {
    throw new Error(`No JSONC edits generated for path ${path.join('.')}`);
  }

  return applyEdits(configRaw, edits);
}

async function run() {
  const prodId = requireEnv('CF_D1_SEARCH_DB_ID');

  assertUuid('CF_D1_SEARCH_DB_ID_PROD', prodId);

  const configRaw = await readFile(wranglerConfigPath, 'utf8');

  const parseErrors = [];
  const tree = parseTree(configRaw, parseErrors, {
    allowTrailingComma: true,
    disallowComments: false,
  });

  if (!tree) {
    throw new Error('Failed to parse wrangler.jsonc');
  }

  if (parseErrors.length) {
    const firstError = parseErrors[0];
    throw new Error(`Invalid wrangler.jsonc: ${printParseErrorCode(firstError.error)} at offset ${firstError.offset}`);
  }

  assertJsoncPathExists(tree, DB_PATH);

  let output = configRaw;
  output = applyJsoncUpdate(output, DB_PATH, prodId);
  output = applyJsoncUpdate(output, DB_REMOTE_PATH, true);

  await writeFile(wranglerConfigPath, output, 'utf8');
  console.log('[inject-d1-database-ids] Updated wrangler.jsonc with CI-provided D1 database IDs and remote bindings.');
}

run().catch((error) => {
  const message = error instanceof Error ? error.message : String(error);
  console.error(`[inject-d1-database-ids] ${message}`);
  process.exit(1);
});
