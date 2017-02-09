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

VersionService.destroy = function(version, req) {
  var deletePromises = _.map(version.assets, function(asset) {
    return Promise.join(
      AssetService.destroy(asset, req),
      AssetService.deleteFile(asset),
      function() {
        sails.log.info('Destroyed asset: ', asset);
      });
  });

  return Promise.all(deletePromises)
    .then(function allDeleted() {
      return Version.destroy(pk)
        .then(function destroyedRecord() {

          if (sails.hooks.pubsub) {
            Version.publishDestroy(
              pk, !req._sails.config.blueprints.mirror && req, {
                previous: version
              }
              );

            if (req.isSocket) {
              Version.unsubscribe(req, version);
              Version.retire(version);
            }
          }

          sails.log.info('Destroyed version: ', version);
        });
    });
}

module.exports = VersionService;
