/**
 *  AssetController
 *
 * @description :: Server-side logic for managing assets
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

var _ = require('lodash');
var path = require('path');
var actionUtil = require('sails/lib/hooks/blueprints/actionUtil');
var Promise = require('bluebird');

var SEGMENTS_TO_REMOVE = _.concat(_.pickBy(PlatformService, _.isString), [
  'x64',
  'ia32',
  'x32',
  'win32',
  'windows',
  'osx',
  'linux'
]);

module.exports = {

  /**
   * Download a release artifact
   *
   * (GET /download/channel/:channel/:platform?)
   * (GET /download/version/:version/:platform?)
   * (GET /download/:version/:filename)
   * (GET /download/:platform?)
   */
  download: function(req, res) {
    var channel = req.params.channel || 'stable';
    var version = req.params.version || undefined;
    var filename = req.params.filename;
    var filetype = req.query.filetype;

    // We accept multiple platforms (x64 implies x32)
    var platforms;
    var platform = req.param('platform');
    if (platform) {
      platforms = [platform];
    }

    // Normalize filetype by prepending with period
    if (_.isString(filetype) && filetype[0] !== '.') {
      filetype = '.' + filetype;
    }

    // When serving a specific file, platform is not required
    if (!filename) {
      // Detect platform from useragent
      if (!platforms) {
        platforms = PlatformService.detectFromRequest(req);

        if (!platforms) {
          return res.serverError('No platform specified and impossible to detect one');
        }
      }
    } else {
      platforms = undefined;
    }

    var assetPromise = new Promise(function(resolve, reject) {
      var assetOptions = UtilityService.getTruthyObject({
        platform: platforms,
        name: filename,
        filetype: filetype
      });

      sails.log.debug('Asset requested with options', assetOptions);

      if (version || channel) {
        Version.find(UtilityService.getTruthyObject({
            name: version,
            channel: channel
          }))
          .sort({
            createdAt: 'desc'
          })
          .limit(1)
          .populate('assets', assetOptions)
          .then(function(versions) {
            if (!versions || !versions.length) {
              return resolve();
            }

            var version = versions[0];

            if (!version.assets || !version.assets.length) {
              return resolve();
            }

            // sorting filename in ascending order prioritizes other files over
            // zip archives is both are available and matched.
            return resolve(_.orderBy(
              version.assets, ['filetype', 'createdAt'], ['asc', 'desc']
            )[0]);
          })
          .catch(reject);
      } else {
        Asset.find(assetOptions)
          .sort({
            createdAt: 'desc'
          })
          .limit(1)
          .then(resolve)
          .catch(reject);
      }
    });

    assetPromise
      .then(function(asset) {
        if (!asset || !asset.fd) {
          var noneFoundMessage = 'No download available';

          if (platforms) {
            if (platforms.length > 1) {
              noneFoundMessage += ' for platforms ' + platforms.toString();
            } else {
              noneFoundMessage += ' for platform ' + platforms[0];
            }
          }

          noneFoundMessage += version ? ' for version ' + version : '';
          noneFoundMessage += ' (' + channel + ') ';
          noneFoundMessage += filename ? ' with filename ' + filename : '';
          noneFoundMessage += filetype ? ' with filetype ' + filetype : '';
          return res.notFound(noneFoundMessage);
        }

        // Serve asset & log analytics
        return AssetService.serveFile(req, res, asset);
      })
      // Catch any unhandled errors
      .catch(res.negotiate);
  },

  create: function(req, res) {
    // Create data object (monolithic combination of all parameters)
    // Omit the blacklisted params (like JSONP callback param, etc.)
    var data = actionUtil.parseValues(req);

    if (!data.version) {
      return res.badRequest('A version is required.');
    }

    if (_.isString(data.version)) {
      // Only a name was provided, normalize
      data.version = {
        name: data.version
      };
    } else if (_.isObjectLike(data.version) && _.has(data.version, 'name')) {
      // Valid request, but we only want the name
      data.version = {
        name: data.version.name
      };
    } else {
      return res.badRequest('Invalid version provided.');
    }

    req.file('file').upload(sails.config.files,
      function whenDone(err, uploadedFiles) {
        if (err) {
          return res.negotiate(err);
        }

        // If an unexpected number of files were uploaded, respond with an error.
        if (uploadedFiles.length !== 1) {
          return res.badRequest('No file was uploaded');
        }

        var uploadedFile = uploadedFiles[0];

        var fileExt = path.extname(uploadedFile.filename);

        // Normalize filename
        var name =
          sails.config.appName + '-' +
          data.version.name + '-' +
          data.platform.replace('_', '-') +
          fileExt;

        sails.log.debug('Creating asset with name', name);

        var hashPromise;

        if (fileExt === '.nupkg') {
          // Calculate the hash of the file, as it is necessary for windows files
          hashPromise = AssetService.getHash(uploadedFile.fd);
        } else {
          hashPromise = Promise.resolve('');
        }

        hashPromise
          .then(function(fileHash) {
            // Create new instance of model using data from params
            Asset
              .create(_.merge({
                name: name,
                hash: fileHash,
                filetype: fileExt,
                fd: uploadedFile.fd,
                size: uploadedFile.size
              }, data))
              .exec(function created(err, newInstance) {

                // Differentiate between waterline-originated validation errors
                // and serious underlying issues. Respond with badRequest if a
                // validation error is encountered, w/ validation info.
                if (err) return res.negotiate(err);

                // If we have the pubsub hook, use the model class's publish method
                // to notify all subscribers about the created item
                if (req._sails.hooks.pubsub) {
                  if (req.isSocket) {
                    Asset.subscribe(req, newInstance);
                    Asset.introduce(newInstance);
                  }
                  Asset.publishCreate(newInstance, !req.options.mirror && req);
                }

                // Send JSONP-friendly response if it's supported
                res.created(newInstance);
              });
          })
          .catch(res.negotiate);
      });
  },

  destroy: function(req, res) {
    var pk = actionUtil.requirePk(req);

    var query = Asset.findOne(pk);
    query.populate('version');
    query
      .then(function foundRecord(record) {
        if (!record) return res.notFound('No record found with the specified `name`.');

        // Delete the file & remove from db
        return Promise.join(
            AssetService.destroy(record, req),
            AssetService.deleteFile(record),
            function() {})
          .then(function success() {
            res.ok(record);
          });
      })
      .error(res.negotiate);
  }

};
