import { BaseApi } from './base';
import { MyConversationsApi } from './myConversations';

const APPS_API_PROTOCOL = 'purecloud-client-apps';

export default describe('MyConversationsApi', () => {
    const targetPcOrigin = 'https://subdomain.envdomain.com';
    const baseProtoDetails = {
        protocol: APPS_API_PROTOCOL,
        protocolAgentName: 'foo',
        protocolAgentVersion: 'bar'
    };

    let myConversationsApi: MyConversationsApi;

    beforeEach(() => {
        myConversationsApi = new MyConversationsApi(Object.assign({}, { targetPcOrigin }, baseProtoDetails));
    });

    it('send the message asking for interaction details to the parent window', () => {
        const mockWindow = {};
        const mockParent = {
            postMessage() {}
        };
        myConversationsApi['_myWindow'] = mockWindow as any as Window;
        myConversationsApi['_myParent'] = mockParent as any as Window;

        const sendMsgSpy = spyOn(BaseApi.prototype as any, 'sendMsgToPc');

        const testConvoId = 'B1B0B92B-B944-4F5D-AF62-8E5BAFFC92984';

        myConversationsApi.showInteractionDetails(testConvoId);
        expect(sendMsgSpy).toHaveBeenCalled();
        const sendMsgArgs = sendMsgSpy.calls.first().args;
        expect(sendMsgArgs.length).toBe(2);
        expect(sendMsgArgs[0]).toBe('showMyInteractionDetails');
        expect(sendMsgArgs[1]).toEqual({ conversationId: testConvoId });
    });

    it('send the message asking for evaluation details to the parent window', () => {
        const mockWindow = {};
        const mockParent = {
            postMessage() {}
        };
        myConversationsApi['_myWindow'] = mockWindow as any as Window;
        myConversationsApi['_myParent'] = mockParent as any as Window;

        const sendMsgSpy = spyOn(BaseApi.prototype as any, 'sendMsgToPc');

        const testConvoId = 'B1B0B92B-B944-4F5D-AF62-8E5BAFFC9298';
        const testEvalId = '0E3759CE-2275-4480-BB15-3D4717446F93';

        myConversationsApi.showEvaluationDetails(testConvoId, testEvalId);
        expect(sendMsgSpy).toHaveBeenCalled();
        const sendMsgArgs = sendMsgSpy.calls.first().args;
        expect(sendMsgArgs.length).toBe(2);
        expect(sendMsgArgs[0]).toBe('showMyEvaluationDetails');
        expect(sendMsgArgs[1]).toEqual({
            conversationId: testConvoId,
            evaluationId: testEvalId
        });
    });
});
