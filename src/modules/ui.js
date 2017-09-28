/**
 * Utilities for interacting with general PureCloud App UI components
 *
 * @module modules/core-ui
 *
 * @since 1.0.0
 */

import BaseApi from './base';

/**
 * Utilities for interacting with general PureCloud App UI components
 *
 * @extends module:modules/base~BaseApi
 *
 * @since 1.0.0
 */
class CoreUiApi extends BaseApi {
    /**
     * Show the help UI.  Noop if already shown.
     *
     * @example
     * myClientApp.coreUi.showHelp();
     *
     * @since 1.0.0
     */
    showHelp() {
        super.sendMsgToPc('showHelp');
    }

    /**
     * Open the help panel to the specified Resource Center artifact
     *
     * @param {string} artifactRelPath - The path of the Resource Center artifact
     * relative to the Resource Center root.  Supports paths and query string params,
     * but not hash params.  The appropriate theme will be inserted automatically.
     *
     * @example
     * // Direct path
     * myClientApp.coreUi.showResourceCenterArtifact('articles/complete-profile');
     *
     * @example
     * // Permalink
     * myClientApp.coreUi.showResourceCenterArtifact('?p=7711');
     *
     * @since 1.0.0
     */
    showResourceCenterArtifact(artifactRelPath) {
        super.sendMsgToPc('showResourceCenterArtifact', {resourceCenterRelPath: artifactRelPath});
    }

    /**
     * Hide the help UI.  Noop if already hidden.
     *
     * @example
     * myClientApp.coreUi.hideHelp();
     *
     * @since 1.0.0
     */
    hideHelp() {
        super.sendMsgToPc('hideHelp');
    }
}

export default CoreUiApi;
