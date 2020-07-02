/* eslint-env jasmine */
import ApiBase from './base';
import ConversationsApi from './conversations';

const APPS_API_PROTOCOL = 'purecloud-client-apps';

export default describe('ConversationsApi', () => {
    const targetPcOrigin = 'https://subdomain.envdomain.com';
    const baseProtoDetails = {
        protocol: APPS_API_PROTOCOL,
        protocolAgentName: 'bar',
        protocolAgentVersion: 'baz'
    };
    let conversationsApi: ConversationsApi;

    beforeEach(() => {
        conversationsApi = new ConversationsApi(Object.assign({}, { targetPcOrigin }, baseProtoDetails));
    });

    it('sends the message to the parent window', () => {
        // No-op the postMessage
        let mockWindow = {};
        let mockParent = {
            postMessage() {}
        };
        conversationsApi['_myWindow'] = mockWindow as any as Window;
        conversationsApi['_myParent'] = mockParent as any as Window;

        let sendMsgSpy = spyOn(ApiBase.prototype as any, 'sendMsgToPc');

        let testConvoId = 'af2ef59d-9bc5-4436-8738-97c04869c81c';
        conversationsApi.showInteractionDetails(testConvoId);
        expect(sendMsgSpy).toHaveBeenCalled();
        let sendMsgArgs = sendMsgSpy.calls.first().args;
        expect(sendMsgArgs.length).toBe(2);
        expect(sendMsgArgs[0]).toBe('showInteractionDetails');
        expect(sendMsgArgs[1]).toEqual({conversationId: testConvoId});
    });
});
