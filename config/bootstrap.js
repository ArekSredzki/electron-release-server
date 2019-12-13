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
const series = require('async/series');

module.exports.bootstrap = done => {
  series([

    // Create configured channels in database
    cb => mapSeries(sails.config.channels, (name, next) => {
      waterfall([
        next => {
          Channel
            .find(name)
            .exec(next);
        },
        (result, next) => {
          if (result.length) return next();

          Channel
            .create({ name })
            .exec(next);
        }
      ], next);
    }, cb),

    // Populate existing versions without availability date using version creation date
    cb => Version
      .find({ availability: null })
      .then(versions => mapSeries(
        versions,
        ({ id, createdAt }, next) => {
          Version
            .update(id, { availability: createdAt })
            .exec(next)
        },
        cb
      )),

    // Create configured flavors in database
    cb => mapSeries(sails.config.flavors, (name, next) => {
      waterfall([
        next => {
          Flavor
            .find(name)
            .exec(next);
        },
        (result, next) => {
          if (result.length) return next();

          Flavor
            .create({ name })
            .exec(next);
        }
      ], next);
    }, cb),

    // Update existing versions and associated assets in database with default flavor data
    cb => Version
      .update(
        { flavor: null },
        { flavor: 'default' }
      )
      .exec((err, updatedVersions) => mapSeries(
        updatedVersions,
        ({ name, id }, next) => {
          Asset
            .update(
              { version: name },
              { version: id }
            )
            .exec(next)
        },
        cb
      ))

  ], done);
};
