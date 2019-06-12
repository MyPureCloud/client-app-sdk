/**
 * Utilities for showing agent level interaction and evaluation details
 *
 * @module modules/myConversations
 *
 * @since 1.1.0
 */
import BaseApi from './base';

/**
 * Utilities for showing agent level interaction and evaluation details
 *
 * @extends module:modules/base~BaseApi
 *
 * @since 1.1.0
 */

class MyConversationsApi extends BaseApi {
    /**
     * Show an interaction by ID.
     *
     * Required Permissions:
     * * ALL Of
     *     * quality:evaluation:view
     * * Must be participant of conversation
     * @param {String} conversationId
     *
     * @example
     * myClientApp.myConversations.showInteractionDetails(
     *   'B1B0B92B-B944-4F5D-AF62-8E5BAFFC9298',
     * );
     *
     * @since 1.1.0
     */

    showInteractionDetails(conversationId) {
        super.sendMsgToPc('showMyInteractionDetails', {
            'conversationId': conversationId
        });
    }

    /**
     * Show evaluation details by ID.
     *
     * Required Permissions:
     * * ALL Of
     *     * quality:evaluation:view
     * * Must be the agent evaluated
     * @param {String} conversationId
     *
     * @example
     * myClientApp.myConversations.showEvaluationDetails(
     *   'B1B0B92B-B944-4F5D-AF62-8E5BAFFC9298',
     *   '0E3759CE-2275-4480-BB15-3D4717446F93',
     * );
     *
     * @since 1.1.0
     */
    showEvaluationDetails(conversationId, evaluationId) {
        super.sendMsgToPc('showMyEvaluationDetails', {
            'conversationId': conversationId,
            'evaluationId': evaluationId
        });
    }
}

export default MyConversationsApi;
