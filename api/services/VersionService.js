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

/**
 * Deletes a version from the database.
 * @param   {Object}  version The versions record object from sails
 * @param   {Object}  req     Optional: The request object
 * @returns {Promise}         Resolved once the version is destroyed
 */
VersionService.destroy = (version, req) => {
  if (!version) {
    throw new Error('You must pass a version');
  }

  return Version
    .destroy(version.id)
    .then(() => {
      if (sails.hooks.pubsub) {
        Version.publishDestroy(
          version.id, !req._sails.config.blueprints.mirror && req, {
            previous: version
          }
        );

        if (req && req.isSocket) {
          Version.unsubscribe(req, version);
          Version.retire(version);
        }
      }
    });
};

module.exports = VersionService;
