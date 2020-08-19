import commsUtil from './comms';

export default describe('comms util', () => {
    it('should have the correct signature', function () {
        expect(typeof commsUtil.postMsgToPc).toBe('function');
    });

    it('should not work with null window/parent params', () => {
        expect(() => {
            // @ts-expect-error
            commsUtil.postMsgToPc('message', '*', undefined, null, null, null);
        }).toThrowError();
    });

    it('should not work without a window instance', () => {
        expect(() => {
            // @ts-expect-error
            commsUtil.postMsgToPc('message', '*', undefined, null, {}, null);
        }).toThrowError();
    });

    it('should not work outside of an iframe', () => {
        const mockWindow = {
            postMessage() {
                return null;
            }
        } as any as Window;
        const myWindow = mockWindow, myParent = mockWindow;

        expect(() => {
            commsUtil.postMsgToPc('message', '*', undefined, myWindow, myParent, null);
        }).toThrowError();
    });

    it('should require the postMessage api', () => {
        const myWindow = {} as Window;
        const myParent = {} as Window;

        expect(() => {
            commsUtil.postMsgToPc('message', '*', undefined, myWindow, myParent, null);
        }).toThrowError();
    });

    it('should use the console for errors if avaialable', () => {
        const myWindow = {} as Window, myParent = {} as Window;
        const myConsole = {
            error() {
                return null;
            }
        } as any as Console;

        spyOn(myConsole, 'error');

        commsUtil.postMsgToPc('message', '*', undefined, myWindow, myParent, myConsole);

        expect(myConsole.error).toHaveBeenCalled();
    });

    it('should call postMessage when the env is right', () => {
        const myWindow = {} as Window;
        const myParent = {
            postMessage() {
                return null;
            }
        } as any as Window;

        spyOn(myParent, 'postMessage');

        commsUtil.postMsgToPc('message', '*', undefined, myWindow, myParent);

        expect(myParent.postMessage).toHaveBeenCalledWith('message', '*', undefined);
    });
});
