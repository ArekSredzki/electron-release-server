/**
 * Windows Release Service
 */

var _ = require('lodash');
var semver = require('semver');
var stripBom = require('strip-bom');

var ChannelService = require('./ChannelService');

var WindowsReleaseService = {};

// Ordered list of supported pre-release channels
var PRERELEASE_CHANNEL_MAGINITUDE = 1000;
var PRERELEASE_CHANNELS = _(ChannelService.availableChannels)
  .without('stable')
  .reverse()
  .value();

// RELEASES parsing
var releaseRegex = /^([0-9a-fA-F]{40})\s+(\S+)\s+(\d+)[\r]*$/;

/**
 * Hash a prerelease
 * @param  {String} s [description]
 * @return {String}   [description]
 */
function hashPrerelease(s) {
  if (_.isString(s[0])) {
    return (_.indexOf(PRERELEASE_CHANNELS, s[0]) + 1) * PRERELEASE_CHANNEL_MAGINITUDE + (s[1] || 0);
  } else {
    return s[0];
  }
}

// Map a semver version to a windows version
WindowsReleaseService.normVersion = function(tag) {
  var parts = new semver.SemVer(tag);
  var prerelease = '';

  if (parts.prerelease && parts.prerelease.length > 0) {
    prerelease = hashPrerelease(parts.prerelease);
  }

  return [
    parts.major,
    parts.minor,
    parts.patch
  ].join('.') + (prerelease ? '.' + prerelease : '');
};

// Map a windows version to a semver
WindowsReleaseService.toSemver = function(tag) {
  var parts = tag.split('.');
  var version = parts.slice(0, 3).join('.');
  var prerelease = Number(parts[3]);

  // semver == windows version
  if (!prerelease) return version;

  var channelId = Math.floor(prerelease / CHANNEL_MAGINITUDE);
  var channel = CHANNELS[channelId - 1];
  var count = prerelease - (channelId * CHANNEL_MAGINITUDE);

  return version + '-' + channel + '.' + count;
};

// Parse RELEASES file
// https://github.com/Squirrel/Squirrel.Windows/blob/0d1250aa6f0c25fe22e92add78af327d1277d97d/src/Squirrel/ReleaseExtensions.cs#L19
WindowsReleaseService.parse = function(content) {
  return _.chain(stripBom(content))
    .replace('\r\n', '\n')
    .split('\n')
    .map(function(line) {
      var parts = releaseRegex.exec(line);
      if (!parts) return null;

      var filename = parts[2];
      var isDelta = filename.indexOf('-full.nupkg') == -1;

      var filenameParts = filename
        .replace('.nupkg', '')
        .replace('-delta', '')
        .replace('-full', '')
        .split(/\.|-/)
        .reverse();

      var version = _.chain(filenameParts)
        .filter(function(x) {
          return /^\d+$/.exec(x);
        })
        .reverse()
        .value()
        .join('.');

      return {
        sha: parts[1],
        filename: filename,
        size: Number(parts[3]),
        isDelta: isDelta,
        version: version,
        semver: toSemver(version)
      };
    })
    .compact()
    .value();
};

// Generate a RELEASES file
WindowsReleaseService.generate = function(assets) {
  return _.map(assets, function(asset) {
      return [
        asset.hash,
        asset.name.replace('-ia32', ''),
        asset.size
      ].join(' ');
    })
    .join('\n');
};

module.exports = WindowsReleaseService;
