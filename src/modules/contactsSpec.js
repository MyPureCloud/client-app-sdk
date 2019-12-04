/* eslint-env jasmine */
import ApiBase from './base';
import ContactsApi from './contacts';

const APPS_API_PROTOCOL = 'purecloud-client-apps';

export default describe('ContactsApi', () => {
    const targetPcOrigin = 'https://subdomain.envdomain.com';
    const baseProtoDetails = {
        protocol: APPS_API_PROTOCOL,
        protocolAgentName: 'foo',
        protolAgentVersion: 'bar'
    };
    let contactsApi = null;

    beforeEach(() => {
        contactsApi = new ContactsApi(Object.assign({}, { targetPcOrigin }, baseProtoDetails));
    });

    it('sends the message to the parent window', () => {
        // No-op the postMessage call
        let mockWindow = {};
        let mockParent = {
            postMessage() {}
        };
        contactsApi._myWindow = mockWindow;
        contactsApi._myParent = mockParent;

        let sendMsgSpy = spyOn(ApiBase.prototype, 'sendMsgToPc');

        // Test external contact sdk method
        let testContactId = 'testContact';
        contactsApi.showExternalContactProfile(testContactId);
        expect(sendMsgSpy).toHaveBeenCalled();
        let sendMsgArgs = sendMsgSpy.calls.first().args;
        expect(sendMsgArgs.length).toBe(2);
        expect(sendMsgArgs[0]).toBe('showExternalContactProfile');
        expect(sendMsgArgs[1]).toEqual({contactId: testContactId});

        // Test external organization sdk method
        let testContactOrganization = 'testOrg';
        contactsApi.showExternalOrganizationProfile(testContactOrganization);
        expect(sendMsgSpy).toHaveBeenCalledTimes(2);
        sendMsgArgs = sendMsgSpy.calls.mostRecent().args;
        expect(sendMsgArgs.length).toBe(2);
        expect(sendMsgArgs[0]).toBe('showExternalOrganizationProfile');
        expect(sendMsgArgs[1]).toEqual({orgId: testContactOrganization});
    });
});
