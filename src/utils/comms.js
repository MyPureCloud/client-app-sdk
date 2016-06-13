const ACTION_NAME_KEY = 'action';

/**
 * @private
 */
exports._postMsgToPc = function (msg, tgtOrigin, transfer, myWindow=window, myParent=parent, myConsole=console) {
    let validRuntime = false,
        validEnv = false,
        validApi = false;

    if ((validRuntime = (typeof myWindow === 'object' && typeof myParent === 'object'))) {
        if ((validEnv = myParent !== myWindow)) {
            validApi = typeof myParent.postMessage === 'function';
        }
    }

    if (validRuntime && validEnv && validApi) {
        myParent.postMessage(msg, tgtOrigin, transfer);
    } else {
        let errMsg = 'PureCloud Communication Failed.  ';
        if (!validRuntime) {
            errMsg += 'Not running within a browser.';
        } else if (!validEnv) {
            errMsg += 'Not running within an iframe.';
        } else {
            errMsg += 'postMessage not supported in this browser.';
        }

        if (myConsole) {
            myConsole.error(errMsg);
        } else {
            throw new Error(errMsg);
        }
    }
};

/**
 * @private
 */
exports._sendMsgToPc = function (actionName, msgPayload) {
    let postMsgPayload = {};
    if (msgPayload && typeof msgPayload === 'object') {
        postMsgPayload = JSON.parse(JSON.stringify(msgPayload));
    }
    postMsgPayload[ACTION_NAME_KEY] = actionName;
    exports._postMsgToPc(postMsgPayload, '*');
};
