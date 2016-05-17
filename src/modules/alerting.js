/**
 * Utilities for alerting users in the PureCloud Client
 * @module alerting
 * @since 1.0.0
 */

let comms = require('../utils/comms');

const VALID_MESSAGE_TYPES = ['error', 'info', 'success'];

function isInt(n) {
   return n % 1 === 0;
}

/**
 * Displays a toast popup.
 * @since 1.0.0
 * @param {string} title - Toast title.
 * @param {string} message - Toast Message.
 * @param {string} options - Additonal toast options.
 * @param {string} options.messageType - Toast type, valid options are 'error', 'info', 'success'.
 * @param {bool}   options.shouldPlaySound - (default true) When set to true, notification sound will play when toast is displayed.
 * @param {number} options.timeout - (default 5) Time in seconds to show the toast.
 * @param {string} options.icon - Url of an icon to show in the toast.
 *
 * @example
 * var options = {
 *    messageType: "info"
 * };
 * purecloud.apps.showToastPopup("Hello world", "Hello world, how are you doing today?", options);
 */
exports.showToastPopup = function (title, message, options) {
    options = options || {};

    let type = "info";
    if(options.messageType && typeof options.messageType === 'string') {
        let requestedType = options.messageType.trim().toLowerCase();

        if (VALID_MESSAGE_TYPES.indexOf(typeToTest) > -1) {
            type = requestedType;
        }
    }

    let messageParams = {
        title,
        message,
        type
    };

    if (options.shouldPlaySound) {
        messageParams.shouldPlaySound = options.shouldPlaySound;
    }

    if (options.timeout && isInt(options.timeout)) {
        messageParams.hideAfter = options.timeout;
    }

    comms._sendMsgToPc('showToast', messageParams);
};
