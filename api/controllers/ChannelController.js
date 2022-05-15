/**
 * ChannelController
 *
 * @description :: Server-side logic for managing Channels
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

module.exports = {

  /**
   * Returns a list of channel names sorted by their priority
   *
   * ( GET /channels/sorted )
   */
  list: function (req, res) {
    res.send(ChannelService.availableChannels);
  },

};
