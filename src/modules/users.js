/**
 * Utilities for interacting with users in the PureCloud Client
 * @module users
 * @since 1.0.0
 */

 /**
  * Shows the profile of a specified user
  * @since 1.0.0
  * @param {string} profileId - The id of the user to show
  *
  * @example
  * purecloud.apps.showProfile("targetUserId");
  */
exports.showProfile = function(profileId) {
    parent.postMessage({"action": "showProfile", "profileId": profileId}, '*');
};
