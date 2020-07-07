/**
 * Location test class
 * need to change test type
 */
import Result from './results';
import InterferenceDetails from '../wifi/interference/interferencedetails'

export default class Location {

    /**
     * Set up a new location
     * @param id
     * @param location
     * @param wifi
     * @param hsi // HSI profile object
     * @param params // Additional parameters required for calculation
     */
    constructor(id, location, wifi, hsi, params, band, type) {
        this._id = id;
        this._location_name = location;
        this._time = Date.now();

        this._start_timestamp = global.functions.getCurrentTimeStamp();
        this._end_timestamp = null;

        this._download = 0;
        this._upload = 0;
        this._jitter = 0;
        this._ping = 0;

        this._wifi_details = wifi;
        this._signal = (wifi !== null ? wifi.getSignal() : null);
        this._interference_details = new InterferenceDetails();
        this._channel_details = null;

        this._location_result = null;
        this._band = band;

        this._results = new Result(hsi, params, band);
        this._incomplete = true;
        this._test_type = type;
        this._signal_test24 = {SSID: "", BSSID: "", signal: "", channel: "", band: ""};
        this._signal_test5 = {SSID: "", BSSID: "", signal: "", channel: "", band: ""};

        //virtual tech heatmap items
        this._num_interfering_networks = null;
        this._link_speed = null;
        this._coordinates = {x: null, y: null, z: null};
        this._heatmap_point_type = "default";
        this._pinName = "";
    }

    /**
     * Get the id
     * @returns {*}
     */
    get id() {
        return this._id;
    }

    /**
     * Set the location
     * @param value
     */
    set location(value) {
        this._location_name = value;
    }

    /**
     * Get the location
     * @returns {*}
     */
    get location() {
        return this._location_name;
    }

    /**
     * Get the time
     * @returns {*}
     */
    get time() {
        return global.functions.formatDateToTime(new Date(this._time));
    }

    /**
     * Get the timestamp the location test started
     * @returns {string}
     */
    get startDateTime() {
        return this._start_timestamp;
    }

    /**
     * Set the end time stamp
     */
    end() {
        this._end_timestamp = global.functions.getCurrentTimeStamp();
    }

    /**
     * Get the timestamp the location test finished
     * @returns {string}
     */
    get endDateTime() {
        return this._end_timestamp;
    }

    /**
     * Set the speed result information
     * @param speedResult
     */
    setSpeedResults(speedResult) {
        this._download = speedResult.download;
        this._upload = speedResult.upload;
        this._jitter = speedResult.latency.jitter;
        this._ping = speedResult.latency.minimum;
        this._incomplete = false;
    }

    /**
     * Get the location result
     * @returns {Results._states.minor|{color, icon}|Results._states.incomplete|Results._states.failed|Results._states.ok|Results._states.excellent|Results._states.major|*}
     */
    get locationResult() {
        let downloadResult = this._results.getDownloadResult(this._download, this._incomplete);
        let uploadResult = this._results.getUploadResult(this._upload, this._incomplete);
        let pingResult = this._results.getPingResult(this._ping, this._incomplete);
        let signalResult = null;
        if(this._test_type === 'speedTest' || this._test_type === 'heatMap') {
            signalResult = this._signal !== "" ? this._results.getSignalResult(this._signal, false) : null;
        }
        else {
            let result24 = this._signal_test24.signal !== "" ? this._results.getSignalResultWithBand(this._signal_test24.signal, 'band24') : null;
            let result5 = this._signal_test5.signal !== "" ? this._results.getSignalResultWithBand(this._signal_test5.signal, 'band5') : null;
            if(result24 !== null && result5 !== null) {
                signalResult = result24.result > result5.result ? result24 : result5;
            }
            else {
                if(result24 === null && result5 !== null) {
                    signalResult = result5;
                }
                else if(result5 === null && result24 !== null) {
                    signalResult = result24;
                }
                else {
                    signalResult = null;
                }
            }
        }
        let coInterfResult = this._interference_details.coScore !== null ? this._results.getCoInterferenceResult(this._interference_details, false) : null;
        let adjInterfResult = this._interference_details.coScore !== null ? this._results.getAdjInterferenceResult(this._interference_details, false): null;

        let highestResult = downloadResult.result > uploadResult.result ? downloadResult : uploadResult;
        highestResult = highestResult.result > pingResult.result ? highestResult : pingResult;

        // Check for signal and interference and add them as a calculation
        if (signalResult !== null && !isNaN(signalResult.result)) {
            highestResult = highestResult.result > signalResult.result ? highestResult : signalResult;
        }

        if (coInterfResult !== null) {
            highestResult = highestResult.result > coInterfResult.result ? highestResult : coInterfResult;
        }

        if (adjInterfResult !== null) {
            highestResult = highestResult.result > adjInterfResult.result ? highestResult : adjInterfResult;
        }

        if (this._end_timestamp == null) this.end();

        return highestResult;
    }

