import Configuration from "../../constants/configuration";


/**
 * Checks to see if OS/band/OS+band specific config item exists
 * @param key
 * @returns <string>
 */
let checkKeyAndBand = (key, band, object) => {
    let osBandKey = global.functions.replace('{0}-{1}{2}{3}', [Platform.OS.toUpperCase(), 'band', band, global.functions.capitalizeFirstLetter(key)]);
    let osKey = global.functions.replace('{0}-{1}', [Platform.OS.toUpperCase(), key]);
    let bandKey = global.functions.replace('{0}{1}{2}', ['band', band, global.functions.capitalizeFirstLetter(key)]);
    if(object.hasOwnProperty(osBandKey)) {
        return osBandKey;
    }
    else if(object.hasOwnProperty(osKey)) {
        return osKey;
    }
    else if(object.hasOwnProperty(bandKey)) {
        return bandKey;
    }
    else {
        return key;
    }
};

export default class Thresholds extends Configuration {
    /**
     * constructor calls configuration constructor as super
     */
    constructor() {
        super();
    }

    /**
     * Get the value of a single item
     * @param key
     * @param band
     * @returns {*}
     */
    get(key, band = '', item = null) {
        let object = item === null ? this.items() : item;
        return object[checkKeyAndBand(key, band, object)];
    }
}