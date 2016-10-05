/**
 * Utilities for manipulating the PureCloud Client UI
 * @module ui
 * @since 1.0.0
 */

let comms = require('../utils/comms');

/**
 * Show the help UI.  Noop if already shown.
 * @since 1.0.0
 *
 * @example
 * purecloud.apps.ui.showHelp();
 */
exports.showHelp = function () {
    comms._sendMsgToPc('showHelp');
};

/**
 * Open the help panel to the specified Resource Center artifact
 *
 * @since 1.0.0
 *
 * @param {string} artifactRelPath - The path of the Resource Center artifact
 * relative to the Resource Center root.  Supports paths and query string params,
 * but not hash params.  The appropriate theme will be inserted automatically.
 *
 * @example
 * // Direct path
 * purecloud.apps.ui.showResourceCenterArtifact('articles/complete-profile');
 *
 * @example
 * // Permalink
 * purecloud.apps.ui.showResourceCenterArtifact('?p=7711');
 */
exports.showResourceCenterArtifact = function (artifactRelPath) {
    comms._sendMsgToPc('showResourceCenterArtifact', {resourceCenterRelPath: artifactRelPath});
};

/**
 * Hide the help UI.  Noop if already hidden.
 * @since 1.0.0
 *
 * @example
 * purecloud.apps.ui.hideHelp();
 */
exports.hideHelp = function () {
    comms._sendMsgToPc('hideHelp');
};
