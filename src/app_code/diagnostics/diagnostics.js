
import Log from './log';

let _diag = [];
export default class Diagnostics {

    constructor() {
        console.log = this.apply(console.log);
        //console.info = this.log(console.info);
        //console.error = this.log(console.error);
    }

    apply(consoleFunction) {
        return function () {
            const args = Array.prototype.slice.apply(arguments);
            let result = '';
            for (let i = 0; i < args.length; i++) {
                const arg = args[i];
                if (!arg || (typeof arg === 'string') || (typeof arg === 'number')) {
                    result += arg;
                } else {
                    result += JSON.stringify(arg);
                }
            }
            _diag.unshift(new Log(result));
            return consoleFunction.apply(console, arguments);
        };
    }

    get log() {
        return _diag;
    }
}
