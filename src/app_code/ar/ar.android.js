/**
 * AR Manager Android
 * This returns the results of the WIFI manager
 */

import WifiManager from "../../app_code/wifi/wifiservices";

export default class AR {
    WifiManage = new WifiManager();

    /**
     * Get the SSID from the Wifi Manager
     * @param result
     */
    getSSID(result) {
        this.WifiManage.getSSID((ssid) => {
            result(ssid);
        });
    }

    /**
     * Get the BSSID from the Wifi Manager
     * @param result
     */
    getBSSID(result) {
        this.WifiManage.getBSSID((bssid) => {
            result(bssid);
        });
    }

    /**
     * Get the Frequency from the Wifi Manager
     * @param result
     */
    getFrequency(result) {
        this.WifiManage.getFrequency((freq) => {
            result(freq);
        });
    }

    /**
     * Get the Signal Strength from the Wifi Manager
     * @param result
     */
    getCurrentSignalStrength(result) {
        this.WifiManage.getSignalStrength((level) => {
            result(level);
        });
    }

    /**
     * Get the Link Speed from the Wifi Manager
     * @param result
     */
    getLinkSpeed(result) {
        this.WifiManage.getLinkSpeed((linkspeed) => {
            result(linkspeed);
        });
    }

    /**
     * Load the Wifi list from the Wifi Manager
     * @param result
     */
    loadWifiList(result) {
        this.WifiManage.loadWifiList((list) => {
            result(list);
        });
    }
}
