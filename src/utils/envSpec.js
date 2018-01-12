/* eslint-env jasmine */
import envUtils from './env';

export default describe('env utils', () => {
    const VALID_PC_TLDS = [
        'mypurecloud.com',
        'mypurecloud.com.au',
        'mypurecloud.ie',
        'mypurecloud.jp'
    ];

    it('should provide the default environment', () => {
        expect(envUtils.DEFAULT_PC_ENV.pcEnvTld).toBe('mypurecloud.com');
        expect(envUtils.DEFAULT_PC_ENV.pcAppOrigin).toBe('https://apps.mypurecloud.com');
    });

    it('should parse valid TLDs and return the environment object', () => {
        VALID_PC_TLDS.forEach(currTld => {
            let resolvedEnv = envUtils.lookupPcEnv(currTld);
            expect(resolvedEnv.pcEnvTld).toBe(currTld);
            expect(resolvedEnv.pcAppOrigin).toBe(`https://apps.${currTld}`);
        });
    });

    it('should allow lenient parsing of TLDs and return the environment object', () => {
        let seedTld = VALID_PC_TLDS[0];

        let variations = [
            ` ${seedTld}`, // Leading whitespace
            `  ${seedTld}`, // Leading multi-whitespace
            `${seedTld} `, // Trailing whitespace
            `${seedTld}  `, // Trailing multi-whitespace
            `   ${seedTld}   `, // Both Leading and Trailing whitespace
            `.${seedTld}`, // Leading dot
            ` .${seedTld}`, // Leading whitespace and dot
            `${seedTld}/`, // Trailing slash
            `${seedTld}/ `, // Trailing slash and whitespace
            `  .${seedTld}/  ` // All of the above
        ];

        variations.forEach(currTld => {
            let resolvedEnv = envUtils.lookupPcEnv(currTld, true);
            expect(resolvedEnv.pcEnvTld).toBe(seedTld);
            expect(resolvedEnv.pcAppOrigin).toBe(`https://apps.${seedTld}`);
        });
    });

    it('should return null if the pcEnvTld cannot be parsed or is unknown', () => {
        let seedTld = VALID_PC_TLDS[0];

        let variations = [
            undefined,
            null,
            3,
            {foo: 1},
            [],
            '', // Empty string
            ' ', // Blank string
            `apps.${seedTld}`, // Subdomain
            `https://apps.${seedTld}`, // FQDN
            `. ${seedTld} /`, // Inner whitespace
            'mypurecloud.io', // Valid TLD, but invalid PC Env TLD
            'mypurecloud.com.evil.com' // Evil subdomains
        ];

        variations.forEach(currTld => {
            let resolvedEnv = envUtils.lookupPcEnv(currTld);
            expect(resolvedEnv).toBe(null);

            // Doesn't matter if it's lenient
            resolvedEnv = envUtils.lookupPcEnv(currTld, true);
            expect(resolvedEnv).toBe(null);
        });
    });
});
