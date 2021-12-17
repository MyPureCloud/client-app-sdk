/**
 * Utilities for interacting with users in the Genesys Cloud Client
 *
 * @since 1.0.0
 *
 * @deprecated Use {@link module:directory} instead. (Since 2.3.0)
 */

import BaseApi from './base';

/**
 * Utilities for interacting with users in the Genesys Cloud Client
 *
 * @noInheritDoc
 * @since 1.0.0
 *
 * @deprecated Use {@link DirectoryApi} instead. (Since 2.3.0)
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
     *
     * @deprecated Use {@link ClientApp#directory#showUser} instead. (Since 2.3.0)
     *
     * @see [DirectoryApi#showUser](directoryapi.md#showuser) for a replacement.
     */
    showProfile(userId: string) {
        super.sendMsgToPc('showProfile', {'profileId': userId});
    }
}

export default UsersApi;
