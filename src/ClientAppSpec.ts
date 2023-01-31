import ClientApp from './index';
import BaseApi from './modules/base';
import {name, version} from '../package.json';

export default describe('ClientApp', () => {
    const VALID_DEFAULT_PC_ENVIRONMENT = 'mypurecloud.com';
    const VALID_NON_DEFAULT_PC_ENVIRONMENT = 'mypurecloud.jp';

    it('should have a static property holding the current version of the library', () => {
        expect(ClientApp.version).toBe(version);
    });

    it('should have a static method that returns details of the library', () => {
        expect(ClientApp.about()).toBe(`${name}v${version}`);
    });

    it('should have instances of all the modules', () => {
        const myClientApp = new ClientApp();
        (['alerting', 'lifecycle', 'coreUi', 'users', 'myConversations', 'externalContacts', 'directory'] as const).forEach(currModuleName => {
            expect(myClientApp[currModuleName] instanceof BaseApi).toBe(true);
        });
    });

    describe('Constructor', () => {
        /* eslint-disable no-new */
        it(`should default the enviroment to ${VALID_DEFAULT_PC_ENVIRONMENT} if no environment/origin config is provided`, () => {
            let myClientApp = new ClientApp();
            expect(myClientApp.pcEnvironment).toBe(VALID_DEFAULT_PC_ENVIRONMENT);

            myClientApp = new ClientApp({nonEmptyConfig: true} as any);
            expect(myClientApp.pcEnvironment).toBe(VALID_DEFAULT_PC_ENVIRONMENT);
        });
        it('should export gcEnvironment', () => {
            expect(new ClientApp().gcEnvironment).toBe(VALID_DEFAULT_PC_ENVIRONMENT);
        });

        describe('pcEnvironmentQueryParam config', () => {
            it('should allow a user to pass a valid query string param name into the constructor', () => {
                const pcEnvironmentQueryParam = 'pcEnvironment';
                spyOn(ClientApp, '_getQueryString')
                    .and.returnValue(`?${pcEnvironmentQueryParam}=${VALID_NON_DEFAULT_PC_ENVIRONMENT}`);

                const myClientApp = new ClientApp({
                    pcEnvironmentQueryParam
                });

                expect(myClientApp.pcEnvironment).toBe(VALID_NON_DEFAULT_PC_ENVIRONMENT);
            });

            it('should fail if the query param cannot be found', () => {
                const invalidQueryStrings = [
                    undefined,
                    null,
                    '',
                    '?', // Empty query string
                    '?bar=baz', // param not found
                    `?foo=${VALID_NON_DEFAULT_PC_ENVIRONMENT}&foo=${VALID_NON_DEFAULT_PC_ENVIRONMENT}`, // param specified multiple times
                    `?foo[0]=${VALID_NON_DEFAULT_PC_ENVIRONMENT}` // Array syntax not supported
                ];

                let index = 0;
                spyOn(ClientApp, '_getQueryString').and.callFake(() => invalidQueryStrings[index++] as any);

                invalidQueryStrings.forEach(() => {
                    expect(() => {
                        new ClientApp({
                            pcEnvironmentQueryParam: 'foo'
                        });
                    }).toThrow();
                });
            });

            it('should fail if the query param value is not a valid environment', () => {
                spyOn(ClientApp, '_getQueryString').and.returnValue('?foo=invalid.com');

                expect(() => {
                    new ClientApp({
                        pcEnvironmentQueryParam: 'foo'
                    });
                }).toThrow();
            });

            it('should fail if invalid data is passed as the query param name', () => {
                const invalidQueryParamNames = [undefined, null, 3, [], {}, '', ' '];

                invalidQueryParamNames.forEach(currInvalidParamName => {
                    expect(() => {
                        // @ts-expect-error
                        new ClientApp({ pcEnvironmentQueryParam: currInvalidParamName });
                    }).toThrow();
                });
            });
        });

        describe('pcEnvironment config', () => {
            it('should allow a user to pass a valid pcEnvironment into the constructor', () => {
                const myClientApp = new ClientApp({
                    pcEnvironment: VALID_NON_DEFAULT_PC_ENVIRONMENT
                });

                expect(myClientApp.pcEnvironment).toBe(VALID_NON_DEFAULT_PC_ENVIRONMENT);
            });

            it('should leniently parse the pcEnvironment and store the normalized version it in the property', () => {
                const myClientApp = new ClientApp({
                    pcEnvironment: ` ${VALID_NON_DEFAULT_PC_ENVIRONMENT} `
                });

                expect(myClientApp.pcEnvironment).toBe(VALID_NON_DEFAULT_PC_ENVIRONMENT);
            });

            it('should fail if invalid data is passed', () => {
                const invalidEnvironments = [undefined, null, 3, [], {}, '', ' ', 'unknown.com'];

                invalidEnvironments.forEach(currInvalidEnv => {
                    expect(() => {
                        // @ts-expect-error
                        new ClientApp({ pcEnvironment: currInvalidEnv });
                    }).toThrow();
                });
            });
        });

        describe('pcOrigin config', () => {
            it('should allow a user to pass an arbitrary origin into the constructor', () => {
                const customOrigin = 'some.pc-origin.com';
                const myClientApp = new ClientApp({
                    pcOrigin: customOrigin
                });
                expect(myClientApp['_customPcOrigin']).toBe(customOrigin);
                expect(myClientApp.pcEnvironment).toBe(null);
            });

            it('should fail if invalid data is passed', () => {
                const invalidCustomOrigins = [undefined, null, 3, [], {}, '', ' '];

                invalidCustomOrigins.forEach(currCustomOrigin => {
                    expect(() => {
                        // @ts-expect-error
                        new ClientApp({ pcOrigin: currCustomOrigin });
                    }).toThrow();
                });
            });
        });
        describe('gcHostOriginQueryParam and gcTargetEnvQueryParam config', () => {
            it('should allow a user to pass valid query param names into the constructor', () => {
                // External
                let query = '?gcHostOrigin=https://apps.mypurecloud.com&gcTargetEnv=prod';
                spyOn(ClientApp, '_getQueryString').and.callFake(() => query);
                let myClientApp = new ClientApp({
                    gcHostOriginQueryParam: 'gcHostOrigin',
                    gcTargetEnvQueryParam: 'gcTargetEnv'
                });
                expect(myClientApp.pcEnvironment).toBe('mypurecloud.com');
                // Localhost
                query = '?gcHostOrigin=https://localhost:1337&gcTargetEnv=prod';
                myClientApp = new ClientApp({
                    gcHostOriginQueryParam: 'gcHostOrigin',
                    gcTargetEnvQueryParam: 'gcTargetEnv'
                });
                expect(myClientApp.pcEnvironment).toBe('localhost');
            });
            it('should fail if is not targeting a valid env', () => {
                // Mismatch Environment
                let query = '?gcHostOrigin=https://apps.mypurecloud.jp&gcTargetEnv=prod';
                spyOn(ClientApp, '_getQueryString').and.callFake(() => query);
                expect(() => {
                    new ClientApp({
                        gcHostOriginQueryParam: 'gcHostOrigin',
                        gcTargetEnvQueryParam: 'gcTargetEnv'
                    });
                }).toThrow();
                // Mismatch Localhost
                query = '?gcHostOrigin=https://localhost:1337&gcTargetEnv=unknown';
                expect(() => {
                    new ClientApp({
                        gcHostOriginQueryParam: 'gcHostOrigin',
                        gcTargetEnvQueryParam: 'gcTargetEnv'
                    });
                }).toThrow();
                // External
                query = '?gcHostOrigin=https://invalid.com&gcTargetEnv=prod';
                expect(() => {
                    new ClientApp({
                        gcHostOriginQueryParam: 'gcHostOrigin',
                        gcTargetEnvQueryParam: 'gcTargetEnv'
                    });
                }).toThrow();
                // Invalid target env
                query = '?gcHostOrigin=https://apps.mypurecloud.com&gcTargetEnv=invalid';
                expect(() => {
                    new ClientApp({
                        gcHostOriginQueryParam: 'gcHostOrigin',
                        gcTargetEnvQueryParam: 'gcTargetEnv'
                    });
                }).toThrow();
            });
            it('should fail if the query params are badly configured or not set', () => {
                // Missing gcHostOrigin config option
                expect(() => {
                    new ClientApp({ gcHostOriginQueryParam: 'gcHostOrigin' });
                }).toThrow();
                // Missing gcTargetEnv config option
                expect(() => {
                    new ClientApp({ gcTargetEnvQueryParam: 'gcTargetEnv' });
                }).toThrow();
                // Missing gcHostOrigin query param
                let query = '?gcTargetEnv=prod';
                spyOn(ClientApp, '_getQueryString').and.callFake(() => query);
                expect(() => {
                    new ClientApp({
                        gcHostOriginQueryParam: 'gcHostOrigin',
                        gcTargetEnvQueryParam: 'gcTargetEnv'
                    });
                }).toThrow();
                // Missing gcTargetEnv query param
                query = '?gcHostOrigin=https://apps.mypurecloud.com';
                expect(() => {
                    new ClientApp({
                        gcHostOriginQueryParam: 'gcHostOrigin',
                        gcTargetEnvQueryParam: 'gcTargetEnv'
                    });
                }).toThrow();
            });
            it('should fail if the query params are badly configured or not set', () => {
                const invalidQueryParamNames = [undefined, null, 3, [], {}, '', ' '];
                invalidQueryParamNames.forEach((currInvalidParamName) => {
                    expect(() => {
                        new ClientApp({
                            gcHostOriginQueryParam: 'gcHostOrigin',
                            // @ts-expect-error
                            gcTargetEnvQueryParam: currInvalidParamName
                        });
                    }).toThrow();
                    expect(() => {
                        new ClientApp({
                            gcTargetEnvQueryParam: 'gcTargetEnv',
                            // @ts-expect-error
                            gcHostOriginQueryParam: currInvalidParamName
                        });
                    }).toThrow();
                });
            });
        });
        describe('gcHostOrigin and gcTargetEnv config', () => {
            it('should allow a user to pass valid origin and target env into the constructor', () => {
                // External
                let myClientApp = new ClientApp({
                    gcHostOrigin: 'https://apps.mypurecloud.com',
                    gcTargetEnv: 'prod'
                });
                expect(myClientApp.pcEnvironment).toBe('mypurecloud.com');
                // Localhost
                myClientApp = new ClientApp({
                    gcHostOrigin: 'https://localhost:1337',
                    gcTargetEnv: 'prod'
                });
                expect(myClientApp.pcEnvironment).toBe('localhost');
            });
            it('should fail if is not targeting a valid env', () => {
                // Mismatch Environment
                expect(() => {
                    new ClientApp({
                        gcHostOrigin: 'https://apps.mypurecloud.jp',
                        gcTargetEnv: 'prod'
                    });
                }).toThrow();
                // Mismatch Localhost
                expect(() => {
                    new ClientApp({
                        gcHostOrigin: 'https://localhost:1337',
                        gcTargetEnv: 'unknown'
                    });
                }).toThrow();
                // External
                expect(() => {
                    new ClientApp({
                        gcHostOrigin: 'https://invalid.com',
                        gcTargetEnv: 'prod'
                    });
                }).toThrow();
                // Invalid target env
                expect(() => {
                    new ClientApp({
                        gcHostOrigin: 'https://apps.mypurecloud.com',
                        gcTargetEnv: 'invalid'
                    });
                }).toThrow();
            });
            it('should fail if the host origin and target env are not set', () => {
                // Missing gcHostOrigin config option
                expect(() => {
                    new ClientApp({ gcHostOrigin: 'https://apps.mypurecloud.com' });
                }).toThrow();
                // Missing gcTargetEnv config option
                expect(() => {
                    new ClientApp({ gcTargetEnv: 'prod' });
                }).toThrow();
            });
            it('should fail if the host origin and target env are not configured', () => {
                const invalidValues = [undefined, null, 3, [], {}, '', ' '];
                invalidValues.forEach((invalidValue) => {
                    expect(() => {
                        new ClientApp({
                            gcHostOrigin: 'https://apps.mypurecloud.com',
                            // @ts-expect-error
                            gcTargetEnv: invalidValue
                        });
                    }).toThrow();
                    expect(() => {
                        new ClientApp({
                            gcTargetEnv: 'prod',
                            // @ts-expect-error
                            gcHostOrigin: invalidValue
                        });
                    }).toThrow();
                });
            });
        });
        /* eslint-enable no-new */
    });
});
