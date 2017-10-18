/**
 * Utilities for monitoring and updating the lifecycle of a PureCloud Client App
 *
 * @module modules/lifecycle
 *
 * @since 1.0.0
 */

import BaseApi from './base';

/**
 * Utilities for monitoring and updating the lifecycle of a PureCloud Client App
 *
 * @extends module:modules/base~BaseApi
 *
 * @since 1.0.0
 */
class LifecycleApi extends BaseApi {
    /**
     * Signals PureCloud that this app has finished its initialization work and
     * can be shown to the user.
     *
     * @example
     * myClientApp.lifecycle.bootstrapped();
     *
     * @since 1.0.0
     */
    bootstrapped() {
        super.sendMsgToPc('bootstrapped');
    }

    /**
     * Signals PureCloud that this app has finished its tear down work and the iframe
     * can be removed from purecloud permanently.
     *
     * @example
     * myClientApp.lifecycle.stopped();
     *
     * @since 1.0.0
     */
    stopped() {
        super.sendMsgToPc('stopped');
    }
}

export default LifecycleApi;
