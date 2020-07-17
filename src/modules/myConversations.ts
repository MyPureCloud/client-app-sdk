/**
 * Utilities for showing agent level interaction and evaluation details
 *
 * @since 1.3.0
 */
import { BaseApi } from './base';

/**
 * Utilities for showing agent level interaction and evaluation details
 *
 * @noInheritDoc
 * @since 1.3.0
 */
export class MyConversationsApi extends BaseApi {
    /**
     * Show an agent his/her interaction by ID.
     *
     * Required Permissions:
     * * ALL Of
     *     * User must be an Agent participant on the conversation
     *     * ONE Of
     *         * Implicit Conversation Access via participant on the Conversation
     *         * conversation:communication:view
     *
     * ```ts
     * myClientApp.myConversations.showInteractionDetails(
     *   'B1B0B92B-B944-4F5D-AF62-8E5BAFFC9298',
     * );
     * ```
     * 
     * @param conversationId The id of the conversation
     * 
     * @since 1.3.0
     */

    showInteractionDetails(conversationId: string) {
        super.sendMsgToPc('showMyInteractionDetails', {
            'conversationId': conversationId
        });
    }

    /**
     * Show an agent his/her evaluation details by conversation and evaluation IDs.
     *
     * Required Permissions:
     * * ALL Of
     *     * User must be the Agent evaluated on the specified conversation/evaluation
     *     * quality:evaluation:view
     * 
     * ```ts
     * myClientApp.myConversations.showEvaluationDetails(
     *   'B1B0B92B-B944-4F5D-AF62-8E5BAFFC9298',
     *   '0E3759CE-2275-4480-BB15-3D4717446F93',
     * );
     * ```
     *
     * @param conversationId The id of the conversation
     * @param evaluationId The id of the evaluation
     *
     * @since 1.3.0
     */
    showEvaluationDetails(conversationId: string, evaluationId: string) {
        super.sendMsgToPc('showMyEvaluationDetails', {
            'conversationId': conversationId,
            'evaluationId': evaluationId
        });
    }
}
