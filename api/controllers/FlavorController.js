/**
 * FlavorController
 *
 * @description :: Server-side logic for managing Flavors
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

const actionUtil = require('sails/lib/hooks/blueprints/actionUtil');
const Promise = require('bluebird');

const destroyAssetAndFile = (asset, req) => AssetService
  .destroy(asset, req)
  .then(AssetService.deleteFile(asset))
  .then(() => sails.log.info('Destroyed asset:', asset));

const destroyAssetsAndFiles = (version, req) => version.assets
  .map(asset => destroyAssetAndFile(asset, req));

const destroyVersion = (version, req) => VersionService
  .destroy(version, req)
  .then(() => sails.log.info('Destroyed version:', version));

const destroyVersionAssetsAndFiles = (version, req) => Promise
  .all(destroyAssetsAndFiles(version, req))
  .then(destroyVersion(version, req));

const destroyFlavor = (flavor, req) => FlavorService
  .destroy(flavor, req)
  .then(() => sails.log.info('Destroyed flavor:', flavor));

module.exports = {

  /**
   * Overloaded blueprint function
   * Changes:
   *  - Delete all associated versions, assets & their files
   * @param {Object} req Incoming request object
   * @param {Object} res Outgoing response object
   */
  destroy: (req, res) => {
    const pk = actionUtil.requirePk(req);

    if (pk === 'default') {
      res.serverError('Default flavor cannot be deleted.');
    } else {
      Flavor
        .findOne(pk)
        .exec((err, flavor) => {
          if (err) {
            res.serverError(err);
          } else if (!flavor) {
            res.notFound('No flavor found with the specified `name`.');
          } else {
            Version
              .find({ flavor: flavor.name })
              .populate('assets')
              .exec((err, versions) => {
                if (err) {
                  res.serverError(err);
                } else {
                  Promise
                    .map(versions, version => destroyVersionAssetsAndFiles(version, req))
                    .then(destroyFlavor(flavor, req))
                    .then(res.ok(flavor.name))
                    .error(res.negotiate);
                }
              });
          }
        });
    }
  }

};
