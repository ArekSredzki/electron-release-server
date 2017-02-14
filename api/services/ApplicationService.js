
var ApplicationService = {};

ApplicationService.destroy = function(application, req) {
  var deletePromises = _.map(application.versions, function(version) {
      var query = Version.findOne(version.id);
      query.populate('assets');
      return query.then(function foundRecord(record) {
        if (record) {
          return VersionService.destroy(record, req)
          .then(function() {
            sails.log.info('Destroyed version: ', version);
          });
        }
      });
  });

  return Promise.all(deletePromises)
    .then(function allDeleted() {
      return Application.destroy(application.name)
        .then(function destroyedRecord() {

          if (sails.hooks.pubsub) {
            Application.publishDestroy(
              application.name, !req._sails.config.blueprints.mirror && req, {
                previous: application
              }
              );

            if (req.isSocket) {
              Application.unsubscribe(req, application);
              Application.retire(application);
            }
          }

          sails.log.info('Destroyed application: ', application);
        });
    });
};

module.exports = ApplicationService;
