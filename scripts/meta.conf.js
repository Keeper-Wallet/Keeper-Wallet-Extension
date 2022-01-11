module.exports = version => {
  const conf = {
    chrome: {
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
