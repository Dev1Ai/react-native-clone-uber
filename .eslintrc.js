/* eslint-env node */
// https://docs.expo.dev/guides/using-eslint/
const path = require("path");

module.exports = {
  root: true,
  extends: ["expo", "prettier"],
  plugins: ["prettier", "import"],
  env: {
    node: true,
  },
  parserOptions: {
    tsconfigRootDir: __dirname,
    project: path.resolve(__dirname, "tsconfig.json"),
  },
  settings: {
    "import/resolver": {
      typescript: {
        project: [path.resolve(__dirname, "tsconfig.json")],
        alwaysTryTypes: true,
      },
      node: {
        extensions: [".ts", ".tsx", ".js", ".jsx"],
        moduleDirectory: [".", "node_modules"],
      },
    },
  },
  rules: {
    "prettier/prettier": "error",
    "import/order": [
      "error",
      {
        groups: [
          "builtin",
          "external",
          "internal",
          "parent",
          "sibling",
          "index",
          "object",
          "type",
        ],
        "newlines-between": "always",
        alphabetize: {
          order: "asc",
          caseInsensitive: true,
        },
      },
    ],
  },
};