    /**
     * Get download speed
     * @returns {number}
     */
    get downloadSpeed() {
        return Math.round(this._download/1000);
    }

    /**
     * Get the unformated download value
     * @returns {number}
     */
    get download() {
        return this._download;
    }

    /**
     * Get the download result
     * @returns {*}
     */
    get downloadSpeedResult() {
        return this._results.getDownloadResult(this._download, this._incomplete, global.const.DOWNLOAD_SPEED);
    }

    /**
     * Get upload speed
     * @returns {number}
     */
    get uploadSpeed() {
        return Math.round(this._upload/1000);
    }

    /**
     * Get the unformated upload value
     * @returns {number}
     */
    get upload() {
        return this._upload;
    }

    /**
     * Get the upload result
     * @returns {*}
     */
    get uploadSpeedResult() {
        return this._results.getUploadResult(this._upload, this._incomplete, global.const.UPLOAD_SPEED);
    }

    /**
     * Get jitter
     * @returns {number}
     */
    get jitter() {
        return Math.round(this._jitter);
    }

    /**
     * Get ping
     * @returns {number}
     */
    get ping() {
        return Math.round(this._ping);
    }

    /**
     * Get the latency result
     * @returns {*}
     */
    get pingResult() {
        return this._results.getPingResult(this._ping, this._incomplete, global.const.LATENCY_TIME);
    }

    /**
     * Get band
     */
    get band() {
        return this._band;
    }

    set band(value) {
        this._band = value;
    }

    /**
     * Set the signal strength at the time of testing
     * @param value
     */
    set signal(value) {
        this._signal = value;
    }
    /**
     * Get signal strength
     * @returns {number}
     */
    get signal() {
        return this._signal;
    }

    /**
     * Get the signal strength result
     * @returns {*}
     */
    get signalResult() {
        return this._results.getSignalResult(this._signal, false, global.const.SIGNAL);
    }

    /**
     * Get the co-channel interference score
     */
    get coInterferenceResult() {
        return this._results.getCoInterferenceResult(this._interference_details, false, global.const.CO_CHANNEL);
    }

    /**
     * Get the adjacent channel interference score
     */
    get adjInterferenceResult() {
        return this._results.getAdjInterferenceResult(this._interference_details, false, global.const.AJ_CHANNEL);
    }

    /**
     * Get wifi details
     * @returns {*}
     */
    get wifiDetails() {
        return this._wifi_details;
    }

    /**
     * Set the wifi details for a specific test
     */
    set wifiDetails(value) {
        this._wifi_details = value;
    }

    /**
     * Get the interference object
     */
    get interferenceDetails() {
        return this._interference_details;
    }

    /**
     * Set the interference scores within the interference details object
     */
    set interference(value) {
        this._interference_details.setInterference(value);
    }

    /**
     * Get the interference scores within the interference details object
     */
    get interference() {
        return this._interference_details.interference;
    }

    /**
     * Set the interference scores within the interference details object
     */
    setInterference(value) {
        this._interference_details.setInterference(value);
    }

    setChannelDetails(value) {
        this._channel_details = value;
    }

    get channelDetails() {
        return this._channel_details;
    }

    set signalTest24(value) {
        this._signal_test24 = value;
    }

    get signalTest24() {
        return this._signal_test24;
    }

    set signalTest5(value) {
        this._signal_test5 = value;
    }

    get signalTest5() {
        return this._signal_test5;
    }

    get signalTestResults24() {
        return this._results.getSignalResultWithBand(this._signal_test24.signal, 'band24');
    }

    get signalTestResults5() {
        return this._results.getSignalResultWithBand(this._signal_test5.signal, 'band5');
    }

    set signalTest24Signal(value) {
        this._signal_test24.signal = value;
    }

    set signalTest5Signal(value) {
        this._signal_test5.signal = value;
    }

    set testType(value) {
        this._test_type = value;
    }

    get testType() {
        return this._test_type;
    }

    set signalTest24Band(value) {
        this._signal_test24.band = value;
    }

    set signalTest5Band(value) {
        this._signal_test5.band = value;
    }

    set interferingNetworks(value) {
        this._num_interfering_networks = value;
    }

    get interferingNetworks() {
        return this._num_interfering_networks;
    }

    set linkSpeed(value) {
        this._link_speed = value;
    }

    get linkSpeed() {
        return this._link_speed;
    }

    setCoordinates(x, y, z) {
        this._coordinates = {x: x, y: y, z: z};
    }

    get coordinates() {
        return this._coordinates;
    }

    set pointType(value) {
        this._heatmap_point_type = value;
    }

    get pointType() {
        return this._heatmap_point_type;
    }

    set pinName(value) {
        this._pinName = value;
    }

    get pinName() {
        return this._pinName;
    }

    /**
     * Used for the pins for upload
     * @param timestamp
     */
    updateTimeStamps(timestamp) {
        this._start_timestamp = timestamp;
        this._end_timestamp = timestamp;
    }
}
