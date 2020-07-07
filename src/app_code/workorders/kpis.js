/**
 * KPIS class object
 */

export default class KPIS {

    // Set up a new KPIS object
    constructor() {
        this._kpis = {};
    }

    /**
     * Add a KPI
     * @param key
     * @param designation
     * @param result
     * @param value
     */
    add(key, designation, result, value) {
        this._kpis[key] = {
            designation: designation,
            result: result,
            value: value
        };
    }

    /**
     * Get the KPIS Object
     * @returns {{}|*}
     */
    get() {
        return this._kpis;
    }
}