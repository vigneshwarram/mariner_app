/**
 * Wifi Services Class
 */

import WifiManage from './manager/wifimanager';
//import NetInfo from "@react-native-community/netinfo";
import WifiManager from 'react-native-wifi';
import Settings from '../managers/settings/settings';

const change_listener = data => {
    //alert("Connection has changed");
};
const is_connected_listener = isConnected => {
    //alert("Connection is: " + isConnected ? "Connected" : "Disconnected");
};

export default class WifiService extends WifiManage {
    constructor() {
        super();

        this.loadEventListeners();
    }

    loadEventListeners() {
        //NetInfo.addEventListener('connectionChange', change_listener);
        //NetInfo.isConnected.addEventListener('connectionChange', is_connected_listener);
    }

    /**
     * Open the WiFi settings
     */
    openSettings() {
        new Settings().wifi();
    }

    /**
     * Connect to an SSID
     * @param ssid
     * @param password
     * @param isWep
     */
    connectToSSID(ssid, password, isWep) {
        WifiManager.connectToProtectedSSID(ssid, password, isWep)
            .then(() => {
                alert("connected");
                console.log('Connected successfully!')
            }, () => {
                alert("connection failed");
                console.log('Connection failed!')
            })
    }


}
