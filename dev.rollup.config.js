import pkg from './package.json';
import os from 'os';
import { spawn } from 'child_process';
import fs from 'fs-extra';
import path from 'path';
import glob from 'glob';
import serve from 'rollup-plugin-serve';
import livereload from 'rollup-plugin-livereload';
import { umdConfig } from './rollup.config';

const BROWSER_FILENAME = `${pkg.name}.js`;
const tmpDestPath = fs.mkdtempSync(path.join(os.tmpdir(), `${pkg.name}-dev-server-`));

let httpsConfig;
try {
    httpsConfig = {
        key: fs.readFileSync('sslcert-dev/key.pem'),
        cert: fs.readFileSync('sslcert-dev/cert.pem')
    };
} catch (e) {
    console.warn('Unable to find ssl key/cert for https, serving over http.');
}

const transformExampleSdkUrl = (buffer) => {
    return buffer.replace(
        /(\s*<script.*src=")([^"]+client-app-sdk[^"]+)(".*<\/script>\s*)/i,
        '$1' + (BROWSER_FILENAME || '$2') + '$3\n'
    );
};

const buildExample = (relativeFilePath) => {
    fs.outputFileSync(
        path.join(tmpDestPath, relativeFilePath.replace('examples/', '')),
        transformExampleSdkUrl(fs.readFileSync(relativeFilePath, 'utf8'))
    );
};

const tsc = () => {
    return new Promise((resolve) => {
        const bin = require.resolve('typescript/bin/tsc');
        spawn(bin, [
            '--incremental',
            '--outDir', `${tmpDestPath}/ts-build`,
            '--project', 'tsconfig.build.json'
        ], { stdio: 'inherit' })
            .on('exit', resolve);
    });
};

// Build all examples initially
glob.sync('examples/**/*', { nodir: true }).forEach(buildExample);

export default Object.assign({}, umdConfig, {
    output: Object.assign({}, umdConfig.output, {
        dir: tmpDestPath
    }),
    watch: {
        clearScreen: false
    },
    plugins: [
        ...umdConfig.plugins,
        {
            name: 'process-examples',
            async buildStart() {
                this.addWatchFile(path.resolve('examples'));
                await tsc(); // Check typescript types
            },
            watchChange(id) {
                // Rebuild individual example file when changed
                if (id.indexOf('examples/') < 0) return;
                buildExample(path.relative(__dirname, id));
            }
        },
        serve({
            port: 8443,
            contentBase: tmpDestPath,
            https: httpsConfig
        }),
        livereload({
            watch: tmpDestPath,
            https: httpsConfig,
            verbose: true
        })
    ]
});
