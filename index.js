const grubbyStrategy = require('./fetchStrategies/jsonHttpStrategy/grubby');
const deploy = require('./deploy');

/**
 * Every strategy must ba a promise of a valid tierlist json.
 */
const strategies = [
    { slug: 'grubby', name: "Grubby's Tierlist", strategy: grubbyStrategy },
    { slug: 'grubby2', name: "Grubby's Tierlist2", strategy: grubbyStrategy }
];

// Deploy.
deployTierLists(fetchTierLists(strategies));

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

function deployTierLists(tierListPromises) {
    Promise.all(tierListPromises)
        .then(tierlists => {
            return tierlists.reduce((output, tierlist) => {
                return tierlist ? [...output, tierlist] : output;
            }, []);
        })
        .then(finalTierlists => {
            return deploy(finalTierlists)
        })
        .then(() => {
            console.log('Successfully deployed new tierlists.');
        })
        .catch(err => {
            console.error('Failed deploying new tierlists: ', err);
        });
}

function validateTierListJson(json) {
    return json.heroes.length > 10;
}