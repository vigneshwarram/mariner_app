/**
 * Threshold class for storing and comparing threshold values
 */

export default class Threshold {

    /**
     * Set up a new threshold
     * @param min
     * @param max
     */
    constructor(min, max) {
        if (global.configuration.typeOf(min) === 'number' || global.configuration.typeOf(max) === 'number') {
            this._min = min != null ? Number(min) : Number(max);
            this._max = max != null ? Number(max) : Number(min);
        }
        else {

            console.log("Threshold not correctly set. There must be at least one number");
            this._min = 0;
            this._max = 0;
        }
    }

    /**
     * Get the min value
     * @returns {*}
     */
    get min() {
        return this._min;
    }

    /**
     * Get the max value
     * @returns {*}
     */
    get max() {
        return this._max;
    }

    /**
     * Check if value is in threshold range
     * @param value
     * @returns {boolean}
     */
    inRange(value) {
        return Number(value) >= this._min && Number(value) <= this._max;
    }

    /**
     * Check if value is in threshold range
     * @param value
     * @returns {boolean}
     */
    inReverseRange(value) {
        return Number(value) <= this._min && Number(value) >= this._max;
    }

    /**
     * Is Less than the min range
     * @returns {boolean}
     */
    isLessThan(value) {
        return Number(value) < this._min;
    }

    /**
     * Is Greater than the max range
     * @returns {boolean}
     */
    isGreaterThan(value) {
        return Number(value) > this._max;
    }
}
