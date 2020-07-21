/**
 * Utilities for interacting with Genesys Cloud conversations
 *
 * @module modules/conversations
 *
 * @since 1.1.0
 */

import BaseApi from './base';

/**
 * Utilities for interacting with Genesys Cloud conversations
 *
 * @extends module:modules/base~BaseApi
 *
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
     * @example
     * myClientApp.conversations.showInteractionDetails('af2ef59d-9bc5-4436-8738-97c04869c81c');
     *
     * @since 1.1.0
     */
    showInteractionDetails(conversationId) {
        super.sendMsgToPc('showInteractionDetails', {conversationId: conversationId});
    }
}

export default ConversationsApi;
