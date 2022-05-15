/**
 * Flavor.js
 *
 * @description :: Represents a release flavor (ex. default)
 * @docs        :: http://sailsjs.org/#!documentation/models
 */

module.exports = {

  primaryKey: 'name',

  attributes: {
    name: {
      type: 'string',
      unique: true,
      required: true
    }
  },

};
