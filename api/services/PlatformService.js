/**
 * Platform Service
 */

var _ = require('lodash');
var useragent = require('express-useragent');

var PlatformsService = {
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
PlatformsService.toType = function(platform) {
  return _.head(platform.split('_'));
};

/**
 * Detect the user's platform from a request object
 * @param  {Object} req An express request object
 * @return {String}     String representation of the detected platform
 */
PlatformsService.detectFromRequest = function(req) {
  var platform;

  var source = req.headers['user-agent'];
  var ua = useragent.parse(source);

  if (ua.isWindows) return [this.WINDOWS_32, this.WINDOWS_64];
  if (ua.isMac) return [this.OSX_32, this.OSX_64];
  if (ua.isLinux64) return [this.LINUX_32, this.LINUX_64];
  if (ua.isLinux) return [this.LINUX_32];
};

/**
 * Detect and normalize the platformID from platform name input string.
 * Used to handle unnormalized inputs from user agents
 * @param  {Object} platformName An Asset object
 * @return {String}              Full platform ID
 */
PlatformsService.detect = function(platformName) {
  var name = platformName.toLowerCase();
  var prefix = '';
  var suffixes = ['32'];

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

  // Detect 64 bit
  if (
    _.includes(name, '64') ||
    _.includes(name, 'x64') ||
    _.includes(name, 'amd64')
  ) {
    suffixes.unshift('64'); // Order first
  }

  var result = [];
  _.forEach(suffixes, function (suffix) {
    result.push(prefix + '_' + suffix);
  });

  return result;
};

module.exports = PlatformsService;
