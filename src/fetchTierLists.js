function fetchTierLists(strategies) {
    return strategies.map((strategyInfo) => {
        return strategyInfo.strategy
            .then(json => {
                console.log('--- ', strategyInfo.name, ' ---');
                console.log('Fetching tierlist.');

                const tierList = {
                    name: strategyInfo.name,
                    heroes: json
                };

                if (!validateTierListJson(tierList)) {
                    return Promise.reject('invalid tierlist JSON');
                }

                return tierList;
            })
            .catch(err => {
                console.error('Error fetching new tierlist: ', err);
            });
    });
}

function validateTierListJson(json) {
    return json.heroes.length > 10;
}

module.exports = fetchTierLists;