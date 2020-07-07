/**
 * Certification class
 */
import Location from './location';
import VirtualTechResults from './virtualtechresults';

export default class Certification {

    /**
     * Set up a new Certification
     * @param id
     * @param type
     * @param required
     */
    constructor(id, type, required) {
        this._id_track = 0;

        this._id = id;
        this._time = Date.now();
        this._start_timestamp = global.functions.getCurrentTimeStamp();
        this._end_timestamp = null;


        this._tested = 0;
        this._passed = 0;
        this._type = type;

        this._required_count = required;
        this._result = null;
        this._recommended = true;
        this._selected = true;

        this._gateway_id = null;
        this._hsi_profile = null;
        this._hsi_profile_object = null;
        this._location = null;

        this._location_tests = [];
        this._current_location = null;
        this._wifi_details = null;
        this._test_type = 'speedTest';

        this._reason_code = null;
        this._reviewed = false;
        this._notes = "";
        this._summary_viewed = false;

        this._test_group = global.functions.generateGuid();
        this._installed_location = null;

        //for vt heatmap certifications
        this._vt_results = new VirtualTechResults();

        this._finished = false;
    }

    /**
     * Get the group id for this certification
     * @returns {string}
     */
    get groupId() {
        return this._test_group;
    }

    /**
     * Get the ID
     * @returns {*}
     */
    get id() {
        return this._id;
    }

    /**
     * Get the time the certification was set up
     * @returns {*}
     */
    get time() {
        return global.functions.formatDateToTime(new Date(this._time));
    }

    /**
     * Get the timestamp the certification started
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
     * Get the timestamp the certification finished
     * @returns {string}
     */
    get endDateTime() {
        return this._end_timestamp;
    }

    /**
     * Get the certification test type
     * @returns {*}
     */
    get type() {
        return this._type;
    }

    get typeIcon() {
        return this._type === "MESH" ? 1 : 0;
    }

    /**
     * Get the number of location tests
     * @returns {number}
     */
    get tested() {
        return this._location_tests.length;
    }

    /**
     * Get the count of passed tests
     * @returns {number}
     */
    get passed() {
        return this.getTestedResult(-1,2);
    }

    /**
     * Get the results of the different severity tests
     * @param min
     * @param max
     * @returns {number}
     */
    getTestedResult(min, max) {
        let value = 0;
        for(let i=0;i<this._location_tests.length;i++) {
            let result = this._location_tests[i].locationResult.result;
            if (result > min && result < max) {
                value++;
            }
        }
        return value;
    }

    /**
     * Get the count of warning tests
     * @returns {number}
     */
    get warn() {
        return this.getTestedResult(1,4);
    }

    /**
     * Get the count of failed tests
     * @returns {number}
     */
    get failed() {
        return this.getTestedResult(3,5);
    }

    /**
     * Get the results
     * @returns {null}
     */
    get result() {
        return this._result;
    }

    /**
     * Get the recommended location
     * @returns {boolean}
     */
    get recommended() {
        return this._recommended;
    }

    /**
     * Set the recommended location
     * @param value
     */
    set recommended(value) {
        this._recommended = value;
    }

    /**
     * Get selected
     * @returns {boolean}
     */
    get selected() {
        return this._selected;
    }

    /**
     * Set selected
     * @param value
     */
    set selected(value) {
        this._selected = value;
    }

    /**
     * Get the gateway ID
     * @returns {null}
     */
    get gateway() {
        return this._gateway_id;
    }

    /**
     * Set the gateway ID
     * @param value
     */
    set gateway(value) {
        this._gateway_id = value;
    }

    /**
     * Get the HSI profile
     * @returns {null}
     */
    get hsi() {
        return this._hsi_profile;
    }

    /**
     * Set the HSI profile
     * @param value
     */
    set hsi(value) {
        this._hsi_profile = value;
    }

    /**
     * Set the HSI profile object
     * @param value
     */
    set hsiProfile(value) {
        this._hsi_profile_object = value;
    }

    /**
     * Get the HSI profile object
     * @returns {null}
     */
    get hsiProfile() {
        return this._hsi_profile_object;
    }

    /**
     * Get the location
     * @returns {null}
     */
    get location() {
        return this._location;
    }

    /**
     * Set the location
     * @param value
     */
    set location(value) {
        this._location = value;
    }

    /**
     * Get if the certification is finished
     * @returns {boolean}
     */
    get finished() {
        this.validLocationTests;
        return this._finished;
    }

