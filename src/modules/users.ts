/**
 * Utilities for interacting with users in the Genesys Cloud Client
 *
 * @since 1.0.0
 */

import BaseApi from './base';

/**
 * Utilities for interacting with users in the Genesys Cloud Client
 *
 * @noInheritDoc
 * @since 1.0.0
 */
class UsersApi extends BaseApi {
    /**
     * Shows the profile of a specified user
     *
     * ```ts
     * myClientApp.users.showProfile("targetUserId");
     * ```
     *
     * @param userId - The id of the user to show
     * 
     * @since 1.0.0
     */
    showProfile(userId: string) {
        super.sendMsgToPc('showProfile', {'profileId': userId});
    }
}

export default UsersApi;
