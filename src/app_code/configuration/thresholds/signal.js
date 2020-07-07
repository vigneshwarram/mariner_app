/**
 * Signal Strength Thresholds
 */

// Import threshold class
import Threshold from "./threshold";

export default class SignalStrength {

    /**
     * Set up a new Signal Strength threshold
     */
    constructor() {
        this._thresholds = global.configuration.get('signalThresholds');

        this._ok = new Threshold(this._thresholds.ok.min, this._thresholds.ok.max);
        this._minor = new Threshold(this._thresholds.minor.min, this._thresholds.minor.max);
        this._major = new Threshold(this._thresholds.major.min, this._thresholds.major.max);
        this._critical = new Threshold(this._thresholds.critical.min, this._thresholds.critical.max);
    }

    /**
     * Get the threshold values
     * @returns {*}
     */
    get thresholds() {
        return this._thresholds;
    }

    /**
     * Get the ok threshold
     * @returns {Threshold}
     */
    get ok() {
        return this._ok;
    }

    /**
     * Get the minor threshold
     * @returns {Threshold}
     */
    get minor() {
        return this._minor;
    }

    /**
     * Get the major threshold
     * @returns {Threshold}
     */
    get major() {
        return this._major;
    }

    /**
     * Get the critical threshold
     * @returns {Threshold}
     */
    get critical() {
        return this._critical;
    }

    /**
     * Get the signal strength result
     * @param value
     * @returns {string}
     */
    getResult(value) {
        if (this.critical.inRange(value)) return global.const.THRESHOLD_CRITICAL;
        else if (this.major.inRange(value)) return global.const.THRESHOLD_MAJOR;
        else if (this.minor.inRange(value)) return global.const.THRESHOLD_MINOR;
        else return global.const.THRESHOLD_OK;
    }




}
