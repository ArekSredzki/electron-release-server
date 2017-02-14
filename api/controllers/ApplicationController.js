/**
 * ApplicationController
 *
 * @description :: Server-side logic for managing Applications
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

var actionUtil = require('sails/lib/hooks/blueprints/actionUtil');

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
    query.then(function foundRecord(record) {
      if (!record) return res.notFound(
          'No record found with the specified `name`.'
        );

      return ApplicationService.destroy(record, req)
      .then(function destroyedRecord() {
        return res.ok(record);
      });
    })
    .error(res.negotiate);
  }
};
