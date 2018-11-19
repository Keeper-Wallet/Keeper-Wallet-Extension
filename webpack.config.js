const conf = require('./scripts/webpack.config');
const prodConf = require('./scripts/webpack.prod.config');
const defConf = require('./scripts/webpack.dev.config');
const getVersion = require('./scripts/getVersion');

const DIST = 'dist';
const LANGS = ['ru', 'en'];
const PAGE_TITLE = 'Waves Keeper';
const PLATFORMS = ['chrome', 'firefox', 'opera', 'edge'];
const I18N_API = 'https://api.locize.io/30ffe655-de56-4196-b274-5edc3080c724/latest';

module.exports = () => {
    const version = getVersion();
    if (!version) {
        throw 'Build failed';
    }
    const configFn = process.env.NODE_ENV === 'production' ? prodConf : defConf;
    const config = configFn(
        {
            ...conf({
                version,
                DIST,
                PLATFORMS,
                LANGS,
                I18N_API,
                PAGE_TITLE,
            })
        });

    return config;
};
