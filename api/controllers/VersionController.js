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
var compareVersions = require('compare-versions');

const availabilityFilter = () => ({ '<=': (new Date()).toISOString() });

module.exports = {

  /**
   * Set availability date of specified version
   *
   * (PUT /version/availability/:version/:timestamp)
   */
  availability: (req, res) => {
    const { version, timestamp } = req.params;

    if (!version) return res.badRequest('Requires `version` parameter');
    if (!timestamp) return res.badRequest('Requires `timestamp` parameter');

    const availability = new Date(parseInt(timestamp, 10));

    if (isNaN(availability) || availability.getTime().toString() !== timestamp) {
      return res.badRequest('Parameter `timestamp` must be a valid unix timestamp in milliseconds');
    }

    Version
      .findOne(version)
      .then(foundVersion => {
        if (!foundVersion) return res.notFound('The specified `version` does not exist');

        if (availability < new Date(foundVersion.createdAt)) {
          return res.badRequest(
            'Parameter `timestamp` must be greater than or equal to the version creation date'
          );
        }

        return Version
          .update(version, { availability })
          .then(([updatedVersion]) => {
            Version.publishUpdate(version, updatedVersion, req);

            res.send(updatedVersion);
          });
      })
      .catch(res.negotiate);
  },

  /**
   * Redirect the update request to the appropriate endpoint
   * (GET /update)
   */
  redirect: function(req, res) {
    var platform = req.param('platform');
    var version = req.param('version');

    if (!version) {
      return res.badRequest('Requires "version" parameter');
    }
    if (!platform) {
      return res.badRequest('Requires "platform" parameter');
    }

    return res.redirect('/update/' + platform + '/' + version);
  },

  /**
   * Sorts versions and returns pages sorted by by sermver
   *
   * ( GET /versions/sorted )
   */
  list: function (req, res) {
    Version
      .find()
      .then(versions => {
        var count = versions.length;
        var page = req.param('page') || req.query.page || 0;
        var start = page * sails.config.views.pageSize;
        var end = start + sails.config.views.pageSize;
        var items = versions
          .sort(function (a, b) {
            return -compareVersions(a.name, b.name);
          })
          .slice(start, end);

        const response = {
          total: count,
          offset: start,
          page: page,
          items: items
        }

        return Promise.all([
          // load channels
          new Promise(function (resolve, reject) {
            Promise.all(items.map(function (version) {
              return Channel.findOne({
                name: version.channel
              })
            }))
            .then(resolve)
            .catch(reject)
          }),
          // load assets
          new Promise(function (resolve, reject) {
            Promise.all(items.map(function (version) {
              return Asset.find({
                version: version.id
              })
            }))
            .then(resolve)
            .catch(reject)
          }),
          // load flavors
          new Promise((resolve, reject) => Promise
            .map(items, version => Flavor.findOne(version.flavor))
            .then(resolve)
            .catch(reject)
          )
        ])
        .then(function (results) {
          response.items = response.items.map(function (item, index) {
            return {
              id: item.id,
              channel: results[0][index],
              assets: results[1][index].map(function (asset) {
                return {
                  id: asset.id,
                  name: asset.name,
                  platform: asset.platform,
                  filetype: asset.filetype,
                  hash: asset.hash,
                  size: asset.size,
                  download_count: asset.download_count,
                  fd: asset.fd,
                  createdAt: asset.createdAt,
                  updatedAt: asset.updatedAt
                }
              }),
              flavor: results[2][index],
              name: item.name,
              notes: item.notes,
              createdAt: item.createdAt,
              updatedAt: item.updatedAt,
              availability: item.availability
            }
          })

          return response
        })
      })
      .then(response => {
        res.send(response);
      })
      .catch(res.negotiate);
  },

  /**
   * Serves auto-updates: Status and Squirrel.Mac
   *
   * Assumes stable channel & default flavor unless specified
   *
   * (GET /update/:platform/:version/:channel)
   * (GET /update/flavor/:flavor/:platform/:version/:channel?)
   */
  general: function(req, res) {
    var platform = req.param('platform');
    var version = req.param('version');
    var channel = req.param('channel') || 'stable';
    const flavor = req.params.flavor || 'default';

    if (!version) {
      return res.badRequest('Requires `version` parameter');
    }

    if (!platform) {
      return res.badRequest('Requires `platform` parameter');
    }

    var platforms = PlatformService.detect(platform, true);

    sails.log.debug('Update Search Query', {
      platform: platforms,
      version: version,
      channel: channel,
      flavor
    });

    // Get specified version object, it's time will be used for the general
    // cutoff.
    Version
      .findOne({
        name: version,
        flavor
      })
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
            channel: applicableChannels,
            createdAt: createdAtFilter,
            availability: availabilityFilter(),
            flavor
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
                `/download/flavor/${flavor}/${latestVersion.name}/` +
                latestVersion.assets[0].platform + '?filetype=zip'
              ),
              name: latestVersion.name,
              notes: releaseNotes,
              pub_date: latestVersion.availability.toISOString()
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
   * (GET /update/:platform/:version/:channel/RELEASES)
   * (GET /update/flavor/:flavor/:platform/:version/:channel/RELEASES)
   */
  windows: function(req, res) {
    var platform = req.param('platform');
    var version = req.param('version');
    var channel = req.param('channel') || 'stable';
    const flavor = req.params.flavor || 'default';

    if (!version) {
      return res.badRequest('Requires `version` parameter');
    }

    if (!platform) {
      return res.badRequest('Requires `platform` parameter');
    }

    var platforms = PlatformService.detect(platform, true);

    sails.log.debug('Windows Update Search Query', {
      platform: platforms,
      version: version,
      channel: channel,
      flavor
    });

    // Get specified version object, it's time will be used for the general
    // cutoff.
    Version
      .findOne({
        name: version,
        flavor
      })
      .then(function(currentVersion) {
        var applicableChannels, createdAtFilter;

        applicableChannels = ChannelService.getApplicableChannels(channel);
        sails.log.debug('Applicable Channels', applicableChannels);

        if (currentVersion) {
          createdAtFilter = {
            '>=': currentVersion.createdAt
          };
        } else {
          sails.log.debug('The specified `version` does not exist');
        }

        sails.log.debug('Time Filter', createdAtFilter);

        return Version
          .find(UtilityService.getTruthyObject({
            channel: applicableChannels,
            createdAt: createdAtFilter,
            availability: availabilityFilter(),
            flavor
          }))
          .populate('assets', {
            platform: platforms
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
                      return asset.filetype === '.nupkg'
                        && _.includes(asset.name.toLowerCase(), '-delta')
                        && semver.lte(version, asset.version)
                        && semver.gt(latestVersion.name, asset.version);
                    }));
              }, []);

            Array.prototype.unshift.apply(latestVersion.assets, deltaAssets);

            latestVersion.assets.sort(function(a1, a2) {
              return semver.compare(a1.version, a2.version);
            });

            sails.log.debug('Latest Windows Version', latestVersion);

            // Change asset name to use full download link
            const assets = _.map(latestVersion.assets, function(asset) {
              asset.name = url.resolve(
                sails.config.appUrl,
                `/download/flavor/${flavor}/${latestVersion.name}/${asset.platform}/` +
                asset.name
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
   * Get electron-updater win yml for a specific channel
   * (GET /update/:platform/latest.yml)
   * (GET /update/:platform/:channel.yml)
   * (GET /update/:platform/:channel/latest.yml)
   * (GET /update/flavor/:flavor/:platform/latest.yml)
   * (GET /update/flavor/:flavor/:platform/:channel.yml)
   * (GET /update/flavor/:flavor/:platform/:channel/latest.yml)
   */
  electronUpdaterWin: function(req, res) {
    var platform = req.param('platform');
    var channel = req.param('channel') || 'stable';
    const flavor = req.params.flavor || 'default';

    if (!platform) {
      return res.badRequest('Requires `platform` parameter');
    }

    var platforms = PlatformService.detect(platform, true);

    sails.log.debug('NSIS electron-updater Search Query', {
      platform: platforms,
      channel: channel,
      flavor
    });

    var applicableChannels = ChannelService.getApplicableChannels(channel);
    sails.log.debug('Applicable Channels', applicableChannels);

    // Get latest version that has a windows asset
    Version
      .find({
        channel: applicableChannels,
        availability: availabilityFilter(),
        flavor
      })
      .populate('assets')
      .then(function(versions) {
        // TODO: Implement method to get latest version with available asset
        var sortedVersions = versions.sort(UtilityService.compareVersion);
        var latestVersion = null;
        var asset = null;
        for (var i = 0; i < sortedVersions.length; i++) {
          var currentVersion = sortedVersions[i];
          if (currentVersion.assets) {
            for (var j = 0; j < currentVersion.assets.length; j++) {
              var currentAsset = currentVersion.assets[j];
              if (currentAsset.filetype === '.exe' && _.includes(platforms, currentAsset.platform)) {
                latestVersion = currentVersion;
                asset = currentAsset;
                break;
              }
            }

            if (latestVersion) {
              break;
            }
          }
        }

        if (latestVersion) {
          var downloadPath = url.resolve(
            //sails.config.appUrl,
            "",
            `/download/flavor/${flavor}/${latestVersion.name}/${asset.platform}/` +
            asset.name
          );

          const sha2 = asset.hash ? asset.hash.toLowerCase() : null;

          var latestYml = "version: " + latestVersion.name
                          + "\nreleaseDate: " + latestVersion.updatedAt
                          + "\npath: " + downloadPath
                          + "\nsha2: " + sha2;
          res.ok(latestYml);
        } else {
          res.notFound();
        }
      });
  },

  /**
   * Get electron-updater mac yml for a specific channel
   * (GET /update/:platform/latest-mac.yml)
   * (GET /update/:platform/:channel-mac.yml)
   * (GET /update/:platform/:channel/latest-mac.yml)
   * (GET /update/flavor/:flavor/:platform/latest-mac.yml)
   * (GET /update/flavor/:flavor/:platform/:channel-mac.yml)
   * (GET /update/flavor/:flavor/:platform/:channel/latest-mac.yml)
   */
  electronUpdaterMac: function(req, res) {
    var platform = req.param('platform');
    var channel = req.param('channel') || 'stable';
    const flavor = req.params.flavor || 'default';

    if (!platform) {
      return res.badRequest('Requires `platform` parameter');
    }

    var platforms = PlatformService.detect(platform, true);

    sails.log.debug('Mac electron-updater Search Query', {
      platform: platforms,
      channel: channel,
      flavor
    });

    var applicableChannels = ChannelService.getApplicableChannels(channel);
    sails.log.debug('Applicable Channels', applicableChannels);

    // Get latest version that has a mac asset
    Version
      .find({
        channel: applicableChannels,
        availability: availabilityFilter(),
        flavor
      })
      .populate('assets')
      .then(function(versions) {
        // TODO: Implement method to get latest version with available asset
        var sortedVersions = versions.sort(UtilityService.compareVersion);
        var latestVersion = null;
        var asset = null;
        for (var i = 0; i < sortedVersions.length; i++) {
          var currentVersion = sortedVersions[i];
          if (currentVersion.assets) {
            for (var j = 0; j < currentVersion.assets.length; j++) {
              var currentAsset = currentVersion.assets[j];
              if (currentAsset.filetype === '.zip' && _.includes(platforms, currentAsset.platform)) {
                latestVersion = currentVersion;
                asset = currentAsset;
                break;
              }
            }

            if (latestVersion) {
              break;
            }
          }
        }

        if (latestVersion) {
          var downloadPath = url.resolve(
            //sails.config.appUrl,
            "",
            `/download/flavor/${flavor}/${latestVersion.name}/${asset.platform}/` +
            asset.name
          );

          const sha2 = asset.hash ? asset.hash.toLowerCase() : null;

          var latestYml = "version: " + latestVersion.name
                          + "\nreleaseDate: " + latestVersion.updatedAt
                          + "\npath: " + downloadPath
                          + "\nsha2: " + sha2;
          res.ok(latestYml);
        } else {
          res.notFound();
        }
      });
  },

  /**
   * Get release notes for a specific version
   * (GET /notes/:version/:flavor?)
   */
  releaseNotes: function(req, res) {
    var version = req.params.version;
    const flavor = req.params.flavor || 'default';

    Version
      .findOne({
        name: version,
        availability: availabilityFilter(),
        flavor
      })
      .then(function(currentVersion) {
        if (!currentVersion) {
          return res.notFound('The specified version does not exist');
        }

        return res.format({
          'application/json': function() {
            res.send({
              'notes': currentVersion.notes,
              'pub_date': currentVersion.availability.toISOString()
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
    query.exec(function foundRecord(err, record) {
      if (err) return res.serverError(err);
      if (!record) return res.notFound(
        'No record found with the specified `name`.'
      );

      var deletePromises = _.map(record.assets, function(asset) {
        return Promise.join(
          AssetService.destroy(asset, req),
          AssetService.deleteFile(asset),
          function() {
            sails.log.info('Destroyed asset: ', asset);
          });
      });

      Promise.all(deletePromises)
        .then(function allDeleted() {
          return Version.destroy(pk)
            .then(function destroyedRecord() {

              if (sails.hooks.pubsub) {
                Version.publishDestroy(
                  pk, !req._sails.config.blueprints.mirror && req, {
                    previous: record
                  }
                );

                if (req.isSocket) {
                  Version.unsubscribe(req, record);
                  Version.retire(record);
                }
              }

              sails.log.info('Destroyed version: ', record);

              return res.ok(record);
            });
        })
        .error(res.negotiate);
    });
  }
};
