/**
 * Utilities for alerting users in the PureCloud Client
 * @module alerting
 * @since 1.0.0
 */

const comms = require('../utils/comms');

const VALID_MESSAGE_TYPES = ['error', 'info', 'success'];
const VALID_SUPPLEMENTAL_OPTIONS = ['id', 'markdownMessage', 'timeout', 'showCloseButton'];

/**
 * Displays a toast popup.
 * @since 1.0.0
 * @param {string} title - Toast title.
 * @param {string} message - Toast Message.  Supports emoticons, emoji (unicode, shortcodes) and markdown (with markdwownMessage boolean).
 * @param {string} options - Additonal toast options.
 * @param {string} options.id - The id of the message.  Duplicate IDs will replace each other in the toast display.  All IDs will be
 *  namespaced with your app ID to avoid collisions.  (Default will just be your app's namespace and will not support multiple messages)
 * @param {string} options.type - Toast type, valid options are 'error', 'info', 'success'.  (Default is 'info')
 * @param {string} options.markdownMessage - Boolean indicating if the message is in MD.  (Default is true)
 * @param {number} options.timeout - Time in seconds to show the toast.  Set to 0 to disable automatic dismissal. (Default is 5)
 * @param {string} options.showCloseButton - Boolean indicating if the close button should be shown. (Defalt is false)
 *
 * @example
 * purecloud.apps.alerting.showToastPopup("Hello world", "Hello world, how are you doing today?");
 *
 * @example
 * var options = {
 *    type: 'success'
 * };
 * purecloud.apps.alerting.showToastPopup("Hello world", "Hello world, how are you doing today?", options);
 *
 * @example
 * var options = {
 *    id: 'greeting',
 *    timeout: 0,
 *    showCloseButton: true
 * };
 * purecloud.apps.alerting.showToastPopup("Hello world", "Hello world, how are you doing today?", options);
 * // Set new id so the messages can show together
 * options.id = 'exit'
 * purecloud.apps.alerting.showToastPopup("Goodbye world", "See you later world", options);
 *
 *  @example
 * var options = {
 *    id: 'mdExample',
 *    markdownMessage: true
 * };
 * purecloud.apps.alerting.showToastPopup("Hello world", "Hello :earth_americas: How are *you* doing today?", options);
 */
exports.showToastPopup = function (title, message, options) {
    const messageParams = {
        title,
        message,
        type: 'info'
    };

    if (options && typeof options === 'object') {
        if(options.type && typeof options.type === 'string') {
            let requestedType = options.type.trim().toLowerCase();

            if (VALID_MESSAGE_TYPES.indexOf(requestedType) > -1) {
                messageParams.type = requestedType;
            }
        }

        VALID_SUPPLEMENTAL_OPTIONS.forEach(currOption => {
            if (options.hasOwnProperty(currOption)) {
                messageParams[currOption] = options[currOption];
            }
        });
    }

    comms._sendMsgToPc('showToast', messageParams);
};

/**
 * Displays badging for unread messages and notifications
 * @param {number} count - The updated number of unread messages or notifications
 *
 * @example
 * purecloud.apps.alerting.setAttentionCount(2);
 *
 * @example
 * purecloud.apps.alerting.setAttentionCount(0);
 */
exports.setAttentionCount = function (count) {
    comms._sendMsgToPc('setAttentionCount', {count});
};
