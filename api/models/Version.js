/**
 * Version.js
 *
 * @description :: Represents a release version, which has a flavor, contains assets and is a member of a channel
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

    assets: {
      collection: 'asset',
      via: 'version'
    },

    channel: {
      model: 'channel',
      required: true
    },

    availability: {
      type: 'datetime'
    },

    flavor: {
      model: 'flavor',
      defaultsTo: 'default'
    },

    notes: {
      type: 'string'
    }
  },

  autoPK: false,

  beforeCreate: (version, proceed) => {
    const { name, flavor } = version;

    version.id = `${name}_${flavor}`;

    return proceed();
  },

  afterCreate: (version, proceed) => {
    const { availability, createdAt, id } = version;

    if (!availability || new Date(availability) < new Date(createdAt)) {
      return Version
        .update(id, { availability: createdAt })
        .exec(proceed);
    }

    return proceed();
  }

};
