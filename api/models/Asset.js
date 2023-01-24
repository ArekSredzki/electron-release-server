/**
 * Asset.js
 *
 * @description :: A software asset that can be used to install the app (ex. .exe, .dmg, .deb, etc.)
 * @docs        :: http://sailsjs.org/#!documentation/models
 */

module.exports = {

  primaryKey: 'id',

  attributes: {

    id: {
      type: 'string',
      unique: true,
      required: true
    },

    name: {
      type: 'string',
      required: true
    },

    platform: {
      type: 'string',
      isIn: ['linux_32', 'linux_64', 'osx_64', 'osx_arm64', 'windows_32', 'windows_64'],
      required: true
    },

    filetype: {
      type: 'string',
      required: true
    },

    hash: {
      type: 'string'
    },

    size: {
      type: 'number',
      required: true,
      columnType: 'integer'
    },

    download_count: {
      type: 'number',
      defaultsTo: 0,
      columnType: 'integer'
    },

    version: {
      model: 'version',
      required: true
    },

    // File descriptor for the asset
    fd: {
      type: 'string',
      required: true
    }
  }

};
