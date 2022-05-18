module.exports = {
  root: true,
  env: {
    es6: true,
    browser: true,
    node: true,
  },
  globals: {
    __SENTRY_DSN__: 'readonly',
    __SENTRY_ENVIRONMENT__: 'readonly',
    __SENTRY_RELEASE__: 'readonly',
  },
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaFeatures: {
      jsx: true,
    },
  },
  plugins: ['@typescript-eslint', 'prettier', 'import', 'react', 'react-hooks'],
  settings: {
    react: {
      version: 'detect',
    },
  },
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/eslint-recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:react/recommended',
    'plugin:react-hooks/recommended',
    'plugin:prettier/recommended',
    'prettier',
  ],
  rules: {
    'prefer-const': [
      'error',
      {
        destructuring: 'all',
      },
    ],
    '@typescript-eslint/no-unused-vars': [
      'error',
      { ignoreRestSiblings: true },
    ],
  },
  overrides: [
    {
      files: ['src/lib/*.js', 'scripts/*.js', 'webpack.config.js', 'test/**/*'],
      rules: {
        '@typescript-eslint/no-var-requires': 0,
      },
    },
  ],
};
