const fs = require('fs');
const { execSync } = require('child_process');
const path  = require('path');
const DIST = './dist/edge';
const EXT_DIST = './dist';
const DIST_PATH = path.resolve(DIST);
const ROOT_PATH = path.resolve(EXT_DIST);
const distUtil = 'manifoldjs';

const PACKAGE_IDENTITY_NAME = '60844WavesPlatform.WavesKeeper';
const PACKAGE_IDENTITY_PUBLISHER = '4268AF7A-13B3-4B08-923A-DF5F6D92E653';
const PUBLISHER_NAME = 'WavesPlatform';
const NAME = 'WavesKeeper';

const REPLACE_PATTERN = {
    "0.1.1.0": "1.1.0.0", //TODO delete after first release
    "INSERT-YOUR-PACKAGE-IDENTITY-NAME-HERE": PACKAGE_IDENTITY_NAME,
    "INSERT-YOUR-PACKAGE-IDENTITY-PUBLISHER-HERE": PACKAGE_IDENTITY_PUBLISHER,
    "INSERT-YOUR-PACKAGE-PROPERTIES-PUBLISHERDISPLAYNAME-HERE": PUBLISHER_NAME,
    "<Resource Language=\"ru\" />": '',
    "<!-- UPDATE PUBLISHER DISPLAY NAME -->": '',
    "<!-- UPDATE IDENTITY -->": '',
    "__MSG_appName__": "Waves Keeper",
    "__MSG_appDescription__": "Manage your private keys securely",
};

const ICONS = [
    {
        name: 'StoreLogo.png',
        size: 50,
    },
    {
        name: 'Square150x150Logo.png',
        size: 150,
    },
    {
        name: 'Square44x44Logo.png',
        size: 44,
    }
];

if (fs.existsSync(`${DIST_PATH}/_locales/index.json`)) {
    execSync(`rm ${DIST_PATH}/_locales/index.json`);
}
try {
    execSync(`${distUtil} -s ${NAME} -d ${ROOT_PATH} -l debug -p edgeextension -f edgeextension -m ${DIST_PATH}/manifest.json`);

    const packDir = path.resolve(path.join(ROOT_PATH, NAME, '/edgeextension/manifest'));

    const manifestXML = fs.readFileSync(`${packDir}/appxmanifest.xml`);
    const manifestReady = Object.entries(REPLACE_PATTERN).reduce((acc, [key, replacer]) => replaceAll(acc, key, replacer), manifestXML.toString());
    fs.writeFileSync(`${packDir}/appxmanifest.xml`, manifestReady);

    const manifestJson = fs.readFileSync(`${packDir}/Extension/manifest.json`);
    const manifestJsonReady = Object.entries(REPLACE_PATTERN).reduce((acc, [key, replacer]) => replaceAll(acc, key, replacer), manifestJson.toString());


    fs.writeFileSync(`${packDir}/Extension/manifest.json`, manifestJsonReady);

    ICONS.forEach(({name, size}) => {
        const from = `${packDir}/Extension/images/icon_${size}.png`;
        const to = `${packDir}/Assets/${name}`;
        fs.copyFileSync(from, to);
    });

    execSync(`${distUtil} -s ${NAME} -d ${ROOT_PATH} -l debug -p edgeextension package ${packDir}`);

    const appXpath = path.resolve(path.join(ROOT_PATH, NAME, '/edgeextension/package'));

    fs.copyFileSync(path.join(appXpath, 'edgeExtension.appx'), path.join(ROOT_PATH, 'edgeExtension.appx'));

    execSync(`rm -rf ${path.join(ROOT_PATH, NAME)}`);
} catch (e) {
    console.error('No Edge Package build');
}


function replaceAll(str, search, replacement) {
    try {
        return str.replace(new RegExp(search, 'g'), replacement);
    } catch (e) {
        return str;
    }
}
