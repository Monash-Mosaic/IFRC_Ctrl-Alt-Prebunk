import { existsSync, readFileSync, statSync } from 'node:fs';
import { resolve as pathResolve } from 'node:path';

const EXTENSIONS = ['.js', '.jsx', '.ts', '.tsx', '.mjs', '.cjs', '.json', '.mdx'];

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function loadJson(filePath) {
  if (!existsSync(filePath)) {
    return {};
  }

  try {
    return JSON.parse(readFileSync(filePath, 'utf8'));
  } catch {
    return {};
  }
}

function resolveWithExtensions(basePath) {
  if (existsSync(basePath) && statSync(basePath).isFile()) {
    return basePath;
  }

  for (const ext of EXTENSIONS) {
    const fileCandidate = `${basePath}${ext}`;
    if (existsSync(fileCandidate)) {
      return fileCandidate;
    }
  }

  for (const ext of EXTENSIONS) {
    const indexCandidate = pathResolve(basePath, `index${ext}`);
    if (existsSync(indexCandidate)) {
      return indexCandidate;
    }
  }

  return null;
}

function compilePathMapping(pattern, targets) {
  const regex = new RegExp(`^${escapeRegExp(pattern).replace(/\\\*/g, '(.*)')}$`);
  return {
    regex,
    targets: Array.isArray(targets) ? targets : [],
  };
}

function getJsCompilerOptions(projectRoot) {
  const jsconfig = loadJson(pathResolve(projectRoot, 'jsconfig.json'));
  const jsOptions = jsconfig.compilerOptions ?? {};

  const baseUrl = jsOptions.baseUrl ?? '.';
  const paths = jsOptions.paths ?? {};

  return {
    baseUrlAbs: pathResolve(projectRoot, baseUrl),
    entries: Object.entries(paths).map(([pattern, targets]) => compilePathMapping(pattern, targets)),
  };
}

function applyWildcard(target, captures) {
  let output = target;
  for (const capture of captures) {
    output = output.replace('*', capture);
  }
  return output;
}

function isBareImport(specifier) {
  if (!specifier || specifier.startsWith('.') || specifier.startsWith('/') || specifier.startsWith('node:')) {
    return false;
  }

  return !specifier.includes('://');
}

export function createPathResolver({ projectRoot }) {
  const { baseUrlAbs, entries } = getJsCompilerOptions(projectRoot);

  return function resolveImportPath(specifier) {
    for (const entry of entries) {
      const match = specifier.match(entry.regex);
      if (!match) {
        continue;
      }

      const captures = match.slice(1);
      for (const target of entry.targets) {
        const candidate = applyWildcard(target, captures);
        const basePath = pathResolve(baseUrlAbs, candidate);
        const resolved = resolveWithExtensions(basePath);
        if (resolved) {
          return resolved;
        }
      }
    }

    // Fallback to baseUrl-only resolution for bare imports.
    if (isBareImport(specifier)) {
      const fallback = resolveWithExtensions(pathResolve(baseUrlAbs, specifier));
      if (fallback) {
        return fallback;
      }
    }

    return null;
  };
}
