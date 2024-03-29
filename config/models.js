/**
 * Default model configuration
 * (sails.config.models)
 *
 * Unless you override them, the following properties will be included
 * in each of your models.
 *
 * For more info on Sails models, see:
 * http://sailsjs.org/#!/documentation/concepts/ORM
 */

module.exports.models = {

  // Your app's default datastore. i.e. the name of one of your app's datastores (see `config/datastores.js`)
  // The former `connection` model setting is now `datastore`.  This sets the datastore
  // that models will use, unless overridden directly in the model file in `api/models`.
  datastore: 'postgresql',

  /***************************************************************************
   *                                                                          *
   * How and whether Sails will attempt to automatically rebuild the          *
   * tables/collections/etc. in your schema.                                  *
   *                                                                          *
   * See http://sailsjs.org/#!/documentation/concepts/ORM/model-settings.html  *
   *                                                                          *
   ***************************************************************************/
  migrate: 'alter',

  schema: true,

  // These settings make the .update(), .create() and .createEach()
  // work like they did in 0.12, by returning records in the callback.
  // This is pretty ineffecient, so if you don't _always_ need this feature, you
  // should turn these off and instead chain `.meta({fetch: true})` onto the
  // individual calls where you _do_ need records returned.
  fetchRecordsOnUpdate: true,
  fetchRecordsOnCreate: true,
  fetchRecordsOnCreateEach: true,

  // Fetching records on destroy was experimental, but if you were using it,
  // uncomment the next line.
  // fetchRecordsOnDestroy: true,

  // Because you can't have the old `connection` setting at the same time as the new
  // `datastore` setting, we'll set it to `null` here.  When you merge this file into your
  // existing `config/models.js` file, just remove any reference to `connection`.
  connection: null,

  // These attributes will be added to all of your models.  When you create a new Sails 1.0
  // app with "sails new", a similar configuration will be generated for you.
  attributes: {
    // In Sails 1.0, the `autoCreatedAt` and `autoUpdatedAt` model settings
    // have been removed.  Instead, you choose which attributes (if any) to use as
    // timestamps.  By default, "sails new" will generate these two attributes as numbers,
    // giving you the most flexibility.  But for compatibility with your existing project,
    // we'll define them as strings.
    createdAt: { type: 'string', autoCreatedAt: true, },
    updatedAt: { type: 'string', autoUpdatedAt: true, },
  },
};
