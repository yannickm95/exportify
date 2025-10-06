import restrictedGlobals from 'confusing-browser-globals';

import jsPlugin from '@eslint/js';
import tsPlugin from 'typescript-eslint';
import reactPlugin from 'eslint-plugin-react';
import reactHooksPlugin from 'eslint-plugin-react-hooks';
import jsxA11yPlugin from 'eslint-plugin-jsx-a11y';

export default [
  { ignores: ['*', '!src'] },
  jsPlugin.configs.recommended,
  ...tsPlugin.configs.recommended,
  ...tsPlugin.configs.stylistic,
  reactPlugin.configs.flat.recommended,
  reactPlugin.configs.flat['jsx-runtime'],
  ...reactHooksPlugin.configs['recommended-latest'],
  jsxA11yPlugin.flatConfigs.recommended,
  {
    languageOptions: {
      parser: tsPlugin.parser,
    },

    settings: {
      react: {
        version: 'detect',
      },
    },

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
      // `plugin:react/recommended` overrides
      'react/prop-types': 'off',
      'react/display-name': 'off',
      // `plugin:react-hooks` rules
      ...setReactHooksRules(),
      // `plugin:jsx-a11y/recommended` overrides
      'jsx-a11y/click-events-have-key-events': 'off',
      'jsx-a11y/no-static-element-interactions': 'off',
      'jsx-a11y/no-autofocus': 'off',
      'jsx-a11y/no-noninteractive-element-interactions': 'off',
    },
  },
];

function setReactHooksRules() {
  return Object.fromEntries(
    Object.entries(reactHooksPlugin.configs['recommended-latest'][0]?.rules || []).map(([key]) => {
      return [key, key !== 'react-hooks/rules-of-hooks' ? 'warn' : 'error'];
    }),
  );
}
