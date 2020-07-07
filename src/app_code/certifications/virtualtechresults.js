/**
 * Certification Summary
 */

export default class VirtualTechResults {

    /**
     * Set up the summary results
     */
    constructor() {
        this._good_coverage = false;
        this._num_pods_needed = 0;
    }

    get coverage() {
        return this._good_coverage;
    }

    get numPodsNeeded() {
        return this._num_pods_needed;
    }

    setCoverage(certification) {
        let critical = 0;
        let major = 0;
        let minor = 0;
        let excellent = 0;
        let vt_coverage_thresholds = global.configuration.get("coverageThresholds")
        let maxMajors = vt_coverage_thresholds.major;
        let maxCriticals = vt_coverage_thresholds.critical;
        let tests = certification.locationTests;

        for(let i=0; i<tests.length;i++) {
            if(tests[i].signalResult.designation === 'critical') {
                critical++;
            }
            if(tests[i].signalResult.designation === 'major') {
                major++;
            }
            if(tests[i].signalResult.designation === 'minor') {
                minor++;
            }
            if(tests[i].signalResult.designation === 'excellent') {
                excellent++;
            }
        }
        if((critical + major) <= maxMajors && critical <= maxCriticals) {
            this._good_coverage = true;
        }
    }

    setNumberOfPodsNeeded(certification) {
        //will later calculate number of pods needed to get proper coverage if the coverage is not sufficient
        this._num_pods_needed = 1;
    }

}