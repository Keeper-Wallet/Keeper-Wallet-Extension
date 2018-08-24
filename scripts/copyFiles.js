const ncp = require('ncp').ncp;
const fs = require('fs');
const path = require('path');

module.exports = function (platformName, options) {

    const toCopy = options.copyFiles || [];

    toCopy.forEach(({ from, to }) => {
        ncp(from, to, function (err) {
            if (err) {
                return console.error(err);
            }
            updateManifest(path.join(from, 'manifest.json'), options.manifest, path.join(to, 'manifest.json'));
            console.log(`${platformName}: file copy done!`);
        });
    });
};

function updateManifest(path, options = {}, to) {
    const data = JSON.parse(fs.readFileSync(path));
    const remove = options.remove || [];
    const add = options.add || [];

    remove.forEach((jsonPath) => {
        let currentData = data;
        const arrayPath = jsonPath.split('.');
        const path = arrayPath.slice(0, -1);
        const key = arrayPath[path.length];
        for (const key of path) {
            currentData = currentData[key];
        }
        delete currentData[key];
    });

    Object.entries(add).forEach(([jsonPath, jsonObject]) => {
        let currentData = data;
        const arrayPath = jsonPath.split('.');
        const path = arrayPath.slice(0, -1);
        const key = arrayPath[path.length];
        for (const key of path) {
            currentData = currentData[key];
        }

        currentData[key] = jsonObject;
    });
    if(fs.existsSync(to)) {
        fs.unlinkSync(to);
    }
    fs.writeFileSync(to, JSON.stringify(data, null, 4));
}
