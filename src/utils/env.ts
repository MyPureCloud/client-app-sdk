import { getEnvironments, parse } from 'genesys-cloud-service-discovery-web';

export type EnvironmentParser = typeof parse;
export interface PcEnv {
    pcEnvTld: string;
    pcAppOrigin: string;
}

const buildPcEnv = (tld: string): PcEnv => ({
    pcEnvTld: tld,
    pcAppOrigin: `https://apps.${tld}`
});

const DEFAULT_ENV_REGION = 'us-east-1';
const environments = getEnvironments({ env: ['prod', 'fedramp'], status: ['beta', 'stable'] });

const PC_ENV_TLDS = environments
    .reduce((tlds, env) => {
        tlds.push(env.publicDomainName);
        tlds.push(...env.publicDomainAliases);
        return tlds;
    }, [] as string[])
    .concat(__PC_DEV_ENVS__);

const [defaultEnv] = environments.filter(env => env.region === DEFAULT_ENV_REGION);

export const DEFAULT_PC_ENV = buildPcEnv(defaultEnv.publicDomainName);

function findPcEnvironment(location: URL, targetEnv: string, parseEnvironment: EnvironmentParser): PcEnv|null {
    const parsedEnv = parseEnvironment(location.origin, {});
    if (parsedEnv && parsedEnv.name === targetEnv) {
        return {
            pcEnvTld: parsedEnv.publicDomainName,
            pcAppOrigin: location.origin
        };
    } else {
        for (const environment of __GC_DEV_EXTRA_ENVS__) {
            const publicDomains = [environment.publicDomainName, ...(environment.publicDomainAliases || [])];
            const matchingDomain = publicDomains.find((p) => location.hostname.endsWith(p));
            if (environment.env === targetEnv && matchingDomain) {
                return {
                    pcEnvTld: environment.publicDomainName,
                    pcAppOrigin: location.origin
                };
            }
        }
    }
    return null;
}

/**
 * Attempts to locate a PC environment corresponding to the provided search params
 *
 * @param pcEnvTld A string representing the Genesys Cloud environment top-level domain to search for
 * @param lenient When true, trims leading/trailing whitespace, ignores leading '.', and ignores trailing '/'.
 * @param envTlds A string array of all available Genesys Cloud environment top-level domains
 * @param hostAppDevOrigin The origin to target when the host app is running on `localhost`
 *
 * @returns A Genesys Cloud environment object if found; null otherwise.
 */
export const lookupPcEnv = (pcEnvTld: string, lenient = false, envTlds: string[] = PC_ENV_TLDS, hostAppDevOrigin = __HOST_APP_DEV_ORIGIN__): PcEnv | null => {
    if (pcEnvTld && typeof pcEnvTld === 'string') {
        if (pcEnvTld === 'localhost' && hostAppDevOrigin) {
            return {
                pcEnvTld: 'localhost',
                pcAppOrigin: hostAppDevOrigin
            };
        }
        let toSearch = pcEnvTld;

        if (lenient) {
            toSearch = toSearch.trim();

            if (toSearch.indexOf('.') === 0) {
                toSearch = toSearch.substring(1);
            }

            if (toSearch.indexOf('/') === (toSearch.length - 1)) {
                toSearch = toSearch.substring(0, toSearch.length - 1);
            }
        }

        if (envTlds.indexOf(toSearch) >= 0) {
            return buildPcEnv(toSearch);
        }
    }

    return null;
};

/**
 * Attempts to locate a PC environment corresponding to the provided url
 * @param url A string representing the Genesys Cloud environment top-level domain to search for
 * @returns A Genesys Cloud environment object if found; null otherwise.
 */
export const lookupGcEnv = (url: string, targetEnv: string, parseEnvironment: EnvironmentParser = parse): PcEnv|null => {
    try {
        const hostLocation = new URL(url);
        if (['localhost', '127.0.0.1'].includes(hostLocation.hostname)) {
            return {
                pcEnvTld: 'localhost',
                pcAppOrigin: hostLocation.origin
            };
        } else {
            return findPcEnvironment(hostLocation, targetEnv, parseEnvironment);
        }
    } catch {
        return null;
    }
};
