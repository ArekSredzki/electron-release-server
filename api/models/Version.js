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

    availability: {
      type: 'datetime',
      required: true
    },

    notes: {
      type: 'string'
    }
  },

  autoPK: false,

  afterCreate: (version, proceed) => {
    const { availability, createdAt, name } = version;

    if (new Date(availability) < new Date(createdAt)) {
      return Version
        .update(name, { availability: createdAt })
        .exec(proceed);
    }

    return proceed();
  }

};
