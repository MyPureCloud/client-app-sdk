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
 * Base Class for PureCloud Client App APIs
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
    constructor (cfg = {}) {
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
    }

    /**
     * Sends the message to purecloud augmenting with environmental details such as
     * target env origin and version info.  Accessible by extenders.
     *
     * @param {string} actionName
     * @param {object} msgPayload
     *
     * @package
     * @ignore
     *
     * @since 1.0.0
     */
    sendMsgToPc (actionName, msgPayload) {
        this._commsUtils.postMsgToPc(this.buildSdkMsgPayload(...arguments), this._targetPcOrigin);
    }

    /**
     * Constructs a payload tailored for the PureCloud Client Apps SDK.  Can be
     * overridden by extenders, but should not be invoked externally.
     *
     * @param string actionName - The name of the client-app action to invoke
     * @param object msgPayload - Action-specific payload data
     *
     * @returns {object} A postMessage payload for the Client Apps SDK
     *
     * @package
     * @ignore
     *
     * @since 1.0.0
     */
    buildSdkMsgPayload(actionName, msgPayload=null) {
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
}

export default BaseApi;
