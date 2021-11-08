const ncp = require('ncp').ncp;
const updateManifest = require('./updateManifest');
const path = require('path');
const zipFolder = require('./zipFolder');

module.exports = function (platformName, options, isProduction, onEnd) {
  const toCopy = options.copyFiles || [];

  toCopy.forEach(({ from, to }) => {
    ncp(from, to, function (err) {
      if (err) {
        return console.error(err);
      }
      const version = updateManifest(
        path.join(from, 'manifest.json'),
        options.manifest,
        path.join(to, 'manifest.json')
      );

      isProduction ? zipFolder(to, `${to}.zip`) : null;
      console.log(`${platformName}: ${version} file compile done!`);
      onEnd();
    });
  });
};
