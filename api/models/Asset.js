/**
 * Asset.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/#!documentation/models
 */

module.exports = {

  attributes: {

    id: {
      type: 'string',
      primaryKey: true,
      unique: true
    },

    name: {
      type: 'string',
      required: true
    },

    platform: {
      type: 'string',
      enum: ['linux_32', 'linux_64', 'osx_64', 'osx_arm64', 'windows_32', 'windows_64'],
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
      type: 'integer',
      required: true
    },

    download_count: {
      type: 'integer',
      defaultsTo: 0
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
  },

  autoPK: false,

  beforeCreate: (asset, proceed) => {
    const { version, platform, filetype } = asset;

    asset.id = `${version}_${platform}_${filetype.replace(/\./g, '')}`;

    return proceed();
  }

};
