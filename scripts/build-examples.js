/* eslint-env node */
const pkg = require('../package.json');
const fs = require('fs-extra');
const path = require('path');
const glob = require('glob');

const { PC_OAUTH_CLIENT_IDS, MINIFIED_BUNDLE_FILENAME } = process.env;
const BROWSER_FILENAME = `${pkg.name}.js`;

// Called from command line
if (!module.parent) {
    buildExamples('dist');
}

function transformExampleSdkUrl(buffer) {
    return buffer.replace(
        /(\s*<script.*src=")([^"]+client-app-sdk[^"]+)(".*<\/script>\s*)/i,
        `$1${MINIFIED_BUNDLE_FILENAME || BROWSER_FILENAME}$3\n`
    );
}

function transformSdkOAuthClientIds(buffer) {
    return buffer.replace(
        /(pcOAuthClientIds =)[^;]+;/,
        `$1${PC_OAUTH_CLIENT_IDS}`
    );
}

function buildExample(outDir, relativeFilePath) {
    let buffer = fs.readFileSync(relativeFilePath, 'utf8');
    buffer = transformExampleSdkUrl(buffer);
    if (PC_OAUTH_CLIENT_IDS) {
        buffer = transformSdkOAuthClientIds(buffer);
    }
    fs.outputFileSync(
        path.join(outDir, relativeFilePath.replace('examples/', '')),
        buffer
    );
}

function buildExamples(outDir) {
    glob.sync('examples/**/*', { nodir: true }).forEach(example => buildExample(outDir, example));
}

module.exports = { buildExample, buildExamples };
