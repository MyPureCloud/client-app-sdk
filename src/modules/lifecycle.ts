/**
 * Utilities for monitoring and updating the lifecycle of a Genesys Cloud Client App
 *
 * @since 1.0.0
 */

import BaseApi, { SDKMessagePayload, MessagePayloadFilter } from './base';

export type LifecycleHook = 'bootstrap' | 'focus' | 'blur' | 'stop';

const LIFECYCLE_HOOK_EVENT_NAME = 'appLifecycleHook';
const buildHookFilter = (hookName: LifecycleHook): MessagePayloadFilter => (msgPayload) => {
    return (typeof msgPayload === 'object' && msgPayload.hook === hookName);
};
const BOOTSTRAP_HOOK_FILTER = buildHookFilter('bootstrap');
const FOCUS_HOOK_FILTER = buildHookFilter('focus');
const BLUR_HOOK_FILTER = buildHookFilter('blur');
const STOP_HOOK_FILTER = buildHookFilter('stop');

/**
 * Utilities for monitoring and updating the lifecycle of a Genesys Cloud Client App
 *
 * ### Lifecycle Hooks
 *
 * These utilities require the app to be opted into the appropriate lifecycle hook via
 * advanced configuration.  This can be set via the API, Admin UI, or hard-coded for Premium Apps.
 * The format of lifecycle hooks in advanced configuration is as follows:
 *
 * ```json
 * {
 *   "lifecycle": {
 *     "ephemeral": <boolean>,
 *     "hooks": {
 *       "stop": <boolean>,
 *       "blur": <boolean>,
 *       "focus": <boolean>,
 *       "bootstrap": <boolean>
 *     }
 *   }
 * }
 * ```
 *
 * @see [Advanced Application Concepts - Lifecycle Events](/api/client-apps/advanced.html#lifecycle_events) for more details
 * @noInheritDoc
 * @since 1.0.0
 */
class LifecycleApi extends BaseApi {
    /**
     * Attach a listener function to be called when Genesys Cloud has loaded the app.
     *
     * This provides a hook for implementers to do any post-load initialization
     * work with Genesys Cloud.  Implementers should call bootstrapped() after initialization work is
     * complete.  Genesys Cloud will eventually timeout and show the app anyway if the bootstrapped()
     * function is not called in a timely manor.
     *
     * #### Required Lifecycle Hooks ([More Info](/api/client-apps/advanced.html#lifecycle_events))
     * * `bootstrap`
     *
     * ```ts
     * myClientApp.lifecycle.addBootstrapListener(() => {
     *   // Perform bootstrap (post-load init) work
     *
     *   // Simulate 500ms delay
     *   window.setTimeout(() => {
     *     myClientApp.lifecycle.bootstrapped();
     *   }, 500);
     * });
     * ```
     * 
     * @param listener - The function to call when Genesys Cloud is ready for the app to
     * perform post-load initialization work.  This function will be passed the lifecycle event and
     * does not augment the this context.
     * @param once - If the listener should only be invoked once or repeatedly; true by default.
     *
     * @see [Advanced Application Concepts - Lifecycle Events](/api/client-apps/advanced.html#lifecycle_events)
     *
     * @since 1.0.0
     */
    addBootstrapListener(listener: (event: SDKMessagePayload) => void, once = true) {
        this.addMsgListener(LIFECYCLE_HOOK_EVENT_NAME, listener, {
            once,
            msgPayloadFilter: BOOTSTRAP_HOOK_FILTER
        });
    }

    /**
     * Signals Genesys Cloud that this app has finished its initialization work and
     * can be shown to the user.
     *
     * #### Required Lifecycle Hooks ([More Info](/api/client-apps/advanced.html#lifecycle_events))
     * * `bootstrap`
     *
     * ```ts
     * myClientApp.lifecycle.bootstrapped();
     * ```
     *
     * @see [Advanced Application Concepts - Lifecycle Events](/api/client-apps/advanced.html#lifecycle_events)
     *
     * @since 1.0.0
     */
    bootstrapped() {
        super.sendMsgToPc('bootstrapped');
    }

