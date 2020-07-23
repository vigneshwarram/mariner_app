import React from "react";
import {PermissionsAndroid} from 'react-native';
import wifi from 'react-native-android-wifi';
import WifiDetails from "../wifidetails";
import NetInfo from './wifimanager.ios';


export default class WifiManage extends React.Component{
    constructor(props) {
        super(props);

        this.WifiDetailsObject = new WifiDetails();
        this.getPermission();
    }

    async getPermission() {
        try {
            const granted = await PermissionsAndroid.request(
                PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
                {
                    'title': 'Wifi networks',
                    'message': 'Permission is required to retrieve wifi information'
                }
            )
            if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
            
            }
        }
        catch (err) {
            console.warn(err)
        }
    }

    getConnectionStatus(result) {
        wifi.connectionStatus((isConnected) => {
            result(isConnected);
        });
    }

    getNetworks(success, fail) {
        wifi.loadWifiList((wifiStringList) => {
                var wifiArray = JSON.parse(wifiStringList);
                success(wifiArray);
            },
            (error) => {
                fail(error);
            }
        );
    }

    internetConnection(result) {
        result(true);
    }

    getSSID(result) {
        wifi.getSSID((ssid) => {
            result(ssid);
        });
    }
    getBSSID(result) {
        wifi.getBSSID((bssid) => {
            result(bssid);
        });
    }
    getSignalStrength(result) {
        wifi.getCurrentSignalStrength((level) => {
            result(level);
        });
    }
    getFrequency(result) {
        wifi.getFrequency((frequency) => {
            result(frequency);
        });
    }

    getChannel(result) {
        wifi.getFrequency((frequency) => {
            let band = (frequency <= 2500 ? "2.4GHz" : "5GHz");

            let channel;
            let channels = global.configuration.get("channels");
            channels[band].forEach(function (f, index) {
                if (f.freq === frequency) {
                    channel = f;
                    channel.index = index;
                }
            });
            /*default in the case the frequency corresponds to a channel
            we don't have configured*/
            if(channel === undefined) {
                channel = {"ch": -100, "freq": -100, "width": 0, "madeUpOf": []};
            }
            result(channel);
        });
    }

    getBand(result) {
        wifi.getFrequency((frequency) => {
            let band = (frequency <= 2500 ? "2.4GHz" : "5GHz");
            result(band);
        });
    }

    getLinkSpeed(result) {
        wifi.getLinkSpeed((linkspeed) => {
            result(linkspeed);
        });
    }

    loadWifiList(result) {
        wifi.loadWifiList((list) => {
            let scannedList = JSON.parse(list.toString());
            result(scannedList);
        }, () => {result([])});
    }

    scanNetworks(result) {
        wifi.reScanAndLoadWifiList((wifiStringList) => {
            var wifiArray = JSON.parse(wifiStringList);
            result(wifiArray);
        });
    }

    getConnection(success) {
        this.getConnectionStatus((value) => {
            this.WifiDetailsObject.setConnection(value);
            if (value) {
                this.getSSID((value) => {
                    this.WifiDetailsObject.setSSID(value);
                });
                this.getFrequency((value) => {
                    this.WifiDetailsObject.setFreq(value);
                });
                this.getChannel((value) => {
                    this.WifiDetailsObject.setChannel(value);
                });
                this.getBand((value) => {
                    this.WifiDetailsObject.setBand(value);
                });
                this.getBSSID((value) => {
                    this.WifiDetailsObject.setBSSID(value);
                });
                this.getSignalStrength((value) => {
                    this.WifiDetailsObject.setSignal(value);

                    success(this.WifiDetailsObject);
                });
            }
        });
    };

    getConnectionDetails(result) {
        this.getConnection(result);
    };

}
