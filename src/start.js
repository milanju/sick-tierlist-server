const grubbyStrategy = require('./fetchStrategies/jsonHttpStrategy/grubby');
const fetchTierLists = require('./fetchTierLists');
const deployTierLists = require('./deployTierLists');

/**
 * Every strategy must ba a promise of a valid tierlist json.
 */
const strategies = [
    { slug: 'grubby', name: "Grubby's Tierlist", strategy: grubbyStrategy },
    { slug: 'grubby2', name: "Grubby's Tierlist2", strategy: grubbyStrategy }
];

// Deploy.
const start = () => deployTierLists(fetchTierLists(strategies));

module.exports = start;