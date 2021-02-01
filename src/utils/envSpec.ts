import * as envUtils from './env';

export default describe('env utils', () => {
    it('should provide the default environment', () => {
        expect(envUtils.DEFAULT_PC_ENV.pcEnvTld).toBe('mypurecloud.com');
        expect(envUtils.DEFAULT_PC_ENV.pcAppOrigin).toBe('https://apps.mypurecloud.com');
    });

    it('should parse a valid TLD and return the environment object', () => {
        const resolvedEnv = envUtils.lookupPcEnv('mypurecloud.com')!;
        expect(resolvedEnv).not.toBeNull();
        expect(resolvedEnv.pcEnvTld).toBe('mypurecloud.com');
        expect(resolvedEnv.pcAppOrigin).toBe('https://apps.mypurecloud.com');
    });

    it('should resolve a local environment object with a custom dev origin if passed', () => {
        const env = envUtils.lookupPcEnv('localhost', true, [], 'https://localhost:3000')!;
        expect(env).not.toBeNull();
        expect(env.pcEnvTld).toBe('localhost');
        expect(env.pcAppOrigin).toBe('https://localhost:3000');
    });

    it('should resolve an env when in the list of TLDs passed in via param', () => {
        const resolvedEnv = envUtils.lookupPcEnv('example.com', true, ['example.com'])!;
        expect(resolvedEnv).not.toBeNull();
        expect(resolvedEnv.pcEnvTld).toBe('example.com');
        expect(resolvedEnv.pcAppOrigin).toBe('https://apps.example.com');
    });

    it('should not resolve an env when it is not in the list of TLDs passed in via param', () => {
        const env = envUtils.lookupPcEnv('example2.com', true, ['example.com']);
        expect(env).toBeNull();
    });

    it('should allow lenient parsing of TLDs and return the environment object', () => {
        const seedTld = 'mypurecloud.com';

        const variations = [
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
            const resolvedEnv = envUtils.lookupPcEnv(currTld, true)!;
            expect(resolvedEnv.pcEnvTld).toBe(seedTld);
            expect(resolvedEnv.pcAppOrigin).toBe(`https://apps.${seedTld}`);
        });
    });

    it('should return null if the pcEnvTld cannot be parsed or is unknown', () => {
        const seedTld = 'mypurecloud.com';

        const variations = [
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
            'mypurecloud.com.evil.com', // Evil subdomains
            'usw3.pure.cloud' // Valid PC Env TLD, but invalid subdomain
        ];

        variations.forEach(currTld => {
            // @ts-expect-error
            let resolvedEnv = envUtils.lookupPcEnv(currTld);
            expect(resolvedEnv).toBe(null);

            // Doesn't matter if it's lenient
            // @ts-expect-error
            resolvedEnv = envUtils.lookupPcEnv(currTld, true);
            expect(resolvedEnv).toBe(null);
        });
    });
});
