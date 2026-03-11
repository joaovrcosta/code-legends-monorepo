import unusedImports from "eslint-plugin-unused-imports";

export default [
  {
    ignores: ["**/node_modules/**", ".next/**"],
  },
  {
    plugins: {
      "unused-imports": unusedImports,
    },
    rules: {
      // Desabilita regras padrão que conflitam
      "@typescript-eslint/no-unused-vars": "off",
      "no-unused-vars": "off",

      // Regras do plugin unused-imports
      "unused-imports/no-unused-imports": "error",
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
  },
];
