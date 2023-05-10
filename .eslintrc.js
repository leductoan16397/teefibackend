module.exports = {
  parser: '@typescript-eslint/parser',
  parserOptions: {
    project: 'tsconfig.json',
    tsconfigRootDir: __dirname,
    sourceType: 'module',
  },
  plugins: ['@typescript-eslint/eslint-plugin'],
  extends: [
    'plugin:@typescript-eslint/recommended',
    'plugin:prettier/recommended',
  ],
  root: true,
  env: {
    node: true,
    jest: true,
  },
  ignorePatterns: ['.eslintrc.js'],
  rules: {
    "max-len": ["error", {
      "code": 120,
      "ignoreComments": true,
      "ignoreStrings": true,
      "ignoreUrls": true,
      "ignoreRegExpLiterals": true,
      "ignoreTemplateLiterals": true
    }],
    "@typescript-eslint/no-misused-promises": [
      "error",
      {
        "checksConditionals": true,
        "checksSpreads": true,
        "checksVoidReturn": {
          "arguments": false,
          // "attributes": false,
          // "returns": false,
          // "variables": false,
          // "properties": false

        }
      }
    ],
    "@typescript-eslint/no-unsafe-declaration-merging": "error",
    "@typescript-eslint/no-unnecessary-qualifier": "error",
    "@typescript-eslint/no-non-null-assertion": "error",
    "@typescript-eslint/no-non-null-asserted-nullish-coalescing": "error",
    "@typescript-eslint/no-extra-non-null-assertion": "error",
    "@typescript-eslint/no-empty-interface": "error",
    "@typescript-eslint/no-duplicate-type-constituents": "error",
    "@typescript-eslint/no-duplicate-enum-values": "error",
    "@typescript-eslint/no-empty-function": ["error", { allow: ["constructors"] }],
    '@typescript-eslint/interface-name-prefix': 'off',
    '@typescript-eslint/explicit-function-return-type': 'off',
    '@typescript-eslint/explicit-module-boundary-types': 'off',
    '@typescript-eslint/no-explicit-any': 'off',
    "@typescript-eslint/no-unsafe-enum-comparison": "error",
    "@typescript-eslint/no-useless-empty-export": "error",
    "@typescript-eslint/non-nullable-type-assertion-style": "error",
    "@typescript-eslint/prefer-includes": "error",
    "@typescript-eslint/prefer-optional-chain": "error",
    "@typescript-eslint/prefer-string-starts-ends-with": "error",
    "no-return-await": "off",
    "@typescript-eslint/return-await": "error"
  },
};
