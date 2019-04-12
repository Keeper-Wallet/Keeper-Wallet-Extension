const request = require('request');
const config = require('../config.json');
const https = require('https');
const fs = require('fs');
const unzipper = require('unzipper');


var options = { method: 'POST',
    url: 'https://api.lokalise.co/api2/projects/371458875c7d357054bbd8.44472567/files/download',
    headers: { 'x-api-token': config.lokaliseApiKey, 'content-type': 'application/json' },
    body: { format: 'json', original_filenames: true },
    json: true,
};

function getLocales(locales = [], path = './') {
    return new Promise(resolve => {

        function onError(error) {
            console.error('Download lokalise error', error);
            resolve();
        }

        function onDone() {
            console.log('Download lokalise done...');
            resolve();
        }

        request(options, function (error, response, body) {
            if (error) {
                return onError(error);
            }

            getFile(body.bundle_url, locales, path)
                .then(onDone)
                .catch(onError);
        });
    });
}


function getFile(url, locales, path) {
    const parse = res => {
        unzipFile(res, locales, path);
    };

    return new Promise((resolve, reject) => {
         const request = https.get(url, parse);
         request.on('close', resolve);
         request.on('error', reject);
     });
}

function unzipFile(response, locales, path ) {
    return response && response.pipe(unzipper.Parse())
        .on('entry', function (entry) {
            var fileName = entry.path;
            var type = entry.type; // 'Directory' or 'File'

            const existLocales = locales.filter(lang => fileName.includes(`${lang}/`));

            if (!existLocales.length) {
                console.warn('[skip lang]', fileName);
                return;
            }

            if (type === 'Directory') {
                const name = `${path}/${fileName}`;

                if (!fs.existsSync(name)) {
                    fs.mkdirSync(name);
                }

                return;
            }

            console.log('[get lang]', fileName);
            entry.pipe(fs.createWriteStream(`${path}/${fileName}`));
        });
}

module.exports = getLocales;
