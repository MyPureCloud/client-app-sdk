/**
 * Base module for all API modules
 *
 * @since 1.0.0
 */
import commsUtils from '../utils/comms';

const PROTOCOL_NAME = 'purecloud-client-apps';

interface ProtocolDetails {
    name: string;
    agentName: string;
    agentVersion: string;
}

export interface SDKMessagePayload {
    action: string;
    hook?: string;
    protocol: string;
    protocolAgentName: string;
    protocolAgentVersion: string;
}

export type MessageListener = (event: SDKMessagePayload) => void;
export type MessagePayloadFilter = (payload: SDKMessagePayload) => boolean;

type ListenerOptions = Partial<{
    /** 
     * Set to true to only invoke this listener once; it will be removed after first invocation.
     * false by default.  null/undefined will use default.
     */
    once: boolean;
    /**
     * Provide a function to further filter the invocation of the listener;
     * The listener will be called if this method returns a truthy value. null by default.  undefined will also use default.
     */
    msgPayloadFilter: MessagePayloadFilter | null;
}>

interface ListenerConfig {
    listener: MessageListener;
    options: ListenerOptions;
}

/**
 * Base Class for Genesys Cloud Client App APIs
 *
 * @since 1.0.0
 */
class BaseApi {
    private _targetPcOrigin: string;
    private _protocolDetails: ProtocolDetails;

    // ----- Message Listening
    private _msgListenerCfgs: Record<string, ListenerConfig[]> = {};
    private _msgHandler = (event: MessageEvent) => this._onMsg(event);

    /**
     * Injection point for tests.  Should not be used by api users or extenders.
     */
    private _commsUtils = commsUtils;

    /**
     * Injection point for tests.  Should not be used by api users or extenders.
     */
    private _myWindow = window as Window;

    /**
     * Injection point for tests.  Should not be used by api users or extenders.
     */
    private _myParent = (window ? window.parent : undefined);

    /**
     * Instantiates the BaseApi
     *
     * @param cfg Optional configuration
     *
     * @since 1.0.0
     */
    constructor(cfg: {
        /** The origin (protocol, hostname, and port) of the target PC environment (e.g. https://apps.mypurecloud.com). Default is '*'. */
        targetPcOrigin?: string | null,
        /** The name of the message protocol under which the message will be sent. Default is purecloud-client-apps. */
        protocol?: string | null;
        /** The name of the agent from which the message will be sent. Default is purecloud-client-app-sdk (name of the package). */
        protocolAgentName?: string | null;
        /** The version of the agent from which the message will be sent. Default is the version of the package. */
        protocolAgentVersion?: string | null;
    } = {}) {
        this._targetPcOrigin = cfg.targetPcOrigin || '*';

        this._protocolDetails = {
            name: cfg.protocol || PROTOCOL_NAME,
            agentName: cfg.protocolAgentName || __PACKAGE_NAME__,
            agentVersion: cfg.protocolAgentVersion || __PACKAGE_VERSION__
        };
    }

    /**
     * Sends the message to Genesys Cloud augmenting with environmental details such as
     * target env origin and version info.  Accessible by extenders.
     *
     * @param actionName
     * @param msgPayload
     *
     * @since 1.0.0
     */
    protected sendMsgToPc(actionName: string, msgPayload?: object) {
        this._commsUtils.postMsgToPc(this.buildSdkMsgPayload(actionName, msgPayload), this._targetPcOrigin);
    }

    /**
     * Constructs a payload tailored for the Genesys Cloud Client Apps SDK.  Can be
     * overridden by extenders, but should not be invoked externally.
     *
     * @param actionName - The name of the client-app action to invoke
     * @param msgPayload - Action-specific payload data
     *
     * @returns A postMessage payload for the Client Apps SDK
     *
     * @since 1.0.0
     */
    protected buildSdkMsgPayload(actionName: string, msgPayload?: object) {
        let result = {} as SDKMessagePayload;

        // Clone the payload
        if (msgPayload && typeof msgPayload === 'object') {
            result = JSON.parse(JSON.stringify(msgPayload));
        }

        result.action = actionName;
        result.protocol = this._protocolDetails.name;
        result.protocolAgentName = this._protocolDetails.agentName;
        result.protocolAgentVersion = this._protocolDetails.agentVersion;

        return result;
    }

    // ----- Message Listening

