/**
 * Flavor Service
 */

const FlavorService = {};

/**
 * Deletes a flavor from the database.
 * @param   {Object}  flavor The flavors record object from sails
 * @param   {Object}  req    Optional: The request object
 * @returns {Promise}        Resolved once the flavor is destroyed
 */
FlavorService.destroy = (flavor, req) => {
  if (!flavor) {
    throw new Error('You must pass a flavor');
  }

  return Flavor
    .destroy(flavor.name)
    .then(() => {
      if (sails.hooks.pubsub) {
        Flavor.publishDestroy(
          flavor.name, !req._sails.config.blueprints.mirror && req, {
            previous: flavor
          }
        );

        if (req && req.isSocket) {
          Flavor.unsubscribe(req, flavor);
          Flavor.retire(flavor);
        }
      }
    });
};

module.exports = FlavorService;
