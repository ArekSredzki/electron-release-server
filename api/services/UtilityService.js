/**
 * A simple service for making reusable helper functions globaly available yet
 * namespaced
 */

var _ = require('lodash');

var UtilityService = {};

UtilityService.getTruthyObject = function(object) {
  return _.pickBy(object, _.identity);
};

module.exports = UtilityService;
