module.exports = {
  root: true,
  env: {
    node: true,
    es2022: true,
  },

  parser: "@typescript-eslint/parser",

  plugins: ["@typescript-eslint", "import", "prettier"],

  extends: [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
    "plugin:import/recommended",
    "plugin:prettier/recommended",
  ],

  settings: {
    "import/resolver": {
      typescript: {
        project: "./tsconfig.json",
      },
    },
  },

  rules: {
    "prettier/prettier": "error",
    "@typescript-eslint/no-unused-vars": "warn",
    "import/order": [
      "warn",
      {
        groups: [["builtin", "external"], "internal", ["parent", "sibling"]],
      },
    ],
  },
};