const deploy = require('./deploy');

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

module.exports = deployTierLists;