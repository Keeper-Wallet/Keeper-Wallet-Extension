var request = require('request');

var options = { method: 'GET',
    url: 'https://api.lokalise.co/api2/projects/371458875c7d357054bbd8.44472567/files',
    qs:
        { filter_filename: '{filter_filename}',
            limit: '{limit}',
            page: '{page}' },
    headers: { 'x-api-token': '' } };

request(options, function (error, response, body) {
    if (error) throw new Error(error);

    console.log(body);
});
