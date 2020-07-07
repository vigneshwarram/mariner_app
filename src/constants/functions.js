/**
 * Global function class
 */

import moment from 'moment';


let S4 = function () {
    return (((1+Math.random())*0x10000)|0).toString(16).substring(1);
};

export default class Functions {
    static instance = null;

    /**
     * Create a singleton instance of the global functions class
     * @returns {null}
     */
    static getInstance() {
        if (Functions.instance == null) {
            Functions.instance = new Functions();
        }

        return this.instance;
    }

    // Global functions
    // use by calling global.functions

    /**
     * Render content if a condition is met
     * @param condition
     * @param content
     * @returns {null|*}
     */
    renderIf(condition, content) {
        if (condition) {
            return content;
        }
        else {
            return null;
        }
    }

    /**
     * Determine the type
     * @param value
     * @returns {typeof}
     */
    isTypeOf(value) {
        if (Array.isArray(value)) return 'array';
        return value != null ? typeof value : null;
    }

    /**
     * Convert a wifi signal to a percentage
     * @param value
     * @returns {number}
     */
    convertSignalToPercent(value) {
        let currentValue = Number(value);
        if (currentValue < -92) {
            return 1;
        }
        else if (currentValue > -21) {
            return 100;
        }
        else {
            return Math.round((-0.0154 * currentValue * currentValue) - (0.3794 * currentValue) + 98.182);
        }
    }

    /**
     * Token replace
     * @param string
     * @param values []
     * @returns {*}
     */
    replace(string, values) {
        if (string != null) {
            for (let i = 0; i < values.length; i++) {
                string = string.replace(new RegExp("(\\\{" + i + "\\\})", "g"), values[i]);
            }
            return string;
        }
        return string;
    }

    /**
     * Is Null or Empty
     * @param value
     * @returns {boolean}
     */
    isNullOrEmpty(value) {
        return value == null || value === "";
    }


    /**
     * Get a date object from milliseconds
     * @param ms
     * @returns {{s: *, d: *, h: *, m: *}}
     */
    getDateFromMS(ms) {
        var d, h, m, s;
        s = Math.floor(ms / 1000);
        m = Math.floor(s / 60);
        s = s % 60;
        h = Math.floor(m / 60);
        m = m % 60;
        d = Math.floor(h / 24);
        h = h % 24;
        return { d: d, h: h, m: m, s: s };
    };

    /**
     * Format the date to a time
     * @param date
     * @returns {*}
     */
    formatDateToTime(date) {
        return moment(new Date(date)).local().format('h:mm a');

    }

    /**
     * Get a timestamp formated
     * @returns {string}
     */
    getCurrentTimeStamp() {
        return moment.utc(Date.now()).format('YYYY-MM-DDTHH:mm:ss.SSS') + "Z";
    }

    /**
     * Generate a GUID
     * @returns {string}
     */
    generateGuid() {
        return (S4() + S4() + "-" + S4() + "-4" + S4().substr(0,3) + "-" + S4() + "-" + S4() + S4() + S4()).toLowerCase();
    }

    /**
     * Capitalize the first letter of a string
     * @param string
     * @returns string
     */
    capitalizeFirstLetter(string) {
        if(string !== null && string !== '') {
            return string.charAt(0).toUpperCase() + string.slice(1);
        }
        else {
            return string;
        }
    }

    /**
     * Check to see if two strings match
     * @param a a string
     * @param b another string
     * @param caseInsensitive a boolean, case sensitive comparison or not, default false
     * @returns {boolean}
     */
    matchString(a, b, caseInsensitive) {
        if (caseInsensitive == null) caseInsensitive = false;
        return (caseInsensitive ? a.toLowerCase() == b.toLowerCase() : a==b);
    }
}
