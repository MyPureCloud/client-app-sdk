const ACTION_NAME_KEY = 'action';

/**
 * @private
 */
exports._postMsgToPc = function () {
    let validRuntime = false,
        validEnv = false,
        validApi = false;

    if ((validRuntime = (typeof window === 'object' && typeof parent === 'object'))) {
        if ((validEnv = parent !== window)) {
            validApi = typeof parent.postMessage === 'function';
        }
    }

    if (validRuntime && validEnv && validApi) {
        parent.postMessage(...arguments);
    } else {
        let errMsg = 'PureCloud Communication Failed.  ';
        if (!validRuntime) {
            errMsg += 'Not running within a browser.';
        } else if (!validEnv) {
            errMsg += 'Not running within an iframe.';
        } else {
            errMsg += 'postMessage not supported in this browser.';
        }

        if (console) {
            console.error(errMsg);
        } else {
            throw new Error(errMsg);
        }
    }
};

/**
 * @private
 */
exports._sendMsgToPc = function (actionName, msgPayload) {
    let postMsgPayload = JSON.parse(JSON.stringify(msgPayload));
    postMsgPayload[ACTION_NAME_KEY] = actionName;
    exports._postMsgToPc(postMsgPayload, '*');
};
