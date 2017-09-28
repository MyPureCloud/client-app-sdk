/**
 * Utilities for interacting with users in the PureCloud Client
 *
 * @module modules/users
 *
 * @since 1.0.0
 */

import BaseApi from './base';

/**
 * Utilities for interacting with users in the PureCloud Client
 *
 * @extends module:modules/base~BaseApi
 *
 * @since 1.0.0
 */
class UsersApi extends BaseApi {
    /**
     * Shows the profile of a specified user
     *
     * @param {string} userId - The id of the user to show
     *
     * @example
     * myClientApp.users.showProfile("targetUserId");
     *
     * @since 1.0.0
     */
    showProfile(userId) {
        super.sendMsgToPc('showProfile', {'profileId': userId});
    }
}

export default UsersApi;
