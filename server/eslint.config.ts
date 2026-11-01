import js from "@eslint/js";
import globals from "globals";
import tseslint from "typescript-eslint";
import { defineConfig } from "eslint/config";

export default defineConfig([
  { files: ["**/*.{js,mjs,cjs,ts,mts,cts}"], plugins: { js }, extends: ["js/recommended"], languageOptions: { globals: globals.node } },
  tseslint.configs.recommended,
  {
    // A service's models, controllers and services are private. Other code must use its client.js.
    rules: {
      "no-restricted-imports": ["error", {
        patterns: [{
          regex: "^(\\.\\./)+(.+/)?[^/.][^/]*/(models|controllers|services)/",
          message: "Don't import another service's internals. Use its client.js instead.",
        }],
      }],
    },
  },
]);
