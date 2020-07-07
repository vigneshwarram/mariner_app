/*
 * this class communicates with the global oscium object to retrieve information from
 * the Oscium Wipry module
 */

import React from 'react';
import {NativeEventEmitter, NativeModules} from 'react-native';
import WifiManage from '../manager/wifimanager';

let WipryManager = NativeModules.WipryManager;
let WipryEventManager = WipryManager ? new NativeEventEmitter(WipryManager) : null;

let BSSIDsMatch = function(a, b){
    let bssids = [a, b];
    let convertedbssids = [[],[]];
    tempSegment = "";
    for(let z in bssids) {
        let i=0;
        let j=0;
        while(i<bssids[z].length-1) {
            if(bssids[z][i] === ':') {
                convertedbssids[z].push(tempSegment);
                tempSegment = "";

                j++;
            }
            else {
                tempSegment+=bssids[z][i];
            }
            i++;
        }
        i = bssids[z].length-1;
        tempSegment = "";
        let gotLastSegment = false;
        while(i>0 && !gotLastSegment) {
            if(bssids[z][i] === ":") {
                let tempSegmentReversed = "";
                for(let i=tempSegment.length-1;i>=0;i--) {
                    tempSegmentReversed += tempSegment[i];
                }
                convertedbssids[z].push(tempSegmentReversed);
                gotLastSegment = true;
            }
            else {
                tempSegment+=bssids[z][i];
                i--;
            }
        }
        tempSegment = "";
    }
    for(let i=0; i<6; i++) {
        if(parseInt(convertedbssids[0][i], 16) !== parseInt(convertedbssids[1][i], 16)) {
            return false;
        }
    }
    return true;
};

export default class OsciumManager extends React.Component {

    constructor() {
        super();
    }

    isConnected() {
        return global.oscium.isConnected();
    }

    /**
     * Isolate the information that came back for this device
     */
    getDeviceWifiInfo(results, network=null, callback) {
        let foundBSSID = false;
        if(network === null) {
            wifiManager.getSSID((SSID) => {
                wifiManager.getBSSID((BSSID) => {
                    for(let i in results) {
                        if(/*results[i][0].substring(0, results[i][0].length - 1)*/ results[i].SSID === SSID && BSSIDsMatch(results[i].BSSID, BSSID)) {
                            foundBSSID = true;
                            callback(results[i]);
                        }
                    }
                    if(!foundBSSID) {
                        callback(null);
                    }
                });
            });
        }
        else {
            let SSID = network.SSID;
            let BSSID = network.BSSID;
            for(let i in results) {
                if(results[i].SSID === SSID && BSSIDsMatch(results[i].BSSID, BSSID)) {
                    foundBSSID = true;
                    callback(results[i]);
                }
            }
            if(!foundBSSID) {
                callback(null);
            }
        }
    }

    /**
     * Get scan results and return them to the callback
     */
    getScanResults(callback) {
        let scanListener = WipryEventManager.addListener(
        'ScanComplete',
        (results) => {
            console.log("External Accessory: Finished scan");
            scanListener.remove();
            global.oscium.setLastScan(results);
            callback(results);
        });
        WipryManager.scan(() => {
            console.log("External Accessory: started scan");
        });
    }

    sortResults(results) {
        return results.sort(function (a, b) {
            return parseInt(b.signal) - parseInt(a.signal);
        });
    }
}
let wifiManager = new WifiManage();
