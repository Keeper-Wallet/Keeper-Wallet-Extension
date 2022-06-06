module.exports = version => {
  const conf = {
    chrome: {
      manifest: {
        add: {},
        remove: ['applications'],
      },
    },
    edge: {
      manifest: {
        add: {},
        remove: ['applications'],
      },
    },
    firefox: {
      manifest: {
        add: {
          manifest_version: 2,
          browser_action: {
            default_icon: {
              16: 'images/icon_16.png',
              24: 'images/icon_24.png',
              32: 'images/icon_32.png',
              48: 'images/icon_48.png',
              64: 'images/icon_64.png',
              96: 'images/icon_96.png',
              128: 'images/icon_128.png',
              192: 'images/icon_192.png',
              256: 'images/icon_256.png',
              512: 'images/icon_512.png',
            },
            default_title: 'Keeper Wallet',
            default_popup: 'popup.html',
          },
          web_accessible_resources: ['inpage.js'],
          'background.scripts': ['background.js'],
        },
        remove: [
          'background.service_worker',
          'action',
          'content_security_policy',
        ],
      },
    },
    opera: {
      manifest: {
        add: {
          permissions: [
            'https://*/*',
            'http://*/*',
            'alarms',
            'storage',
            'unlimitedStorage',
            'clipboardWrite',
            'clipboardRead',
            'idle',
          ],
        },
        remove: ['applications'],
      },
    },
  };

  for (const browserConf of Object.values(conf)) {
    browserConf.manifest.add.version = version;
  }

  return conf;
};
