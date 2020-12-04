/**
 * Utilities for alerting and attention
 *
 * @since 1.0.0
 */

import BaseApi from './base';

const VALID_MESSAGE_TYPES = ['error', 'info', 'success'] as const;
const VALID_SUPPLEMENTAL_OPTIONS = ['id', 'markdownMessage', 'timeout', 'showCloseButton'] as const;

type ValidMessageType = typeof VALID_MESSAGE_TYPES[number];

const isValidMessageType = (type: string): type is ValidMessageType => {
    return VALID_MESSAGE_TYPES.indexOf(type as ValidMessageType) > -1;
};

const pick = <
    T extends Record<string, unknown>,
    K extends keyof T,
>(obj: T, keys: readonly K[]): Pick<T, K> => {
    const newObj = {} as Record<K, any>;
    keys.forEach(key => {
        newObj[key] = obj[key];
    });
    return newObj;
};

type ToastOptions<Type extends ValidMessageType, Timeout extends number> = {
    /**
     * The id of the message.  Duplicate IDs will replace each other in the toast display.  All IDs will be
     * namespaced with your app ID to avoid collisions.  (Default will just be your app's namespace and will not support multiple messages)
     * */
    id?: string;
    /** Toast type, valid options are 'error', 'info', 'success'.  (Default is 'info') */
    type?: Type;
    /** Boolean indicating if the message is in MD.  (Default is true) */
    markdownMessage?: boolean;
} & ToastTimeoutConfig<Type, Timeout> & ToastCloseButtonConfig<Timeout>;

type ToastTimeoutConfig<Type extends ValidMessageType, Timeout extends number> = Type extends 'error'
    ? {
        /**
         * Time in seconds to show the toast.  Set to 0 to disable automatic dismissal. (Default is 7)
         * Timeout must be 0 for toasts with type 'error'.
         */
        timeout: 0;
    } : {
        /** Time in seconds to show the toast.  Set to 0 to disable automatic dismissal. (Default is 7) */
        timeout?: Timeout;
    }

type ToastCloseButtonConfig<Timeout extends number> = Timeout extends 0
    ? {
        /**
         * Boolean indicating if the close button should be shown.
         * Must explicitly set to true when `timeout` is 0; otherwise, default is true
         */
        showCloseButton: true
    } : {
        /**
         * Boolean indicating if the close button should be shown.
         * Must explicitly set to true when `type` is 'error'; otherwise, default is true
         */
        showCloseButton?: boolean
    }

/**
 * Handles aspects of alerting and attention of this app with Genesys Cloud
 *
 * @noInheritDoc
 * @since 1.0.0
 */
class AlertingApi extends BaseApi {
    /**
     * Displays a toast popup.
     *
     * Permanent/Sticky toasts are not allowed.  Therefore, toasts must specify either a manual
     * dismissal (`showCloseButton: true`) or an automatic dismissal (`timeout > 0`). Both
     * `showCloseButton` and `timeout` can be specified to provide both dismissal options.
     *
     * Error toasts (`type: 'error'`) require manual dismissal and must be explictly specified with `showCloseButton: true`.
     * TypeScript users will also specify `timeout: 0` while JavaScript users can specify 0 or omit the prop entirely.
     * The `timeout` prop will be ignored regardless.
     *
     * ```ts
     * myClientApp.alerting.showToastPopup("Hello world", "Hello world, how are you doing today?");
     * ```
     *
     * ```ts
     * var options = {
     *    type: 'success'
     * };
     * myClientApp.alerting.showToastPopup("Hello world", "Hello world, how are you doing today?", options);
     * ```
     *
     * ```ts
     * var options = {
     *    id: 'greeting',
     *    timeout: 0,
     *    showCloseButton: true
     * };
     * myClientApp.alerting.showToastPopup("Hello world", "Hello world, how are you doing today?", options);
     * // Set new id so the messages can show together
     * options.id = 'exit'
     * myClientApp.alerting.showToastPopup("Goodbye world", "See you later world", options);
     * ```
     *
     * ```ts
     * var options = {
     *    id: 'mdExample',
     *    markdownMessage: true
     * };
     * myClientApp.alerting.showToastPopup("Hello world", "Hello :earth_americas: How are *you* doing today?", options);
     * ```
     *
     * @param title - Toast title.
     * @param message - Toast Message.  Supports emoticons, emoji (unicode, shortcodes) and markdown (with markdwownMessage boolean).
     * @param options - Additonal toast options.
     *
     * @since 1.0.0
     */
    showToastPopup<
        MessageType extends ValidMessageType,
        Timeout extends number
    >(
        title: string,
        message: string,
        options: ToastOptions<MessageType, Timeout> = {
            type: 'info',
            timeout: 7,
            showCloseButton: true,
            markdownMessage: true
        } as unknown as ToastOptions<MessageType, Timeout>
    ) {
        const messageParams = {
            title,
            message,
            type: 'info'
        };

        if (options && typeof options === 'object') {
            if (options.type && typeof options.type === 'string') {
                const requestedType = options.type.trim().toLowerCase();

                if (isValidMessageType(requestedType)) {
                    messageParams.type = requestedType;
                }
            }

            const validOptions = pick(options, VALID_SUPPLEMENTAL_OPTIONS);
            Object.assign(messageParams, validOptions);
        }

        super.sendMsgToPc('showToast', messageParams);
    }

    /**
     * Displays badging for unread messages and notifications
     *
     * ```ts
     * myClientApp.alerting.setAttentionCount(2);
     * ```
     *
     * ```ts
     * myClientApp.alerting.setAttentionCount(0);
     * ```
     *
     * @param count - The updated number of unread messages or notifications
     *
     * @since 1.0.0
     */
    setAttentionCount(count: number) {
        super.sendMsgToPc('setAttentionCount', {count});
    }
}

export default AlertingApi;
