/**
 * Global site uploads tracking class
 */


export default class UploadTracker {
    static instance = null;

    /**
     * Create a singleton instance of the class
     * @returns {null}
     */
    static getInstance() {
        if (UploadTracker.instance == null) {
            UploadTracker.instance = new UploadTracker();
        }
        return this.instance;
    }

    constructor() {
        this._last_uploaded_map_items = [];
        this._reference_data = {};
    }

    /**
     * Get the last uploaded map items
     */
    get lastUploaded() {
        return this._last_uploaded_map_items;
    }

    /**
     * Set the last uploaded map items
     */
    set lastUploaded(value) {
        this._last_uploaded_map_items = value.slice();
    }

    /**
     * Get quick reference data from last upload
     */
    get referenceData() {
        return this._reference_data;
    }

    /**
     * Set quick reference data from latest upload
     */
    set referenceData(value) {
        this._reference_data = value;
    }

    /**
     * Checks to see if the heatmap data has been modified since the last upload
     */
    hasBeenModified() {
        if(this._last_uploaded_map_items.length !== global.tracking.allNodeData.length) {
            return true;
        }
        else if(this._last_uploaded_map_items.length === global.tracking.allNodeData.length) {
            for(let i in this._last_uploaded_map_items) {
                if(this._last_uploaded_map_items[i].data.key_value !== global.tracking.allNodeData[i].data.key_value) {
                    return true;
                }
            }
        }
        return false;
    }
}