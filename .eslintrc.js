module.exports = {
  'env': {
    'browser': true,
    'commonjs': true,
    'es6': true,
    'jquery': true,
    'node': true
  },
  'extends': [
    'eslint:recommended'
  ],
  'globals': {
    'angular': 'readonly',
    'sails': 'readonly',

    'Asset': 'readonly',
    'Channel': 'readonly',
    'Flavor': 'readonly',
    'Version': 'readonly',

    'AssetService': 'readonly',
    'AuthService': 'readonly',
    'AuthToken': 'readonly',
    'ChannelService': 'readonly',
    'FlavorService': 'readonly',
    'PlatformService': 'readonly',
    'UtilityService': 'readonly',
    'VersionService': 'readonly',
    'WindowsReleaseService': 'readonly'
  }
};
