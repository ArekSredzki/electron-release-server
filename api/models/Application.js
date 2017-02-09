/**
 * Application.js
 *
 * @description :: Represents an application, which regroups the different versions of a same package
 * @docs        :: http://sailsjs.org/#!documentation/models
 */

module.exports = {
  attributes: {

    name: {
      type: 'string',
      primaryKey: true,
      unique: true,
      required: true
    },

    description: {
      type: 'string',
    },

    versions: {
      collection: 'version',
      via: 'application'
    }

  },
  autoPK: false 
};