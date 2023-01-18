/* eslint-env node */
const pkg = require('../package.json');
const fs = require('fs-extra');
const path = require('path');
const glob = require('glob');

const {
    CLIENT_APP_SDK_PC_OAUTH_CLIENT_IDS: oauthClientIds,
    CLIENT_APP_SDK_PC_DEV_PLATFORM_ENV: devPlatformEnv
} = process.env;
const BROWSER_FILENAME = `/${pkg.name}.js`;

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

function transformPlatformEnvironment(buffer, env) {
    return buffer.replace(
        /(platformEnvironment =)[^;]+;/,
        `$1 pcEnvironment === 'localhost' ? '${env}' : pcEnvironment;`
    );
}

function buildExample(outDir, relativeFilePath, bundleFileName) {
    const exampleExt = path.extname(relativeFilePath);

    let buffer = null;

    if (!exampleExt || !['.js', '.html'].includes(exampleExt)) {
        // Read as a binary buffer
        buffer = fs.readFileSync(relativeFilePath);
    } else {
        // Read as utf-8 text and transform
        buffer = fs.readFileSync(relativeFilePath, 'utf8');
        buffer = transformExampleSdkUrl(buffer, bundleFileName);
        if (oauthClientIds) {
            buffer = transformSdkOAuthClientIds(buffer, oauthClientIds);
        }
        if (devPlatformEnv) {
            buffer = transformPlatformEnvironment(buffer, devPlatformEnv);
        }
    }
    fs.outputFileSync(
        path.join(outDir, relativeFilePath.replace(/examples[/|\\]/, '')),
        buffer
    );
}

function buildExamples(outDir, bundleFileName) {
    glob
        .sync('examples/**/*', { nodir: true })
        .forEach((example) => buildExample(outDir, path.normalize(example), bundleFileName));
}

module.exports = { buildExample, buildExamples };
