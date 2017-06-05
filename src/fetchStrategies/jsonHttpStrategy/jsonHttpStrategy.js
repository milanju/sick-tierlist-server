const request = require('request-promise-native');

/**
 * @param {string} url Url to fetch the tierlist JSON from.
 * @param {function} parser Function that gets the plain tierlist object and returns
 * a valid tierlist object.
 * 
 * @returns {Promise<Tierlist>} Promise containing the valid plain tierlist object.
 */
function jsonHttpStrategy(url, parser) {
    return request(url).then(body => {
        return parser(JSON.parse(body));
    });
}

module.exports = jsonHttpStrategy;