/**
 * View Engine Configuration
 * (sails.config.views)
 *
 * Server-sent views are a classic and effective way to get your app up
 * and running. Views are normally served from controllers.  Below, you can
 * configure your templating language/framework of choice and configure
 * Sails' layout support.
 *
 * For more information on views and layouts, check out:
 * http://sailsjs.org/#!/documentation/concepts/Views
 */

module.exports.views = {

  /****************************************************************************
  *                                                                           *
  * View engine (aka template language) to use for your app's *server-side*   *
  * views                                                                     *
  *                                                                           *
  * Sails+Express supports all view engines which implement TJ Holowaychuk's  *
  * `consolidate.js`, including, but not limited to:                          *
  *                                                                           *
  * ejs, pug, handlebars, mustache underscore, hogan, haml, haml-coffee,     *
  * dust atpl, eco, ect, jazz, jqtpl, JUST, liquor, QEJS, swig, templayed,    *
  * toffee, walrus, & whiskers                                                *
  *                                                                           *
  * For more options, check out the docs:                                     *
  * https://github.com/balderdashy/sails-wiki/blob/0.9/config.views.md#engine *
  *                                                                           *
  ****************************************************************************/

  engine: 'pug',
  layout: false,

  /**
   * How many releases are retrieve from the API at a time
   */
  pageSize: 50

};
