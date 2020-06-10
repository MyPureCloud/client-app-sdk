/**
 * Utilities for alerting and attention
 *
 * @module modules/alerting
 *
 * @since 1.0.0
 */

import BaseApi from './base';

const VALID_MESSAGE_TYPES = ['error', 'info', 'success'];
const VALID_SUPPLEMENTAL_OPTIONS = ['id', 'markdownMessage', 'timeout', 'showCloseButton'];

/**
 * Handles aspects of alerting and attention of this app with PureCloud
 *
 * @extends module:modules/base~BaseApi
 *
 * @since 1.0.0
 */
class AlertingApi extends BaseApi {
    /**
     * Displays a toast popup.
     *
     * @param title - Toast title.
     * @param message - Toast Message.  Supports emoticons, emoji (unicode, shortcodes) and markdown (with markdwownMessage boolean).
     * @param options - Additonal toast options.
     * @param options.id - The id of the message.  Duplicate IDs will replace each other in the toast display.  All IDs will be
     *  namespaced with your app ID to avoid collisions.  (Default will just be your app's namespace and will not support multiple messages)
     * @param options.type - Toast type, valid options are 'error', 'info', 'success'.  (Default is 'info')
     * @param options.markdownMessage - Boolean indicating if the message is in MD.  (Default is true)
     * @param options.timeout - Time in seconds to show the toast.  Set to 0 to disable automatic dismissal. (Default is 5)
     * @param options.showCloseButton - Boolean indicating if the close button should be shown. (Defalt is false)
     *
     * @example
     * myClientApp.alerting.showToastPopup("Hello world", "Hello world, how are you doing today?");
     *
     * @example
     * var options = {
     *    type: 'success'
     * };
     * myClientApp.alerting.showToastPopup("Hello world", "Hello world, how are you doing today?", options);
     *
     * @example
     * var options = {
     *    id: 'greeting',
     *    timeout: 0,
     *    showCloseButton: true
     * };
     * myClientApp.alerting.showToastPopup("Hello world", "Hello world, how are you doing today?", options);
     * // Set new id so the messages can show together
     * options.id = 'exit'
     * myClientApp.alerting.showToastPopup("Goodbye world", "See you later world", options);
     *
     *  @example
     * var options = {
     *    id: 'mdExample',
     *    markdownMessage: true
     * };
     * myClientApp.alerting.showToastPopup("Hello world", "Hello :earth_americas: How are *you* doing today?", options);
     *
     * @since 1.0.0
     */
    showToastPopup(title: string, message: string, options?: {
        id?: string;
        type?: string;
        markdownMessage?: boolean;
        timeout?: number;
        showCloseButton?: boolean;
    }) {
        const messageParams = {
            title,
            message,
            type: 'info'
        };

        if (options && typeof options === 'object') {
            if (options.type && typeof options.type === 'string') {
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

        super.sendMsgToPc('showToast', messageParams);
    }

    /**
     * Displays badging for unread messages and notifications
     *
     * @param count - The updated number of unread messages or notifications
     *
     * @example
     * myClientApp.alerting.setAttentionCount(2);
     *
     * @example
     * myClientApp.alerting.setAttentionCount(0);
     *
     * @since 1.0.0
     */
    setAttentionCount(count: number) {
        super.sendMsgToPc('setAttentionCount', {count});
    }
}

export default AlertingApi;
