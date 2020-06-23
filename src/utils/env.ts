const DEFAULT_PC_ENV_TLD = 'mypurecloud.com';
const PC_ENV_TLDS = [
    'mypurecloud.com',
    'mypurecloud.com.au',
    'mypurecloud.ie',
    'mypurecloud.jp',
    'mypurecloud.de',
    'usw2.pure.cloud',
    'euw2.pure.cloud',
    'cac1.pure.cloud',
    'apne2.pure.cloud',
    ...__PC_DEV_ENVS__
];

export interface PcEnv {
    pcEnvTld: string;
    pcAppOrigin: string;
}

const PC_ENVS = PC_ENV_TLDS.map<PcEnv>(tld => ({
    pcEnvTld: tld,
    pcAppOrigin: `https://apps.${tld}`
}));

const [DEFAULT_PC_ENV] = PC_ENVS.filter(env => env.pcEnvTld === DEFAULT_PC_ENV_TLD);

export default {
    DEFAULT_PC_ENV,

    /**
     * Attempts to locate a PC environment corresponding to the provided search params
     *
     * @param pcEnvTld A string representing the PureCloud environment top-level domain to search for
     * @param lenient When true, trims leading/trailing whitespace, ignores leading '.', and ignores trailing '/'.
     *
     * @returns A PureCloud environment object if found; null otherwise.
     */
    lookupPcEnv(pcEnvTld: string, lenient = false) {
        if (pcEnvTld && typeof pcEnvTld === 'string') {
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

            for (const env of PC_ENVS) {
                if (env.pcEnvTld === toSearch) return env;
            }
        }

        return null;
    }
};
