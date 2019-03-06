const deck = require('../core/bundle');

Object.assign(
  deck,
  require('@deck.gl/layers'),
  require('@deck.gl/aggregation-layers'),
  require('@deck.gl/geo-layers'),
  require('@deck.gl/mesh-layers'),
  require('@deck.gl/mapbox'),
  require('@deck.gl/json')
);

module.exports = deck;
