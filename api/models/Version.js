/**
 * Version.js
 *
 * @description :: Represents a release version, which contains assets and is a member of a channel
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

    assets: {
      collection: 'asset',
      via: 'version'
    },

    channel: {
      model: 'channel',
      required: true
    },

    notes: {
      type: 'string'
    }
  },
  autoPK: false

};
