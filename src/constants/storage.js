/**
 * Storage class
 */

import {AsyncStorage} from 'react-native';

export default class Storage {
    static instance = null;

    /**
     * Create a singleton instance of the class
     * @returns {null}
     */
    static getInstance() {
        if (Storage.instance == null) {
            Storage.instance = new Storage();
        }
        return this.instance;
    }

    /**
     * Store data to the device
     * @param key
     * @param value
     * @param callback
     * @returns {Promise<void>}
     */
    storeData = async (key, value, callback) => {
        try {
            await AsyncStorage.setItem(key, value);
            if(callback !== null && (typeof callback === 'function')){
                callback();
            }
        } catch (e) {
            console.log('error trying to store data:');
            console.log(e);
        }
    };

    /**
     * Clear multiple items from the storage
     * @param keys
     * @param callback
     * @returns {Promise<void>}
     */
    multiClear = async (keys, callback) => {
        try {
            await AsyncStorage.multiRemove(keys);
            if(callback !== null && (typeof callback === 'function')){
                callback();
            }
        } catch (e) {
            console.log('error clear keys:');
            console.log(e);
        }
    };

    /**
     * Get data from stored data on the device
     * @param key
     * @param callback
     * @returns {Promise<void>}
     */
    getData = async (key, callback) => {
        try {
            const value = await AsyncStorage.getItem(key);
            if(callback !== null && (typeof callback === 'function')) {
                callback(value);
            }
            else {
                return value;
            }
        } catch(e) {
            console.log('could not retrieve data, exiting function with error:');
            console.log(e)
        }
    };
}
