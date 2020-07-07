import React from "react";
import NetInfo from "@react-native-community/netinfo";
import { NetworkInfo } from 'react-native-network-info';
import WifiDetails from "../wifidetails";
import Geolocation from "@react-native-community/geolocation";
import wifi from 'react-native-android-wifi';

export default class WifiManage extends React.Component{
    constructor(props) {
        super(props);

        this.WifiDetailsObject = new WifiDetails();
    }

    getConnectionStatus(result) {
        NetInfo.isConnected.fetch().then((isConnected) => {
            //result(isConnected);
        });
        Geolocation.requestAuthorization();
        result(true);
    }

    internetConnection(result) {
        NetInfo.isConnected.fetch().then((isConnected) => {
            result(isConnected);
        });
    }

    getNetworks(success, fail) {
        success(null);
    }

    async getSSID(result) {
        NetworkInfo.getSSID(ssid => {
            result(ssid);
        });
    }
    getBSSID(result) {
        NetworkInfo.getBSSID(bssid => {
            result(bssid);
        });
    }
    getSignalStrength(result) {
        result('');
    }
    getFrequency(result) {
        result('');
    }

    getLinkSpeed(result) {
        result('');
    }

    loadWifiList(result) {
        result({});
    }

    scanNetworks(result) {
        result('');
    }

    getConnection(success) {
        this.getConnectionStatus((value) => {
            this.WifiDetailsObject.setConnection(value);
            if (value) {
                this.getSSID((value) => {
                    this.WifiDetailsObject.setSSID(value);

                    this.getBSSID((value) => {
                        this.WifiDetailsObject.setBSSID(value);

                        this.getSignalStrength((value) => {
                            this.WifiDetailsObject.setSignal(value);
                            success(this.WifiDetailsObject);
                        });
                    });
                });
            }
        });
    };

    getConnectionDetails(result) {
        this.WifiDetailsObject = new WifiDetails();
        this.getConnection(result);
    }

}
