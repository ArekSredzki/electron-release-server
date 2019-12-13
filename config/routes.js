/**
 * Route Mappings
 * (sails.config.routes)
 *
 * Your routes map URLs to views and controllers.
 *
 * If Sails receives a URL that doesn't match any of the routes below,
 * it will check for matching files (images, scripts, stylesheets, etc.)
 * in your assets directory.  e.g. `http://localhost:1337/images/foo.jpg`
 * might match an image file: `/assets/images/foo.jpg`
 *
 * Finally, if those don't match either, the default 404 handler is triggered.
 * See `api/responses/notFound.js` to adjust your app's 404 logic.
 *
 * Note: Sails doesn't ACTUALLY serve stuff from `assets`-- the default Gruntfile in Sails copies
 * flat files from `assets` to `.tmp/public`.  This allows you to do things like compile LESS or
 * CoffeeScript for the front-end.
 *
 * For more information on configuring custom routes, check out:
 * http://sailsjs.org/#!/documentation/concepts/Routes/RouteTargetSyntax.html
 */

module.exports.routes = {

  '/': { view: 'homepage' },
  '/home': { view: 'homepage' },
  '/releases/:channel?': { view: 'homepage' },
  '/admin': { view: 'homepage' },
  '/auth/login': { view: 'homepage' },
  '/auth/logout': { view: 'homepage' },

  'PUT /version/availability/:version/:timestamp': 'VersionController.availability',

  'GET /download/latest/:platform?': 'AssetController.download',
  'GET /download/channel/:channel/:platform?': 'AssetController.download',
  'GET /download/:version/:platform?/:filename?': 'AssetController.download',
  'GET /download/flavor/:flavor/latest/:platform?': 'AssetController.download',
  'GET /download/flavor/:flavor/channel/:channel/:platform?': 'AssetController.download',
  'GET /download/flavor/:flavor/:version/:platform?/:filename?': 'AssetController.download',

  'GET /update': 'VersionController.redirect',
  'GET /update/:platform/latest-mac.yml': 'VersionController.electronUpdaterMac',
  'GET /update/:platform/:channel-mac.yml': 'VersionController.electronUpdaterMac',
  'GET /update/:platform/latest.yml': 'VersionController.electronUpdaterWin',
  'GET /update/:platform/:channel.yml': 'VersionController.electronUpdaterWin',
  'GET /update/:platform/:version': 'VersionController.general',
  'GET /update/:platform/:channel/latest.yml': 'VersionController.electronUpdaterWin',
  'GET /update/:platform/:channel/latest-mac.yml': 'VersionController.electronUpdaterMac',
  'GET /update/:platform/:version/RELEASES': 'VersionController.windows',
  'GET /update/:platform/:version/:channel/RELEASES': 'VersionController.windows',
  'GET /update/:platform/:version/:channel': 'VersionController.general',

  'GET /update/flavor/:flavor/:platform/:version/:channel?': 'VersionController.general',
  'GET /update/flavor/:flavor/:platform/:version/RELEASES': 'VersionController.windows',
  'GET /update/flavor/:flavor/:platform/:version/:channel/RELEASES': 'VersionController.windows',
  'GET /update/flavor/:flavor/:platform/latest.yml': 'VersionController.electronUpdaterWin',
  'GET /update/flavor/:flavor/:platform/:channel.yml': 'VersionController.electronUpdaterWin',
  'GET /update/flavor/:flavor/:platform/:channel/latest.yml': 'VersionController.electronUpdaterWin',
  'GET /update/flavor/:flavor/:platform/latest-mac.yml': 'VersionController.electronUpdaterMac',
  'GET /update/flavor/:flavor/:platform/:channel-mac.yml': 'VersionController.electronUpdaterMac',
  'GET /update/flavor/:flavor/:platform/:channel/latest-mac.yml': 'VersionController.electronUpdaterMac',

  'GET /notes/:version/:flavor?': 'VersionController.releaseNotes',

  'GET /versions/sorted': 'VersionController.list'

};
