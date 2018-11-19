const ncp = require('ncp').ncp;
const updateManifest = require('./updateManifest');
const path = require('path');

module.exports = function (platformName, options) {

    const toCopy = options.copyFiles || [];

    toCopy.forEach(({ from, to }) => {
        ncp(from, to, function (err) {
            if (err) {
                return console.error(err);
            }
            const version = updateManifest(path.join(from, 'manifest.json'), options.manifest, path.join(to, 'manifest.json'));
            console.log(`${platformName}: ${version} file compile done!`);
        });
    });
};

