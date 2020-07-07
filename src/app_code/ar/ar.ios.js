/**
 * AR Manager IOS
 */

import WifiManager from "../../app_code/wifi/wifiservices";
import GatewayManager from '../../app_code/wifi/gateway/gatewaymanager';
import { NativeModules, NativeEventEmitter } from 'react-native';

let WifiSSReader = NativeModules.WifiSSReader;

export default class AR {
    WifiManage = new WifiManager();
    Gateway = new GatewayManager();
    SignalStrengthMethod = global.configuration.get("signalStrengthMethod");

    /**
     * Get the SSID
     * @param result
     */
    getSSID(result) {
        this.WifiManage.getSSID((ssid) => {
            result(ssid);
        });
    }

    /**
     * Get the BSSID
     * @param result
     */
    getBSSID(result) {
        this.WifiManage.getBSSID((bssid) => {
            result(bssid);
        });
    }

    /**
     * Get the frequency
     * @param result
     */
    getFrequency(result) {
        this.WifiManage.getFrequency((freq) => {
            result(freq);
        });
    }

    /**
     * Get the current signal strength
     * @param result
     */
    getCurrentSignalStrength(result) {
        if(this.SignalStrengthMethod === "GW or OS") {
            this.Gateway.getDetails(true, (device) => {
                if (device && device.signal){
                    result(device.signal)
                }
                else if (WifiSSReader != null) {
                    WifiSSReader.getWifiSignalStrength((signalStrength) => {
                        result(signalStrength.toString());
                    });
                }
                else { result(""); }
            });
        }
        else if(this.SignalStrengthMethod === "OS") {
            if(WifiSSReader != null) {
                WifiSSReader.getWifiSignalStrength((signalStrength) => {
                    result(signalStrength.toString());
                });
            }
        }
        else if(this.SignalStrengthMethod === "GW") {
            this.Gateway.getDetails(true, (device) => {
                if (device && device.signal){
                    result(device.signal)
                }
                else { result(""); }
            });
        }
    }

    /**
     * Get the link speed
     * @param result
     */
    getLinkSpeed(result) {
        this.WifiManage.getSignalStrength((level) => {
            result(level);
        });
    }

    /**
     * Load the wifi network list
     * @param result
     */
    loadWifiList(result) {
        this.WifiManage.loadWifiList((list) => {
            result(list);
        });
    }
}