    /**
     * Add a new location test
     * @param location
     * @param params // Additional parameters required to calculate result
     */
    addLocationTest(location, params, band24Info, band5Info) {
        this._id_track++;
        this._location = location;
        this._current_location = new Location(this._id_track, location, this._wifi_details, this._hsi_profile_object, params, null, this._test_type);
        if(this._test_type === 'signalTest'){
            if(band24Info !== null) {
                this._current_location.signalTest24 = band24Info;
            }
            if(band5Info !== null) {
                this._current_location.signalTest5 = band5Info;
            }
        }
        this._location_tests.unshift(this._current_location);
    }

    /**
     * Get a location test by ID
     * @param id
     * @returns {*}
     */
    getLocationTest(id) {
        for(let i=0;i<this._location_tests.length;i++) {
            if (this._location_tests[i].id === id) {
                return this._location_tests[i];
            }
        }
    }

    /**
     * Get only the valid tests returned
     * @returns {number}
     */
    get validLocationTests() {
        let count = 0;
        for (let i=0;i<this._location_tests.length;i++) {
            if (this._location_tests[i].locationResult.result > -1 || (this._test_type === 'heatMap')) {
                count++;
            }
        }

        // Check and see if the amount of valid tests fulfil the required amount
        if (this._location_tests.length >= this._required_count) {
            this._finished = true;
            this.end();
        }
        else {
            this._finished = false;
        }

        return count;
    }

    /**
     * Get all location tests
     * @returns {Array}
     */
    get locationTests() {
        return this._location_tests;
    }

    /**
     * Set the location tests
     * @param value
     */
    set locationTests(value) {
        this._location_tests = value;
    }

    /**
     * Get the current location
     * @returns {null}
     */
    get currentLocation() {
        return this._current_location;
    }

    /**
     * Get the wifi details associated to this certification
     * @returns {null}
     */
    get wifiDetails() {
        return this._wifi_details;
    }

    /**
     * Set the wifi details
     * @param value
     */
    set wifiDetails(value) {
        this._wifi_details = value;
    }

    /**
     * Get the SSID chosen by the user to test
     */
    get testType() {
        return this._test_type;
    }

    /**
     * Set the SSID chosen by the user to test
     */
    set testType(value) {
        this._test_type = value;
    }

    /**
     * Get the overall result for location
     * @returns {null}
     */
    get results() {
        this._passed = 0;
        let lastResult = {icon:'minus-circle', color:'#000000', result:-2};
        if(this._location_tests.length >= this._required_count) {
            if(this.validLocationTests >= this._required_count) {
                for(let i=0;i<this._location_tests.length;i++) {
                    let result = this._location_tests[i].locationResult.result;
                    if (result > -1 && result < 4) {
                        this._passed++;
                    }
                    if (result > lastResult.result) {
                        lastResult = this._location_tests[i].locationResult;
                    }
                }
            }
            else {
                lastResult = {icon: 'times-circle', color:'#000000', result: -1};
            }
        }
        return lastResult;
    }

    /**
     * Set a reason code for this certification
     * @param value
     */
    set reasonCode(value) {
        this._reason_code = value;
    }

    /**
     * Get the reason code for this certification
     * @returns {null}
     */
    get reasonCode() {
        return this._reason_code;
    }

    /**
     * Set the review state of this certification
     * @param value
     */
    set reviewed(value) {
        this._reviewed = value;
    }

    /**
     * Get if the certification has been reviewed
     * @returns {boolean}
     */
    get reviewed() {
        return this._reviewed;
    }

    /**
     * Set the certification notes
     * @param value
     */
    set notes(value) {
        this._notes = value;
    }


    /**
     * Get the certification notes
     * @returns {string}
     */
    get notes() {
        return this._notes;
    }

    /**
     * Set if the summary was completed
     * @param value
     */
    set summaryViewed(value) {
        this._summary_viewed = value;
    }

    /**
     * Check to see if the summary has been completed
     * @returns {boolean}
     */
    get summaryViewed() {
        return this._summary_viewed;
    }

    /**
     * Set the installed location of the gateway
     * @param {String}
     */
    set installedLocation(value) {
        this._installed_location = value;
    }

    /**
     * Get the installed location of the gateway
     * @return {String}
     */
    get installedLocation() {
        return this._installed_location;
    }

    setVirtualTechResults() {
        if(!this._vt_results.setCoverage(this)) {
            this._vt_results.setNumberOfPodsNeeded(this);
        }
    }

    get coverage() {
        return this._vt_results.coverage;
    }
}