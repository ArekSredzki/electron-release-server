/**
 * Version Service
 */

var _ = require('lodash');
var semver = require('semver');

var VersionService = {};

// Normalize version name
VersionService.normalizeName = function(name) {
  if (name[0] == 'v') name = name.slice(1);
  return name;
};

// Compare two versions
VersionService.compare = function(v1, v2) {
  if (semver.gt(v1.tag, v2.tag)) {
    return -1;
  }
  if (semver.lt(v1.tag, v2.tag)) {
    return 1;
  }
  return 0;
};

module.exports = VersionService;
