const conf = require('./scripts/webpack.config');
const prodConf = require('./scripts/webpack.prod.config');
const defConf = require('./scripts/webpack.dev.config');
const getVersion = require('./scripts/getVersion');

const DIST = 'dist';
const LANGS = ['en'];
const PAGE_TITLE = 'Waves Keeper';
const PLATFORMS = ['chrome', 'firefox', 'opera', 'edge'];

module.exports = () => {
    const version = getVersion();
    if (!version) {
        throw 'Build failed';
    }
    const isProduction = process.env.NODE_ENV === 'production';
    const configFn = isProduction ? prodConf : defConf;
    return configFn(
        {
            ...conf({
                version,
                DIST,
                PLATFORMS,
                LANGS,
                I18N_API,
                PAGE_TITLE,
                isProduction,
            })
        });
};
