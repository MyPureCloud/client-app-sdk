import { LifecycleApi, LifecycleHook } from './lifecycle';

const APPS_API_PROTOCOL = 'purecloud-client-apps';

export default describe('LifecycleApi', () => {
    const targetPcOrigin = 'https://subdomain.envdomain.com';
    const baseProtoDetails = {
        protocol: APPS_API_PROTOCOL,
        protocolAgentName: 'bar',
        protocolAgentVersion: 'baz'
    };
    let lifecycleApi: LifecycleApi;

    beforeEach(() => {
        lifecycleApi = new LifecycleApi(Object.assign({}, {targetPcOrigin}, baseProtoDetails));
    });

    describe('lifecycleEvents', () => {
        let mockParent: Window;
        let mockWindow: Window;
        let fireEvent: (event: MessageEvent) => void;
        const basePayloadData = {
            protocol: APPS_API_PROTOCOL
        };

        const hookMap = {
            bootstrap: { add: 'addBootstrapListener', remove: 'removeBootstrapListener' },
            focus: { add: 'addFocusListener', remove: 'removeFocusListener' },
            blur: { add: 'addBlurListener', remove: 'removeBlurListener' },
            stop: { add: 'addStopListener', remove: 'removeStopListener' }
        } as const;

        const hookCases: Array<{ hook: LifecycleHook, onceDefault: boolean }> = [{
            hook: 'bootstrap',
            onceDefault: true
        }, {
            hook: 'focus',
            onceDefault: false
        }, {
            hook: 'blur',
            onceDefault: false
        }, {
            hook: 'stop',
            onceDefault: true
        }];

        beforeEach(() => {
            mockParent = {} as Window;
            mockWindow = {
                addEventListener() {},
                removeEventListener() {}
            } as any as Window;
            lifecycleApi['_myWindow'] = mockWindow;
            lifecycleApi['_myParent'] = mockParent;

            fireEvent = function (event: MessageEvent) {
                lifecycleApi['_onMsg'](event);
            };
        });

        it('should allow lifecycle listeners to be attached', () => {
            hookCases.forEach(currHookCase => {
                testLifecycleHookListener(currHookCase.hook);
            });
        });

        it('should include the once flag in the listener equality check', () => {
            hookCases.forEach(currHookCase => {
                testLifecycleHookListenerOnceEquality(currHookCase.hook);
            });
        });

        it('should register hook listeners uniquely, so that the caller can use the same function if desired', () => {
            hookCases.forEach(currHookCase => {
                testLifecycleHookListenerIsolation(currHookCase.hook);
            });
        });

        it('should allow lifecycle listeners to be removed', () => {
            hookCases.forEach(currHookCase => {
                testLifecycleHookListenerRemoval(currHookCase.hook);
            });
        });

        it('should allow lifecycle listeners to be attached in once mode', () => {
            hookCases.forEach(currHookCase => {
                testLifecycleHookListenerOnce(currHookCase.hook);
            });
        });

        it('should provide provide once defaults for each listener type', () => {
            hookCases.forEach(currHookCase => {
                testLifecycleHookListenerOnceDefault(currHookCase.hook, currHookCase.onceDefault);
            });
        });

        it('should have consistent once default param values for each listener add/remove pair', () => {
            hookCases.forEach(currHookCase => {
                testAddRemoveOnceDefaultConsistency(currHookCase.hook);
            });
        });

        function testLifecycleHookListener(hook: LifecycleHook) {
            const myObj = {
                myListener() {}
            };
            spyOn(myObj, 'myListener');

            const validEvent = {
                source: mockParent,
                origin: targetPcOrigin,
                data: Object.assign({}, basePayloadData, {
                    purecloudEventType: 'appLifecycleHook',
                    hook
                })
            } as MessageEvent;

            // Always pass false to test multiple calls
            lifecycleApi[hookMap[hook].add](myObj.myListener, false);

            fireEvent(validEvent);
            expect(myObj.myListener).toHaveBeenCalledTimes(1);

            fireEvent(validEvent);
            expect(myObj.myListener).toHaveBeenCalledTimes(2);

            // This event should not trigger the listener
            fireEvent({
                source: mockParent,
                origin: targetPcOrigin,
                data: Object.assign({}, basePayloadData, {
                    purecloudEventType: 'appLifecycleHook',
                    hook: `someOther-${hook}`
                })
            } as MessageEvent);
            expect(myObj.myListener).toHaveBeenCalledTimes(2);
        }

        function testLifecycleHookListenerOnceEquality(hook: LifecycleHook) {
            const myObj = {
                myListener() {}
            };
            spyOn(myObj, 'myListener');

            const validEvent = {
                source: mockParent,
                origin: targetPcOrigin,
                data: Object.assign({}, basePayloadData, {
                    purecloudEventType: 'appLifecycleHook',
                    hook
                })
            } as MessageEvent;

            lifecycleApi[hookMap[hook].add](myObj.myListener, true);
            lifecycleApi[hookMap[hook].add](myObj.myListener, false);

            fireEvent(validEvent);
            expect(myObj.myListener).toHaveBeenCalledTimes(2);

            fireEvent(validEvent);
            expect(myObj.myListener).toHaveBeenCalledTimes(3);
        }

        // Tests that each lifecycle hook can be add/removed in isolation of the others
        function testLifecycleHookListenerIsolation(hook: LifecycleHook) {
            const myObj = {
                myListener() {}
            };
            spyOn(myObj, 'myListener');

            const hookEvents: MessageEvent[] = [];

            // Attach the same listener to every hook
            hookCases.forEach(currCase => {
                const currHook = currCase.hook;

                // Always pass false to ensure consistent tests
                lifecycleApi[hookMap[currHook].add](myObj.myListener, false);

                hookEvents.push({
                    source: mockParent,
                    origin: targetPcOrigin,
                    data: Object.assign({}, basePayloadData, {
                        purecloudEventType: 'appLifecycleHook',
                        hook: currHook
                    })
                } as MessageEvent);
            });

            // Fire an event for each hook
            hookEvents.forEach(currEvent => {
                fireEvent(currEvent);
            });

            // Each listener should be called
            expect(myObj.myListener).toHaveBeenCalledTimes(hookCases.length);

            // Remove the listener for the hook under test
            lifecycleApi[hookMap[hook].remove](myObj.myListener, false);

            // Fire an event for each hook
            hookEvents.forEach(currEvent => {
                fireEvent(currEvent);
            });

            // All but the removed hook should be called
            expect(myObj.myListener).toHaveBeenCalledTimes((hookCases.length * 2) - 1);
        }

        function testLifecycleHookListenerRemoval(hook: LifecycleHook) {
            const myObj = {
                myListener() {}
            };
            spyOn(myObj, 'myListener');

            const validEvent = {
                source: mockParent,
                origin: targetPcOrigin,
                data: Object.assign({}, basePayloadData, {
                    purecloudEventType: 'appLifecycleHook',
                    hook
                })
            } as MessageEvent;

            // Always pass false to test removal
            lifecycleApi[hookMap[hook].add](myObj.myListener, false);

            fireEvent(validEvent);
            expect(myObj.myListener).toHaveBeenCalledTimes(1);

            // Ensure it's not a once listener
            fireEvent(validEvent);
            expect(myObj.myListener).toHaveBeenCalledTimes(2);

            // Ensure the listener is used in the equality check for removal
            lifecycleApi[hookMap[hook].remove](() => {}, false);
            fireEvent(validEvent);
            expect(myObj.myListener).toHaveBeenCalledTimes(3);

            // Ensure once is used in the equality check for removal
            lifecycleApi[hookMap[hook].remove](myObj.myListener, true);
            fireEvent(validEvent);
            expect(myObj.myListener).toHaveBeenCalledTimes(4);

            // Finally, pass the right listener and once to actually remove it
            lifecycleApi[hookMap[hook].remove](myObj.myListener, false);
            fireEvent(validEvent);
            expect(myObj.myListener).toHaveBeenCalledTimes(4);
        }

        function testLifecycleHookListenerOnce(hook: LifecycleHook) {
            const myObj = {
                myListener() {}
            };
            spyOn(myObj, 'myListener');

            const validEvent = {
                source: mockParent,
                origin: targetPcOrigin,
                data: Object.assign({}, basePayloadData, {
                    purecloudEventType: 'appLifecycleHook',
                    hook
                })
            } as MessageEvent;

            // Always pass true to test once
            lifecycleApi[hookMap[hook].add](myObj.myListener, true);

            fireEvent(validEvent);
            expect(myObj.myListener).toHaveBeenCalledTimes(1);

            fireEvent(validEvent);
            expect(myObj.myListener).toHaveBeenCalledTimes(1);
        }

        function testLifecycleHookListenerOnceDefault(hook: LifecycleHook, onceDefault: boolean) {
            const myObj = {
                myListener() {}
            };
            spyOn(myObj, 'myListener');

            const validEvent = {
                source: mockParent,
                origin: targetPcOrigin,
                data: Object.assign({}, basePayloadData, {
                    purecloudEventType: 'appLifecycleHook',
                    hook
                })
            } as MessageEvent;

            lifecycleApi[hookMap[hook].add](myObj.myListener);

            fireEvent(validEvent);
            expect(myObj.myListener).toHaveBeenCalledTimes(1);

            fireEvent(validEvent);
            expect(myObj.myListener).toHaveBeenCalledTimes(onceDefault ? 1 : 2);
        }

        function testAddRemoveOnceDefaultConsistency(hook: LifecycleHook) {
            const myObj = {
                myListener() {}
            };
            spyOn(myObj, 'myListener');

            const validEvent = {
                source: mockParent,
                origin: targetPcOrigin,
                data: Object.assign({}, basePayloadData, {
                    purecloudEventType: 'appLifecycleHook',
                    hook
                })
            } as MessageEvent;

            lifecycleApi[hookMap[hook].add](myObj.myListener);
            // Immediately call remove to test the default once param is the same for remove as add
            lifecycleApi[hookMap[hook].remove](myObj.myListener);

            fireEvent(validEvent);
            expect(myObj.myListener).toHaveBeenCalledTimes(0);
        }
    });
});
