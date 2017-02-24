/* jshint node: true */

/**
 * Utilities for integrating with a PureCloud App's Lifecycle
 * @module lifecycle
 * @since 1.0.0
 */

const comms = require('../utils/comms');

/**
 * Signals PureCloud that this app has finished its initialization work and
 * can be shown to the user.
 *
 * @since 1.0.0
 *
 * @example
 * purecloud.apps.lifecycle.bootstrapped();
 */
exports.bootstrapped = function () {
    comms._sendMsgToPc('bootstrapped');
};

/**
 * Signals PureCloud that this app has finished its tear down work and the iframe
 * can be removed from purecloud permanently.
 *
 * @since 1.0.0
 *
 * @example
 * purecloud.apps.lifecycle.stopped();
 */
exports.stopped = function () {
    comms._sendMsgToPc('stopped');
};
