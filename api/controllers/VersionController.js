/**
 * VersionController
 *
 * @description :: Server-side logic for handling version requests
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

var actionUtil = require('sails/lib/hooks/blueprints/actionUtil');
var url = require('url');
var Promise = require('bluebird');
var semver = require('semver');

module.exports = {

  /**
   * Redirect the update request to the appropriate endpoint
   * (GET /update)
   * (GET /:application/update)
   */
  redirect: function(req, res) {
    var platform = req.param('platform');
    var version = req.param('version');
    var application = req.param('application');

    if (!application) {
      return res.badRequest('Requires "application" parameter');
    }
    if (!version) {
      return res.badRequest('Requires "version" parameter');
    }
    if (!platform) {
      return res.badRequest('Requires "platform" parameter');
    }

    return res.redirect('/' + application + '/update/' + platform + '/' + version);
  },

  /**
   * Serves auto-updates: Status and Squirrel.Mac
   *
   * Assumes stable channel unless specified
   *
   * (GET /:application/update/:platform/:version/:channel)
   */
  general: function(req, res) {
    var platform = req.param('platform');
    var application = req.param('application') || sails.config.miscellaneous.defaultApp;
    var version = req.param('version');
    var channel = req.param('channel') || 'stable';

    if (!application) {
      return res.badRequest('Requires `application` parameter');
    }

    if (!version) {
      return res.badRequest('Requires `version` parameter');
    }

    if (!platform) {
      return res.badRequest('Requires `platform` parameter');
    }

    var platforms = PlatformService.detect(platform, true);

    sails.log.debug('Update Search Query', {
      platform: platforms,
      application: application,
      version: version,
      channel: channel
    });

    // Get specified version object, it's time will be used for the general
    // cutoff.
    Version
      .findOne({name: version, application: application})
      .then(function(currentVersion) {

        var applicableChannels, createdAtFilter;

        applicableChannels = ChannelService.getApplicableChannels(channel);
        sails.log.debug('Applicable Channels', applicableChannels);

        if (currentVersion) {
          createdAtFilter = {
            '>': currentVersion.createdAt
          };
        } else {
          sails.log.debug('The specified `version` does not exist');
        }

        sails.log.debug('Time Filter', createdAtFilter);

        return Version
          .find(UtilityService.getTruthyObject({
            application: application,
            channel: applicableChannels,
            createdAt: createdAtFilter
          }))
          .populate('assets', {
            platform: platforms
          })
          .then(function(newerVersions) {
            // Sort versions which were added after the current one by semver in
            // descending order.
            newerVersions.sort(UtilityService.compareVersion);

            var latestVersion;
            sails.log.debug('Newer Versions', newerVersions);

            var releaseNotes = _.reduce(
              newerVersions,
              function(prevNotes, newVersion) {

                newVersion.assets = _.filter(newVersion.assets, function(asset) {
                  return asset.filetype === '.zip';
                });

                // If one of the assets for this verison apply to our desired
                // platform then we will skip this version
                if (!newVersion.assets.length) {
                  return prevNotes;
                }

                if (!latestVersion && semver.lt(version, newVersion.name)) {
                  latestVersion = newVersion;
                }

                // Skip if no notes available for this version
                if (!newVersion.notes || !newVersion.notes.length) {
                  return prevNotes;
                }

                // If not the first changenote, prefix with new line
                var newChangeNote = !prevNotes.length ? '' : '\n';

                newChangeNote += '## ' + newVersion.name + '\n' + newVersion.notes;

                return prevNotes + newChangeNote;
              },
              '');

            var currentVersionName = _.get(currentVersion, 'name');

            sails.log.debug('Version candidate', latestVersion);
            sails.log.debug('Current version', currentVersionName);

            if (!latestVersion || latestVersion.name === currentVersionName) {
              sails.log.debug('Version candidate denied');
              return res.status(204).send('No updates.');
            }

            sails.log.debug('Version candidate accepted');

            return res.ok({
              url: url.resolve(
                sails.config.appUrl,
                '/' + latestVersion.application +
                '/download/' + latestVersion.name + '/' +
                latestVersion.assets[0].platform + '?filetype=zip'
              ),
              name: latestVersion.name,
              notes: releaseNotes,
              pub_date: latestVersion.createdAt.toISOString()
            });
          });
      })
      .catch(res.negotiate);
  },

  /**
   * Serves auto-updates: Squirrel.Windows: serve RELEASES from latest version
   * Currently, it will only serve a full.nupkg of the latest release with a
   * normalized filename (for pre-release)
   *
   * (GET /:application/update/:platform/:version/:channel/RELEASES)
   */
  windows: function(req, res) {
    var application = req.param('application') || sails.config.miscellaneous.defaultApp;
    var platform = req.param('platform');
    var version = req.param('version');
    var channel = req.param('channel') || 'stable';

    if (!application) {
      return res.badRequest('Requires `application` parameter');
    }

    if (!version) {
      return res.badRequest('Requires `version` parameter');
    }

    if (!platform) {
      return res.badRequest('Requires `platform` parameter');
    }

    var platforms = PlatformService.detect(platform, true);

    sails.log.debug('Windows Update Search Query', {
      platform: platforms,
      application: application,
      version: version,
      channel: channel
    });

    // Get specified version object, it's time will be used for the general
    // cutoff.
    Version
      .findOne({ name: version, application: application })
      .then(function(currentVersion) {
        var applicableChannels, createdAtFilter;

        applicableChannels = ChannelService.getApplicableChannels(channel);
        sails.log.debug('Applicable Channels', applicableChannels);

        if (currentVersion) {
          createdAtFilter = {
            '>': currentVersion.createdAt
          };
        } else {
          sails.log.debug('The specified `version` does not exist');
        }

        sails.log.debug('Time Filter', createdAtFilter);

        return Version
          .find(UtilityService.getTruthyObject({
            application: application,
            channel: applicableChannels,
            createdAt: createdAtFilter
          }))
          .populate('assets', {
            platform: platforms,
          })
          .then(function(newerVersions) {
            // Sort versions which were added after the current one by semver in
            // descending order.
            newerVersions.sort(UtilityService.compareVersion);

            var latestVersion = _.find(
              newerVersions,
              function(newVersion) {
                _.remove(newVersion.assets, function(o) {
                  return o.filetype !== '.nupkg' || !o.hash;
                });

                // Make sure the last version is a version with full asset
                // so RELEASES contains at least one full asset (which is mandatory for Squirrel.Windows)
                let v = _.filter(
                    newVersion.assets,
                    function(o) {
                      return _.includes(o.name.toLowerCase(), '-full');
                    }
                  );

                return v.length && semver.lte(
                  version, newVersion.name
                );
              });

            if (!latestVersion) {
              sails.log.debug('Version not found');
              return res.status(500).send('Version not found');
            }

            // Add Delta assets from other versions
            var deltaAssets = _.reduce(
              newerVersions,
              function(assets, newVersion) {
                return assets.concat(
                  _.filter(
                    newVersion.assets,
                    function(asset) {
                      asset.version = newVersion.name;
                      return asset.filetype === '.nupkg'
                        && _.includes(asset.name.toLowerCase(), '-delta')
                        && semver.lte(version, newVersion.name)
                        && semver.gt(latestVersion.name, newVersion.name);
                    }));
              }, []);

            Array.prototype.unshift.apply(latestVersion.assets, deltaAssets);

            sails.log.debug('Latest Windows Version', latestVersion);

            latestVersion.assets.sort(function(a1, a2) {
              return semver.compare(a1.version, a2.version);
            });

            sails.log.debug('Latest Windows Version', latestVersion);

            // Change asset name to use full download link
            assets = _.map(latestVersion.assets, function(asset) {
              asset.name = url.resolve(
                sails.config.appUrl,
                '/' + application +
                '/download' +
                '/' + asset.version +
                '/' + asset.platform +
                '/' + asset.name
              );

              return asset;
            });

            var output = WindowsReleaseService.generate(assets);

            res.header('Content-Length', output.length);
            res.attachment('RELEASES');
            return res.send(output);
          });
      })
      .catch(res.negotiate);
  },

  /**
   * Get release notes for a specific version
   * (GET /:application/notes/:version?)
   */
  releaseNotes: function(req, res) {
    var application = req.params.application || sails.config.miscellaneous.defaultApp;
    var version = req.params.version;

    Version
      .findOne({ name: version, application: application})
      .then(function(currentVersion) {
        if (!currentVersion) {
          return res.notFound('The specified version does not exist');
        }

        return res.format({
          'application/json': function() {
            res.send({
              'notes': currentVersion.notes,
              'pub_date': currentVersion.createdAt.toISOString()
            });
          },
          'default': function() {
            res.send(currentVersion.notes);
          }
        });
      })
      .catch(res.negotiate);
  },

  /**
   * Overloaded blueprint function
   * Changes:
   *  - Delete all associated assets & their files
   * @param  {[type]} req [description]
   * @param  {[type]} res [description]
   * @return {[type]}     [description]
   */
  destroy: function(req, res) {
    var pk = actionUtil.requirePk(req);

    var query = Version.findOne(pk);
    query.populate('assets');
    query
      .then(function foundRecord(record) {
        if (!record) return res.notFound(
          'No record found with the specified `name`.'
        );

        return VersionService.destroy(record, req)
        .then(function destroyedRecord() {
          return res.ok(record);
        });
    })
    .error(res.negotiate);
  }
};
