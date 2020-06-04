/* eslint-env node */
'use strict';

var pkg = require('./package.json');
var path = require('path');
var fs = require('fs');
let fsThen = require('fs-then-native');
var mkdirp = require('mkdirp');

var gulp = require('gulp');
var gutil = require('gulp-util');
var del = require('del');
var replace = require('gulp-replace');
var runSequence = require('run-sequence');

var rollup = require('rollup');
var rollupPluginCommonJs = require('rollup-plugin-commonjs');
var rollupPluginNodeResolve = require('rollup-plugin-node-resolve');
var rollupPluginJson = require('rollup-plugin-json');
var rollupPluginBabel = require('rollup-plugin-babel');
var rollupPluginUglify = require('rollup-plugin-uglify');

// Development Server Utils
var browserSync = require('browser-sync');

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

const DEFAULT_ROLLUP_CONFIG = {
    input: './src/index.js',
    plugins: [
        rollupPluginCommonJs(),
        rollupPluginNodeResolve(),
        rollupPluginJson(),
        rollupPluginBabel({
            exclude: 'node_modules/**'
        })
    ],
    cache: false
};

let flagDocsAsPreview = true;
if (process.env.FLAG_DOCS_AS_PREVIEW) {
    ['false', 'f', '0'].forEach(currFalseValue => {
        if (process.env.FLAG_DOCS_AS_PREVIEW === currFalseValue) {
            flagDocsAsPreview = false;
        }
    });
}

const GITHUB_FORMAT = 'github';
const KRAMDOWN_FORMAT = 'kramdown';
const PC_DEV_CENTER_FORMAT = 'purecloudDevCenter';
const SUPPORTED_DOC_OUTPUT_FORMATS = [GITHUB_FORMAT, KRAMDOWN_FORMAT, PC_DEV_CENTER_FORMAT];
let docMdOutputFormat = process.env.DOC_MD_OUTPUT_FORMAT || PC_DEV_CENTER_FORMAT;
if (SUPPORTED_DOC_OUTPUT_FORMATS.indexOf(docMdOutputFormat) < 0) {
    console.error(`Unknown MD Output Format Specified: '${docMdOutputFormat}'`);
    process.exit(1);
}

let relativeLinkExtension = '.md';
if (docMdOutputFormat === PC_DEV_CENTER_FORMAT) {
    relativeLinkExtension = '.html';
}

var build = function () {
    return Promise.all([buildStdDists(), buildProdBrowserDist()]);
};

/**
 * Builds std formats subtable for use with browsers, cjs, browserify, webpack, rollup, and other bundlers depending on
 * the output format.  All transpilation is complete (except for es modules when applicable),
 * comments are maintained, and the result is not minified.
 *
 * @param {string} The path to the destination directory in which the formats should be outputted
 *
 * @returns {Promise} resolves on success of all formats; rejects otherwise
 */
function buildStdDists(destDirPath = path.resolve(DEST_DIR)) {
    return rollup.rollup(DEFAULT_ROLLUP_CONFIG).then(bundle => {
        return Promise.all([
            bundle.write({
                intro: LEGAL_TEXT,
                file: path.resolve(destDirPath, CJS_FILENAME),
                format: 'cjs'
            }),
            bundle.write({
                intro: LEGAL_TEXT,
                file: path.resolve(destDirPath, ES_FILENAME),
                format: 'es'
            }),
            bundle.write({
                intro: LEGAL_TEXT,
                name: GLOBAL_LIBRARY_NAME,
                file: path.resolve(destDirPath, BROWSER_FILENAME),
                format: 'umd'
            })
        ]);
    });
}

/**
 * Builds prod-level, browser distribution in the specified directory. The bundle includes the
 * minified and uglified source, hashed file name, and a source map.
 *
 * @param {string} destDirPath - The path to the directory in which to generate the distribution.  Defaults to the default dist directory.
 *
 * @returns - A promise resolved with the details of the bundle or rejected on error.
 */
function buildProdBrowserDist(destDirPath = path.resolve(DEST_DIR)) {
    let prodBrowserCfg = Object.assign({}, DEFAULT_ROLLUP_CONFIG, {plugins: []});

    let includedCommentsRegExp = /@copyright|@license|@cc_on/i;
    prodBrowserCfg.plugins.push(...DEFAULT_ROLLUP_CONFIG.plugins, rollupPluginUglify({
        output: {
            comments: function (node, comment) {
                if (comment.type === 'comment2') {
                    // multiline comment
                    return includedCommentsRegExp.test(comment.value);
                }
            }
        }
    }));

    let nonHashedPath = path.resolve(destDirPath, `${pkg.name}${PROD_BROWSER_EXT}`);
    return rollup.rollup(prodBrowserCfg).then(bundle => {
        return bundle.write({
            banner: LEGAL_TEXT,
            name: GLOBAL_LIBRARY_NAME,
            file: nonHashedPath,
            format: 'umd',
            sourcemap: true
        });
    }).then(() => {
        let hasha = require('hasha');

        return hasha.fromFile(nonHashedPath, {algorithm: 'md5'}).then(hash => {
            let hashedFilename = `${pkg.name}-${hash}${PROD_BROWSER_EXT}`;
            return new Promise((resolve, reject) => {
                fs.rename(nonHashedPath, path.resolve(destDirPath, hashedFilename), err => {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(hashedFilename);
                    }
                });
            });
        });
    }).then(hashedFilename => {
        return {
            jsFilename: hashedFilename
        };
    });
}

