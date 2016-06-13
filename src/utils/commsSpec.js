let commsUtil = require('./comms');

module.exports = describe('comms util', () => {
    it('should have the correct signature', function () {
        expect(typeof commsUtil._postMsgToPc).toBe('function');
        expect(typeof commsUtil._sendMsgToPc).toBe('function');
    });

    it('should allow sending simple messages to PC', () => {
        spyOn(commsUtil, '_postMsgToPc');

        commsUtil._sendMsgToPc('mySimpleCommand');

        expect(commsUtil._postMsgToPc).toHaveBeenCalledWith({action: 'mySimpleCommand'}, '*');
    });

    it('should allow sending messages with options to PC', () => {
        spyOn(commsUtil, '_postMsgToPc');

        commsUtil._sendMsgToPc('myTestCommand', {foo: 1});

        expect(commsUtil._postMsgToPc).toHaveBeenCalledWith({action: 'myTestCommand', foo: 1}, '*');
    });

    it('should not leak internals into user space', () => {
        spyOn(commsUtil, '_postMsgToPc');

        let cmdOptions = {foo: 1};

        commsUtil._sendMsgToPc('myTestCommand', cmdOptions);

        expect(commsUtil._postMsgToPc).toHaveBeenCalledWith({action: 'myTestCommand', foo: 1}, '*');
        expect(cmdOptions.action).toBe(undefined);
    });

    it('should not work without a window instance', () => {
        expect(() => {
            commsUtil._postMsgToPc('message', '*', undefined, null, {}, null);
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
            commsUtil._postMsgToPc('message', '*', undefined, myWindow, myParent, null);
        }).toThrowError();
    });

    it('should require the postMessage api', () => {
        let myWindow, myParent;
        myWindow = myParent = {};

        expect(() => {
            commsUtil._postMsgToPc('message', '*', undefined, myWindow, myParent, null);
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

        commsUtil._postMsgToPc('message', '*', undefined, myWindow, myParent, myConsole);

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

        commsUtil._postMsgToPc('message', '*', undefined, myWindow, myParent);

        expect(myParent.postMessage).toHaveBeenCalledWith('message', '*', undefined);
    });
});
