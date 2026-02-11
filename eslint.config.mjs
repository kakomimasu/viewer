import nextCoreWebVitals from "eslint-config-next/core-web-vitals";
// import nextTypescript from 'eslint-config-next/typescript' // TODO: 有効にしたい

const config = [
  ...nextCoreWebVitals,
  // ...nextTypescript,
  {
    ignores: [".next/**", "out/**", "build/**", "next-env.d.ts"],
    rules: {
      "react-hooks/set-state-in-effect": "warn",
      "react-hooks/preserve-manual-memoization": "warn",
      // '@typescript-eslint/triple-slash-reference': 'warn',
      // '@typescript-eslint/no-empty-object-type': 'warn',
      // '@typescript-eslint/no-explicit-any': 'warn',
      // '@typescript-eslint/no-empty-object-type': 'warn',
      // 'prefer-const': 'warn',
      // 'import/no-anonymous-default-export': 'off',
    },
  },
];

export default config;
