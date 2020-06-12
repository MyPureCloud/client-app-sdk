/* eslint-env node */
'use strict';

const path = require('path');
const fs = require('fs-extra');

const DEST_DIR = 'dist';

async function getFiles(dir) {
    const subdirs = await fs.readdir(dir);
    const files = await Promise.all(subdirs.map(async (subdir) => {
        const res = path.resolve(dir, subdir);
        return (await fs.stat(res)).isDirectory() ? getFiles(res) : res;
    }));
    return files.reduce((files, file) => files.concat(file), []);
}

async function buildExamples(destPath = DEST_DIR, sdkUrl = null) {
    const files = await getFiles('examples');
    return Promise.all(files.map(async file => {
        const path = file.replace('examples', destPath);
        const buffer = await fs.readFile(file);
        const transformedBuffer = buffer
            .toString()
            .replace(/(\s*<script.*src=")([^"]+client-app-sdk[^"]+)(".*<\/script>\s*)/i, '$1' + (sdkUrl || '$2') + '$3\n');
        return fs.outputFile(path, transformedBuffer);
    }));
}

exports.buildExamples = buildExamples;
