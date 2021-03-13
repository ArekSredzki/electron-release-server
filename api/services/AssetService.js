/**
 * File Service
 *
 * Handles uploads & downloads of versions
 */

var mime = require('mime');

var fsx = require('fs-extra');
var crypto = require('crypto');
var Promise = require('bluebird');

var SkipperDisk = require('skipper-disk');

var AssetService = {};

AssetService.serveFile = function(req, res, asset) {
  // Stream the file to the user
  fsx.createReadStream(asset.fd)
    .on('error', function(err) {
      res.serverError('An error occurred while accessing asset.', err);
      sails.log.error('Unable to access asset:', asset.fd);
    })
    .on('open', function() {
      // Send file properties in header
      res.setHeader(
        'Content-Disposition', 'attachment; filename*=UTF-8' + "''" + '"' + encodeURIComponent(asset.name) + '"'
      );
      res.setHeader('Content-Length', asset.size);
      res.setHeader('Content-Type', mime.lookup(asset.fd));
    })
    .on('end', function complete() {
      // After we have sent the file, log analytics, failures experienced at
      // this point should only be handled internally (do not use the res
      // object).
      //
      // Atomically increment the download count for analytics purposes
      //
      // Warning: not all adapters support queries
      if (_.isFunction(Asset.query)) {
        Asset.query(
          'UPDATE asset SET download_count = download_count + 1 WHERE id = \'' + asset.id + '\';',
          function(err) {
            if (err) {
              sails.log.error(
                'An error occurred while logging asset download', err
              );
            }
          });
      } else {
        asset.download_count++;

        Asset.update({
            id: asset.id
          }, asset)
          .exec(function(err) {
            if (err) {
              sails.log.error(
                'An error occurred while logging asset download', err
              );
            }
          });
      }
    })
    // Pipe to user
    .pipe(res);
};

/**
 * Asyncronously generates a SHA1 hash from a file
 * Identical to:
 * https://github.com/electron-userland/electron-builder/blob/552f1a4ed6f4bb83c3c548ed962c21142f07a9b4/packages/electron-updater/src/DownloadedUpdateHelper.ts#L161
 * @param  {String} fd File descriptor of file to hash
 * @return {String}    Promise which is resolved with the hash once complete
 */
AssetService.getHash = function (fd, type = "sha1", encoding = "hex") {
  return new Promise(function (resolve, reject) {
    var hash = crypto.createHash(type);
    hash.setEncoding(encoding);

    fsx
      .createReadStream(fd)
      .on("error", function (err) {
        reject(err);
      })
      .on("end", function () {
        hash.end();
        resolve(hash.read());
      })
      // Pipe to hash generator
      .pipe(hash, {    end: false    });
  });
};


/**
 * Deletes an asset from the database.
 * Warning: this will NOT remove fd from the file system.
 * @param   {Record}  asset The asset's record object from sails
 * @param   {Object}  req   Optional: The request object
 * @returns {Promise}       Resolved once the asset is destroyed
 */
AssetService.destroy = function(asset, req) {
  if (!asset) {
    throw new Error('You must pass an asset');
  }

  return Asset.destroy(asset.id)
    .then(function destroyedRecord() {
      if (sails.hooks.pubsub) {
        Asset.publishDestroy(
          asset.id, !req._sails.config.blueprints.mirror && req, {
            previous: asset
          }
        );

        if (req && req.isSocket) {
          Asset.unsubscribe(req, record);
          Asset.retire(record);
        }
      }
    });
};

/**
 * Deletes an asset's file from the filesystem.
 * Warning: this will NOT remove the reference to the fd in the database.
 * @param   {Object}  asset The asset object who's file we would like deleted
 * @returns {Promise}       Resolved once the file is deleted
 */
AssetService.deleteFile = function(asset) {
  if (!asset) {
    throw new Error('You must pass an asset');
  }
  if (!asset.fd) {
    throw new Error('The provided asset does not have a file descriptor');
  }

  var fileAdapter = SkipperDisk();
  var fileAdapterRmAsync = Promise.promisify(fileAdapter.rm);

  return fileAdapterRmAsync(asset.fd);
};

module.exports = AssetService;
