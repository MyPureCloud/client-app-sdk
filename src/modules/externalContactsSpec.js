/* eslint-env jasmine */
import ApiBase from './base';
import ExternalContactsApi from './externalContacts';

const APPS_API_PROTOCOL = 'purecloud-client-apps';

export default describe('ContactsApi', () => {
    const targetPcOrigin = 'https://subdomain.envdomain.com';
    const baseProtoDetails = {
        protocol: APPS_API_PROTOCOL,
        protocolAgentName: 'foo',
        protolAgentVersion: 'bar'
    };
    let externalContactsApi = null;

    beforeEach(() => {
        externalContactsApi = new ExternalContactsApi(Object.assign({}, { targetPcOrigin }, baseProtoDetails));
    });

    it('sends the message to the parent window', () => {
        // No-op the postMessage call
        let mockWindow = {};
        let mockParent = {
            postMessage() {}
        };
        externalContactsApi._myWindow = mockWindow;
        externalContactsApi._myParent = mockParent;

        let sendMsgSpy = spyOn(ApiBase.prototype, 'sendMsgToPc');

        // Test external contact sdk method
        let testContactId = 'testContact';
        externalContactsApi.showExternalContactProfile(testContactId);
        expect(sendMsgSpy).toHaveBeenCalled();
        let sendMsgArgs = sendMsgSpy.calls.first().args;
        expect(sendMsgArgs.length).toBe(2);
        expect(sendMsgArgs[0]).toBe('showExternalContactProfile');
        expect(sendMsgArgs[1]).toEqual({contactId: testContactId});

        // Test external organization sdk method
        let testContactOrganization = 'testOrg';
        externalContactsApi.showExternalOrganizationProfile(testContactOrganization);
        expect(sendMsgSpy).toHaveBeenCalledTimes(2);
        sendMsgArgs = sendMsgSpy.calls.mostRecent().args;
        expect(sendMsgArgs.length).toBe(2);
        expect(sendMsgArgs[0]).toBe('showExternalOrganizationProfile');
        expect(sendMsgArgs[1]).toEqual({externalOrganizationId: testContactOrganization});
    });
});
