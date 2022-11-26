const path = require('path');
const { zip } = require('zip-a-folder');
const version = require('./version');
const platforms = require('./platforms.json');

const DIST_FOLDER = path.resolve(__dirname, '..', 'dist');

platforms.forEach(async platformName => {
  await zip(
    path.resolve(DIST_FOLDER, platformName),
    path.resolve(DIST_FOLDER, `keeper-wallet-${version}-${platformName}.zip`)
  );
});
