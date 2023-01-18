import pkg from './package.json';
import commonjs from '@rollup/plugin-commonjs';
import json from '@rollup/plugin-json';
import babel from '@rollup/plugin-babel';
import resolve from '@rollup/plugin-node-resolve';
import { terser } from 'rollup-plugin-terser';
import replace from '@rollup/plugin-replace';
import dotenv from 'dotenv';

// Get .env variables
dotenv.config();

const DEST_DIR = 'dist';
const GLOBAL_LIBRARY_NAME = 'purecloud.apps.ClientApp';
const CJS_FILENAME = 'main.js';
const ES_FILENAME = 'main.mjs';
const BROWSER_FILENAME = `${pkg.name}.js`;
const PROD_BROWSER_EXT = '.min.js';

const LEGAL_TEXT = `/*
* ${pkg.name}
* @copyright Copyright (C) ${new Date().getUTCFullYear()} Genesys Telecommunications Laboratories, Inc.}
* @license MIT
*
* This software comprises other FOSS software.
* Attribution and license information can be found at https://github.com/MyPureCloud/client-app-sdk/blob/master/README.md
*/`;

const {
    npm_package_name,
    npm_package_version,
    CLIENT_APP_SDK_HOST_APP_DEV_ORIGIN: devOrigin,
    CLIENT_APP_SDK_PC_DEV_ENVS: devEnvs,
    CLIENT_APP_SDK_GC_EXTRA_ENVS: extraEnvs
} = process.env;

// Packages to exclude from esm/cjs bundles
const EXTERNAL_DEPS = [
    'query-string',
    'genesys-cloud-service-discovery-web',
    /@babel\/runtime/ // Need to use a regex here: https://github.com/rollup/plugins/issues/475#issuecomment-652416290
];

// Need to be able to configure whether or not
// babel pulls in the esm versions of the runtime helpers
const babelPlugin = (useESModules = false) => babel({
    babelHelpers: 'runtime',
    exclude: /node_modules/,
    extensions: ['.js', '.ts'],
    presets: ['@babel/env', '@babel/typescript'],
    plugins: [
        ['@babel/transform-runtime', { useESModules }],
        '@babel/proposal-class-properties',
        '@babel/transform-object-assign'
    ]
});

const baseRollupConfig = {
    input: './src/index.ts',
    cache: false,
    plugins: [
        replace({
            '__PACKAGE_NAME__': JSON.stringify(npm_package_name),
            '__PACKAGE_VERSION__': JSON.stringify(npm_package_version),
            '__HOST_APP_DEV_ORIGIN__': JSON.stringify(devOrigin),
            '__PC_DEV_ENVS__': JSON.stringify(devEnvs ? devEnvs.split(',') : []),
            '__GC_DEV_EXTRA_ENVS__': extraEnvs || '[]',
        }),
        commonjs(),
        resolve({ extensions: ['.js', '.ts'] }),
        json()
    ]
};

const buildRollupConfig = (config) => Object.assign({}, baseRollupConfig, config);

export const umdConfig = buildRollupConfig({
    plugins: [...baseRollupConfig.plugins, babelPlugin()],
    output: {
        dir: DEST_DIR,
        intro: LEGAL_TEXT,
        name: GLOBAL_LIBRARY_NAME,
        entryFileNames: BROWSER_FILENAME,
        format: 'umd'
    }
});

export default [
    umdConfig,
    buildRollupConfig({
        external: EXTERNAL_DEPS,
        plugins: [...baseRollupConfig.plugins, babelPlugin()],
        output: {
            dir: DEST_DIR,
            intro: LEGAL_TEXT,
            entryFileNames: CJS_FILENAME,
            format: 'cjs'
        }
    }),
    buildRollupConfig({
        external: EXTERNAL_DEPS,
        plugins: [...baseRollupConfig.plugins, babelPlugin(true)],
        output: {
            dir: DEST_DIR,
            intro: LEGAL_TEXT,
            entryFileNames: ES_FILENAME,
            format: 'es'
        }
    }),
    buildRollupConfig({
        plugins: umdConfig.plugins,
        output: {
            banner: LEGAL_TEXT,
            name: GLOBAL_LIBRARY_NAME,
            dir: DEST_DIR,
            entryFileNames: `${pkg.name}-[hash]${PROD_BROWSER_EXT}`,
            format: 'umd',
            sourcemap: true,
            plugins: [
                terser({
                    output: {
                        comments: (node, comment) => {
                            if (comment.type === 'comment2') {
                                // multiline comment
                                let includedCommentsRegExp = /@copyright|@license|@cc_on/i;
                                return includedCommentsRegExp.test(comment.value);
                            }
                        }
                    }
                })
            ]
        }
    })
];
