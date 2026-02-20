module.exports = {
  plugins: [
    [
      'postcss-preset-env',
      {
        enableClientSidePolyfills: false,
        autoprefixer: false,
      },
    ],
    'postcss-normalize',
  ],
};
