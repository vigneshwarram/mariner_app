/**
 * Open different settings in IOS
 */

import {Linking} from 'react-native';
export default class Settings {
    constructor() {
    }

    /**
     * Open the Wifi settings
     */
    wifi() {
        Linking.openURL("App-Prefs:root=WIFI");
    }
}