/**
 * Utilities for interacting with users in the PureCloud Client
 * @module users
 * @since 1.0.0
 */

let comms = require('../utils/comms');

 /**
  * Shows the profile of a specified user
  * @since 1.0.0
  * @param {string} profileId - The id of the user to show
  *
  * @example
  * purecloud.apps.users.showProfile("targetUserId");
  */
exports.showProfile = function(profileId) {
    comms._sendMsgToPc('showProfile', {'profileId': profileId});
};
