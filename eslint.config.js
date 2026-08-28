import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  { ignores: ['dist/**', 'node_modules/**', 'playwright-report/**', 'test-results/**'] },
  eslint.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ['**/*.ts'],
    rules: {
      'no-undef': 'off'
    }
  },
  {
    files: ['public/sw.js'],
    languageOptions: {
      globals: {
        caches: 'readonly',
        fetch: 'readonly',
        location: 'readonly',
        self: 'readonly',
        URL: 'readonly'
      }
    }
  },
  {
    files: ['scripts/**/*.mjs'],
    languageOptions: {
      globals: {
        console: 'readonly',
        fetch: 'readonly',
        process: 'readonly'
      }
    }
  }
);
