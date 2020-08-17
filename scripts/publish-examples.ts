/*
 * This script is necessitated by two issues in the gh-pages progject.
 *
 * https://github.com/tschaub/gh-pages/issues/13 (using global git config)
 * https://github.com/tschaub/gh-pages/issues/56 (no-push switch broken)
 *
 * If these are fixed, the built-in gh-pages bin can be used as:
 * "publish-examples": "gh-pages -d examples/ --add --message 'Update Examples'",
 * [Note:] The -n option could then be used for testing
 */

import * as ghpages from 'gh-pages';
import * as path from 'path';
import { exec } from 'child-process-promise';

const DEFAULT_COMMIT_MSG = 'Update Examples';

let customCommitMsg: string;
if (process.argv.length === 3) {
    customCommitMsg = process.argv[2];
} else if (process.argv.length > 3) {
    console.error(`Invalid Arguments\n${getUsage()}`);
    process.exit(1);
}

let username: string, email: string;
exec('git config user.name').then(result => {
    if (!result.stderr) {
        username = result.stdout.trim();
    }

    if (!username) {
        throw new Error('Failed to read user.name');
    }

    return exec('git config user.email');
}).then((result) => {
    if (!result.stderr) {
        email = result.stdout.trim();
    }

    if (!email) {
        throw new Error('Failed to read user.email');
    }

    return;
}).then(() => {
    console.log(`Publishing examples as ${username}/${email}`);
    ghpages.publish(path.join(__dirname, '../examples'), {
        add: true,
        message: customCommitMsg || DEFAULT_COMMIT_MSG,
        user: {
            name: username,
            email: email
        }
    }, function (err) {
        if (err) {
            console.error('Failed to publish examples to gh-pages', err);
            process.exit(1);
        } else {
            console.log('Successfully published examples to gh-pages');
            process.exit(0);
        }
    });
}).catch(err => {
    console.error(err);
    process.exit(1);
});

/**
 * Get Usage Information
 *
 * @returns Usage string
 * node publish-examples.js [commit-message]
 */
function getUsage() {
    return 'node publish-examples.js [commit-message]';
}
