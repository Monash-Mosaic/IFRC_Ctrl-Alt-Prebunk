import dotenv from 'dotenv';
import { dirname, resolve as pathResolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { getPlatformProxy } from 'wrangler';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = pathResolve(__dirname, '..', '..');

const LOCALES = new Set(['ar', 'en', 'es', 'fr', 'ru', 'zh']);
const REG_TABLE_PATTERN = /^reg_ifrcwdrplaybook([a-z]{2})db([a-z0-9_]*)$/;

const dotenvResult = dotenv.config({ path: pathResolve(projectRoot, '.env') });
if (dotenvResult.error && dotenvResult.error.code !== 'ENOENT') {
  throw dotenvResult.error;
}

function normalizeNamespace(value) {
  if (typeof value !== 'string') {
    return null;
  }

  const trimmed = value.trim();
  if (!trimmed) {
    return null;
  }

  const normalized = trimmed
    .toLowerCase()
    .replace(/[^a-z0-9_]+/g, '_')
    .replace(/_+/g, '_')
    .replace(/^_+|_+$/g, '');

  return normalized || null;
}

function parseDbEnvironment(value) {
  const raw = String(value || 'preview').trim().toLowerCase();
  if (!raw || raw === 'production') {
    return undefined;
  }
  return raw;
}

function parseNamespaceList(value, envName) {
  if (!value || !value.trim()) {
    return new Set();
  }

  const trimmed = value.trim();
  let items;

  if (trimmed.startsWith('[')) {
    let parsed;
    try {
      parsed = JSON.parse(trimmed);
    } catch (error) {
      throw new Error(`Invalid JSON in ${envName}: ${error instanceof Error ? error.message : String(error)}`);
    }

    if (!Array.isArray(parsed)) {
      throw new Error(`${envName} must be a JSON array when passed as JSON.`);
    }

    items = parsed;
  } else {
    items = trimmed.split(',');
  }

  const normalized = new Set();
  for (const item of items) {
    const namespace = normalizeNamespace(String(item || ''));
    if (namespace) {
      normalized.add(namespace);
    }
  }

  return normalized;
}

async function listRegistryScopes(searchDb) {
  const result = await searchDb
    .prepare("SELECT name FROM sqlite_master WHERE type = 'table' AND name GLOB 'reg_ifrcwdrplaybook*db*'")
    .all();

  const rows = result?.results || [];
  const entries = [];

  for (const row of rows) {
    const table = row?.name;
    if (typeof table !== 'string') {
      continue;
    }

    const match = REG_TABLE_PATTERN.exec(table);
    if (!match) {
      continue;
    }

    const locale = match[1];
    if (!LOCALES.has(locale)) {
      continue;
    }

    entries.push({
      table,
      scope: table.slice(4),
      locale,
      namespace: match[2] || null,
    });
  }

  return entries;
}

async function listAllTables(searchDb) {
  const result = await searchDb
    .prepare("SELECT name FROM sqlite_master WHERE type = 'table'")
    .all();

  const rows = result?.results || [];
  const tableNames = [];

  for (const row of rows) {
    if (typeof row?.name === 'string') {
      tableNames.push(row.name);
    }
  }

  return tableNames;
}

function collectScopeTables(scope, tableNames) {
  const tablePrefixes = [
    `map_${scope}_`,
    `ctx_${scope}_`,
    `tag_${scope}_`,
    `cfg_${scope}_`,
  ];
  const regTable = `reg_${scope}`;
  const matches = [];

  for (const tableName of tableNames) {
    if (tableName === regTable) {
      matches.push(tableName);
      continue;
    }

    if (tablePrefixes.some((prefix) => tableName.startsWith(prefix))) {
      matches.push(tableName);
    }
  }

  return matches;
}

async function createPlatformProxy(dbEnvironment) {
  return getPlatformProxy({
    envFiles: [pathResolve(projectRoot, '.env')],
    environment: dbEnvironment,
    configPath: pathResolve(projectRoot, 'wrangler.jsonc'),
    persist: {
      path: pathResolve(projectRoot, '.wrangler', 'state', 'v3'),
    },
  });
}

async function run() {
  const dbEnvironment = parseDbEnvironment(process.env.FLEXSEARCH_DB_ENV);
  const targetNamespace = normalizeNamespace(process.env.FLEXSEARCH_TARGET_NAMESPACE);
  const candidateNamespaces = parseNamespaceList(
    process.env.FLEXSEARCH_CANDIDATE_NAMESPACES,
    'FLEXSEARCH_CANDIDATE_NAMESPACES'
  );
  const keepNamespaces = parseNamespaceList(
    process.env.FLEXSEARCH_KEEP_NAMESPACES,
    'FLEXSEARCH_KEEP_NAMESPACES'
  );

  if (!targetNamespace && candidateNamespaces.size === 0) {
    throw new Error(
      'No cleanup requested. Set FLEXSEARCH_TARGET_NAMESPACE or FLEXSEARCH_CANDIDATE_NAMESPACES.'
    );
  }

  if (candidateNamespaces.size === 0 && keepNamespaces.size > 0) {
    throw new Error('FLEXSEARCH_KEEP_NAMESPACES requires FLEXSEARCH_CANDIDATE_NAMESPACES.');
  }

  const namespacesToPrune = new Set();
  for (const namespace of candidateNamespaces) {
    if (!keepNamespaces.has(namespace)) {
      namespacesToPrune.add(namespace);
    }
  }

  console.log(
    `[cleanup-flexsearch-tables] db_env=${dbEnvironment || 'production'} target_namespace=${targetNamespace || 'none'} prune_candidates=${candidateNamespaces.size} keep=${keepNamespaces.size}`
  );

  const platform = await createPlatformProxy(dbEnvironment);
  const { env, dispose } = platform;

  try {
    if (!env?.SEARCH_DB) {
      throw new Error('SEARCH_DB binding is required. Configure D1 in wrangler.jsonc.');
    }

    const searchDb = env.SEARCH_DB;
    const entries = await listRegistryScopes(searchDb);
    const tableNames = await listAllTables(searchDb);

    const scopesToDrop = new Set();

    if (targetNamespace) {
      for (const entry of entries) {
        if (entry.namespace === targetNamespace) {
          scopesToDrop.add(entry.scope);
        }
      }
    }

    if (namespacesToPrune.size > 0) {
      for (const entry of entries) {
        if (entry.namespace && namespacesToPrune.has(entry.namespace)) {
          scopesToDrop.add(entry.scope);
        }
      }
    }

    if (scopesToDrop.size === 0) {
      console.log('[cleanup-flexsearch-tables] Nothing to delete.');
      return;
    }

    const tablesToDrop = new Set();
    for (const scope of scopesToDrop) {
      const matchedTables = collectScopeTables(scope, tableNames);
      for (const table of matchedTables) {
        tablesToDrop.add(table);
      }
    }

    if (tablesToDrop.size === 0) {
      console.log('[cleanup-flexsearch-tables] Namespace scope matched but no tables were found.');
      return;
    }

    const statements = Array.from(tablesToDrop).map((table) => `DROP TABLE IF EXISTS ${table}`);
    await searchDb.exec(`${statements.join(';\n')};`);

    const droppedScopes = Array.from(scopesToDrop).sort();
    console.log(
      `[cleanup-flexsearch-tables] Dropped ${tablesToDrop.size} table(s) across ${droppedScopes.length} namespace scope(s): ${droppedScopes.join(', ')}`
    );
  } finally {
    await dispose();
  }
}

run().catch((error) => {
  const message = error instanceof Error ? error.message : String(error);
  console.error(`[cleanup-flexsearch-tables] ${message}`);
  process.exit(1);
});
