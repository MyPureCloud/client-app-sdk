/* jshint node: true */

'use strict';

let pkg = require('../package.json');

/**
 * Displays information about this version of the PureClound Client App SDK.
 * @since 1.0.0
 *
 * @returns A string of information describing this library
 *
 * @example
 * pcClientApp.about() // returns module name and current version
 */
exports.about = function () {
    return `${pkg.name}: ${pkg.version}`;
};

exports.users = require('./modules/users');
exports.alerting = require('./modules/alerting');