function buildDocHeader(title) {
    let result = `---\ntitle: ${title}`;
    if (flagDocsAsPreview) {
        result += '\nispreview: true';
    }
    result += '\n---\n\n';

    return result;
}

/**
 * Builds markdown docs suitable for ingestion into the website generator
 */
var buildDoc = function () {
    let jsdoc2md = require('jsdoc-to-markdown');
    let docSrcDirPath = path.resolve('doc');
    let docDestDirPath = path.resolve(DEST_DIR, 'docs');

    // Create docs dest dir, if not already present
    mkdirp.sync(docDestDirPath);

    let docPromises = [];

    // Initiate index copy - Add to promise array for concurrency
    docPromises.push(
        fsThen.readFile(path.join(docSrcDirPath, 'index.md'), {encoding: 'UTF-8'}).then(buffer => {
            buffer = buildDocHeader('Client App SDK') + buffer;

            buffer = transformGithubMarkdown(buffer, docMdOutputFormat);

            buffer = transformRelativeLinks(buffer, relativeLinkExtension);

            return fsThen.writeFile(path.join(docDestDirPath, 'index.md'), buffer, {encoding: 'UTF-8'});
        })
    );

    // Generate Class docs from jsdoc in src
    let partialsPattern = path.join(docSrcDirPath, 'partials', '**', '*.hbs');
    let helpers = path.join(docSrcDirPath, 'helpers.js');

    return jsdoc2md.getTemplateData({
        cache: null,
        files: 'src/**/*.js'
    }).then(templateData => {
        templateData.forEach(currIdentifier => {
            if (!currIdentifier || currIdentifier.kind !== 'class') {
                return;
            }

            let {name: className} = currIdentifier;
            if (className) {
                // Remove the module as the parent of the classes for the purposes of doc generation
                currIdentifier.scope = 'global';
                currIdentifier.memberof = '';

                let template = `{{#class name="${className}"}}{{>docs}}{{/class}}`;

                docPromises.push(
                    jsdoc2md.render({
                        data: templateData,
                        template: template,
                        partial: partialsPattern,
                        helper: helpers,
                        'heading-depth': 2,
                        'example-lang': 'js',
                        purecloudCustom: {
                            linkExtension: relativeLinkExtension
                        }
                    }).then(output => {
                        output = buildDocHeader(className) + output;

                        output = transformGithubMarkdown(output, docMdOutputFormat);

                        return fsThen.writeFile(path.join(docDestDirPath, `${className}.md`), output);
                    })
                );
            }
        });

        return Promise.all(docPromises);
    }).catch(reason => {
        let errMsg = 'Documentation generation failed';
        gutil.log(gutil.colors.red(errMsg), reason);
        return Promise.reject(errMsg);
    });
};

function transformRelativeLinks(buffer, ext) {
    const RELATIVE_LINK_REPLACE_REGEXP = /\(\.\/([^)]+)\.[^)]+\)/gm;
    return buffer.replace(RELATIVE_LINK_REPLACE_REGEXP, (match, name) => {
        return `(./${name}${ext})`;
    });
}

/**
 * Returns a copy of the github-flavored markdown srcBuffer transformed into the target format.
 *
 * @param {string} srcBuffer The base github-flavored markdown format
 * @param {string} targetFormat The desired markdwon format of the response
 */
function transformGithubMarkdown(srcBuffer, targetFormat) {
    let result = srcBuffer;

    if (targetFormat === PC_DEV_CENTER_FORMAT) {
        // Transform ``` javascript to ``` {"language": "javascript"}
        let codeFenceRegExp = /^[ \t]*```[ \t]*(\S*)[ \t]*$/gm;
        result = result.replace(codeFenceRegExp, (match, language) => {
            return '```' + (language ? ` {"language": "${language}"}` : '');
        });
    }

    if (targetFormat === KRAMDOWN_FORMAT) {
        // Kramdown uses ~~~ for code blocks
        result = result.replace(/```/g, '~~~');
    }

    return result;
}

var buildExamples = function (destPath = DEST_DIR, sdkUrl = null) {
    gulp.src('examples/**')
        .pipe(replace(/(\s*<script.*src=")([^"]+client-app-sdk[^"]+)(".*<\/script>\s*)/i, '$1' + (sdkUrl || '$2') + '$3\n'))
        .pipe(gulp.dest(destPath));
};

// Tasks
gulp.task('default', function (done) {
    runSequence('clean', ['build', 'doc'], done);
});

gulp.task('clean', function () {
    return del([DEST_DIR]);
});

gulp.task('build', build);

gulp.task('doc', buildDoc);

gulp.task('watch', function () {
    gulp.watch('src/**/*.js', () => {
        console.log('SDK Changed.  Rebuilding.');
        build();
    });
});

gulp.task('serve', ['clean'], function () {
    let buildSdkForDevServer = buildStdDists.bind(this, path.resolve(DEST_DIR, 'vendor'));
    let buildExamplesForDevServer = buildExamples.bind(this, DEST_DIR, `vendor/${BROWSER_FILENAME}`);

    return buildSdkForDevServer().then(() => {
        buildExamplesForDevServer();

        browserSync({
            server: {
                baseDir: DEST_DIR,
                directory: true
            },
            port: 8443,
            https: {
                key: 'sslcert-dev/key.pem',
                cert: 'sslcert-dev/cert.pem'
            }
        });

        gulp.watch('src/**/*.js', () => {
            console.log('SDK Changed.  Rebuilding.');
            buildSdkForDevServer();
        });
        gulp.watch('examples/**', () => {
            console.log('Examples changed.  Rebuilding.');
            buildExamplesForDevServer();
        });
    });
});
