/* eslint-env node */
'use strict';

const path = require('path');
const fsThen = require('fs-then-native');
const mkdirp = require('mkdirp');

const DEST_DIR = 'dist';
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

let flagDocsAsPreview = true;
if (process.env.FLAG_DOCS_AS_PREVIEW) {
    ['false', 'f', '0'].forEach(currFalseValue => {
        if (process.env.FLAG_DOCS_AS_PREVIEW === currFalseValue) {
            flagDocsAsPreview = false;
        }
    });
}

// If invoked via "npm run docs" or "node scripts/build-docs.js" run immediately
const calledFromCli = !module.parent;
if (calledFromCli) {
    buildDocs();
}

function buildDocHeader(title) {
    let result = `---\ntitle: ${title}`;
    if (flagDocsAsPreview) {
        result += '\nispreview: true';
    }
    result += '\n---\n\n';

    return result;
}

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

/**
 * Builds markdown docs suitable for ingestion into the website generator
 */
function buildDocs() {
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
        console.error(errMsg, reason);
        return Promise.reject(errMsg);
    });
}

exports.buildDocs = buildDocs;
