/* eslint-env node */
const pkg = require('../package.json');
const fs = require('fs-extra');
const path = require('path');
const glob = require('glob');

const { CLIENT_APP_SDK_PC_OAUTH_CLIENT_IDS: oauthClientIds } = process.env;
const BROWSER_FILENAME = `${pkg.name}.js`;

// Called from command line
if (!module.parent) {
    const { bundle } = require('yargs')
        .option('bundle', { describe: 'minified UMD bundle file name' })
        .demandOption(['bundle'])
        .argv;
    buildExamples('dist', bundle);
}

function transformExampleSdkUrl(buffer, bundleFileName = BROWSER_FILENAME) {
    return buffer.replace(
        /(\s*<script.*src=")([^"]+client-app-sdk[^"]+)(".*<\/script>\s*)/i,
        `$1${bundleFileName}$3\n`
    );
}

function transformSdkOAuthClientIds(buffer, ids) {
    return buffer.replace(
        /(pcOAuthClientIds =)[^;]+;/,
        `$1${ids}`
    );
}

function buildExample(outDir, relativeFilePath, bundleFileName) {
    let buffer = fs.readFileSync(relativeFilePath, 'utf8');
    buffer = transformExampleSdkUrl(buffer, bundleFileName);
    if (oauthClientIds) {
        buffer = transformSdkOAuthClientIds(buffer, oauthClientIds);
    }
    fs.outputFileSync(
        path.join(outDir, relativeFilePath.replace('examples/', '')),
        buffer
    );
}

function buildExamples(outDir, bundleFileName) {
    glob
        .sync('examples/**/*', { nodir: true })
        .forEach(example => buildExample(outDir, example, bundleFileName));
}

module.exports = { buildExample, buildExamples };
