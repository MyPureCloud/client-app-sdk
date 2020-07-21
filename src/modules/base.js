/**
 * Base module for all API modules
 *
 * @module modules/base
 *
 * @since 1.0.0
 */
import commsUtils from '../utils/comms';
import {name as PROTOCOL_AGENT_NAME, version as PROTOCOL_AGENT_VERSION} from '../../package.json';

const PROTOCOL_NAME = 'purecloud-client-apps';

const ACTION_NAME_KEY = 'action';
const PROTOCOL_NAME_KEY = 'protocol';
const PROTOCOL_AGENT_NAME_KEY = 'protocolAgentName';
const PROTOCOL_AGENT_VERSION_KEY = 'protocolAgentVersion';

/**
 * Base Class for Genesys Cloud Client App APIs
 *
 * @since 1.0.0
 */
class BaseApi {
    /**
     * Instantiates the BaseApi
     *
     * @param {object=} cfg Optional configuration
     * @param {string=} cfg.targetPcOrigin The origin (protocol, hostname, and port) of the target PC environment (e.g. https://apps.mypurecloud.com). Default is '*'.
     * @param {string=} cfg.protocol The name of the message protocol under which the message will be sent. Default is purecloud-client-apps.
     * @param {string=} cfg.protocolAgentName The name of the agent from which the message will be sent. Default is purecloud-client-app-sdk (name of the package).
     * @param {string=} cfg.protocolAgentVersion The version of the agent from which the message will be sent. Default is the version of the package.
     *
     * @since 1.0.0
     */
    constructor(cfg = {}) {
        this._targetPcOrigin = cfg.targetPcOrigin || '*';

        this._protocolDetails = {
            name: cfg.protocol || PROTOCOL_NAME,
            agentName: cfg.protocolAgentName || PROTOCOL_AGENT_NAME,
            agentVersion: cfg.protocolAgentVersion || PROTOCOL_AGENT_VERSION
        };

        /**
         * Injection point for tests.  Should not be used by api users or extenders.
         *
         * @private
         * @ignore
         */
        this._commsUtils = commsUtils;

        // ----- Message Listening

        this._msgListenerCfgs = {};
        this._msgHandler = this._onMsg.bind(this);

        /**
         * Injection point for tests.  Should not be used by api users or extenders.
         *
         * @private
         * @ignore
         */
        this._myWindow = window;

        /**
         * Injection point for tests.  Should not be used by api users or extenders.
         *
         * @private
         * @ignore
         */
        this._myParent = (window ? window.parent : undefined);
    }

    /**
     * Sends the message to Genesys Cloud augmenting with environmental details such as
     * target env origin and version info.  Accessible by extenders.
     *
     * @param {string} actionName
     * @param {object} msgPayload
     *
     * @package
     * @ignore Extender-use only.  Not a public API
     *
     * @since 1.0.0
     */
    sendMsgToPc(actionName, msgPayload) {
        this._commsUtils.postMsgToPc(this.buildSdkMsgPayload(...arguments), this._targetPcOrigin);
    }

    /**
     * Constructs a payload tailored for the Genesys Cloud Client Apps SDK.  Can be
     * overridden by extenders, but should not be invoked externally.
     *
     * @param string actionName - The name of the client-app action to invoke
     * @param object msgPayload - Action-specific payload data
     *
     * @returns {object} A postMessage payload for the Client Apps SDK
     *
     * @package
     * @ignore Extender-use only.  Not a public API
     *
     * @since 1.0.0
     */
    buildSdkMsgPayload(actionName, msgPayload = null) {
        let result = {};

        // Clone the payload
        if (msgPayload && typeof msgPayload === 'object') {
            result = JSON.parse(JSON.stringify(msgPayload));
        }

        result[ACTION_NAME_KEY] = actionName;

        result[PROTOCOL_NAME_KEY] = this._protocolDetails.name;
        result[PROTOCOL_AGENT_NAME_KEY] = this._protocolDetails.agentName;
        result[PROTOCOL_AGENT_VERSION_KEY] = this._protocolDetails.agentVersion;

        return result;
    }

    // ----- Message Listening

