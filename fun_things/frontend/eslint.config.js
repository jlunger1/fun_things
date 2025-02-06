const globals = require("globals");

module.exports = [
  {
    files: ["**/*.js", "**/*.jsx"],
    ignores: [
      "**/node_modules/**",
      ".next/**",
      "out/**",
      "build/**",
      "dist/**",
      "coverage/**",
      "**/*.config.js",
      "**/*.setup.js",
    ],
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      globals: {
        ...globals.browser,
        ...globals.es2021,
      },
    },
    rules: {
      semi: ["error", "always"],
      quotes: ["error", "single"],
      indent: ["error", 2],
      "no-unused-vars": "warn",
      "no-console": "warn",
      "prefer-const": "error",
      "arrow-spacing": "error",
      "no-multiple-empty-lines": ["error", { max: 1 }],
      "eol-last": ["error", "always"],
    },
  },
];
