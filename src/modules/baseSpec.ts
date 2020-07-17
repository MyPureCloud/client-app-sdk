import { BaseApi, MessageListener, MessagePayloadFilter } from './base';
import {name as pkgName, version as pkgVersion} from '../../package.json';

const APPS_API_PROTOCOL = 'purecloud-client-apps';

export default describe('BaseApi', () => {
    const baseProtoDetails = {
        protocol: 'foo',
        protocolAgentName: 'bar',
        protocolAgentVersion: 'baz'
    };

    it('should set reasonable defaults', () => {
        const baseApi = new BaseApi();

        expect(baseApi['_targetPcOrigin']).toBe('*');
        expect(baseApi['_protocolDetails']).toEqual({
            name: 'purecloud-client-apps',
            agentName: pkgName,
            agentVersion: pkgVersion
        });
    });

    it('should construct action-only SDK payloads correctly', () => {
        const baseApi = new BaseApi(baseProtoDetails);

        const action = 'myAction';
        const actionOnlyPayload = baseApi['buildSdkMsgPayload'](action);
        expect(actionOnlyPayload).toEqual(
            Object.assign({}, {action}, baseProtoDetails) as any
        );
    });

    it('should construct action with payload SDK payloads correctly', () => {
        const baseApi = new BaseApi(baseProtoDetails);

        const action = 'myAction';
        const actionPayload = {
            actionProp1: 'one',
            actionProp2: 'two'
        };

        const complexPayload = baseApi['buildSdkMsgPayload'](action, actionPayload);
        expect(complexPayload).toEqual(
            Object.assign({}, {action}, baseProtoDetails, actionPayload) as any
        );
    });

    it('should not leak decorated payload details back into user space', () => {
        const baseApi = new BaseApi(baseProtoDetails);

        const action = 'myAction';
        const origPayload = {
            actionProp1: 'one',
            actionProp2: 'two'
        };
        const actionPayload = Object.assign({}, origPayload);

        const complexPayload = baseApi['buildSdkMsgPayload'](action, actionPayload);
        expect(actionPayload).toEqual(origPayload);
        // @ts-expect-error
        expect(complexPayload).not.toEqual(origPayload);
    });

    it('should target the specified origin', () => {
        const mockCommsUtils = {
            postMsgToPc() {}
        };

        spyOn(mockCommsUtils, 'postMsgToPc');

        const targetPcOrigin = 'https://subdomain.envdomain.com';

        const baseApi = new BaseApi(Object.assign({}, {targetPcOrigin}, baseProtoDetails));
        baseApi['_commsUtils'] = mockCommsUtils;

        const action = 'myAction';
        const actionPayload = {
            actionProp1: 'one',
            actionProp2: 'two'
        };

        baseApi['sendMsgToPc'](action, actionPayload);
        expect(mockCommsUtils.postMsgToPc).toHaveBeenCalled();
        const args = (mockCommsUtils.postMsgToPc as jasmine.Spy).calls.first().args;
        expect(args.length).toBe(2);
        expect(args[0]).toEqual(Object.assign({}, {action}, baseProtoDetails, actionPayload));
        expect(args[1]).toBe(targetPcOrigin);
    });

    describe('MessageListeners', () => {
        const targetPcOrigin = 'https://subdomain.envdomain.com';
        let baseApi: BaseApi;

        beforeEach(function () {
            baseApi = new BaseApi(Object.assign({}, {targetPcOrigin}, baseProtoDetails));
        });

        describe('addMsgListener', () => {
            it('should validate it\'s params', () => {
                // Invalid Event Types
                [null, undefined, 1, [], {}, '', ' ', true].forEach(currEventType => {
                    expect(() => {
                        // @ts-expect-error
                        baseApi['addMsgListener'](currEventType, () => {});
                    }).toThrowError(/^Invalid eventType.*$/);
                });

                // Invalid listeners
                [null, undefined, 1, [], {}, '', ' ', true].forEach(currListener => {
                    expect(() => {
                        // @ts-expect-error
                        baseApi['addMsgListener']('foo', currListener);
                    }).toThrowError(/^Invalid listener.*$/);
                });

                // Invalid options
                [1, [], '', ' ', true, () => {}].forEach(currOptions => {
                    expect(() => {
                        // @ts-expect-error
                        baseApi['addMsgListener']('foo', () => {}, currOptions);
                    }).toThrowError(/^Invalid options.*$/);
                });

                // Valid options
                [null, undefined, {}].forEach(currOptions => {
                    expect(() => {
                        baseApi['addMsgListener']('foo', () => {}, currOptions);
                    }).not.toThrow();
                });

                // Invalid msgPayloadFilter options
                [1, [], {}, '', ' ', true].forEach(currFilter => {
                    expect(() => {
                        // @ts-expect-error
                        baseApi['addMsgListener']('foo', () => {}, {msgPayloadFilter: currFilter});
                    }).toThrowError(/^.*msgPayloadFilter.*$/);
                });

                // Valid msgPayloadFilter options
                [null, undefined, () => {}].forEach(currFilter => {
                    expect(() => {
                        // @ts-expect-error
                        baseApi['addMsgListener']('foo', () => {}, {msgPayloadFilter: currFilter});
                    }).not.toThrow();
                });
                expect(() => {
                    // @ts-expect-error
                    baseApi['addMsgListener']('foo', () => {}, {noFilterKey: 'provided'});
                }).not.toThrow();

                // Invalid once options
                [1, [], {}, '', ' ', () => {}].forEach(currOnce => {
                    expect(() => {
                        // @ts-expect-error
                        baseApi['addMsgListener']('foo', () => {}, {once: currOnce});
                    }).toThrowError(/^.*once.*$/);
                });

                // Valid once options
                [null, undefined, true, false].forEach(currOnce => {
                    expect(() => {
                        // @ts-expect-error
                        baseApi['addMsgListener']('foo', () => {}, {once: currOnce});
                    }).not.toThrow();
                });
                expect(() => {
                    // @ts-expect-error
                    baseApi['addMsgListener']('foo', () => {}, {noOnceKey: 'provided'});
                }).not.toThrow();
            });

            it('should allow multiple distinct listeners per event', () => {
                expect(baseApi['_getListenerCount']()).toBe(0);
                baseApi['addMsgListener']('event1', () => {});
                expect(baseApi['_getListenerCount']()).toBe(1);
                baseApi['addMsgListener']('event1', () => {});
                expect(baseApi['_getListenerCount']()).toBe(2);
            });

            it('should not attach duplicate listeners', () => {
                expect(baseApi['_getListenerCount']()).toBe(0);
                const myListener = () => {};
                baseApi['addMsgListener']('event1', myListener);
                expect(baseApi['_getListenerCount']()).toBe(1);
                baseApi['addMsgListener']('event1', myListener);
                expect(baseApi['_getListenerCount']()).toBe(1);

                // But, the same listener instance can be attached to multiple events
                baseApi['addMsgListener']('event2', myListener);
                expect(baseApi['_getListenerCount']()).toBe(2);
            });

            it('should treat eventTypes as case and space sensitive', () => {
                const eventType = 'CaSeSeNsItIvE';

                expect(baseApi['_getListenerCount']()).toBe(0);
                const myListener = () => {};
                baseApi['addMsgListener'](eventType, myListener);
                expect(baseApi['_getListenerCount']()).toBe(1);

                // Space Sensitive
                baseApi['addMsgListener'](` ${eventType}`, myListener);
                expect(baseApi['_getListenerCount']()).toBe(2);
                baseApi['addMsgListener'](`${eventType} `, myListener);
                expect(baseApi['_getListenerCount']()).toBe(3);
                baseApi['addMsgListener'](` ${eventType} `, myListener);
                expect(baseApi['_getListenerCount']()).toBe(4);

                // Case Sensitive
                baseApi['addMsgListener'](eventType.toUpperCase(), myListener);
                expect(baseApi['_getListenerCount']()).toBe(5);
            });

            it('should treat empty options as defaults in the listener options uniqueness check', () => {
                [null, undefined, {}].forEach(defaultOptionEquivalent => {
                    const myListener = () => {};

                    baseApi['addMsgListener']('foo', myListener);
                    expect(baseApi['_getListenerCount']()).toBe(1);

                    baseApi['addMsgListener']('foo', myListener, defaultOptionEquivalent);
                    expect(baseApi['_getListenerCount']()).toBe(1);

                    // Remove it for next test
                    baseApi['removeMsgListener']('foo', myListener);
                    expect(baseApi['_getListenerCount']()).toBe(0);
                });
            });

            it('should include the msgPayloadFilter in the listener uniqueness check', () => {
                const eventType = 'sameEventDiffFilter';

                expect(baseApi['_getListenerCount']()).toBe(0);
                const myListener = () => {};
                baseApi['addMsgListener'](eventType, myListener);
                expect(baseApi['_getListenerCount']()).toBe(1);

                // Null or undefined filters should use default and be considered the same
                baseApi['addMsgListener'](eventType, myListener, {noFilterKey: 'provided'} as any);
                expect(baseApi['_getListenerCount']()).toBe(1);
                baseApi['addMsgListener'](eventType, myListener, {msgPayloadFilter: null});
                expect(baseApi['_getListenerCount']()).toBe(1);
                baseApi['addMsgListener'](eventType, myListener, {msgPayloadFilter: undefined});
                expect(baseApi['_getListenerCount']()).toBe(1);

                // A listener with a different payload should be considered unique
                const myFilter = () => {};
                baseApi['addMsgListener'](eventType, myListener, {msgPayloadFilter: myFilter as any});
                expect(baseApi['_getListenerCount']()).toBe(2);

                // The same filter should collide
                baseApi['addMsgListener'](eventType, myListener, {msgPayloadFilter: myFilter as any});
                expect(baseApi['_getListenerCount']()).toBe(2);
            });

            it('should include the once setting in the listener uniqueness check', () => {
                const eventType = 'sameEventDiffOnce';

                expect(baseApi['_getListenerCount']()).toBe(0);
                const myListener = () => {};
                baseApi['addMsgListener'](eventType, myListener);
                expect(baseApi['_getListenerCount']()).toBe(1);

                // The default once is false; null and undefined should also use the default
                baseApi['addMsgListener'](eventType, myListener, {noOnceKey: 'provided'} as any);
                expect(baseApi['_getListenerCount']()).toBe(1);
                baseApi['addMsgListener'](eventType, myListener, {once: null as any});
                expect(baseApi['_getListenerCount']()).toBe(1);
                baseApi['addMsgListener'](eventType, myListener, {once: undefined});
                expect(baseApi['_getListenerCount']()).toBe(1);
                baseApi['addMsgListener'](eventType, myListener, {once: false});
                expect(baseApi['_getListenerCount']()).toBe(1);

                // A different once should be considered a unique listener
                baseApi['addMsgListener'](eventType, myListener, {once: true});
                expect(baseApi['_getListenerCount']()).toBe(2);

                // The same once should collide
                baseApi['addMsgListener'](eventType, myListener, {once: true});
                expect(baseApi['_getListenerCount']()).toBe(2);
            });

            it('should include all options at once in the listener uniqueness check', () => {
                const eventType = 'sameEvent';

                expect(baseApi['_getListenerCount']()).toBe(0);
                const myListener = () => {};
                const myFilter = () => {};
                baseApi['addMsgListener'](eventType, myListener, {once: true, msgPayloadFilter: myFilter as any});
                expect(baseApi['_getListenerCount']()).toBe(1);

                baseApi['addMsgListener'](eventType, myListener, {once: true, msgPayloadFilter: (() => {}) as any});
                expect(baseApi['_getListenerCount']()).toBe(2);
                baseApi['addMsgListener'](eventType, myListener, {once: false, msgPayloadFilter: myFilter as any});
                expect(baseApi['_getListenerCount']()).toBe(3);

                // The same options should collide
                baseApi['addMsgListener'](eventType, myListener, {once: true, msgPayloadFilter: myFilter as any});
                expect(baseApi['_getListenerCount']()).toBe(3);
            });

            it('should start listening for events when the first listener is added', () => {
                const mockWindow = {
                    addEventListener() {}
                };
                baseApi['_myWindow'] = mockWindow as any as Window;

                spyOn(mockWindow, 'addEventListener');

                baseApi['addMsgListener']('foo', () => {});
                expect(mockWindow.addEventListener).toHaveBeenCalledTimes(1);
                expect((mockWindow.addEventListener as jasmine.Spy).calls.mostRecent().args[0]).toBe('message');
                expect(typeof (mockWindow.addEventListener as jasmine.Spy).calls.mostRecent().args[1]).toBe('function');

                // Should not reattach the listener
                baseApi['addMsgListener']('foo', () => {});
                baseApi['addMsgListener']('bar', () => {});
                expect(mockWindow.addEventListener).toHaveBeenCalledTimes(1);
            });
        });

        describe('invokingListeners', () => {
            const eventType = 'anEvent';
            const basePayloadData = {
                protocol: APPS_API_PROTOCOL,
                purecloudEventType: eventType
            };
            let fireEvent: (event: MessageEvent) => void;
            let mockParent: Window;
            let mockWindow: Window;

            beforeEach(() => {
                mockParent = {} as Window;
                mockWindow = {
                    addEventListener() {},
                    removeEventListener() {}
                } as any as Window;
                baseApi['_myWindow'] = mockWindow;
                baseApi['_myParent'] = mockParent;

                fireEvent = function (event: MessageEvent) {
                    baseApi['_onMsg'](event);
                };
            });

            it('should validate the incoming message as PC genuine', () => {
                const myObj = {
                    myListener() {}
                };
                spyOn(myObj, 'myListener').and.callThrough();

                baseApi['addMsgListener'](eventType, myObj.myListener);

                fireEvent({
                    source: mockParent,
                    origin: targetPcOrigin,
                    data: basePayloadData
                } as MessageEvent);

                expect(myObj.myListener).toHaveBeenCalledTimes(1);

                // Missing or invalid event
                // @ts-expect-error
                fireEvent();
                const invalidEventCases = [
                    null, undefined, {}, [], '', ' ', 1
                ];
                invalidEventCases.forEach(currCase => {
                    // @ts-expect-error
                    fireEvent(currCase);
                });

                // Missing or invalid source
                fireEvent({
                    origin: targetPcOrigin,
                    data: basePayloadData
                } as MessageEvent);
                const invalidSourceCases = [
                    null, undefined, {}
                ];
                invalidSourceCases.forEach(currCase => {
                    fireEvent({
                        // @ts-expect-error
                        source: currCase,
                        origin: targetPcOrigin,
                        data: basePayloadData
                    });
                });

                // Missing or invalid origins
                // @ts-expect-error
                fireEvent({
                    source: mockParent,
                    data: basePayloadData
                });
                const invalidOriginCases = [
                    null, undefined, 'null',
                    'http://subdomain.envdomain.com',
                    'https://envdomain.com',
                    'https://subdomain.anotherdomain.com',
                    'https://subdomain.envdomain.com:443', // Default protocol port is implied
                    'https://subdomain.anotherdomain.com/path'
                ];
                invalidOriginCases.forEach(currCase => {
                    fireEvent({
                        source: mockParent,
                        // @ts-expect-error
                        origin: currCase,
                        data: basePayloadData
                    });
                });

                // Missing or invalid data cases
                // @ts-expect-error
                fireEvent({
                    source: mockParent,
                    origin: targetPcOrigin
                });
                const invalidDataCases = [
                    null, undefined, 1, '', ' ', true, [], {}, {
                        purecloudEventType: null
                    }, {
                        purecloudEventType: undefined
                    }, {
                        purecloudEventType: ''
                    }, {
                        purecloudEventType: ' '
                    }, {
                        purecloudEventType: {}
                    }, {
                        purecloudEventType: []
                    }
                ];
                invalidDataCases.forEach(currCase => {
                    // @ts-expect-error
                    fireEvent({
                        source: mockParent,
                        origin: targetPcOrigin,
                        data: currCase
                    });
                });

                // None of the above should cause the listener to be fired
                expect(myObj.myListener).toHaveBeenCalledTimes(1);
            });

            it('should only invoke the listener when receiving the specified event type', () => {
                const myObj = {
                    myListener: () => {}
                };
                spyOn(myObj, 'myListener');

                baseApi['addMsgListener'](eventType, myObj.myListener);
                baseApi['addMsgListener']('foo', myObj.myListener);

                fireEvent({
                    source: mockParent,
                    origin: targetPcOrigin,
                    data: Object.assign({}, basePayloadData, {purecloudEventType: eventType})
                } as MessageEvent);

                expect(myObj.myListener).toHaveBeenCalledTimes(1);

                // Leading and trailing spaces are part of the key; should not be called
                fireEvent({
                    source: mockParent,
                    origin: targetPcOrigin,
                    data: Object.assign({}, basePayloadData, {purecloudEventType: ` ${eventType} `})
                } as MessageEvent);
                expect(myObj.myListener).toHaveBeenCalledTimes(1);

                // events are case sensitive; should not be called
                fireEvent({
                    source: mockParent,
                    origin: targetPcOrigin,
                    data: Object.assign({}, basePayloadData, {purecloudEventType: eventType.toUpperCase()})
                } as MessageEvent);
                expect(myObj.myListener).toHaveBeenCalledTimes(1);
            });

            it('should pass user-space event data to the listeners', () => {
                const myObj = {
                    myListener: () => {}
                };
                spyOn(myObj, 'myListener');

                baseApi['addMsgListener'](eventType, myObj.myListener);

                const origEventData = Object.assign({}, basePayloadData);
                fireEvent({
                    source: mockParent,
                    origin: targetPcOrigin,
                    data: origEventData
                } as MessageEvent);

                expect(myObj.myListener).toHaveBeenCalledTimes(1);
                let eventPayload = (myObj.myListener as jasmine.Spy).calls.mostRecent().args[0];
                let eventKeys = Object.keys(eventPayload);

                // it should clone the original event data
                expect(eventPayload).not.toBe(origEventData);
                // it should not modify the original event data
                expect(origEventData).toEqual(basePayloadData);

                // it should remove internal props (protocol)
                // the eventType might be useful for listeners and is consistent with browser listener api
                expect(eventKeys.length).toBe(1);
                expect(eventKeys[0]).toBe('purecloudEventType');
                expect(eventPayload.purecloudEventType).toBe(eventType);

                fireEvent({
                    source: mockParent,
                    origin: targetPcOrigin,
                    data: Object.assign({}, basePayloadData, {
                        additionalKey1: 'foo',
                        additionalKey2: 'bar'
                    })
                } as MessageEvent);

                expect(myObj.myListener).toHaveBeenCalledTimes(2);
                eventPayload = (myObj.myListener as jasmine.Spy).calls.mostRecent().args[0];
                eventKeys = Object.keys(eventPayload);
                expect(eventKeys.length).toBe(3);
                expect(eventPayload.purecloudEventType).toBe(eventType);
                expect(eventPayload.additionalKey1).toBe('foo');
                expect(eventPayload.additionalKey2).toBe('bar');
            });

            it('should only call the listener if a specified msgPayloadFilter passes', () => {
                let listenerCallCount = 0;
                const myObj = {
                    myListener: () => {}
                };
                spyOn(myObj, 'myListener');

                baseApi['addMsgListener'](eventType, myObj.myListener, {msgPayloadFilter: () => {
                    listenerCallCount++;
                    return listenerCallCount > 1;
                }});

                const event = {
                    source: mockParent,
                    origin: targetPcOrigin,
                    data: Object.assign({}, basePayloadData)
                } as MessageEvent;
                fireEvent(event);
                expect(myObj.myListener).toHaveBeenCalledTimes(0);
                fireEvent(event);
                expect(myObj.myListener).toHaveBeenCalledTimes(1);
                fireEvent(event);
                expect(myObj.myListener).toHaveBeenCalledTimes(2);
            });

            it('should call the listener multiple times if once is false', () => {
                const myObj = {
                    myListener: () => {},
                    myListenerWithFilter: () => {},
                    myListenerWithDefaultOnce: () => {}
                };
                spyOn(myObj, 'myListener');
                spyOn(myObj, 'myListenerWithFilter');
                spyOn(myObj, 'myListenerWithDefaultOnce');

                baseApi['addMsgListener'](eventType, myObj.myListener, {once: false});
                baseApi['addMsgListener'](eventType, myObj.myListenerWithFilter, {once: false, msgPayloadFilter: () => true});
                baseApi['addMsgListener'](eventType, myObj.myListenerWithDefaultOnce);

                const event = {
                    source: mockParent,
                    origin: targetPcOrigin,
                    data: Object.assign({}, basePayloadData)
                } as MessageEvent;
                fireEvent(event);
                expect(myObj.myListener).toHaveBeenCalledTimes(1);
                expect(myObj.myListenerWithFilter).toHaveBeenCalledTimes(1);
                expect(myObj.myListenerWithDefaultOnce).toHaveBeenCalledTimes(1);
                fireEvent(event);
                expect(baseApi['_getListenerCount']()).toBe(3);
                expect(myObj.myListener).toHaveBeenCalledTimes(2);
                expect(myObj.myListenerWithFilter).toHaveBeenCalledTimes(2);
                expect(myObj.myListenerWithDefaultOnce).toHaveBeenCalledTimes(2);
            });

            it('should only call the listener once if so configured', () => {
                const myObj = {
                    myListener: () => {},
                    myListenerWithFilter: () => {}
                };
                spyOn(myObj, 'myListener');
                spyOn(myObj, 'myListenerWithFilter');

                baseApi['addMsgListener'](eventType, myObj.myListener, {once: true});
                baseApi['addMsgListener'](eventType, myObj.myListenerWithFilter, {once: true, msgPayloadFilter: () => true});

                const event = {
                    source: mockParent,
                    origin: targetPcOrigin,
                    data: Object.assign({}, basePayloadData)
                } as MessageEvent;
                fireEvent(event);
                expect(myObj.myListener).toHaveBeenCalledTimes(1);
                expect(myObj.myListenerWithFilter).toHaveBeenCalledTimes(1);
                expect(baseApi['_getListenerCount']()).toBe(0);
                fireEvent(event);
                expect(myObj.myListener).toHaveBeenCalledTimes(1);
                expect(myObj.myListenerWithFilter).toHaveBeenCalledTimes(1);
            });

            it('should be able to remove multiple once listeners per event', () => {
                const myObj = {
                    myListener: () => {},
                    myListener2: () => {}
                };
                spyOn(myObj, 'myListener');
                spyOn(myObj, 'myListener2');

                baseApi['addMsgListener'](eventType, myObj.myListener, {once: true});
                baseApi['addMsgListener'](eventType, myObj.myListener2, {once: true});
                expect(baseApi['_getListenerCount']()).toBe(2);

                const event = {
                    source: mockParent,
                    origin: targetPcOrigin,
                    data: Object.assign({}, basePayloadData)
                } as MessageEvent;
                fireEvent(event);
                expect(myObj.myListener).toHaveBeenCalledTimes(1);
                expect(myObj.myListener2).toHaveBeenCalledTimes(1);
                fireEvent(event);
                expect(baseApi['_getListenerCount']()).toBe(0);
                expect(myObj.myListener).toHaveBeenCalledTimes(1);
                expect(myObj.myListener2).toHaveBeenCalledTimes(1);
            });
        });

        describe('removeMsgListener', () => {
            it('should validate it\'s params', () => {
                // Invalid Event Types
                [null, undefined, 1, [], {}, '', ' ', true].forEach(currEventType => {
                    expect(() => {
                        // @ts-expect-error
                        baseApi['removeMsgListener'](currEventType, () => {});
                    }).toThrowError(/^Invalid eventType.*$/);
                });

                // Invalid listeners
                [null, undefined, 1, [], {}, '', ' ', true].forEach(currListener => {
                    expect(() => {
                        // @ts-expect-error
                        baseApi['removeMsgListener']('foo', currListener);
                    }).toThrowError(/^Invalid listener.*$/);
                });

                // Invalid options
                [1, [], '', ' ', true, () => {}].forEach(currOptions => {
                    expect(() => {
                        // @ts-expect-error
                        baseApi['removeMsgListener']('foo', () => {}, currOptions);
                    }).toThrowError(/^Invalid options.*$/);
                });

                // Valid options
                [null, undefined, {}].forEach(currOptions => {
                    expect(() => {
                        baseApi['removeMsgListener']('foo', () => {}, currOptions);
                    }).not.toThrow();
                });

                // Invalid msgPayloadFilter options
                [1, [], {}, '', ' ', true].forEach(currFilter => {
                    expect(() => {
                        // @ts-expect-error
                        baseApi['removeMsgListener']('foo', () => {}, {msgPayloadFilter: currFilter});
                    }).toThrowError(/^.*msgPayloadFilter.*$/);
                });

                // Valid msgPayloadFilter options
                [null, undefined, () => {}].forEach(currFilter => {
                    expect(() => {
                        baseApi['removeMsgListener']('foo', () => {}, {msgPayloadFilter: currFilter as any});
                    }).not.toThrow();
                });
                expect(() => {
                    baseApi['removeMsgListener']('foo', () => {}, {noFilterKey: 'provided'} as any);
                }).not.toThrow();

                // Invalid once options
                [1, [], {}, '', ' ', () => {}].forEach(currOnce => {
                    expect(() => {
                        // @ts-expect-error
                        baseApi['removeMsgListener']('foo', () => {}, {once: currOnce});
                    }).toThrowError(/^.*once.*$/);
                });

                // Valid once options
                [null, undefined, true, false].forEach(currOnce => {
                    expect(() => {
                        baseApi['removeMsgListener']('foo', () => {}, {once: currOnce as any});
                    }).not.toThrow();
                });
                expect(() => {
                    baseApi['removeMsgListener']('foo', () => {}, {noOnceKey: 'provided'} as any);
                }).not.toThrow();
            });

            it('should remove the matching listener for the specified event type', () => {
                const myListener = () => {};
                baseApi['addMsgListener']('foo', myListener);

                expect(baseApi['_getListenerCount']()).toBe(1);
                expect(baseApi['removeMsgListener']('foo', myListener));
                expect(baseApi['_getListenerCount']()).toBe(0);
            });

            it('should return silently if a matching eventType or listener is not found', () => {
                // No listeners previously attached
                expect(baseApi['removeMsgListener']('foo', () => {})).toBe(undefined);

                const myListener = () => {};
                baseApi['addMsgListener']('foo', myListener);

                expect(baseApi['_getListenerCount']()).toBe(1);
                expect(baseApi['removeMsgListener']('bar', myListener)).toBe(undefined);
                expect(baseApi['removeMsgListener']('foo', () => {})).toBe(undefined);
                expect(baseApi['_getListenerCount']()).toBe(1);
            });

            it('should not remove a matching listener assigned to a different cased or leading/trailing spaced eventType', () => {
                const eventType = 'foo';
                const myListener = () => {};
                baseApi['addMsgListener'](eventType, myListener);
                expect(baseApi['_getListenerCount']()).toBe(1);

                // case sensitive
                baseApi['removeMsgListener'](eventType.toUpperCase(), myListener);
                expect(baseApi['_getListenerCount']()).toBe(1);

                // leading/trailing space sensitive
                baseApi['removeMsgListener'](` ${eventType}`, myListener);
                expect(baseApi['_getListenerCount']()).toBe(1);
                baseApi['removeMsgListener'](`${eventType} `, myListener);
                expect(baseApi['_getListenerCount']()).toBe(1);
                baseApi['removeMsgListener'](` ${eventType} `, myListener);
                expect(baseApi['_getListenerCount']()).toBe(1);
            });

            it('should not remove a matching listener for a different event type', () => {
                const myListener = () => {};
                baseApi['addMsgListener']('foo', myListener);

                expect(baseApi['_getListenerCount']()).toBe(1);
                baseApi['removeMsgListener']('bar', myListener);
                expect(baseApi['_getListenerCount']()).toBe(1);
            });

            it('should treat empty options as the defaults when checking options for removing a listener', () => {
                [null, undefined, {},
                    {once: null}, {once: undefined}, {once: false},
                    {msgPayloadFilter: null}, {msgPayloadFilter: undefined}
                ].forEach(defaultOptionEquivalent => {
                    const myListener = () => {};

                    baseApi['addMsgListener']('foo', myListener);
                    expect(baseApi['_getListenerCount']()).toBe(1);

                    baseApi['removeMsgListener']('foo', myListener, defaultOptionEquivalent as any);
                    expect(baseApi['_getListenerCount']()).toBe(0);
                });
            });

            it('should check the options when evaluating a listener for removal', () => {
                const myListener = (() => {}) as any as MessagePayloadFilter;

                // Same eventType and listener; different options from default
                baseApi['addMsgListener']('foo', myListener);
                expect(baseApi['_getListenerCount']()).toBe(1);
                baseApi['removeMsgListener']('foo', myListener, {once: true});
                expect(baseApi['_getListenerCount']()).toBe(1);
                baseApi['removeMsgListener']('foo', myListener, {msgPayloadFilter: (() => {}) as any});
                expect(baseApi['_getListenerCount']()).toBe(1);
                baseApi['removeMsgListener']('foo', myListener, {once: false, msgPayloadFilter: (() => {}) as any});
                expect(baseApi['_getListenerCount']()).toBe(1);
                baseApi['removeMsgListener']('foo', myListener, {once: true, msgPayloadFilter: undefined});
                expect(baseApi['_getListenerCount']()).toBe(1);
                baseApi['removeMsgListener']('foo', myListener);
                expect(baseApi['_getListenerCount']()).toBe(0);

                // Same eventType and listener; different options from registered
                const myFilter = (() => {}) as any as MessagePayloadFilter;
                baseApi['addMsgListener']('foo', myListener, {once: true, msgPayloadFilter: myFilter});
                expect(baseApi['_getListenerCount']()).toBe(1);

                baseApi['removeMsgListener']('foo', myListener, {once: true});
                expect(baseApi['_getListenerCount']()).toBe(1);
                baseApi['removeMsgListener']('foo', myListener, {once: true, msgPayloadFilter: null});
                expect(baseApi['_getListenerCount']()).toBe(1);
                baseApi['removeMsgListener']('foo', myListener, {once: true, msgPayloadFilter: undefined});
                expect(baseApi['_getListenerCount']()).toBe(1);
                baseApi['removeMsgListener']('foo', myListener, {once: true, msgPayloadFilter: (() => {}) as any});
                expect(baseApi['_getListenerCount']()).toBe(1);

                baseApi['removeMsgListener']('foo', myListener, {msgPayloadFilter: myFilter});
                expect(baseApi['_getListenerCount']()).toBe(1);
                baseApi['removeMsgListener']('foo', myListener, {once: null as any, msgPayloadFilter: myFilter});
                expect(baseApi['_getListenerCount']()).toBe(1);
                baseApi['removeMsgListener']('foo', myListener, {once: undefined, msgPayloadFilter: myFilter});
                expect(baseApi['_getListenerCount']()).toBe(1);
                baseApi['removeMsgListener']('foo', myListener, {once: false, msgPayloadFilter: myFilter});
                expect(baseApi['_getListenerCount']()).toBe(1);

                // Successful removal
                baseApi['removeMsgListener']('foo', myListener, {once: true, msgPayloadFilter: myFilter});
                expect(baseApi['_getListenerCount']()).toBe(0);
            });

            it('should only remove the one listener matching the eventType, listener, and options.  Regardless of number of listeners or the registered order', () => {
                const myListener = (() => {}) as any as MessageListener;
                const myFilter = (() => {}) as any as MessagePayloadFilter;

                baseApi['addMsgListener']('foo', myListener, {once: true});
                baseApi['addMsgListener']('foo', myListener, {once: true, msgPayloadFilter: myFilter});
                baseApi['addMsgListener']('foo', myListener, {once: true, msgPayloadFilter: (() => {}) as any});
                baseApi['addMsgListener']('foo', myListener);
                baseApi['addMsgListener']('foo', myListener, {once: false, msgPayloadFilter: myFilter});
                baseApi['addMsgListener']('foo', myListener, {once: false, msgPayloadFilter: (() => {}) as any});
                expect(baseApi['_getListenerCount']()).toBe(6);

                baseApi['removeMsgListener']('foo', myListener);
                expect(baseApi['_getListenerCount']()).toBe(5);

                baseApi['removeMsgListener']('foo', myListener, {msgPayloadFilter: myFilter});
                expect(baseApi['_getListenerCount']()).toBe(4);

                baseApi['removeMsgListener']('foo', myListener, {once: true, msgPayloadFilter: myFilter});
                expect(baseApi['_getListenerCount']()).toBe(3);

                baseApi['removeMsgListener']('foo', myListener, {once: true});
                expect(baseApi['_getListenerCount']()).toBe(2);
            });

            it('should stop listening for events when the last listener is removed', () => {
                const mockWindow = {
                    addEventListener() {},
                    removeEventListener() {}
                };
                baseApi['_myWindow'] = mockWindow as any as Window;

                spyOn(mockWindow, 'addEventListener');
                spyOn(mockWindow, 'removeEventListener');

                const listener1 = () => {};
                const listener2 = () => {};

                // Single event; single listener
                baseApi['addMsgListener']('event1', listener1);
                expect(mockWindow.addEventListener).toHaveBeenCalledTimes(1);
                baseApi['removeMsgListener']('event1', listener1);
                expect(mockWindow.removeEventListener).toHaveBeenCalledTimes(1);
                expect((mockWindow.removeEventListener as jasmine.Spy).calls.mostRecent().args[0]).toBe('message');
                expect(typeof (mockWindow.removeEventListener as jasmine.Spy).calls.mostRecent().args[1]).toBe('function');

                // Single event; multiple listeners
                (mockWindow.addEventListener as jasmine.Spy).calls.reset();
                (mockWindow.removeEventListener as jasmine.Spy).calls.reset();

                baseApi['addMsgListener']('event1', listener1);
                expect(mockWindow.addEventListener).toHaveBeenCalledTimes(1);
                baseApi['addMsgListener']('event1', listener2);
                expect(mockWindow.addEventListener).toHaveBeenCalledTimes(1);
                baseApi['removeMsgListener']('event1', listener1);
                expect(mockWindow.removeEventListener).toHaveBeenCalledTimes(0);
                baseApi['removeMsgListener']('event1', listener2);
                expect(mockWindow.removeEventListener).toHaveBeenCalledTimes(1);

                // multiple events; single listeners
                (mockWindow.addEventListener as jasmine.Spy).calls.reset();
                (mockWindow.removeEventListener as jasmine.Spy).calls.reset();

                baseApi['addMsgListener']('event1', listener1);
                expect(mockWindow.addEventListener).toHaveBeenCalledTimes(1);
                baseApi['addMsgListener']('event2', listener2);
                expect(mockWindow.addEventListener).toHaveBeenCalledTimes(1);
                baseApi['removeMsgListener']('event1', listener1);
                expect(mockWindow.removeEventListener).toHaveBeenCalledTimes(0);
                baseApi['removeMsgListener']('event2', listener2);
                expect(mockWindow.removeEventListener).toHaveBeenCalledTimes(1);
            });
        });
    });
});
