import Thresholds from "./thresholds";

/**
 * Results calculation class
 */
export default class Results {

    /**
     * Set up the results
     * @param hsi
     * @param params // Additional parameter object
     */
    constructor(hsi, params, band = '') {
       this.Thresholds = new Thresholds();
       this._states = {
           excellent: {icon:'check-circle', color:'#238e22', result:0, label: 'Excellent', result_code:'Pass', designation: 'ok'},
           ok: {icon:'check-circle', color:'#258f25', result:1, label: 'Excellent', result_code:'Pass', designation: 'ok'},
           minor: {icon:'check-circle', color:'#238f4b', result:2, label: 'Good', result_code:'Pass', designation: 'minor'},
           major: {icon:'exclamation-circle', color:'#8f8d05', result:3, label: 'Fair', result_code:'Warning', designation: 'major'},
           failed: {icon:'times-circle', color:'#8f3014', result:4, label: 'Poor', result_code:'Fail', designation: 'critical'},
           incomplete: {icon:'times-circle', color:'#000000', result:-1, label: 'Incomplete', result_code:'Incomplete', designation: 'incomplete'},
           info_excellent: {icon:'info-circle', color:'#959ca3', result:10, label: 'Excellent', result_code:'Info-Pass', designation: 'ok'},
           info_ok: {icon:'info-circle', color:'#959ca3', result:11, label: 'Excellent', result_code:'Info-Pass', designation: 'ok'},
           info_minor: {icon:'info-circle', color:'#959ca3', result:12, label: 'Good', result_code:'Info-Pass', designation: 'minor'},
           info_major: {icon:'info-circle', color:'#959ca3', result:13, label: 'Fair', result_code:'Info-Warning', designation: 'major'},
           info_failed: {icon:'info-circle', color:'#959ca3', result:14, label: 'Poor', result_code:'Info-Fail', designation: 'critical'},
           info_incomplete: {icon:'info-circle', color:'#959ca3', result:-11, label: 'Incomplete', result_code:'Info-Incomplete', designation: 'incomplete'}
       };
       this._hsi_profile = hsi;
       this._param_object = params;
       this._band = band;
       this.excludeList = global.configuration.typeOf(global.configuration.get('exclude')) === "array" ? global.configuration.get('exclude') : null;
       this.excludeEnabled = global.configuration.typeOf( global.configuration.get('excludeEnabled')) === "boolean" ? global.configuration.get('excludeEnabled') : false;
    }

    /**
     * Convert a result type to an icon and colour
     * @param value
     * @param profile
     * @param incomplete
     * @param excludeType
     * @param trend // Calculate excellent if the values exceed the max ok
     * @returns {Results._states.minor|{color, icon}|Results._states.incomplete|{color, icon}|Results._states.failed|{color, icon}|Results._states.ok|{color, icon}|Results._states.excellent|{color, icon}|Results._states.major|{color, icon}}
     */
    getResult(value, profile, incomplete, excludeType, trend = true) {
        if (incomplete) {
            return this.isExcluded(excludeType) ? this._states.info_incomplete : this._states.incomplete;
        }

        if (trend && value > profile.ok.max) {
            return this.isExcluded(excludeType) ? this._states.info_excellent : this._states.excellent;
        }
        if (!trend && value < profile.ok.min) {
            return this.isExcluded(excludeType) ? this._states.info_excellent : this._states.excellent;
        }

        // Check the threshold ranges
        if (this.inRange(value, profile.ok.min, profile.ok.max)) {
            return this.isExcluded(excludeType) ? this._states.info_ok : this._states.ok;
        }
        else if (this.inRange(value, profile.minor.min, profile.minor.max)) {
            return this.isExcluded(excludeType) ? this._states.info_minor : this._states.minor;
        }
        else if (this.inRange(value, profile.major.min, profile.major.max)) {
            return this.isExcluded(excludeType) ? this._states.info_major : this._states.major;
        }
        else {
            return this.isExcluded(excludeType) ? this._states.info_failed : this._states.failed;
        }
    }

    /**
    * Checks to see if a given result should be excluded (info only)
    * @param excludeType
    */

    isExcluded(excludeType) {
         return (this.excludeEnabled && this.excludeList &&  this.excludeList.includes(excludeType));
    }

    /**
     * Check to see if the value is within the configured range
     * @param value
     * @param min
     * @param max
     * @returns {boolean}
     */
    inRange(value, min, max) {
        if (min > max) {
            console.log("Threshold value range is invalid and may cause issues during calculations")
        }

        if (value >= min && value <= max) {
            return true;
        }
        return false;
    }

    /**
     * Get the download result based on the configured thresholds
     * @param download
     * @param incomplete
     * @returns {Results._states.minor|{color, icon}|Results._states.incomplete|Results._states.failed|Results._states.ok|Results._states.excellent|Results._states.major}
     */
    getDownloadResult(download, incomplete, excludeType) {
        let result = this.getResult(download, this.Thresholds.get("downloadSpeedThresholds", this._band, this._hsi_profile), incomplete, excludeType);
        return result;
    }

    /**
     * Get the upload result based on the configured thresholds
     * @param upload
     * @param incomplete
     * @returns {Results._states.minor|{color, icon}|Results._states.incomplete|Results._states.failed|Results._states.ok|Results._states.excellent|Results._states.major}
     */
    getUploadResult(upload, incomplete, excludeType) {
    let result = this.getResult(upload, this.Thresholds.get("uploadSpeedThresholds", this._band, this._hsi_profile), incomplete, excludeType);
        return result;
    }

    /**
     * Get the latency result based on the configured thresholds
     * @param ping
     * @param incomplete
     * @returns {Results._states.minor|{color, icon}|Results._states.incomplete|Results._states.failed|Results._states.ok|Results._states.excellent|Results._states.major}
     */
    getPingResult(ping, incomplete, excludeType) {
        let result = this.getResult(ping, this._param_object.latencyTimeThresholds, incomplete, excludeType, false);
        return result;
    }

    /**
     *
     * @param signal
     * @param incomplete
     * @param include
     * @returns {Results._states.minor|{color, icon}|Results._states.incomplete|Results._states.failed|Results._states.ok|Results._states.excellent|Results._states.major}
     */
    getSignalResult(signal, incomplete, excludeType) {
        let result = this.getResult(signal, this._param_object.signalThresholds, incomplete, excludeType, true);
        return result;
    }

    /**
     * Gets banded signal result in cases where we need to pass in the band on-the-fly
     * @param signal
     * @param band
     * @param excludeType
     * @returns {Results._states.minor|{color, icon}|Results._states.incomplete|Results._states.failed|Results._states.ok|Results._states.excellent|Results._states.major}
     */
    getSignalResultWithBand(signal, band, excludeType) {
        let signalThresholds = this.Thresholds.get('signalThresholds', band);
        let result = this.getResult(signal, signalThresholds, ((signal !== "" && signal !== null) ? false : true), excludeType, true);
        return result;
    }

    /**
     * Get the co-channel interference rating based on the score
     */
    getCoInterferenceResult(interference, incomplete, excludeType) {
        let result = this.getResult(interference.coScore, this._param_object.coInterferenceScoreThresholds, incomplete, excludeType, false);
        return result;
    }

    /**
     * Get the adjacent channel interference rating based on the score
     */
    getAdjInterferenceResult(interference, incomplete, excludeType) {
        let result = this.getResult(interference.adjScore, this._param_object.adjInterferenceScoreThresholds, incomplete, excludeType, false);
        return result;
    }
}