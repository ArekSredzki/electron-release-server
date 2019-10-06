/**
 * Flavor.js
 *
 * @description :: Represents a release flavor (ex. default)
 * @docs        :: http://sailsjs.org/#!documentation/models
 */

module.exports = {

  attributes: {
    name: {
      type: 'string',
      primaryKey: true,
      unique: true,
      required: true
    }
  },

  autoPK: false

};
