/* eslint-disable @typescript-eslint/no-var-requires */
const request = require('request');
const https = require('https');
const fs = require('fs');
const unZipper = require('unzipper');
let lokaliseApiKey;

try {
  const private_config = require('../config.json');
  lokaliseApiKey = private_config.lokaliseApiKey;
} catch (e) {
  lokaliseApiKey = null;
}

const options = {
  method: 'POST',
  url: 'https://api.lokalise.co/api2/projects/371458875c7d357054bbd8.44472567/files/download',
  headers: {
    'x-api-token': lokaliseApiKey,
    'content-type': 'application/json',
  },
  body: { format: 'json', original_filenames: true },
  json: true,
};

function getLocales(locales = [], path = './') {
  if (!lokaliseApiKey) {
    console.error('\n\x1b[31mNo exist localise api key!!!\n');
    return Promise.resolve();
  }

  return new Promise(resolve => {
    function onError(error) {
      console.error('\n\x1b[31mDownload lokalise error', error, '\n');
      resolve();
    }

    function onDone() {
      console.log('\n\x1b[92mDownload lokalise done...', '\n');
      resolve();
    }

    request(options, function (error, response, body) {
      if (error) {
        return onError(error);
      }

      const { bundle_url } = body;

      getFile(bundle_url, locales, path).then(onDone).catch(onError);
    });
  });
}

function getFile(url, locales, path) {
  const parse = res => {
    return unzipFile(res, locales, path);
  };

  return new Promise((resolve, reject) => {
    const request = https.get(url, parse);
    request.on('close', resolve);
    request.on('error', reject);
  });
}

function unzipFile(response, locales, path) {
  return (
    response &&
    response.pipe(unZipper.Parse()).on('entry', function (entry) {
      const fileName = entry.path;
      const type = entry.type; // 'Directory' or 'File'

      const existLocales = locales.filter(lang =>
        fileName.includes(`${lang}/`)
      );

      if (!existLocales.length) {
        console.warn('[skip lang]', fileName);
        return entry;
      }

      if (type === 'Directory') {
        const name = `${path}/${fileName}`;

        if (!fs.existsSync(name)) {
          fs.mkdirSync(name);
        }

        return entry;
      }

      console.log('[get lang]', fileName);
      return entry.pipe(fs.createWriteStream(`${path}/${fileName}`));
    })
  );
}

module.exports = getLocales;
