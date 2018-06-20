/**
 * Utilities for monitoring and enhancing conversations (interactions) in PureCloud.
 *
 * @module modules/conversations
 *
 * @since 1.1.0
 */

import BaseApi from './base';

const CONVERSATION_HOOK_EVENT_NAME = 'conversationLifecycleHook';
const HOOK_NAME_FILTER = function (hookName, msgPayload) {
    return (typeof msgPayload === 'object' && msgPayload.hook === hookName);
};
const CURRENT_AGENT_ASSIGNED_HOOK_FILTER = HOOK_NAME_FILTER.bind(undefined, 'currentAgentAssigned');

/**
 * Utilities for monitoring and enhancing conversations/interactions in PureCloud.
 *
 * @extends module:modules/base~BaseApi
 *
 * @since 1.1.0
 */
class ConversationsApi extends BaseApi {
    /**
     * Attach a listener function to be called when PureCloud has assigned the current agent
     * to the conversation.
     *
     * @param {function} listener - The function to call when the current agent has been assigned
     * the conversation.  This function will be passed an object containing the conversation ID.
     * Users can use this listener to easily monitor conversations in traditional apps (widget/standalone)
     * or to register interaction based apps via registerConversationApps.
     * The this context of the listener function will not be modified.
     *
     * @param {boolean} once - If the listener should only be invoked once or repeatedly; false by default.
     *
     * @example
     * myClientApp.conversations.addCurrAgentAssignedListener(evt => {
     *   let conversationId = evt.conversationId;
     *   // Lookup conversation details in PureCloud
     *   // Simulate lookup with 500ms delay
     *   window.setTimeout(() => {
     *     // Register new conversation app
     *     myClientApp.conversations.registerConversationApps(conversationId, [{
     *       name: 'myNewApp'
     *       sandbox: ['allow-same-origin']
     *       url: `apps.example.com/interactionApp?pcEnvironment={{pcEnvironment}}&pcLangTag={{pcLangTag}}&conversationId=${conversationId}`
     *       assets: {
     *         // icon sizes and formats
     *       }
     *       preferredLayoutFlow: 'horizontal|vertical'
     *       featureCategory: 'profile|wrapUp|'
     *     }]);
     *   }, 500);
     * });
     *
     * @since 1.1.0
     */
    addCurrAgentAssignedListener(listener, once = false) {
        this.addMsgListener(CONVERSATION_HOOK_EVENT_NAME, listener, {
            once,
            msgPayloadFilter: CURRENT_AGENT_ASSIGNED_HOOK_FILTER
        });
    }

    /*
    * name
    * sandbox
    * url
    * assets
    * preferredLayoutFlow: 'horizontal|vertical'
    * featureCategory: 'profile|wrapUp|'
    */
    registerConversationApps(conversationId, appConfigs) {
        // TODO Validation
        super.sendMsgToPc('registerConversationApps', {
            conversationId,
            appConfigs
        });
    }
}

export default ConversationsApi;
