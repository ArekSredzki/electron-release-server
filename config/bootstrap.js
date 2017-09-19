/**
 * Bootstrap
 * (sails.config.bootstrap)
 *
 * An asynchronous bootstrap function that runs before your Sails app gets lifted.
 * This gives you an opportunity to set up your data model, run jobs, or perform some special logic.
 *
 * For more information on bootstrapping your app, check out:
 * http://sailsjs.org/#!/documentation/reference/sails.config/sails.config.bootstrap.html
 */

 const mapSeries = require('async/mapSeries');
 const waterfall = require('async/waterfall');
 const apply = require('async/apply');

module.exports.bootstrap = function(cb) {  
  // Create configured channels in database
  mapSeries(sails.config.channels, (name, next) => {
    waterfall([
      (next) => {
        Channel.find({
          name: name
        }).exec(next);
      },
      (result, next) => {
        if (result.length) {
          return next();
        }

        Channel.create({
          name: name
        })
        .exec(next);
      }
    ], next);
  }, cb);
};
