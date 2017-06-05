const request = require('request-promise-native');

function jsonHttpStrategy(url, parser) {
    return request(url).then(body => {
        return parser(JSON.parse(body));
    });
}

module.exports = jsonHttpStrategy;