    /**
     * Remove a previously registered bootstrap lifecycle event listener.
     *
     * #### Required Lifecycle Hooks ([More Info](/api/client-apps/advanced.html#lifecycle_events))
     * * `bootstrap`
     * 
     * ```ts
     * let onBootstrap = evt => {
     *   // Perform bootstrap (post-load init) work
     *
     *   // Remove the listener. [Note:] once must be provided to match
     *   myClientApp.lifecycle.removeBootstrapListener(onBootstrap, false);
     * };
     * // Note once must be set to false or the listener will be auto-removed by default
     * myClientApp.lifecycle.addBootstrapListener(onBootstrap, false);
     * ```
     *
     * @param listener - The previously registered bootstrap event listener.
     * @param once - false if once was explicitly set as false when adding the listener;
     *  otherwise, you can explicitly provide true or rely on the default.
     *
     * @see [Advanced Application Concepts - Lifecycle Events](/api/client-apps/advanced.html#lifecycle_events)
     *
     * @since 1.0.0
     */
    removeBootstrapListener(listener: (event: SDKMessagePayload) => void, once = true) {
        this.removeMsgListener(LIFECYCLE_HOOK_EVENT_NAME, listener, {
            once,
            msgPayloadFilter: BOOTSTRAP_HOOK_FILTER
        });
    }

    /**
     * Attach a listener function to be called when the user has re-focused your app.
     * [Note:] Focus is not called on initial show.  Use the bootstrap listener for that work.
     *
     * #### Required Lifecycle Hooks ([More Info](/api/client-apps/advanced.html#lifecycle_events))
     * * `focus`
     * 
     * ```ts
     * let onFocus = evt => {
     *   // Perform focus work
     * };
     * myClientApp.lifecycle.addFocusListener(onFocus);
     *
     * // Don't forget to remove this listener inside the stop event listener
     * myClientApp.lifecycle.addStopListener(() => {
     *   myClientApp.lifecycle.removeFocusListener(onFocus);
     * });
     * ```
     *
     * @param listener - The function to call when the user has re-focused your app in the UI.
     * @param once - If the listener should only be invoked once or repeatedly; false by default.
     *
     * @see [Advanced Application Concepts - Lifecycle Events](/api/client-apps/advanced.html#lifecycle_events)
     *
     * @since 1.0.0
     */
    addFocusListener(listener: (event: SDKMessagePayload) => void, once = false) {
        this.addMsgListener(LIFECYCLE_HOOK_EVENT_NAME, listener, {
            once,
            msgPayloadFilter: FOCUS_HOOK_FILTER
        });
    }

    /**
     * Remove a previously registered focus lifecycle event listener
     *
     * #### Required Lifecycle Hooks ([More Info](/api/client-apps/advanced.html#lifecycle_events))
     * * `focus`
     * 
     * ```ts
     * let onFocus = evt => {
     *   // Perform focus work
     * };
     * myClientApp.lifecycle.addFocusListener(onFocus);
     *
     * // Don't forget to remove this listener inside the stop event listener
     * myClientApp.lifecycle.addStopListener(() => {
     *   myClientApp.lifecycle.removeFocusListener(onFocus);
     * });
     * ```
     *
     * @param listener - The previously registered focus event listener.
     * @param once - true if once was explicitly set as true when adding the listener;
     *  otherwise, you can explicitly provide false or rely on the default.
     *
     * @see [Advanced Application Concepts - Lifecycle Events](/api/client-apps/advanced.html#lifecycle_events)
     *
     * @since 1.0.0
     */
    removeFocusListener(listener: (event: SDKMessagePayload) => void, once = false) {
        this.removeMsgListener(LIFECYCLE_HOOK_EVENT_NAME, listener, {
            once,
            msgPayloadFilter: FOCUS_HOOK_FILTER
        });
    }

    /**
     * Attach a listener function to be called when the user has left/blurred your app.
     *
     * #### Required Lifecycle Hooks ([More Info](/api/client-apps/advanced.html#lifecycle_events))
     * * `blur`
     * 
     * ```ts
     * let onBlur = evt => {
     *   // Perform blur work
     * };
     * myClientApp.lifecycle.addBlurListener(onBlur);
     *
     * // Don't forget to remove this listener inside the stop event listener
     * myClientApp.lifecycle.addStopListener(() => {
     *   myClientApp.lifecycle.removeBlurListener(onBlur);
     * });
     * ```
     *
     * @param listener - The function to call when the user has left your
     * app in the UI.
     * @param once - If the listener should only be invoked once or repeatedly; false by default.
     *
     * @see [Advanced Application Concepts - Lifecycle Events](/api/client-apps/advanced.html#lifecycle_events)
     *
     * @since 1.0.0
     */
    addBlurListener(listener: (event: SDKMessagePayload) => void, once = false) {
        this.addMsgListener(LIFECYCLE_HOOK_EVENT_NAME, listener, {
            once,
            msgPayloadFilter: BLUR_HOOK_FILTER
        });
    }

