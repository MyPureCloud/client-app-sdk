/* eslint-env node */
'use strict';

const pkg = require('./package.json');
const fs = require('fs-extra');
const commonjs = require('rollup-plugin-commonjs');
const resolve = require('rollup-plugin-node-resolve');
const json = require('rollup-plugin-json');
const babel = require('rollup-plugin-babel');
const serve = require('rollup-plugin-serve');
const { terser } = require('rollup-plugin-terser');

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

const baseRollupConfig = {
    input: './src/index.js',
    cache: false,
    plugins: [
        commonjs(),
        resolve(),
        json(),
        babel({
            exclude: 'node_modules/**'
        })
    ]
};

if (process.env.DEV_SERVER) {
    baseRollupConfig.plugins.push(serve({
        host: 'localhost',
        port: 8443,
        contentBase: DEST_DIR,
        https: {
            key: fs.readFileSync('sslcert-dev/key.pem'),
            cert: fs.readFileSync('sslcert-dev/cert.pem')
        }
    }));
}

const buildRollupConfig = (config) => {
    return Object.assign({}, baseRollupConfig, config);
};

export default [
    buildRollupConfig({
        output: {
            dir: DEST_DIR,
            intro: LEGAL_TEXT,
            entryFileNames: CJS_FILENAME,
            format: 'cjs'
        }
    }),
    buildRollupConfig({
        output: {
            dir: DEST_DIR,
            intro: LEGAL_TEXT,
            entryFileNames: ES_FILENAME,
            format: 'es'
        }
    }),
    buildRollupConfig({
        output: {
            dir: DEST_DIR,
            intro: LEGAL_TEXT,
            name: GLOBAL_LIBRARY_NAME,
            entryFileNames: BROWSER_FILENAME,
            format: 'umd'
        }
    }),
    buildRollupConfig({
        output: {
            banner: LEGAL_TEXT,
            name: GLOBAL_LIBRARY_NAME,
            dir: DEST_DIR,
            entryFileNames: `${pkg.name}-[hash]${PROD_BROWSER_EXT}`,
            format: 'umd',
            sourcemap: true
        },
        plugins: [...baseRollupConfig.plugins, terser({
            output: {
                comments: function (node, comment) {
                    if (comment.type === 'comment2') {
                        // multiline comment
                        let includedCommentsRegExp = /@copyright|@license|@cc_on/i;
                        return includedCommentsRegExp.test(comment.value);
                    }
                }
            }
        })]
    })
];
