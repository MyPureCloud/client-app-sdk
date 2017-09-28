import BaseApi from './base';
import {name as pkgName, version as pkgVersion} from '../../package.json';

export default describe('BaseApi', () => {
    const baseProtoDetails = {
        protocol: 'foo',
        protocolAgentName: 'bar',
        protocolAgentVersion: 'baz'
    };

    it('should set reasonable defaults', () => {
        let baseApi = new BaseApi();

        expect(baseApi._targetPcOrigin).toBe('*');
        expect(baseApi._protocolDetails).toEqual({
            name: 'purecloud-client-apps',
            agentName: pkgName,
            agentVersion: pkgVersion
        });
    });

    it('should construct action-only SDK payloads correctly', () => {
        let baseApi = new BaseApi(baseProtoDetails);

        let action = 'myAction';
        let actionOnlyPayload = baseApi.buildSdkMsgPayload(action);
        expect(actionOnlyPayload).toEqual(
            Object.assign({}, {action}, baseProtoDetails)
        );
    });

    it('should construct action with payload SDK payloads correctly', () => {
        let baseApi = new BaseApi(baseProtoDetails);

        let action = 'myAction';
        let actionPayload = {
            actionProp1: 'one',
            actionProp2: 'two'
        };

        let complexPayload = baseApi.buildSdkMsgPayload(action, actionPayload);
        expect(complexPayload).toEqual(
            Object.assign({}, {action}, baseProtoDetails, actionPayload)
        );
    });

    it('should not leak decorated payload details back into user space', () => {
        let baseApi = new BaseApi(baseProtoDetails);

        let action = 'myAction';
        let origPayload = {
            actionProp1: 'one',
            actionProp2: 'two'
        };
        let actionPayload = Object.assign({}, origPayload);

        let complexPayload = baseApi.buildSdkMsgPayload(action, actionPayload);
        expect(actionPayload).toEqual(origPayload);
    });

    it('should target the specified origin', () => {
        let mockCommsUtils = {
            postMsgToPc() {}
        };

        spyOn(mockCommsUtils, 'postMsgToPc');

        let targetPcOrigin = 'https://subdomain.envdomain.com';

        let baseApi = new BaseApi(Object.assign({}, {targetPcOrigin}, baseProtoDetails));
        baseApi._commsUtils = mockCommsUtils;

        let action = 'myAction';
        let actionPayload = {
            actionProp1: 'one',
            actionProp2: 'two'
        };

        baseApi.sendMsgToPc(action, actionPayload);
        expect(mockCommsUtils.postMsgToPc).toHaveBeenCalled();
        let args = mockCommsUtils.postMsgToPc.calls.first().args;
        expect(args.length).toBe(2);
        expect(args[0]).toEqual(Object.assign({}, {action}, baseProtoDetails, actionPayload));
        expect(args[1]).toBe(targetPcOrigin);
    });
});
