import pkg from './package.json';
import os from 'os';
import { spawn } from 'child_process';
import fs from 'fs-extra';
import path from 'path';
import serve from 'rollup-plugin-serve';
import livereload from 'rollup-plugin-livereload';
import { umdConfig } from './rollup.config';

const { buildExample, buildExamples } = require('./scripts/build-examples');

const examplesPath = path.resolve('examples');
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

const tsc = () => {
    return new Promise((resolve, reject) => {
        const bin = process.platform === 'win32' ? require.resolve('.bin/tsc.cmd') : require.resolve('.bin/tsc');
        spawn(bin, [
            '--incremental',
            '--outDir', `${tmpDestPath}/ts-build`,
            '--project', 'tsconfig.build.json'
        ], { stdio: 'inherit' })
            .on('exit', resolve)
            .on('error', (err) => reject(err));
    });
};

// Build all examples initially
buildExamples(tmpDestPath);

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
                this.addWatchFile(examplesPath);
                await tsc(); // Check typescript types
            },
            watchChange(id) {
                // Rebuild individual example file when changed
                if (id.startsWith(examplesPath)) {
                    buildExample(tmpDestPath, path.relative(__dirname, id));
                }
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
