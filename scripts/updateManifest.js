const fs = require('fs/promises');
const version = require('./version');

const action = {
  default_title: 'Keeper Wallet',
  default_popup: 'popup.html',
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
};

const manifestV2 = {
  manifest_version: 2,
  browser_action: action,
  background: {
    scripts: ['background.js'],
  },
  web_accessible_resources: ['inpage.js'],
};

const manifestV3 = {
  manifest_version: 3,
  action,
  background: {
    service_worker: 'background.js',
  },
  web_accessible_resources: [
    { resources: ['inpage.js'], matches: ['<all_urls>'] },
  ],
};

const platformValues = {
  chrome: manifestV3,
  edge: manifestV3,
  firefox: {
    ...manifestV2,
    browser_specific_settings: {
      gecko: {
        id: 'support@wavesplatform.com',
      },
    },
  },
  opera: manifestV2,
};

module.exports = (buffer, platformName, to) =>
  fs.writeFile(
    to,
    JSON.stringify(
      {
        ...JSON.parse(buffer.toString('utf-8')),
        version,
        ...platformValues[platformName],
      },
      null,
      2
    )
  );
