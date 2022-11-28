module.exports = {
  plugins: [
    [
      'postcss-preset-env',
      { enableClientSidePolyfills: false, preserve: true },
    ],
    'postcss-normalize',
  ],
};
