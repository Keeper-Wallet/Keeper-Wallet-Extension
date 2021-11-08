const path = require('path');

module.exports = (BUILD_FOLDER, DIST_FOLDER, version) => {
  const conf = {
    chrome: {
      copyFiles: [
        {
          from: path.join(BUILD_FOLDER),
          to: path.join(DIST_FOLDER, 'chrome'),
        },
      ],
      manifest: {
        add: {
          'background.scripts': ['background.js'],
          permissions: [
            'storage',
            'unlimitedStorage',
            'clipboardWrite',
            'idle',
          ],
        },
        remove: ['applications'],
      },
    },
    edge: {
      copyFiles: [
        {
          from: path.join(BUILD_FOLDER),
          to: path.join(DIST_FOLDER, 'edge'),
        },
      ],
      manifest: {
        add: {
          'background.scripts': ['background.js'],
          permissions: [
            'storage',
            'unlimitedStorage',
            'clipboardWrite',
            'idle',
          ],
        },
        remove: [],
      },
    },
    firefox: {
      copyFiles: [
        {
          from: path.join(BUILD_FOLDER),
          to: path.join(DIST_FOLDER, 'firefox'),
        },
      ],
      manifest: {
        add: {
          background: { scripts: ['background.js'] },
          permissions: [
            'storage',
            'unlimitedStorage',
            'clipboardWrite',
            'idle',
          ],
        },
        remove: [],
      },
    },
    opera: {
      copyFiles: [
        {
          from: path.join(BUILD_FOLDER),
          to: path.join(DIST_FOLDER, 'opera'),
        },
      ],
      manifest: {
        add: {
          permissions: [
            'https://*/*',
            'http://*/*',
            'storage',
            'unlimitedStorage',
            'clipboardWrite',
            'clipboardRead',
            'idle',
          ],
          'background.scripts': ['background.js'],
        },
        remove: [],
      },
    },
  };

  for (const browserConf of Object.values(conf)) {
    browserConf.manifest.add.version = version;
  }

  return conf;
};
