import js from "@eslint/js";
import globals from "globals";
import tseslint from "typescript-eslint";
import { defineConfig } from "eslint/config";

export default defineConfig([
  { files: ["**/*.{js,mjs,cjs,ts,mts,cts}"], plugins: { js }, extends: ["js/recommended"], languageOptions: { globals: globals.node } },
  tseslint.configs.recommended,
  // The gateway and every service are deployed on their own, so no file may import
  // anything outside its own folder. Talk to another service over HTTP (see clients/).
  {
    files: ["gateway/*.js", "services/*/*.js"],
    rules: {
      "no-restricted-imports": ["error", {
        patterns: [{ regex: "^\\.\\./", message: "Don't import outside this service's folder. Call the other service over HTTP." }],
      }],
    },
  },
  {
    files: ["services/*/*/*.js"],
    rules: {
      "no-restricted-imports": ["error", {
        patterns: [{ regex: "^\\.\\./\\.\\./", message: "Don't import outside this service's folder. Call the other service over HTTP." }],
      }],
    },
  },
  { ignores: ["**/node_modules/**"] },
]);
