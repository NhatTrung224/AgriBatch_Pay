import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    // The documentation site is a separate npm project with its own toolchain.
    // Its dependencies live in docs-site/node_modules, which the root install
    // never creates, so linting it from here only produces resolution errors.
    "docs-site/**",
  ]),
]);

export default eslintConfig;
