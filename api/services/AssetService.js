/**
 * File Service
 *
 * Handles uploads & downloads of versions
 */

var mime = require('mime');
var crypto = require('crypto');
var Promise = require('bluebird');
var SkipperDisk = require('skipper-s3');

/* Custom Delete Adapter we built */
var deleteAdapter = require('./CustomDeleteAdapter');

/* s3 Bucket options */
var s3Options = {
  key: process.env.S3_API_KEY,
  secret: process.env.S3_API_SECRET,
  bucket: process.env.S3_BUCKET,
  region: process.env.S3_REGION || undefined,
  endpoint: process.env.S3_ENDPOINT || undefined,
  token: process.env.S3_TOKEN || undefined
}

var AssetService = {};
var fileAdapter = SkipperDisk(s3Options);
var customFileAdapter = deleteAdapter(s3Options)

AssetService.serveFile = function (req, res, asset) {

  // Stream the file to the user
  fileAdapter.read(asset.fd)
    .on('error', function (err) {
      res.serverError('An error occurred while accessing asset.', err);
      sails.log.error('Unable to access asset:', asset.fd);
    })
    .on('open', function () {
      // Send file properties in header
      res.setHeader(
        'Content-Disposition', 'attachment; filename*=UTF-8\'\'' + encodeURIComponent(asset.name)
      );
      res.setHeader('Content-Length', asset.size);
      res.setHeader('Content-Type', mime.getType(asset.fd));
    })
    .on('end', async function complete() {
      // After we have sent the file, log analytics, failures experienced at
      // this point should only be handled internally (do not use the res
      // object).
      //
      // Atomically increment the download count for analytics purposes
      //
      // Warning: not all adapters support queries (such as sails-disk).
      var datastore = Asset.getDatastore();
      if (_.isFunction(datastore.sendNativeQuery) && datastore.config.adapter !== 'sails-disk') {
        try {
          await datastore.sendNativeQuery(
            'UPDATE asset SET download_count = download_count + 1 WHERE id = $1;', [asset.id])
            .intercept(function (err) {
            });

          // Early exit if the query was successful.
          return;
        } catch (err) {
          sails.log.error(
            'An error occurred while logging asset download', err
          );
        }
      }

      // Attempt to update the download count through the fallback mechanism.
      // Note that this may be lossy since it is not atomic.
      asset.download_count++;

      Asset.update({
        id: asset.id
      }, asset)
        .exec(function (err) {
          if (err) {
            sails.log.error(
              'An error occurred while logging asset download', err
            );
          }
        });
    })
    // Pipe to user
    .pipe(res);
};

/**
 * Asynchronously generates a SHA1 hash from a file
 * Identical to:
 * https://github.com/electron-userland/electron-builder/blob/552f1a4ed6f4bb83c3c548ed962c21142f07a9b4/packages/electron-updater/src/DownloadedUpdateHelper.ts#L161
 * @param  {String} fd File descriptor of file to hash
 * @return {String}    Promise which is resolved with the hash once complete
 */

AssetService.getHash = function (fd, type = "sha1", encoding = "hex") {
  return new Promise(function (resolve, reject) {
    var hash = crypto.createHash(type);
    hash.setEncoding(encoding);

    fileAdapter.read(fd)
      .on("error", function (err) {
        reject(err);
      })
      .on("end", function () {
        hash.end();
        resolve(hash.read());
      })
      // Pipe to hash generator
      .pipe(hash, { end: false });
  });
};


/**
 * Deletes an asset from the database.
 * Warning: this will NOT remove fd from the file system.
 * @param   {Record}  asset The asset's record object from sails
 * @param   {Object}  req   Optional: The request object
 * @returns {Promise}       Resolved once the asset is destroyed
 */
AssetService.destroy = function (asset, req) {
  if (!asset) {
    throw new Error('You must pass an asset');
  }
  return Asset.destroy(asset.id)
    .then(function destroyedRecord() {
      if (sails.hooks.pubsub) {
        Asset.publish(
          [asset.id],
          {
            verb: 'destroyed',
            previous: asset
          },
          !req._sails.config.blueprints.mirror && req
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
AssetService.deleteFile = function (asset) {
  if (!asset) {
    throw new Error('You must pass an asset');
  }
  if (!asset.fd) {
    throw new Error('The provided asset does not have a file descriptor');
  }

  var fileAdapterRmAsync = Promise.promisify(customFileAdapter.remove);
  return fileAdapterRmAsync(asset.fd);
};

module.exports = AssetService;
