/**
 * Certification Summary
 */

export default class Summary {

    /**
     * Set up the summary results
     */
    constructor() {
        this._tested = 0;
        this._passed = 0;
        this._warning = 0;
        this._failed = 0;
    }

    /**
     * Calculate the summary
     * @param certifications
     * @returns {{tested: number, warning: number, passed: number, failed: number}}
     */
    calculate(certifications) {
        this._tested = 0;
        this._passed = 0;
        this._warning = 0;
        this._failed = 0;

        this._tested += certifications.validLocationTests;
        this._passed += certifications.passed;
        this._warning += certifications.warn;
        this._failed += certifications.failed;

        let overall = this.getOverall();

        // Pass back an object with the summary results
        return {
            tested: this._tested,
            passed: this._passed,
            warning: this._warning,
            failed: this._failed,
            overall: overall.label
        }
    }

    /**
     * Get the overall result
     * @returns {*}
     */
    getOverall() {
        let overallResult = this._passed > this._warning ? {count: this._passed, label: 'Pass'} : {count: this._warning, label: 'Warning'};
        overallResult = overallResult.count > this._failed ? overallResult : {count: this._warning, label: 'Fail'};
        return overallResult;
    }

    /**
     * Get the tested count
     * @returns {number}
     */
    get tested() {
        return this._tested;
    }

    /**
     * Get the passed count
     * @returns {number}
     */
    get passed() {
        return this._passed;
    }

    /**
     * Get the warning count
     * @returns {number}
     */
    get warning() {
        return this._warning;
    }

    /**
     * Get the failed count
     * @returns {number}
     */
    get failed() {
        return this._failed;
    }

}