    /**
     * Adds the specified listener to messages sent from the host Genesys Cloud appliation
     * on the specified eventType
     *
     * @param {string} eventType - The name of the purecloudEventType in the message; case and leading/trailing space sensitive
     * @param {function} listener - The listener function to invoke when a message of the specified eventType
     *   is received.  Message data will be passed
     * @param {object} options - Options for the invocation of the listener; null/undefined will use defaults
     * @param {boolean} options.once - Set to true to only invoke this listener once; it will be removed after first invocation.
     *  false by default.  null/undefined will use default.
     * @param {boolean} options.msgPayloadFilter - Provide a function to further filter the invocation of the listener;
     *  The listener will be called if this method returns a truthy value. null by default.  undefined will also use default.
     *
     * @since 1.0.0
     * @ignore Extender-use only.  Not a public API
     */
    addMsgListener(eventType, listener, options = {}) {
        if (!eventType || typeof eventType !== 'string' || eventType.trim().length === 0) {
            throw new Error('Invalid eventType provided to addMsgListener');
        }

        if (!listener || typeof listener !== 'function') {
            throw new Error('Invalid listener provided to addMsgListener');
        }

        let proposedListenerCfg = {
            listener,
            options: this._buildNormalizedListenerOptions(options)
        };

        let duplicateListener = false;
        let listenerCfgs = this._msgListenerCfgs[eventType];
        if (!listenerCfgs) {
            listenerCfgs = [];
            this._msgListenerCfgs[eventType] = listenerCfgs;
        } else if (listenerCfgs.length > 0) {
            // Check for duplicates
            listenerCfgs.forEach(currListenerCfg => {
                if (this._isDuplicateListenerCfg(currListenerCfg, proposedListenerCfg)) {
                    duplicateListener = true;
                }
            });
        }

        if (!duplicateListener) {
            listenerCfgs.push(proposedListenerCfg);

            if (this._getListenerCount() === 1) {
                // This is the addition of the only active listener, start listening
                this._subscribeToMsgs();
            }
        }
    }

    /**
     * Removes the specified listener from messages sent from the host Genesys Cloud appliation
     * on the specified eventType. eventType, listener (strict equality), and options must match.
     *
     * @param {string} eventType - The name of the purecloudEventType previously registered; case and leading/trailing space sensitive
     * @param {function} listener - The exact listener function instance that was previously registered.
     * @param {object} options - Options registered with the listener;
     *  null and undefined trigger defaults and will be considered equal.
     * @param {boolean} options.once - Set as true if once was explicitly set as true when adding the listener;
     *  otherwise, you can explicitly provide false or rely on the default.
     * @param {function} options.msgPayloadFilter - Provide the same function instance provided when adding the listener;
     *  otherwise, you can rely on the empty default by either not specifing a function or providing null/undefined.
     *
     * @returns undefined
     *
     * @throws Error if the eventType, listener, or options are invalid
     *
     * @since 1.0.0
     * @ignore Extender-use only.  Not a public API
     */
    removeMsgListener(eventType, listener, options = {}) {
        if (!eventType || typeof eventType !== 'string' || eventType.trim().length === 0) {
            throw new Error('Invalid eventType provided to removeMsgListener');
        }

        if (!listener || typeof listener !== 'function') {
            throw new Error('Invalid listener provided to removeMsgListener');
        }

        // Note: Building the normalized options also validates the options param.
        // This should stay here to always validate the params regardless of eventType listener presence
        let listenerCfgToRemove = {
            listener,
            options: this._buildNormalizedListenerOptions(options)
        };

        let eventTypeListenerCfgs = this._msgListenerCfgs[eventType];
        if (eventTypeListenerCfgs) {
            let listenerCfgIndex = -1;
            for (let index = 0; index < eventTypeListenerCfgs.length; index++) {
                if (this._isDuplicateListenerCfg(eventTypeListenerCfgs[index], listenerCfgToRemove)) {
                    listenerCfgIndex = index;
                    break;
                }
            }

            if (listenerCfgIndex >= 0) {
                eventTypeListenerCfgs.splice(listenerCfgIndex, 1);

                if (this._getListenerCount() === 0) {
                    // No more listeners, tear down our listener
                    this._unsubscribeFromMsgs();
                }
            }
        }
    }

    /**
     * Returns the total number of registered listeners.
     *
     * @private
     * @ignore
     */
    _getListenerCount() {
        let result = 0;

        Object.keys(this._msgListenerCfgs).forEach(currEventType => {
            let currListenerCfgs = this._msgListenerCfgs[currEventType];

            if (currListenerCfgs) {
                result += currListenerCfgs.length;
            }
        });

        return result;
    }

