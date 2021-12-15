/**
 * Utilities for interacting with the company directory in the Genesys Cloud Client
 *
 * @since 2.3.0
 */

import BaseApi from './base';

/**
 * Utilities for interacting with the company directory in the Genesys Cloud Client
 *
 * @noInheritDoc
 * @since 2.3.0
 */
class DirectoryApi extends BaseApi {
    /**
     * Shows the profile of a specified user
     *
     * ```ts
     * myClientApp.directory.showUser("targetUserId");
     * ```
     *
     * @param userId - The id of the user to show
     *
     * @since 2.3.0
     */
    showUser(userId: string) {
        super.sendMsgToPc('showProfile', { profileId: userId });
    }

    /**
     * Shows the specified group
     *
     * ```ts
     * myClientApp.directory.showGroup("targetGroupId");
     * ```
     *
     * @param groupId - The id of the group to show
     *
     * @since 2.3.0
     */
    showGroup(groupId: string) {
        super.sendMsgToPc('showGroup', { groupId: groupId });
    }
}

export default DirectoryApi;
