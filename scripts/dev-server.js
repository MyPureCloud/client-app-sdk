/* eslint-env node */
'use strict';

const pkg = require('../package.json');
const loadConfigFile = require('rollup/dist/loadConfigFile');
const path = require('path');
const rollup = require('rollup');
const chokidar = require('chokidar');

const { buildExamples } = require('./build-examples');

const DEST_DIR = 'dist';
const BROWSER_FILENAME = `${pkg.name}.js`;

const buildExamplesForDevServer = () => buildExamples(DEST_DIR, `vendor/${BROWSER_FILENAME}`);

async function devServer() {
    const { options } = await loadConfigFile(path.resolve(__dirname, '../rollup.config.js'), {
        output: { dir: `${DEST_DIR}/vendor` },
    });

    chokidar.watch(path.resolve(__dirname, '../examples'))
        .on('ready', buildExamplesForDevServer)
        .on('change', () => {
            console.log('Examples Changed. Rebuilding...');
            buildExamplesForDevServer();
        });

    const watcher = rollup.watch(options);
    watcher.on('change', () => {
        console.log('SDK Changed. Rebuilding...');
    });
}

devServer();
