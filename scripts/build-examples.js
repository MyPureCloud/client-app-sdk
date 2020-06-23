/* eslint-env node */
import pkg from '../package.json';
import fs from 'fs-extra';
import path from 'path';
import glob from 'glob';

const { PC_OAUTH_CLIENT_IDS } = process.env;
const BROWSER_FILENAME = `${pkg.name}.js`;

const transformExampleSdkUrl = (buffer) => {
    return buffer.replace(
        /(\s*<script.*src=")([^"]+client-app-sdk[^"]+)(".*<\/script>\s*)/i,
        '$1' + (BROWSER_FILENAME || '$2') + '$3\n'
    );
};

const transformSdkOAuthClientIds = (buffer) => {
    return buffer.replace(
        /(pcOAuthClientIds =)[^;]+;/,
        `$1${PC_OAUTH_CLIENT_IDS}`
    );
};

export const buildExample = (outDir, relativeFilePath) => {
    let buffer = fs.readFileSync(relativeFilePath, 'utf8');
    buffer = transformExampleSdkUrl(buffer);
    if (PC_OAUTH_CLIENT_IDS) {
        buffer = transformSdkOAuthClientIds(buffer);
    }
    fs.outputFileSync(
        path.join(outDir, relativeFilePath.replace('examples/', '')),
        buffer
    );
};

export const buildExamples = (outDir) => {
    glob.sync('examples/**/*', { nodir: true }).forEach(example => buildExample(outDir, example));
};
