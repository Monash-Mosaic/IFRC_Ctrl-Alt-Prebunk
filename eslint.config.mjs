import { defineConfig, globalIgnores } from 'eslint/config';
import nextVitals from 'eslint-config-next/core-web-vitals';
import nextTs from 'eslint-config-next/typescript';
import eslintPluginCompat from 'eslint-plugin-compat';
import eslintPluginPrettier from 'eslint-plugin-prettier';

const eslintConfig = defineConfig([
  {
    plugins: {
      compat: eslintPluginCompat,
      prettier: eslintPluginPrettier,
    },
  },
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    '.next/**',
    'out/**',
    'build/**',
    'next-env.d.ts',
    // Test files
    '**/*.test.ts',
    '**/*.test.tsx',
    '**/*.spec.ts',
    '**/*.spec.tsx',
    '**/__tests__/**',
    'coverage/**',
    'jest.config.js',
    'jest.setup.js',
    'postcss.config.mjs',
    'src/test-utils/**',
  ]),
]);

export default eslintConfig;