    /**
     * Adds the specified listener to messages sent from the host Genesys Cloud appliation
     * on the specified eventType
     *
     * @param eventType - The name of the purecloudEventType in the message; case and leading/trailing space sensitive
     * @param listener - The listener function to invoke when a message of the specified eventType
     *   is received.  Message data will be passed
     * @param options - Options for the invocation of the listener; null/undefined will use defaults
     *
     * @since 1.0.0
     */
    protected addMsgListener(eventType: string, listener: MessageListener, options: ListenerOptions | null = {}) {
        if (!eventType || typeof eventType !== 'string' || eventType.trim().length === 0) {
            throw new Error('Invalid eventType provided to addMsgListener');
        }

        if (!listener || typeof listener !== 'function') {
            throw new Error('Invalid listener provided to addMsgListener');
        }

        const proposedListenerCfg = {
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
     * @param eventType - The name of the purecloudEventType previously registered; case and leading/trailing space sensitive
     * @param listener - The exact listener function instance that was previously registered.
     * @param options - Options registered with the listener;
     *  null and undefined trigger defaults and will be considered equal.
     *
     * @throws Error if the eventType, listener, or options are invalid
     *
     * @since 1.0.0
     */
    protected removeMsgListener(eventType: string, listener: MessageListener, options: ListenerOptions | null = {}) {
        if (!eventType || typeof eventType !== 'string' || eventType.trim().length === 0) {
            throw new Error('Invalid eventType provided to removeMsgListener');
        }

        if (!listener || typeof listener !== 'function') {
            throw new Error('Invalid listener provided to removeMsgListener');
        }

        // Note: Building the normalized options also validates the options param.
        // This should stay here to always validate the params regardless of eventType listener presence
        const listenerCfgToRemove = {
            listener,
            options: this._buildNormalizedListenerOptions(options)
        };

        const eventTypeListenerCfgs = this._msgListenerCfgs[eventType];
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
     */
    private _getListenerCount() {
        let result = 0;

        Object.keys(this._msgListenerCfgs).forEach(currEventType => {
            const currListenerCfgs = this._msgListenerCfgs[currEventType];

            if (currListenerCfgs) {
                result += currListenerCfgs.length;
            }
        });

        return result;
    }

    /**
     * Initiate listening for messages from the host Genesys Cloud application
     */
    private _subscribeToMsgs() {
        this._myWindow.addEventListener('message', this._msgHandler);
    }

    /**
     * Stop listening for messages from the host Genesys Cloud application
     */
    private _unsubscribeFromMsgs() {
        this._myWindow.removeEventListener('message', this._msgHandler);
    }

    /**
     * Message handler function that will filter message events and invoke the correct, registered
     * listeners.
     */
    private _onMsg(event: MessageEvent) {
        if (!event || !event.source || !event.origin || event.source !== this._myParent ||
            event.origin !== this._targetPcOrigin || !event.data || typeof event.data !== 'object' ||
            Array.isArray(event.data)) {
            // Fast-fail for invalid or unknown event
            return;
        }

        // Validate base payload
        const eventType = event.data.purecloudEventType;
        if (eventType && typeof eventType === 'string' && eventType.trim()) {
            const eventTypeListenerCfgs = this._msgListenerCfgs[eventType];
            if (eventTypeListenerCfgs && eventTypeListenerCfgs.length > 0) {
                const listenerCfgsToRemove: ListenerConfig[] = [];

                eventTypeListenerCfgs.forEach(currListenerCfg => {
                    if (!currListenerCfg.options.msgPayloadFilter || currListenerCfg.options.msgPayloadFilter(event.data)) {
                        // Clone the event data and prune internal props before sending the event to user-space
                        const userSpaceEventData: SDKMessagePayload = JSON.parse(JSON.stringify(event.data));
                        delete userSpaceEventData.protocol;

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
     * @param options The additional options config provided to [add|remove]MsgListener; null and undefined also allowed.
     *
     * @returns A normalized listener options object containing the msgPayloadFilter and once properties.
     * msgPayloadFilter will be null unless a valid function is explicitly provided.  once will be false unless true
     * is explictly provided.
     *
     * @throws Error if options is not null, undefined, or an object
     * @throws Error if options.msgPayloadFilter is not null, undefined, or a function
     * @throws Error if options.once is not null, undefined, or a boolean
     */
    private _buildNormalizedListenerOptions(options?: Record<string, any> | null): ListenerOptions {
        const result: ListenerOptions = {
            msgPayloadFilter: null,
            once: false
        };

        if (options === null || options === undefined) {
            return result;
        }

        if (typeof options !== 'object' || Array.isArray(options)) {
            throw new Error('Invalid options provided');
        }

        const filter = options.msgPayloadFilter;
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
     * @param listenerCfg1 The first config
     * @param listenerCfg2 The second config
     *
     * @returns true if the listener, msgPayloadFilter, and once are equal; false otherwise
     */
    private _isDuplicateListenerCfg(listenerCfg1: ListenerConfig, listenerCfg2: ListenerConfig) {
        return (listenerCfg1.listener === listenerCfg2.listener &&
            listenerCfg1.options.once === listenerCfg2.options.once &&
            listenerCfg1.options.msgPayloadFilter === listenerCfg2.options.msgPayloadFilter);
    }
}

export default BaseApi;
