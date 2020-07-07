/**
 * Work order management service
 */
import Workorder from './workorder';

// Work order management list
let _workorders = [];

export default class WorkorderService {

    constructor() {
    }

    /**
     * Clear all work orders
     */
    clear() {
        _workorders = [];
    }

    /**
     * Number of work orders that are active
     * @returns {number}
     */
    get count() {
        return _workorders.length;
    }

    /**
     * Number of work orders that are active that should be displayed
     * @returns {number}
     */
    get displayCount() {
        let count = 0;
        for(i=0;i<_workorders.length - 1;i++){
            if(_workorders[i].displayWhenActive) {
                count++;
            }
        }
        return count;
    }

    /**
     * Get all the work orders currently in memory
     * @returns {Array}
     */
    get list() {
        return _workorders;
    }

    /**
     * Add new work order to the management list
     * @param id
     * @param siteType
     * @param customer
     */
    new(id, siteType, customer) {
        let found = false;
        for (let i=0;i<_workorders.length;i++) {
            if (_workorders[i].id === id) {
                found = true;
            }
        }

        if (!found) {
            _workorders.unshift({
                id: id,
                details: new Workorder(id, siteType, customer)
            })
        }
    }

    /**
     * Remove work order
     * @param id
     */
    remove(id) {
        for (let i=0;i<_workorders.length;i++) {
            if (_workorders[i].id === id) {
                _workorders.splice(i, 1);
            }
        }
    }

    /**
     * Get a work order by id from the management list
     * @param id
     */
    get(id) {
        for (let i=0;i<_workorders.length;i++) {
            if (_workorders[i].id === id) {
                return _workorders[i].details;
            }
        }
        return null;
    }
}