    /**
     * Remove a previously registered blur lifecycle event listener
     *
     * #### Required Lifecycle Hooks ([More Info](/api/client-apps/advanced.html#lifecycle_events))
     * * `blur`
     * 
     * ```ts
     * let onBlur = evt => {
     *   // Perform blur work
     * };
     * myClientApp.lifecycle.addBlurListener(onBlur);
     *
     * // Don't forget to remove this listener inside the stop event listener
     * myClientApp.lifecycle.addStopListener(() => {
     *   myClientApp.lifecycle.removeBlurListener(onBlur);
     * });
     * ```
     *
     * @param listener - The previously registered blur event listener.
     * @param once - true if once was explicitly set as true when adding the listener;
     *  otherwise, you can explicitly provide false or rely on the default.
     *
     * @see [Advanced Application Concepts - Lifecycle Events](/api/client-apps/advanced.html#lifecycle_events)
     *
     * @since 1.0.0
     */
    removeBlurListener(listener: (event: SDKMessagePayload) => void, once = false) {
        this.removeMsgListener(LIFECYCLE_HOOK_EVENT_NAME, listener, {
            once,
            msgPayloadFilter: BLUR_HOOK_FILTER
        });
    }

    /**
     * Attach a listener function to be called when Genesys Cloud is about to shut down your app.
     * For instance, this can happen if the user has loaded too many apps and your app needs to be
     * stopped to conserve resources.
     *
     * This provides a hook for you to do any app cleanup work.  Implementers should call
     * stopped() after shutdown work is complete.  Genesys Cloud will eventually timeout and permanenty
     * remove the app anyway if stopped() is not called in a timely manor.
     *
     * #### Required Lifecycle Hooks ([More Info](/api/client-apps/advanced.html#lifecycle_events))
     * * `stop`
     * 
     * ```ts
     * myClientApp.lifecycle.addStopListener(() => {
     *   // Perform shutdown work
     *
     *   // Simulate 500ms delay
     *   window.setTimeout(() => {
     *     myClientApp.lifecycle.stopped();
     *   }, 500);
     * });
     * ```
     *
     * @param listener - The function to call when Genesys Cloud is about to stop this app.
     * This function will be passed the lifecycle event and does not augment the this context.
     * @param once - If the listener should only be invoked once or repeatedly; true by default.
     *
     * @see [Advanced Application Concepts - Lifecycle Events](/api/client-apps/advanced.html#lifecycle_events)
     *
     * @since 1.0.0
     */
    addStopListener(listener: (event: SDKMessagePayload) => void, once = true) {
        this.addMsgListener(LIFECYCLE_HOOK_EVENT_NAME, listener, {
            once,
            msgPayloadFilter: STOP_HOOK_FILTER
        });
    }

    /**
     * Signals Genesys Cloud that this app has finished its tear down work and the iframe
     * can be removed from Genesys Cloud permanently.
     *
     * #### Required Lifecycle Hooks ([More Info](/api/client-apps/advanced.html#lifecycle_events))
     * * `stop`
     *
     * ```ts
     * myClientApp.lifecycle.stopped();
     * ```
     *
     * @see [Advanced Application Concepts - Lifecycle Events](/api/client-apps/advanced.html#lifecycle_events)
     *
     * @since 1.0.0
     */
    stopped() {
        super.sendMsgToPc('stopped');
    }

    /**
     * Remove a previously registered stop lifecycle event listener.
     *
     * #### Required Lifecycle Hooks ([More Info](/api/client-apps/advanced.html#lifecycle_events))
     * * `stop`
     * 
     * ```ts
     * let onStop = evt => {
     *   // Perform cleanup work
     *
     *   // Don't forget to notify Genesys Cloud on complete
     *   myClientApp.lifecycle.stopped();
     *
     *   // Remove the stop listener (since you passed false for the once option)
     *   // Note: You must also pass false for once to match the listener
     *   myClientApp.lifecycle.removeStopListener(onStop, false);
     * };
     * // Note: once must be set to false or the listener will be auto-removed by default
     * myClientApp.lifecycle.addStopListener(onStop, false);
     * ```
     *
     * @param listener - The previously registered stop event listener.
     * @param once - false if once was explicitly set as false when adding the listener;
     *  otherwise, you can explicitly provide true or rely on the default.
     *
     * @see [Advanced Application Concepts - Lifecycle Events](/api/client-apps/advanced.html#lifecycle_events)
     *
     * @since 1.0.0
     */
    removeStopListener(listener: (event: SDKMessagePayload) => void, once = true) {
        this.removeMsgListener(LIFECYCLE_HOOK_EVENT_NAME, listener, {
            once,
            msgPayloadFilter: STOP_HOOK_FILTER
        });
    }
}

export default LifecycleApi;
