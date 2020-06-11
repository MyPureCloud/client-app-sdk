/* eslint-env jasmine */
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
        let myClientApp = new ClientApp();
        (['alerting', 'lifecycle', 'coreUi', 'users', 'myConversations', 'externalContacts'] as const).forEach(currModuleName => {
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

        describe('pcEnvironmentQueryParam config', () => {
            it('should allow a user to pass a valid query string param name into the constructor', () => {
                let pcEnvironmentQueryParam = 'pcEnvironment';
                spyOn(ClientApp, '_getQueryString')
                    .and.returnValue(`?${pcEnvironmentQueryParam}=${VALID_NON_DEFAULT_PC_ENVIRONMENT}`);

                let myClientApp = new ClientApp({
                    pcEnvironmentQueryParam
                });

                expect(myClientApp.pcEnvironment).toBe(VALID_NON_DEFAULT_PC_ENVIRONMENT);
            });

            it('should fail if the query param cannot be found', () => {
                let invalidQueryStrings = [
                    undefined,
                    null,
                    '',
                    '?', // Empty query string
                    '?bar=baz', // param not found
                    `?foo=${VALID_NON_DEFAULT_PC_ENVIRONMENT}&foo=${VALID_NON_DEFAULT_PC_ENVIRONMENT}`, // param specified multiple times
                    `?foo[0]=${VALID_NON_DEFAULT_PC_ENVIRONMENT}` // Array syntax not supported
                ];

                let index = 0;
                spyOn(ClientApp, '_getQueryString').and.callFake(() => invalidQueryStrings[++index] as any);

                invalidQueryStrings.forEach(currInvalidQueryString => {
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
                let invalidQueryParamNames = [undefined, null, 3, [], {}, '', ' '];

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
                let myClientApp = new ClientApp({
                    pcEnvironment: VALID_NON_DEFAULT_PC_ENVIRONMENT
                });

                expect(myClientApp.pcEnvironment).toBe(VALID_NON_DEFAULT_PC_ENVIRONMENT);
            });

            it('should leniently parse the pcEnvironment and store the normalized version it in the property', () => {
                let myClientApp = new ClientApp({
                    pcEnvironment: ` ${VALID_NON_DEFAULT_PC_ENVIRONMENT} `
                });

                expect(myClientApp.pcEnvironment).toBe(VALID_NON_DEFAULT_PC_ENVIRONMENT);
            });

            it('should fail if invalid data is passed', () => {
                let invalidEnvironments = [undefined, null, 3, [], {}, '', ' ', 'unknown.com'];

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
                let customOrigin = 'some.pc-origin.com';
                let myClientApp = new ClientApp({
                    pcOrigin: customOrigin
                });
                expect(myClientApp['_customPcOrigin']).toBe(customOrigin);
                expect(myClientApp.pcEnvironment).toBe(null);
            });

            it('should fail if invalid data is passed', () => {
                let invalidCustomOrigins = [undefined, null, 3, [], {}, '', ' '];

                invalidCustomOrigins.forEach(currCustomOrigin => {
                    expect(() => {
                        // @ts-expect-error
                        new ClientApp({ pcOrigin: currCustomOrigin });
                    }).toThrow();
                });
            });
        });
        /* eslint-enable no-new */
    });
});
