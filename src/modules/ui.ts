/**
 * Utilities for interacting with general Genesys Cloud App UI components
 *
 * @since 1.0.0
 */

import BaseApi from './base';

/**
 * Utilities for interacting with general Genesys Cloud App UI components
 *
 * @noInheritDoc
 * @since 1.0.0
 */
class CoreUiApi extends BaseApi {
    /**
     * Show the help UI.  Noop if already shown.
     *
     * ```ts
     * myClientApp.coreUi.showHelp();
     * ```
     *
     * @since 1.0.0
     */
    showHelp() {
        super.sendMsgToPc('showHelp');
    }

    /**
     * Open the help panel to the specified Resource Center artifact
     *
     * ```ts
     * // Direct path
     * myClientApp.coreUi.showResourceCenterArtifact('articles/complete-profile');
     * ```
     *
     * ```ts
     * // Permalink
     * myClientApp.coreUi.showResourceCenterArtifact('?p=7711');
     * ```
     * 
     * @param artifactRelPath - The path of the Resource Center artifact
     * relative to the Resource Center root.  Supports paths and query string params,
     * but not hash params.  The appropriate theme will be inserted automatically.
     *
     * @since 1.0.0
     */
    showResourceCenterArtifact(artifactRelPath: string) {
        super.sendMsgToPc('showResourceCenterArtifact', {resourceCenterRelPath: artifactRelPath});
    }

    /**
     * Hide the help UI.  Noop if already hidden.
     *
     * ```ts
     * myClientApp.coreUi.hideHelp();
     * ```
     *
     * @since 1.0.0
     */
    hideHelp() {
        super.sendMsgToPc('hideHelp');
    }

    /**
     * Open a URL in a new window.
     *
     * ```ts
     * myClientApp.coreUi.openWindow("https://en.wikipedia.org/wiki/Main_Page");
     * ```
     * 
     * @param targetUrl - The URL to open in a new window
     * 
     * @since 1.0.0
     */
    openWindow(targetUrl: string) {
        super.sendMsgToPc('openWindow', {targetUrl});
    }

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

    /**
     * Shows the specified group
     *
     * ```ts
     * myClientApp.users.showGroup("targetGroupId");
     * ```
     *
     * @param groupId - The id of the group to show
     * 
     * @since 1.0.0
     */ 
    showGroup(groupId: string) {
        super.sendMsgToPc('showGroup', {'groupId': groupId});
    }
}

export default CoreUiApi;
