export default class Log {
    constructor(message) {
        this._id = Date.now();
        this._message = message;
        this._timestamp = new Date().toLocaleString();

        //let datetime = global.functions.getDateFromMS(Date.now());
        //this._timestamp = global.functions.replace("{0} {1}:{2}:{3}", [datetime.d, datetime.h, datetime.m, datetime.s]);
    }

    get id() {
        return this._id;
    }

    get message() {
        return this._message;
    }

    get timeStamp() {
        return this._timestamp;
    }
}