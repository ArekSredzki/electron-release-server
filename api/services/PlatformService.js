/**
 * Platform Service
 */

var _ = require('lodash');
var useragent = require('express-useragent');

var PlatformService = {
  LINUX: 'linux',
  LINUX_32: 'linux_32',
  LINUX_64: 'linux_64',
  OSX: 'osx',
  OSX_32: 'osx_32',
  OSX_64: 'osx_64',
  WINDOWS: 'windows',
  WINDOWS_32: 'windows_32',
  WINDOWS_64: 'windows_64',
};

/**
 * Reduce a platfrom ID to its type
 * (ex. windows_64 to windows)
 * @param  {String} platform Platform ID
 * @return {String}          Platform type name
 */
PlatformService.toType = function(platform) {
  return _.head(platform.split('_'));
};

/**
 * Detect the user's platform from a request object
 * @param  {Object} req An express request object
 * @return {String}     String representation of the detected platform
 */
PlatformService.detectFromRequest = function(req) {
  var platform;

  var source = req.headers['user-agent'];
  var ua = useragent.parse(source);

  if (ua.isWindows) return [this.WINDOWS_32, this.WINDOWS_64];
  if (ua.isMac) return [this.OSX_64];
  if (ua.isLinux64) return [this.LINUX_64, this.LINUX_32];
  if (ua.isLinux) return [this.LINUX_32];
};

/**
 * Detect and normalize the platformID from platform name input string.
 * Used to handle unnormalized inputs from user agents.
 * @param  {Object}  platformName An Asset object
 * @param  {Boolean} strictMatch  Whether to only match to the current arch
 *                                If false, 32 bit will be added for 64 bit
 * @return {String}               Full platform ID
 */
PlatformService.detect = function(platformName, strictMatch) {
  var name = platformName.toLowerCase();
  var prefix = '';
  var suffixes = [];

  // Detect prefix: osx, widnows or linux
  if (_.includes(name, 'win')) {
    prefix = this.WINDOWS;
  }

  if (
    _.includes(name, 'linux') ||
    _.includes(name, 'ubuntu')
  ) {
    prefix = this.LINUX;
  }

  if (
    _.includes(name, 'mac') ||
    _.includes(name, 'osx') ||
    name.indexOf('darwin') >= 0
  ) {
    prefix = this.OSX;
  }

  // Detect architecture
  if (
    prefix === this.OSX ||
    // _.includes(name, 'x64') ||
    // _.includes(name, 'amd64') ||
    _.includes(name, '64')
  ) {
    suffixes.push('64');

    if (!strictMatch && prefix !== this.OSX) {
      suffixes.unshift('32');
    }
  } else {
    suffixes.unshift('32');
  }

  var result = [];
  _.forEach(suffixes, function(suffix) {
    result.push(prefix + '_' + suffix);
  });

  return result;
};

PlatformService.sanitize = function(platforms) {
  var self = this;
  return _.map(platforms, function(platform) {
    switch (platform) {
      case self.OSX:
      case self.OSX_32:
        platform = self.OSX_64;
        break;
      default:
    }

    return platform;
  });
}

module.exports = PlatformService;
