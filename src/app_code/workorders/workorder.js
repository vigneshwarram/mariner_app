/**
 * Work order class
 */
import Certification from '../certifications/certification';
import Summary from '../certifications/summary';

export default class Workorder {

    /**
     * Setup a new work order
     * @param id
     * @param type - site type
     * @param customer
     */
    constructor(id, type, customer) {
        this._id_track = 0;

        this._id = id;
        this._time = Date.now();
        this._start_timestamp = global.functions.getCurrentTimeStamp();
        this._end_timestamp = null;
        this._certifications = [];

        this._site_type = type;
        this._customer_id = customer;

        this._locations = global.configuration.get('locations') != null ? global.configuration.get('locations') : [];
        this._hsi_profiles = global.configuration.get('hsiProfiles') != null ? global.configuration.get('hsiProfiles') : [];

        this._current_certification = null;
        this._summaryInformation = new Summary();
        this._display_when_active = true;
    }

    /**
     * Calculate the certification summaries
     * @returns {{tested: number, warning: number, passed: number, failed: number}}
     */
    calculateSummary() {
        return this._summaryInformation.calculate(this._current_certification);
    }

    /**
     * Get the work order ID
     * @returns {*}
     */
    get id() {
        return this._id;
    }

    /**
     * Get the timestamp the work order started
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
     * Get the timestamp the work order finished
     * @returns {string}
     */
    get endDateTime() {
        return this._end_timestamp;
    }

    /**
     * Get the customer id
     * @returns {*}
     */
    get customer() {
        return this._customer_id;
    }

    /**
     * Get the site type
     * @returns {*}
     */
    get siteType() {
        return this._site_type;
    }

    /**
     * Set the site type
     * @param value
     */
    set siteType(value) {
        this._site_type = value;
    }

    /**
     * Get the current certification being worked on in the work order
     * @returns {null}
     */
    get currentCertification() {
        return this._current_certification;
    }

    /**
     * Set the current certification being worked on in the work order
     * @param value
     */
    set currentCertification(value) {
        this._current_certification = value;
    }

    /**
     * Get all the locations in the work order
     * @returns {Array}
     */
    get locations() {
        return this._locations;
    }

    /**
     * Get all the HSI profiles in the work order
     * @returns {Array}
     */
    get hsiProfiles() {
        return this._hsi_profiles;
    }

    /**
     * Add a new certification to the work order
     */
    addCertification(type) {
        this._id_track++;

        this.clearRecommended();

        // Deselect all certifications
        this.deselectCertifications();

        let certification = new Certification(this._id_track, type, this._site_type);
        this._certifications.unshift(certification);
        this.currentCertification = certification;

        return certification;
    }

    /**
     * Deselect all certifications
     */
    deselectCertifications() {
        for (let i=0;i<this._certifications.length;i++) {
            this._certifications[i].selected = false;
        }
    }

    /**
     * Open a created certification
     * @param id
     * @returns {boolean}
     */
    openCertification(id) {

        // Deselect all certifications
        this.deselectCertifications();

        // Select the certification by ID
        for (let i=0;i<this._certifications.length;i++) {
            if (this._certifications[i].id === id) {
                this._certifications[i].selected = true;
                this.currentCertification = this._certifications[i];
                return this._certifications[i];
            }
        }

        // Certification was not found, reselect the current one
        this.currentCertification.selected = true;
        return null;
    }

    /**
     * Clear the recommended channels
     */
    clearRecommended() {
        this._certifications.forEach(function (certification) {
            certification.recommended = false;
        });
    }

    /**
     * Set a new list of certifications
     * @param certification
     */
    set certifications(certification) {
        this._certifications = certification;
    }

    /**
     * Get all certifications
     * @returns {Array}
     */
    get certifications() {
        return this._certifications;
    }

    /**
     * Set whether or not this should be displayed as an active work order when it's active/open
     * (to be accessed from the side menu)
     * @param {boolean}
     */
    set displayWhenActive(value) {
        this._display_when_active = value;
    }

    /**
     * Get whether or not to display the order when it's active/open
     * @returns {boolean}
     */
    get displayWhenActive() {
        return this._display_when_active;
    }
}