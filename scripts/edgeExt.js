const fs = require('fs');
const { execSync } = require('child_process');
const path  = require('path');
const DIST = './dist/edge';
const EXT_DIST = './dist';
const DIST_PATH = path.resolve(DIST);
const ROOT_PATH = path.resolve(EXT_DIST);
const distUtil = 'manifoldjs';

const NAME = 'WavesKeeper';
const PUBLISHER = 'WavesPlatform';

const REPLACE_PATTERN = {
    "Version=\"0.1.0.3\"": "Version=\"0.0.0.0\"", //TODO delete after first release
    "INSERT-YOUR-PACKAGE-IDENTITY-NAME-HERE": NAME,
    "INSERT-YOUR-PACKAGE-IDENTITY-PUBLISHER-HERE": PUBLISHER,
    "INSERT-YOUR-PACKAGE-PROPERTIES-PUBLISHERDISPLAYNAME-HERE": PUBLISHER,
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

execSync(`${distUtil} -s ${NAME} -d ${ROOT_PATH} -l debug -p edgeextension -f edgeextension -m ${DIST_PATH}/manifest.json`);

const packDir = path.resolve(path.join(ROOT_PATH, NAME, '/edgeextension/manifest'));

const manifestXML = fs.readFileSync(`${packDir}/appxmanifest.xml`);
const manifestReady = Object.entries(REPLACE_PATTERN).reduce((acc, [key, replacer]) => replaceAll(acc, key, replacer), manifestXML.toString());
fs.writeFileSync(`${packDir}/appxmanifest.xml`, manifestReady);

const manifestJson =  fs.readFileSync(`${packDir}/Extension/manifest.json`);
const manifestJsonReady = Object.entries(REPLACE_PATTERN).reduce((acc, [key, replacer]) => replaceAll(acc, key, replacer), manifestJson.toString());


fs.writeFileSync(`${packDir}/Extension/manifest.json`, manifestJsonReady);

ICONS.forEach(({ name, size }) => {
    const from = `${packDir}/Extension/images/icon_${size}.png`;
    const to = `${packDir}/Assets/${name}`;
    fs.copyFileSync(from, to);
});

execSync(`${distUtil} -s ${NAME} -d ${ROOT_PATH} -l debug -p edgeextension package ${packDir}`);

const appXpath = path.resolve(path.join(ROOT_PATH, NAME, '/edgeextension/package'));

fs.copyFileSync(path.join(appXpath, 'edgeExtension.appx'), path.join(ROOT_PATH, 'edgeExtension.appx'));

execSync(`rm -rf ${path.join(ROOT_PATH, NAME)}`);

function replaceAll(str, search, replacement) {
    try {
        return str.replace(new RegExp(search, 'g'), replacement);
    } catch (e) {
        return str;
    }
}
