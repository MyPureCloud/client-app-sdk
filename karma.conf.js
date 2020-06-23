// Karma configuration
const json = require('@rollup/plugin-json');
const commonjs = require('@rollup/plugin-commonjs');
const replace = require('@rollup/plugin-replace');
const { default: resolve } = require('@rollup/plugin-node-resolve');
const { default: babel } = require('@rollup/plugin-babel');

const {
    npm_package_name,
    npm_package_version,
    HOST_APP_DEV_ORIGIN,
    PC_DEV_ENVS
} = process.env;

module.exports = (config) => {
    config.set({
        // base path that will be used to resolve all patterns (eg. files, exclude)
        basePath: '',
        // frameworks to use
        // available frameworks: https://npmjs.org/browse/keyword/karma-adapter
        frameworks: ['jasmine'],
        // list of files / patterns to load in the browser
        files: [{ pattern: 'src/**/*Spec.ts', watched: false }],
        // list of files to exclude
        exclude: [],
        // preprocess matching files before serving them to the browser
        // available preprocessors: https://npmjs.org/browse/keyword/karma-preprocessor
        preprocessors: {
            'src/**/*Spec.ts': ['rollup']
        },
        // test results reporter to use
        // possible values: 'dots', 'progress'
        // available reporters: https://npmjs.org/browse/keyword/karma-reporter
        reporters: ['progress'],
        // web server port
        port: 9876,
        // enable / disable colors in the output (reporters and logs)
        colors: true,
        // level of logging
        // possible values: config.LOG_DISABLE || config.LOG_ERROR || config.LOG_WARN || config.LOG_INFO || config.LOG_DEBUG
        logLevel: config.LOG_INFO,
        // enable / disable watching file and executing tests whenever any file changes
        autoWatch: true,
        // start these browsers
        // available browser launchers: https://npmjs.org/browse/keyword/karma-launcher
        browsers: ['PhantomJS', 'Chrome'],
        // Continuous Integration mode
        // if true, Karma captures browsers, runs the tests and exits
        singleRun: false,
        // Concurrency level
        // how many browser should be started simultaneous
        concurrency: Infinity,
        rollupPreprocessor: {
            plugins: [
                replace({
                    '__PACKAGE_NAME__': JSON.stringify(npm_package_name),
                    '__PACKAGE_VERSION__': JSON.stringify(npm_package_version),
                    '__HOST_APP_DEV_ORIGIN__': JSON.stringify(HOST_APP_DEV_ORIGIN),
                    '__PC_DEV_ENVS__': JSON.stringify(PC_DEV_ENVS ? PC_DEV_ENVS.split(',') : []),
                }),
                commonjs(),
                resolve({
                    extensions: ['.ts', '.js']
                }),
                json(),
                babel({
                    babelHelpers: 'runtime',
                    exclude: /node_modules/,
                    extensions: ['.js', '.ts'],
                    presets: ['@babel/env', '@babel/typescript'],
                    plugins: [
                        ['@babel/transform-runtime', { useESModules: false }],
                        '@babel/proposal-class-properties',
                        '@babel/transform-object-assign'
                    ]
                })
            ],
            output: {
                format: 'iife',         // Helps prevent naming collisions.
                name: 'sdkTestBundle', // Required for 'iife' format.
                sourcemap: 'inline'     // Sensible for testing.
            }
        }
    });
};
