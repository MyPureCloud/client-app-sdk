/**
 * Utilities for manipulating the PureCloud Client UI
 * @module ui
 * @since 1.0.0
 */

let comms = require('../utils/comms');

/**
 * Show the help UI.
 * @since 1.0.0
 *
 * @example
 * purecloud.apps.ui.showHelp();
 */
exports.showHelp = function () {
    comms._sendMsgToPc('showHelp');
};

/**
 * Hide the help UI.  Noop if already shown.
 * @since 1.0.0
 *
 * @example
 * purecloud.apps.ui.hideHelp();
 */
exports.hideHelp = function () {
    comms._sendMsgToPc('hideHelp');
};
