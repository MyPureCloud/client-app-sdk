/* eslint-disable no-console */
import { getEnvironments, Environment } from 'genesys-cloud-service-discovery-web';

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

function isKnownEnvName(toCheck: string, envs: Environment[]) {
    const envList = new Set<string>([...envs, ...__GC_DEV_EXTRA_ENVS__].map((e) => e.name));
    return envList.has(toCheck);
}

const matchesHostname = (hostname: string) => (domain: string) => {
    return hostname === domain || hostname.endsWith(`.${domain}`);
};

function findPcEnvironment(location: URL, targetEnv: string, envs: Environment[]): PcEnv|null {
    const parsedEnv = [...envs, ...__GC_DEV_EXTRA_ENVS__].find(({ publicDomainName, publicDomainAliases }) => {
        const domains = [publicDomainName, ...publicDomainAliases].filter(d => !!d);
        return domains.some(matchesHostname(location.hostname));
    });
    if (parsedEnv && parsedEnv.name === targetEnv) {
        return {
            pcEnvTld: parsedEnv.publicDomainName,
            pcAppOrigin: location.origin
        };
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
 * Attempts to locate a GC environment corresponding to the provided origin/targetEnv combination
 * @param url A string representing the Genesys Cloud environment url
 * @param targetEnv A string representing the Genesys Cloud environment target
 * @param envs A Environment array of all available Genesys Cloud environments
 * @returns A Genesys Cloud environment object if found; null otherwise.
 */
export const lookupGcEnv = (url: string, targetEnv: string, envs: Environment[] = environments): PcEnv|null => {
    if (!isKnownEnvName(targetEnv, envs)) {
        return null;
    }
    try {
        const hostLocation = new URL(url);
        if (['localhost', '127.0.0.1'].includes(hostLocation.hostname)) {
            return {
                pcEnvTld: 'localhost',
                pcAppOrigin: hostLocation.origin
            };
        } else {
            return findPcEnvironment(hostLocation, targetEnv, envs);
        }
    } catch {
        return null;
    }
};
