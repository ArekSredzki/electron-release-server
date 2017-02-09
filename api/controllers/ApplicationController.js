/**
 * ApplicationController
 *
 * @description :: Server-side logic for managing Applications
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

module.exports = {
  /**
   * Overloaded blueprint function
   * Changes:
   *  - Delete all associated versions & their files
   * @param  {[type]} req [description]
   * @param  {[type]} res [description]
   * @return {[type]}     [description]
   */
  destroy: function(req, res) {
    var pk = actionUtil.requirePk(req);

    var query = Application.findOne(pk);
    query.populate('versions');
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