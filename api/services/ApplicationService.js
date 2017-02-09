var ApplicationService = {};

ApplicationService.destroy = function(application, req) {
  var deletePromises = _.map(application.versions, function(version) {
    return Promise.join(
      VersionService.destroy(version, req),
      function() {
        sails.log.info('Destroyed version: ', version);
      });
  });

  return Promise.all(deletePromises)
    .then(function allDeleted() {
      return Application.destroy(pk)
        .then(function destroyedRecord() {

          if (sails.hooks.pubsub) {
            Application.publishDestroy(
              pk, !req._sails.config.blueprints.mirror && req, {
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
}

module.exports = ApplicationService;