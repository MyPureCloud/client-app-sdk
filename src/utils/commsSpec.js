/* eslint-env jasmine */
import commsUtil from './comms';

export default describe('comms util', () => {
    it('should have the correct signature', function () {
        expect(typeof commsUtil.postMsgToPc).toBe('function');
    });

    it('should not work with null window/parent params', () => {
        expect(() => {
            commsUtil.postMsgToPc('message', '*', undefined, null, null, null);
        }).toThrowError();
    });

    it('should not work without a window instance', () => {
        expect(() => {
            commsUtil.postMsgToPc('message', '*', undefined, null, {}, null);
        }).toThrowError();
    });

    it('should not work outside of an iframe', () => {
        let myWindow, myParent;
        myWindow = myParent = {
            postMessage() {
                return null;
            }
        };

        expect(() => {
            commsUtil.postMsgToPc('message', '*', undefined, myWindow, myParent, null);
        }).toThrowError();
    });

    it('should require the postMessage api', () => {
        let myWindow = {};
        let myParent = {};

        expect(() => {
            commsUtil.postMsgToPc('message', '*', undefined, myWindow, myParent, null);
        }).toThrowError();
    });

    it('should use the console for errors if avaialable', () => {
        let myWindow, myParent, myConsole;
        myWindow = myParent = {};

        myConsole = {
            error() {
                return null;
            }
        };

        spyOn(myConsole, 'error');

        commsUtil.postMsgToPc('message', '*', undefined, myWindow, myParent, myConsole);

        expect(myConsole.error).toHaveBeenCalled();
    });

    it('should call postMessage when the env is right', () => {
        let myWindow, myParent;
        myWindow = {};
        myParent = {
            postMessage() {
                return null;
            }
        };

        spyOn(myParent, 'postMessage');

        commsUtil.postMsgToPc('message', '*', undefined, myWindow, myParent);

        expect(myParent.postMessage).toHaveBeenCalledWith('message', '*', undefined);
    });
});
