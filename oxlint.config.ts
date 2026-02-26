import restrictedBrowserGlobals from "confusing-browser-globals";
import { defineConfig } from "oxlint";

import pkg from "./package.json" with { type: "json" };

export default defineConfig({
  plugins: ["eslint", "import", "jsx-a11y", "oxc", "react", "typescript"],
  env: {
    builtin: true,
    es2026: true,
    browser: true,
  },
  settings: {
    react: {
      version: pkg.dependencies.react.replaceAll(/[^\d.]/g, ""),
    },
  },
  categories: {
    correctness: "error",
    nursery: "warn",
  },
  ignorePatterns: ["*", "!src/**/*", "!vite.config.ts", "!oxlint.config.ts"],
  rules: {
    "getter-return": "error",
    "no-array-constructor": "error",
    "no-console": "error",
    "no-case-declarations": "error",
    "no-empty": ["error", { allowEmptyCatch: true }],
    "no-fallthrough": "error",
    "no-prototype-builtins": "error",
    "no-redeclare": "error",
    "no-regex-spaces": "error",
    "no-restricted-globals": ["error", "setTimeout", "setInterval", "clearTimeout", "clearInterval"].concat(
      restrictedBrowserGlobals,
    ),
    "no-undef": "error",
    "no-unexpected-multiline": "error",
    "no-unreachable": "error",
    "no-unused-vars": [
      "error",
      {
        ignoreRestSiblings: true,
        argsIgnorePattern: "^_",
        destructuredArrayIgnorePattern: "^_",
      },
    ],

    "import/consistent-type-specifier-style": "warn",
    "import/first": "warn",
    "import/no-cycle": ["warn", { ignoreTypes: false }],
    "import/no-default-export": "warn",
    "import/no-duplicates": "warn",
    "import/no-empty-named-blocks": "warn",

    "react/display-name": "error",
    "react/jsx-no-comment-textnodes": "error",
    "react/jsx-no-target-blank": "error",
    "react/no-unescaped-entities": "error",
    "react/no-unknown-property": "error",
    "react/rules-of-hooks": "error",

    "typescript/adjacent-overload-signatures": "error",
    "typescript/array-type": "error",
    "typescript/ban-tslint-comment": "error",
    "typescript/class-literal-property-style": "error",
    "typescript/consistent-generic-constructors": "error",
    "typescript/consistent-indexed-object-style": "error",
    "typescript/consistent-type-assertions": "error",
    "typescript/consistent-type-definitions": "error",
    "typescript/no-confusing-non-null-assertion": "error",
    "typescript/no-empty-object-type": "error",
    "typescript/no-inferrable-types": "error",
    "typescript/no-require-imports": "error",
    "typescript/no-unnecessary-type-constraint": "error",
    "typescript/no-unsafe-function-type": "error",
    "typescript/prefer-for-of": "error",
    "typescript/prefer-function-type": "error",

    // disable unneeded plugin enabled rules
    "no-control-regex": "allow",
    "import/default": "allow",
    "import/export": "allow",
    "import/named": "allow",
    "import/namespace": "allow",
    "typescript/prefer-readonly-parameter-types": "allow",
  },
  overrides: [
    {
      files: ["vite.config.ts", "oxlint.config.ts"],
      rules: {
        "no-undef": "allow",
        "import/no-default-export": "allow",
      },
    },
  ],
});
