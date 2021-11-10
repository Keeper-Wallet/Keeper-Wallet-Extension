const conf = require('./scripts/webpack.config');
const prodConf = require('./scripts/webpack.prod.config');
const defConf = require('./scripts/webpack.dev.config');
const getVersion = require('./scripts/getVersion');

module.exports = () => {
  const version = getVersion();
  if (!version) {
    throw 'Build failed';
  }
  const isProduction = process.env.NODE_ENV === 'production';
  const configFn = isProduction ? prodConf : defConf;
  return configFn({
    ...conf({
      version,
      DIST: 'dist',
      PLATFORMS: ['chrome', 'firefox', 'opera', 'edge'],
      LANGS: ['en'],
      PAGE_TITLE: 'Waves Keeper',
      isProduction,
    }),
  });
};
