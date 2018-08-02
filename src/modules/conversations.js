/**
 * Utilities for interacting with PureCloud conversations
 *
 * @module modules/conversations
 *
 * @since 1.1.0
 */

import BaseApi from './base';

/**
 * Utilities for interacting with PureCloud conversations
 *
 * @extends module:modules/base~BaseApi
 *
 * @since 1.1.0
 */
class ConversationsApi extends BaseApi {
    /**
     * Show an interaction by ID.
     *
     * @example
     * myClientApp.conversationsApi.showInteractionDetails('af2ef59d-9bc5-4436-8738-97c04869c81c');
     *
     * @since 1.1.0
     */
    showInteractionDetails(conversationId) {
        super.sendMsgToPc('showInteractionDetails', {conversationId: conversationId});
    }
}

export default ConversationsApi;
