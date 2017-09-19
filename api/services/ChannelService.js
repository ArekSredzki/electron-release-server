/**
 * Platform Service
 */

var _ = require('lodash');

var ChannelService = {

};

/**
 * Retrieves all available channels given the most restrictive one
 * @param  {String} channel Channel name
 * @return {Array}          Applicable channel names ordered by desc. stability
 */
ChannelService.getApplicableChannels = function(channel) {
  var channelIndex = sails.config.channels.indexOf(channel);

  if (channelIndex === -1) {
    return ChannelService.availableChannels[ChannelService.availableChannels.length - 1];
  }

  return ChannelService.availableChannels.slice(
    0,
    channelIndex + 1
  );
};

module.exports = ChannelService;
