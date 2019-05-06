const conf = require('./scripts/webpack.config');
const prodConf = require('./scripts/webpack.prod.config');
const defConf = require('./scripts/webpack.dev.config');
const getVersion = require('./scripts/getVersion');
const buildConfig = require('./init_config.json');

const config = { ...buildConfig };

const DIST = config.DIST || 'dist';
const LANGS = config.LANGS || ['en'];
const PAGE_TITLE = config.PAGE_TITLE || 'Waves Keeper';
const PLATFORMS = config.PLATFORMS || ['chrome', 'firefox', 'opera', 'edge'];

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
                PAGE_TITLE,
                isProduction,
            })
        });
};
