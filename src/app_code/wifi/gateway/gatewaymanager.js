/**
 * Gateway manager class for collecting data for the View components
 */

import GatewayScraper from './scraper';
import DeviceInformation from '../../diagnostics/deviceinfo';
import Message from '../../message/service';

export default class GatewayManager {

    // Constructor for gateway and device information
    constructor() {
    }

    /**
     * Only authenticate in preparation to load a page or get scan results
     */
    authenticate(callback) {
        let timeout;
        GatewayScrapper.connectToServer((response) => {
            if(response.status === 200 && response.responseURL !== undefined && response.responseURL.includes("at_a_glance.php")) {
                clearTimeout(timeout);timeout=null;
                timeout = setTimeout(function() {
                    callback(true);
                }, 100);
            }
            else {
                message.showToastMessage(global.t.get$('TEXT.GATEWAY_FAIL_UNKNOWN'), 'danger');
                callback(false);
            }
        });
    }

    /**
     * Get the latest gateway details if the connection can be established
     * @param callback
     */
    getDetails(silent, callback) {
        let timeout;
        GatewayScrapper.connectToServer((response) => {
            if(response.status === 200 && response.responseURL !== undefined && response.responseURL.includes("at_a_glance.php")) {
                clearTimeout(timeout);timeout = null;
                timeout = setTimeout(function() {
                      GatewayScrapper.loadDetails(silent).then((deviceList) => {
                          Device.ipAddress().then((ipAddress) => {
                              GatewayScrapper.getDeviceByIp(ipAddress).then((deviceDetails) => {
                                  callback(deviceDetails);
                              }).catch(() => {
                                  callback(null);
                              });
                          }).catch(() => {
                              callback(null);
                          });
                      }).catch(() => {
                          callback(null);
                      });
                }, 100, this);
            }
            else {
                console.log("Could not authenticate with the gateway");
                if(!silent) {
                    message.showToastMessage(global.t.get$('TEXT.GATEWAY_FAIL_UNKNOWN'), 'danger');
                }
                callback(null);
            }
        });
    }

    getScanDetails(band, callback) {
        GatewayScrapper.loadChannelDetails(band).then((channelDetails) => {
            GatewayScrapper.loadSpectrumAnalysis(band, (scanResults) => {
                callback(channelDetails, scanResults);
            });
        }).catch((e) => {
            //send back nulls if there is an error with any of the above
            console.log("Error getting scan details: " + e);
            callback(null, null);
        });
    }
}

// Get the GatewayScrapper and Device Classes
const GatewayScrapper = new GatewayScraper();
const Device = new DeviceInformation();
const message = new Message();

