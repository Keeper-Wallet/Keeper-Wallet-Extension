const path = require('path');
const WebpackCustomActions = require('./scripts/WebpackCustomActionsPlugin');
const clearDist = require('./scripts/clearDist');
const conf = require('./scripts/webpack.config');
const getVersion = require('./scripts/getVersion');

const devConf = conf => ({
  ...conf,
  devtool: 'cheap-module-inline-source-map',
  module: {
    ...conf.module,
    rules: [
      {
        enforce: 'pre',
        test: /\.js$/,
        exclude: [
          'long',
          '@waves/data-entities',
          '@waves/money-like-to-node',
          '@waves/node-api-js',
          '@waves/ts-lib-crypto',
        ].map(
          moduleName =>
            new RegExp(path.join(__dirname, 'node_modules', moduleName))
        ),
        loader: 'source-map-loader',
      },
      ...conf.module.rules,
    ],
  },
});

const prodConf = conf => ({
  ...conf,
  devtool: 'source-map',
  plugins: [
    ...conf.plugins,
    new WebpackCustomActions({ onBuildStart: [clearDist] }),
  ],
});

module.exports = () => {
  const version = getVersion();
  if (!version) {
    throw 'Build failed';
  }
  const isProduction = process.env.NODE_ENV === 'production';
  const configFn = isProduction ? prodConf : devConf;
  return configFn({
    ...conf({
      version,
      DIST: 'dist',
      PLATFORMS: ['chrome', 'firefox', 'opera', 'edge'],
      LANGS: ['en'],
      PAGE_TITLE: 'Keeper Wallet',
      isProduction,
    }),
  });
};
