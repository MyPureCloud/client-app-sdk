/* eslint-env jasmine */
import ConversationsApi from './conversations';

const APPS_API_PROTOCOL = 'purecloud-client-apps';

export default describe('ConversationsApi', () => {
    const targetPcOrigin = 'https://subdomain.envdomain.com';
    const baseProtoDetails = {
        protocol: APPS_API_PROTOCOL,
        protocolAgentName: 'bar',
        protocolAgentVersion: 'baz'
    };
    let conversationsApi = null;

    beforeEach(() => {
        conversationsApi = new ConversationsApi(Object.assign({}, { targetPcOrigin }, baseProtoDetails));
    });

    it('sends the message to the parent window', () => {
        let mockWindow = {};
        let mockParent = {
            postMessage() {}
        };

        conversationsApi._myWindow = mockWindow;
        conversationsApi._myParent = mockParent;
        spyOn(mockParent, 'postMessage');

        conversationsApi.showInteractionDetails('af2ef59d-9bc5-4436-8738-97c04869c81c');
        expect(mockParent.postMessage).toHaveBeenCalled();
    });
});
