/**
 * Configuration class
 * @type {{}}
 */

// Grab the default configuration for waveguide
import {Platform} from 'react-native';
import _default from '../../waveguide';

// Configuration object
let _config = {};

// Check for OS specific keys
let checkKey = (key) => {
    let osKey = global.functions.replace('{0}-{1}', [Platform.OS.toUpperCase(), key]);
    return _config.hasOwnProperty(osKey) ? osKey : key;
};

export default class Configuration {
    static instance = null;

    /**
     * Create a singleton instance of the class
     * @returns {null}
     */
    static getInstance() {
        if (Configuration.instance == null) {
            Configuration.instance = new Configuration();

            // Set up the defaults
            let config = _config;
            _config = Object.assign({}, config, _default.default_configuration);
        }

        return this.instance;
    }

    /**
     * Get all items
     * @returns {{}}
     */
    items() {
        return _config;
    }

    /**
     * Reset the configuration to default
     */
    reset() {
        _config = {};
        this.merge(_default.default_configuration);
    }

    /**
     * Determine the type of configuration item coming back
     * @param value
     * @returns {typeof}
     */
    typeOf(value) {
        if (Array.isArray(value)) return 'array';
        return value != null ? typeof value : null;
    }

    /**
     * Get the value of a single item
     * @param key
     * @returns {*}
     */
    get(key) {
        return _config[checkKey(key)];
    }

    /**
     * Update the value of a single item
     * @param key
     * @param value
     */
    update(key, value) {
        _config[checkKey(key)] = value;
    }

    /**
     * Set all the configuration items
     * @param object
     */
    set(object) {
        _config = object;
    }

    /**
     * Merge configurations together
     * @param object
     */
    merge(object) {
        let config = _config;
        _config = Object.assign({}, config, object);
        global.theme = this.get("theme");
    }

    /**
     * Checks for valid config
     * @param object which is the config to be checked
     * @returns boolean
     */
    isValidConfig(object) {
        const REQUIRED_KEYS = ['configVersion',
            'providerName',
            'serviceProvider',
            'wsbSiteVisitUrl'];
        if(!object) {
            return false;
        }
        for(let key in REQUIRED_KEYS) {
            if (!object.hasOwnProperty(key)) {
                console.warn('ConfigService: Missing property "' + key + "'");
                return false;
            }
        }
        return true;
    }

}
