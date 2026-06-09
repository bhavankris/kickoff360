// Shared ESLint flat-config preset for the kickoff360 monorepo.
// Usage in a package's eslint.config.js:
//   const { base } = require("@repo/config/eslint-preset");
//   module.exports = [...base];
//
// To enforce the PURITY RULE in packages/core, also spread `corePurity`:
//   const { base, corePurity } = require("@repo/config/eslint-preset");
//   module.exports = [...base, ...corePurity];

const js = require("@eslint/js");
const tseslint = require("typescript-eslint");

const base = [
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    rules: {
      "@typescript-eslint/no-unused-vars": [
        "warn",
        { argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
      ],
      "@typescript-eslint/no-explicit-any": "off",
    },
  },
  {
    ignores: ["dist/**", "lib/**", ".next/**", ".expo/**", "node_modules/**"],
  },
];

// THE PURITY RULE: packages/core may not import any platform SDK.
// Keep core pure TS + React + Firebase JS SDK so web can reuse it 100%.
const corePurity = [
  {
    rules: {
      "no-restricted-imports": [
        "error",
        {
          paths: [
            {
              name: "react-native",
              message:
                "packages/core must stay platform-agnostic (PURITY RULE). Move platform code into apps/* behind a .native.ts/.web.ts adapter.",
            },
            {
              name: "next",
              message: "packages/core must not import next (PURITY RULE).",
            },
            {
              name: "@react-native-async-storage/async-storage",
              message: "Inject persistence from the app; do not import it in core.",
            },
            {
              name: "@react-native-google-signin/google-signin",
              message: "Sign-in is platform code; keep it in apps/* adapters.",
            },
          ],
          patterns: [
            {
              group: ["react-native", "react-native/*", "expo", "expo/*", "expo-*"],
              message:
                "packages/core must stay platform-agnostic (PURITY RULE). No react-native/expo imports.",
            },
          ],
        },
      ],
    },
  },
];

module.exports = { base, corePurity };