    /**
     * Intiate listening for messages from the host Genesys Cloud application
     *
     * @private
     * @ignore
     */
    _subscribeToMsgs() {
        this._myWindow.addEventListener('message', this._msgHandler);
    }

    /**
     * Stop listening for messages from the host Genesys Cloud application
     *
     * @private
     * @ignore
     */
    _unsubscribeFromMsgs() {
        this._myWindow.removeEventListener('message', this._msgHandler);
    }

    /**
     * Message handler function that will filter message events and invoke the correct, registered
     * listeners.
     *
     * @private
     * @ignore
     */
    _onMsg(event) {
        if (!event || !event.source || !event.origin || event.source !== this._myParent ||
            event.origin !== this._targetPcOrigin || !event.data || typeof event.data !== 'object' ||
            Array.isArray(event.data)) {
            // Fast-fail for invalid or unknown event
            return;
        }

        // Validate base payload
        let eventType = event.data.purecloudEventType;
        if (eventType && typeof eventType === 'string' && eventType.trim()) {
            let eventTypeListenerCfgs = this._msgListenerCfgs[eventType];
            if (eventTypeListenerCfgs && eventTypeListenerCfgs.length > 0) {
                let listenerCfgsToRemove = [];

                eventTypeListenerCfgs.forEach(currListenerCfg => {
                    if (!currListenerCfg.options.msgPayloadFilter || currListenerCfg.options.msgPayloadFilter(event.data)) {
                        // Clone the event data and prune internal props before sending the event to user-space
                        let userSpaceEventData = JSON.parse(JSON.stringify(event.data));
                        delete userSpaceEventData[PROTOCOL_NAME_KEY];

                        currListenerCfg.listener(userSpaceEventData);

                        if (currListenerCfg.options.once) {
                            listenerCfgsToRemove.push(currListenerCfg);
                        }
                    }
                });

                if (listenerCfgsToRemove.length > 0) {
                    listenerCfgsToRemove.forEach(currListenerCfg => {
                        this.removeMsgListener(eventType, currListenerCfg.listener, currListenerCfg.options);
                    });
                }
            }
        }
    }

    /**
     * Validates and normalizes listener options. msgPayloadFilter will be normalized to null and once
     * will be normalized to false if not specified or specified as an "empty" object (null/undefined).
     *
     * @param {object} options The additional options config provided to [add|remove]MsgListener; null and undefined also allowed.
     * @param {function} options.msgPayloadFilter An additional filtering function; null and undefined also allowed.
     * @param {boolean} options.once A boolean indicating if the listener should be removed after first fire; null and undefined also allowed.
     *
     * @returns A normalized listener options object containing the msgPayloadFilter and once properties.
     * msgPayloadFilter will be null unless a valid function is explicitly provided.  once will be false unless true
     * is explictly provided.
     *
     * @throws Error if options is not null, undefined, or an object
     * @throws Error if options.msgPayloadFilter is not null, undefined, or a function
     * @throws Error if options.once is not null, undefined, or a boolean
     *
     * @private
     * @ignore
     */
    _buildNormalizedListenerOptions(options) {
        let result = {
            msgPayloadFilter: null,
            once: false
        };

        if (options === null || options === undefined) {
            return result;
        }

        if (typeof options !== 'object' || Array.isArray(options)) {
            throw new Error('Invalid options provided');
        }

        let filter = options.msgPayloadFilter;
        if (filter !== null && filter !== undefined && typeof filter !== 'function') {
            throw new Error('options.msgPayloadFilter must be a function if specified');
        }
        result.msgPayloadFilter = filter || null;

        if (options.once !== null && options.once !== undefined && typeof options.once !== 'boolean') {
            throw new Error('options.once must be a boolean if specified');
        }
        result.once = options.once || false;

        return result;
    }

    /**
     * Determines if the specified listener configs are duplicates with respect to
     * listener registration.  Assumes the configs will be normalized for easier comparison.
     *
     * @param {object} listenerCfg1 The first config
     * @param {object} listenerCfg2 The second config
     *
     * @returns true if the listener, msgPayloadFilter, and once are equal; false otherwise
     *
     * @private
     * @ignore
     */
    _isDuplicateListenerCfg(listenerCfg1, listenerCfg2) {
        return (listenerCfg1.listener === listenerCfg2.listener &&
            listenerCfg1.options.once === listenerCfg2.options.once &&
            listenerCfg1.options.msgPayloadFilter === listenerCfg2.options.msgPayloadFilter);
    }
}

export default BaseApi;
