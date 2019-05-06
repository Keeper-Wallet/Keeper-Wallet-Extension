const package = require('../package');


module.exports = () => {
    const currentVersion = package.version;
    const newVersion = process.env.NODE_ENV_VER;
    const isValidCurrentVersion = isValidVersion(currentVersion);

    if (!newVersion && isValidCurrentVersion) {
        console.log('\x1b[92mCurrent version: \x1b[4m\x1b[33m%s\x1b[0m', currentVersion);
        return currentVersion;
    }

    if (!newVersion) {
        console.error(`\x1b[31mInvalid current version: ${currentVersion}\x1b[0m`);
        return null;
    }

    if (!isValidVersion(newVersion)) {
        console.error(`\x1b[31mInvalid new version: ${newVersion}\x1b[0m`);
        return null;
    }

    if (!isUpdatedVersion(currentVersion, newVersion)) {
        console.error(`\x1b[31mInvalid new version \x1b[32m${newVersion}\x1b[31m, version can be more than \x1b[32m${currentVersion}\x1b[0m`);
        return null
    }
    console.log('\x1b[34mNew version: \x1b[4m\x1b[32m%s\x1b[0m', newVersion);

    return newVersion;
};



const isValidVersion = (version) => {
    if (!version || typeof version !== 'string') {
        return false;
    }

    return !version
        .split('.')
        .map(char => char ? Number(char) : NaN)
        .some((number) => isNaN(number));
};

const isUpdatedVersion = (currentVersion, newVersion) => {
    const versionAsArrNew = newVersion.split('.').map(Number);
    const versionAsArrCur = currentVersion.split('.').map(Number);
    return versionAsArrCur.some( (num, index) => num < versionAsArrNew[index]);
};
