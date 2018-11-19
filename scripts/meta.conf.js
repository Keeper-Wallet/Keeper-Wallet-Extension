const path = require('path');

module.exports = (BUILD_FOLDER, DIST_FOLDER, version) => {

    const conf = {
        chrome: {
            copyFiles: [
                {
                    from: path.join(BUILD_FOLDER),
                    to: path.join(DIST_FOLDER, 'chrome')
                }
            ],
            manifest: {
                add: {
                    'background.scripts': ['background.js']
                },
                remove: ['applications']
            }
        },
        edge: {
            copyFiles: [
                {
                    from: path.join(BUILD_FOLDER),
                    to: path.join(DIST_FOLDER, 'edge')
                }
            ],
            manifest: {
                add: {
                    'background.scripts': ['background.js']
                },
                remove: []
            }
        },
        firefox: {
            copyFiles: [
                {
                    from: path.join(BUILD_FOLDER),
                    to: path.join(DIST_FOLDER, 'firefox')
                }
            ],
            manifest: {
                add: {
                    'background.scripts': ['background.js']
                },
                remove: []
            }

        },
        opera: {
            copyFiles: [
                {
                    from: path.join(BUILD_FOLDER),
                    to: path.join(DIST_FOLDER, 'opera')
                }
            ],
            manifest: {
                add: {
                    'permissions': ['storage', 'tabs', 'clipboardWrite', 'clipboardRead'],
                    'background.scripts': ['background.js']
                },
                remove: []
            }
        },
    };

    for (const browserConf of Object.values(conf)) {
        console.log(browserConf);
        browserConf.manifest.add.version = version;
    }

    console.log(conf);

    return conf;
};
