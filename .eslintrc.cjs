const restrictedGlobals = require('confusing-browser-globals');

module.exports = {
  ignorePatterns: ['/*', '!/src'],
  root: true,
  parser: '@typescript-eslint/parser',
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:@typescript-eslint/stylistic',
    'plugin:import/recommended',
    'plugin:react/recommended',
    'plugin:react/jsx-runtime',
    'plugin:react-hooks/recommended',
    'plugin:jsx-a11y/recommended',
  ],
  rules: {
    // `eslint:recommended` overrides
    'no-console': 'error',
    'no-debugger': 'error',
    'no-empty': ['error', { allowEmptyCatch: true }],
    'no-restricted-globals': ['error', 'setTimeout', 'setInterval', 'clearTimeout', 'clearInterval'].concat(
      restrictedGlobals,
    ),
    'no-restricted-exports': [
      'error',
      {
        restrictDefaultExports: {
          direct: true,
          named: true,
          defaultFrom: true,
          namedFrom: true,
          namespaceFrom: true,
        },
      },
    ],
    'padding-line-between-statements': [
      'error',
      {
        blankLine: 'always',
        prev: '*',
        next: 'return',
      },
    ],
    // `@typescript-eslint/recommended` overrides
    '@typescript-eslint/ban-ts-comment': 'off',
    '@typescript-eslint/no-empty-function': 'off',
    '@typescript-eslint/no-explicit-any': 'off',
    '@typescript-eslint/no-namespace': 'off',
    '@typescript-eslint/no-unused-vars': [
      'error',
      {
        ignoreRestSiblings: true,
        argsIgnorePattern: '^_',
        destructuredArrayIgnorePattern: '^_',
      },
    ],
    // Turn of these rules because they give false positives in TypeScript.
    // @typescript-eslint has it's own rules for these.
    'import/named': 'off',
    'import/no-unresolved': 'off',
    // `plugin:react/recommended` overrides
    'react/prop-types': 'off',
    'react/display-name': 'off',
    // `plugin:jsx-a11y/recommended` overrides
    'jsx-a11y/click-events-have-key-events': 'off',
    'jsx-a11y/no-static-element-interactions': 'off',
    'jsx-a11y/no-autofocus': 'off',
    'jsx-a11y/no-noninteractive-element-interactions': 'off',
  },
  settings: {
    react: {
      version: 'detect',
    },
  },
};
