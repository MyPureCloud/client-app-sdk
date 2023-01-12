import { Environment, getEnvironments, parse } from 'genesys-cloud-service-discovery-web';

interface GCEnvironment extends Environment {
    extra?: boolean;
}
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
const ALL_GC_ENVS: GCEnvironment[] = environments.concat(__GC_DEV_EXTRA_ENVS__.map((e) => { return { ...e, extra: true }; }));

const [defaultEnv] = environments.filter(env => env.region === DEFAULT_ENV_REGION);

export const DEFAULT_PC_ENV = buildPcEnv(defaultEnv.publicDomainName);

function findPcEnvironment(location: URL, targetEnv: string, envList: GCEnvironment[]): PcEnv|null {
    for (const environment of envList) {
        if (environment.extra) {
            const publicDomains = [environment.publicDomainName, ...(environment.publicDomainAliases || [])];
            const matchingDomain = publicDomains.find((p) => `apps.${p}` === location.hostname);
            if (environment.env === targetEnv && matchingDomain) {
                return buildPcEnv(matchingDomain);
            }
        } else {
            try {
                const parsedEnv = parse(location.origin, {});
                if (parsedEnv && parsedEnv.name === targetEnv) {
                    return {
                        pcEnvTld: parsedEnv.publicDomainName,
                        pcAppOrigin: location.origin
                    };
                }
            } catch {
                continue;
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
export const lookupGcEnv = (url: string, targetEnv: string, envList: GCEnvironment[] = ALL_GC_ENVS): PcEnv|null => {
    try {
        const hostLocation = new URL(url);
        if (['localhost', '127.0.0.1'].includes(hostLocation.hostname)) {
            return {
                pcEnvTld: 'localhost',
                pcAppOrigin: hostLocation.origin
            };
        } else {
            return findPcEnvironment(hostLocation, targetEnv, envList);
        }
    } catch {
        return null;
    }
};
