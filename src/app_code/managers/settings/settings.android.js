/**
 * Open different settings in Android
 */

import AndroidOpenSettings from 'react-native-android-open-settings';
export default class Settings {
    constructor() {
    }

    /**
     * Open the wifi settings
     */
    wifi() {
        AndroidOpenSettings.wifiSettings()
    }
}