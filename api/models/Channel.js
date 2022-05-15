/**
 * Channel.js
 *
 * @description :: Various release channel (ex. stable & dev)
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
