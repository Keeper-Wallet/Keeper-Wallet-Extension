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
          /node_modules\/(@waves\/(data-entities|money-like-to-node|node-api-js|ts-lib-crypto))/,
        ],
        loader: 'source-map-loader',
      },
      ...conf.module.rules,
    ],
  },
});

const prodConf = conf => ({
  ...conf,
  devtool: 'source-map',
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
