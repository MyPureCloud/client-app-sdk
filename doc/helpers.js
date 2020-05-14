let ddataHelpers = require('dmd/helpers/ddata.js');

const MD_URL_REPLACE_REGEXP = /\(.+\)/;
const MODULE_REGEXP = /module:[^~]*~(.+)/i;

/**
 * Custom link helper that supports outputting the docs to multiple files.
 *
 * @returns a relative file url link if the link target's documentation is in a separate file;
 *   otherwise, the default link help result (e.g. external or an internal document anchor)
 */
exports.link = function (longname, options) {
    let result = ddataHelpers.link(longname, options);

    if (longname && typeof longname === 'string') {
        let parseResult = MODULE_REGEXP.exec(longname);
        if (parseResult) {
            const ext = options.data.root.options.purecloudCustom.linkExtension;
            result = result.replace(MD_URL_REPLACE_REGEXP, `(./${parseResult[1]}${ext})`);
        }
    }

    return result;
}
