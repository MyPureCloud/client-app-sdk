/**
 * Utilities for interacting with Genesys Cloud conversations
 *
 * @since 1.1.0
 */

import BaseApi from './base';

/**
 * Utilities for interacting with Genesys Cloud conversations
 *
 * @noInheritDoc
 * @since 1.1.0
 */
class ConversationsApi extends BaseApi {
    /**
     * Show an interaction by ID.
     *
     * Required Permissions:
     * * ALL Of
     *     * analytics:conversationDetail:view
     *     * analytics:conversationAggregate:view
     *     * ANY Of
     *         * conversation:communication:view
     *         * quality:evaluation:add
     *         * quality:calibration:view
     *         * quality:evaluation:editScore
     *
     * ```ts
     * myClientApp.conversations.showInteractionDetails('af2ef59d-9bc5-4436-8738-97c04869c81c');
     * ```
     *
     * @since 1.1.0
     */
    showInteractionDetails(conversationId: string) {
        super.sendMsgToPc('showInteractionDetails', {conversationId: conversationId});
    }

    /**
     * Send a message to be filled into the interaction message box for the agent to review and send.
     * This function works specifically with a bound interaction when both the interaction and calling app
     * are visible, it is not intended (and will not work) for situations where the interaction is not active.
     * Furthermore, this function should only be called in response to user interaction to ensure the agent is
     * aware of the impending text insertion and so their existing draft state is not unexpectedly altered.
     * 
     * @param mode - The insertion mode to use when injecting the text into the agent's text box.
     * 'insert' -> injects text at agent's cursor position, leaving other text intact.
     * 
     * @param message - The message to inject into the agent's text box.
     */
    proposeInteractionMessage(mode: 'insert', message: string) {
        super.sendMsgToPc('proposeInteractionMessage', { mode, message });
    }
}

export default ConversationsApi;
