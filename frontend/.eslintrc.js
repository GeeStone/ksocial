/** @type {import('eslint').Linter.Config} */
module.exports = {
  root: true,
  extends: ["next/core-web-vitals"],
  plugins: ["unused-imports"],
  // Явно прокидываем пресет для встроенного babel-parser Next,
  // чтобы VSCode не терял 'next/babel'
  parserOptions: {
    babelOptions: {
      presets: [require.resolve("next/babel")],
    },
  },
  rules: {
    "no-unused-vars": "off",
    "@typescript-eslint/no-unused-vars": "off",
    "unused-imports/no-unused-imports": "warn",
    "unused-imports/no-unused-vars": [
      "warn",
      {
        vars: "all",
        varsIgnorePattern: "^_",
        args: "after-used",
        argsIgnorePattern: "^_",
      },
    ],
  },
};
