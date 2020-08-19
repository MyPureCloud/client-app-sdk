export default {
    /**
     * Posts the provided msg to the specified origin and parent window when invoked within the
     * expected environment (e.g. a frame hosted within Genesys Cloud).
     *
     * @param msg - The payload to send as a postMessage
     * @param tgtOrigin - The destination origin (see postMessage)
     * @param transfer - Transferable objects (see postMessage)
     * @param myWindow - The current execution window. Default window
     * @param myParent - The parent window to which the message should be posted. Default parent
     * @param myConsole - logs errors here rather than throwing errors. Default console
     *
     * @throws Error if the environment is invalid (e.g. not a browser, no postMessage api,
     *  not running within an iframe) and myConsole is not specified
     */
    postMsgToPc(msg: any, tgtOrigin: string, transfer?: Transferable[], myWindow: Window = window, myParent = window.parent, myConsole: Console | null = window.console) {
        const validRuntime = !!(myWindow && typeof myWindow === 'object' && myParent && typeof myParent === 'object');
        const validEnv = (validRuntime && myParent !== myWindow);
        const validApi = !!(myParent && typeof myParent.postMessage === 'function');

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
    }
};
