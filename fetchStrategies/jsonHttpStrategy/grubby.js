const jsonHttpStrategy = require('./jsonHttpStrategy');
const apiUrl = 'http://robogrub.com/tierlist_api';

function parser(input) {
    return Object.keys(input).reduce((output, key) => {
        if (!isHeroList(key)) {
            return output;
        }

        return [
            ...output,
            ...input[key].map(item => ({id: item.name, tier: tierToNumber(key)}))
        ];
    }, []);
}

function isHeroList(key) {
    return key.match(/s|t[0-9]/);
}

function tierToNumber(tier) {
    return tier === 's' ? 0 : parseInt(tier[1]);
}

module.exports = jsonHttpStrategy(apiUrl, parser);