import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import { defineConfig, globalIgnores } from 'eslint/config'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{js,jsx}'],
    extends: [
      js.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
      parserOptions: {
        ecmaVersion: 'latest',
        ecmaFeatures: { jsx: true },
        sourceType: 'module',
      },
    },
    rules: {
      // motion.div/span/etc. are JSX namespace expressions; ESLint v9 doesn't count
      // member-expression usage as a "use" of the namespace variable, so we explicitly
      // allow variables whose names match common framer-motion / JSX namespace patterns.
      'no-unused-vars': ['error', { varsIgnorePattern: '^[A-Z_]|^motion$', caughtErrorsIgnorePattern: '.*' }],
    },
  },
])
