import globals from "globals";
import pluginJs from "@eslint/js";

export default [
  { files: ["**/*.js"], languageOptions: { sourceType: "commonjs" } },
  { languageOptions: { globals: globals.browser } },
  pluginJs.configs.recommended,
  {
    rules: {
      "no-undef": "off",
      "no-unused-vars": "warn",
      "no-console": "off",
      "func-names": "off",
      "object-shorthand": "off",
    },
  },
];
