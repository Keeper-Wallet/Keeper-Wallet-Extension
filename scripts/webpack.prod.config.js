const WebpackCustomActions = require('./WebpackCustomActionsPlugin');
const clearDist = require('./clearDist');

module.exports = (conf) => {
    return {
        ...conf,
        mode: 'production',
        plugins: [
            ...conf.plugins,
            new WebpackCustomActions({ onBuildStart: [clearDist] })
        ]
    };
};
