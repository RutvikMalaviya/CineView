import js from "@eslint/js";
import tseslint from "typescript-eslint";
import boundaries from "eslint-plugin-boundaries";

export default tseslint.config(
  {
    ignores: ["dist/**", "node_modules/**", "coverage/**", "**/*.cjs"],
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    plugins: {
      boundaries,
    },
    settings: {
      "boundaries/include": ["src/**/*.ts"],
      "boundaries/elements": [
        { type: "app", pattern: "src/app.ts" },
        { type: "server", pattern: "src/server.ts" },
        { type: "config", pattern: "src/config/**" },
        { type: "db", pattern: "src/db/**" },
        { type: "jobs", pattern: "src/jobs/**" },
        { type: "shared", pattern: "src/shared/**" },
        {
          type: "feature-public",
          pattern: "src/features/*/index.ts",
          capture: ["featureName"],
        },
        {
          type: "feature-internal",
          pattern: "src/features/*/**",
          capture: ["featureName"],
        },
      ],
    },
    rules: {
      "@typescript-eslint/no-unused-vars": [
        "error",
        { argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
      ],
      "@typescript-eslint/no-explicit-any": "warn",
      "boundaries/element-types": [
        "error",
        {
          default: "disallow",
          rules: [
            { from: "server", allow: ["app", "config", "db", "jobs", "shared"] },
            { from: "app", allow: ["config", "shared", "feature-public"] },
            { from: "jobs", allow: ["config", "db", "shared", "feature-public"] },
            { from: "db", allow: ["config", "shared", "feature-public"] },
            { from: "config", allow: ["shared"] },
            { from: "shared", allow: ["shared", "config"] },
            {
              from: ["feature-public", "feature-internal"],
              allow: [
                "shared",
                "config",
                "feature-public",
                ["feature-internal", { featureName: "${from.featureName}" }],
              ],
            },
          ],
        },
      ],
    },
  },
);
