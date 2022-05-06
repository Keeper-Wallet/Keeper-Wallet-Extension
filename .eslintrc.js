module.exports = {
  root: true,
  env: {
    es6: true,
  },
  parser: '@typescript-eslint/parser',
  plugins: [
    '@typescript-eslint',
    'prettier',
  ],
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/eslint-recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:prettier/recommended',
  ],

  rules: {
    'no-useless-escape': 'off',
    'prefer-const': ["error", {
      "destructuring": "all",
    }],
    'no-case-declarations': 'off',
    'no-extra-boolean-cast': 'off',
    '@typescript-eslint/no-empty-function': 'off',
    '@typescript-eslint/ban-types': 'off',
    '@typescript-eslint/no-explicit-any': 'off',
    '@typescript-eslint/no-unused-vars': 'off',
    '@typescript-eslint/no-empty-interface': 'off',
  },
};
