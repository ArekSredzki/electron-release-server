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

module.exports = {

  /**
   * Download a release artifact
   *
   * Note: if a filename is specified, nothing but the filetype is used.
   * This is because Squirrel.Windows does a poor job of parsing the filename,
   * and so we must fake the filenames of x32 and x64 versions to be the same.
   *
   * (GET /download/latest/:platform?': 'AssetController.download')
   * (GET /download/:version/:platform?/:filename?': 'AssetController.download')
   * (GET /download/channel/:channel/:platform?': 'AssetController.download')
   * (GET /download/flavor/:flavor/latest/:platform?': 'AssetController.download')
   * (GET /download/flavor/:flavor/:version/:platform?/:filename?': 'AssetController.download')
   * (GET /download/flavor/:flavor/channel/:channel/:platform?': 'AssetController.download')
   */
  download: function(req, res) {
    var channel = req.params.channel;
    var version = req.params.version || undefined;
    var filename = req.params.filename;
    var filetype = req.query.filetype;
    const flavor = req.params.flavor || 'default';

    // We accept multiple platforms (x64 implies x32)
    var platforms;
    var platform = req.param('platform');
    if (platform) {
      platforms = [platform];
    }

    // Normalize filetype by prepending with period
    if (_.isString(filetype) && filetype[0] !== '.') {
      filetype = '.' + filetype;
    } else if (filename) {
      filetype = filename.substr(filename.lastIndexOf('.'));
    }

    // Detect platform from useragent
    if (!platforms) {
      platforms = PlatformService.detectFromRequest(req);

      if (!platforms) {
        return res.serverError(
          'No platform specified and detecting one was unsuccessful.'
        );
      }
    } else {
      platforms = PlatformService.sanitize(platforms);
    }

    if (!version) {
      channel = channel || 'stable';
    }

    new Promise(function(resolve, reject) {
        var assetOptions = UtilityService.getTruthyObject({
          platform: platforms,
          filetype: filetype
        });

        sails.log.debug('Asset requested with options', assetOptions);

        if (version || channel) {
          Version
            .find(UtilityService.getTruthyObject({
              name: version,
              channel: channel,
              flavor
            }))
            .sort({
              createdAt: 'desc'
            })
            // the latest version maybe has no assets, for example
            // the moment between creating a version and uploading assets,
            // so find more than 1 version and use the one containing assets.
            .limit(10)
            .populate('assets', assetOptions)
            .then(function(versions) {
              if (!versions || !versions.length) {
                return resolve();
              }

              // sort versions by `name` instead of `createdAt`,
              // an lower version could be deleted then be created again,
              // thus it has newer `createdAt`.
              versions = versions.sort(UtilityService.compareVersion);
              var version = versions[0];
              var version;
              for (var i = 0; i < versions.length; i++) {
                version = versions[i];
                if (version.assets && version.assets.length) {
                  break;
                }
              }

              if (!version.assets || !version.assets.length) {
                return resolve();
              }

              // Sorting filename in ascending order prioritizes other files
              // over zip archives is both are available and matched.
              return resolve(_.orderBy(
                version.assets, ['filetype', 'createdAt'], ['asc', 'desc']
              )[0]);
            })
            .catch(reject);
        } else {
          Asset
            .find(assetOptions)
            .sort({
              createdAt: 'desc'
            })
            .limit(1)
            .then(resolve)
            .catch(reject);
        }
      })
      .then(function(asset) {
        if (!asset || !asset.fd) {
          let noneFoundMessage = `The ${flavor} flavor has no download available`;

          if (platforms) {
            if (platforms.length > 1) {
              noneFoundMessage += ' for platforms ' + platforms.toString();
            } else {
              noneFoundMessage += ' for platform ' + platforms[0];
            }
          }

          noneFoundMessage += version ? ' for version ' + version : '';
          noneFoundMessage += channel ? ' (' + channel + ') ' : '';
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
      // Only a id was provided, normalize
      data.version = {
        id: data.version
      };
    } else if (data.version && data.version.id) {
      // Valid request, but we only want the id
      data.version = {
        id: data.version.id
      };
    } else {
      return res.badRequest('Invalid version provided.');
    }

    // Check that the version exists (or its `_default` flavor equivalent)
    Version
      .find({
        id: [data.version.id, `${data.version.id}_default`]
      })
      .then(versions => {
        if (!versions || !versions.length) {
          return res.notFound('The specified `version` does not exist');
        }

        data.version.id = versions[versions.length - 1].id;

        // Set upload request timeout to 10 minutes
        req.setTimeout(10 * 60 * 1000);

        req.file('file').upload(sails.config.files,
          function whenDone(err, uploadedFiles) {
            if (err) {
              return res.negotiate(err);
            }

            // If an unexpected number of files were uploaded, respond with an
            // error.
            if (uploadedFiles.length !== 1) {
              return res.badRequest('No file was uploaded');
            }

            var uploadedFile = uploadedFiles[0];

            var fileExt = path.extname(uploadedFile.filename);

            sails.log.debug('Creating asset with name', data.name || uploadedFile.filename);

            var hashPromise;

            if (fileExt === '.nupkg') {
              // Calculate the hash of the file, as it is necessary for windows
              // files
              hashPromise = AssetService.getHash(uploadedFile.fd);
            } else if (fileExt === '.exe' || fileExt === '.zip') {
              hashPromise = AssetService.getHash(
                uploadedFile.fd,
                "sha512",
                "base64"
              );
            } else {
              hashPromise = Promise.resolve('');
            }

            hashPromise
              .then(function(fileHash) {
                // Create new instance of model using data from params
                Asset
                  .create(_.merge({
                    name: uploadedFile.filename,
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

                    // If we have the pubsub hook, use the model class's publish
                    // method to notify all subscribers about the created item.
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
      });
  },

  destroy: function(req, res) {
    var pk = actionUtil.requirePk(req);

    var query = Asset.findOne(pk);
    query.populate('version');
    query
      .then(function foundRecord(record) {
        if (!record) return res.notFound(
          'No record found with the specified `name`.'
        );

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
