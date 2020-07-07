/**
 * XB6 Gateway page scraper
 * This takes a gateway page and looks for key elements on it.
 * @type {(function(*=, *=, *=, *=): (*|*|*|*|*))|*}
 */

import Base64 from '../../http/base64';
import HttpService from '../../http/service';
import Message from '../../message/service';
import ChannelDetails from '../channel/channeldetails';

const cheerio = require('cheerio');

let connected_devices = [];

// Get the Ip Address using a regular expression
let getIpAddress = function(htmlString) {
    let regEx = /\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}/;
    return getMatch(regEx, htmlString);
};

// Get the Mac Address using a regular expression
let getMacAddress = function(htmlString) {
    let regEx = /([0-9A-Fa-f]{2}[:-]){5}([0-9A-Fa-f]{2})/;
    return getMatch(regEx, htmlString);
};

// Get the RSSI Level using a regular expression
let getSignalStrength = function(htmlString) {
    let regEx = /-\d*/;
    return getMatch(regEx, htmlString);
};

// Get a regular expression match
let getMatch = function(regex, htmlString) {
    let match = htmlString.match(regex);
    return match != null ? match[0] : "";
};

let formatScanResults = function(response) {
    let results = {};
    results['2.4GHz'] = [];
    results['5GHz'] = [];
    for(let i in response.data) {
        if(parseInt(response.data[i].Channel) >= 36) {
            results['5GHz'].push({
                SSID: response.data[i].SSID,
                BSSID: response.data[i].BSSID,
                SignalStrength: parseInt(response.data[i].SignalStrength),
                channel: parseInt(response.data[i].Channel),
                channelWidth: 20
            });
        }
        else {
            results['2.4GHz'].push({
                SSID: response.data[i].SSID,
                BSSID: response.data[i].BSSID,
                SignalStrength: parseInt(response.data[i].SignalStrength),
                channel: parseInt(response.data[i].Channel),
                channelWidth: 20
            });
        }
    }
    return results;
};

export default class GatewayScraper {
    constructor() {

        // Just a blank object to send if no devices match an ip
        this.blank_device = {
            ip: "",
            mac: "",
            type: "",
            signal: "",
            wifi: ""
        }
    }

    /**
     * Connect to the gateway admin page to log in
     * @param callback
     */
    connectToServer(callback) {
        let url = global.functions.replace("http://{0}/check.php",
            [global.configuration.get("waveguide_gateway_ip")]);


        let http = new HttpService();

        let header = {
            "Authorization": "Basic " + Base64.btoa(global.configuration.get("waveguide_gateway_username") + ":" + global.configuration.get("waveguide_gateway_password"))
        };
        let body = {
            username:global.configuration.get("waveguide_gateway_username"),
            password:global.configuration.get("waveguide_gateway_password")
        };

        // Post to the admin page
        http.postIt(url, header, body, (response) => {
            callback(response);
        });
    }

    /**
     * Load the detailed information from the gateway page
     * @returns {Promise<Array>}
     */
    async loadDetails(silent) {
        let url = global.functions.replace("http://{0}/connected_devices_computers.php",
            [global.configuration.get("waveguide_gateway_ip")]);

        connected_devices = [];

        let http = new HttpService();

        let headers = new Headers({
            "Authorization": "Basic " + Base64.btoa(global.configuration.get("waveguide_gateway_username") + ":" + global.configuration.get("waveguide_gateway_password"))
        })

        return (await http.getWithHeaders(url, 20000, headers).then((response) => response.text()).then((htmlString) => {
            const $ = cheerio.load(htmlString);

            let device = cheerio.load($('#online-private').html());

            device('tr').each(function() {
                let device_details = cheerio.load(device(this).html());

                let details = {};
                device_details('td').each(function(i) {
                    if (device_details(this).text() !== "null") {
                        switch (i) {
                            case 0: {
                                details['ip'] = getIpAddress(device_details(this).text());
                                details['mac'] = getMacAddress(device_details(this).text());
                                break;
                            }
                            case 1: {
                                details['type'] = device_details(this).html();
                                break;
                            }
                            case 2: {
                                details['signal'] = getSignalStrength(device_details(this).html());
                                break;
                            }
                            case 3: {
                                details['wifi'] = device_details(this).html();
                                break;
                            }
                        }
                    }
                });
                if (Object.keys(details).length !== 0) {
                    connected_devices.push({
                        raw: device(this).html(),
                        details: details
                    })
                }
            });
            return connected_devices;
        }).catch((e) => {
            console.log("Could not retrieve device details: " + e);
            if(!silent) {
                message.showToastMessage(global.t.get$('TEXT.GATEWAY_NO_DEVICE_INFO'), 'danger');
            }
            return [];
        }));
    }

    /**
     * Load the results of the spectrum analysis from the gateway
     * @param band
     * @param callback
     */
    loadSpectrumAnalysis(band, callback) {
        let url = global.functions.replace("http://{0}/actionHandler/ajax_wifi_spectrum_analyser.php",
            [global.configuration.get("waveguide_gateway_ip")]);

        let http = new HttpService();
        let scanResults = {};
        http.getWithTimeout(url, 10000).then((initialResponse) => initialResponse.json()).then((response) => {
            if(response !== null && response.status === 'success') {
                scanResults = formatScanResults(response);
                callback(scanResults);
            }
            else if(response !== null && response.status === 'In progress') {
                setTimeout(function() {
                    http.getWithTimeout(url, 10000).then((initialResponse) => initialResponse.json()).then((response) => {
                        if(response !== null && response.status === 'success') {
                            scanResults = formatScanResults(response);
                            callback(scanResults);
                        }
                        else {
                            callback(null);
                        }
                    }).catch((e) => {console.log("error")});
                }, global.configuration.get("scanInProgressTimeout"));
            }
            else {
                callback(null);
            }
        }).catch((e) => {
            console.log("Could not load spectrum analysis: " + e);
            message.showToastMessage(global.t.get$('TEXT.GATEWAY_NO_SCAN_RESULTS'), 'danger');
            callback(null);
        });
    }

    /**
     * Gets the detailed channel information configured for the gateway
     * @param band
     * @returns {Promise<object>}
     */
    async loadChannelDetails(band) {
        let bandID;
        if(band === 'Wi-Fi 2.4G') {
            bandID = "id=1";
        }
        else if(band === 'Wi-Fi 5G') {
            bandID = "id=2";
        }
        else {
            //if we don't have the band we can't get channel details
            return null;
        }

        let url = global.functions.replace("http://{0}/wireless_network_configuration_edit.php?{1}",
            [global.configuration.get("waveguide_gateway_ip"), bandID]);

        let http = new HttpService();

        return (await http.getWithTimeout(url, 20000).then((response) => response.text()).then((htmlString) => {
            const $ = cheerio.load(htmlString);
            let channelDiv = cheerio.load($('#div_channel_number').html());

            let channelDetails = new ChannelDetails();
            channelDiv('option').each(function(i, element) {
                let channel_details = cheerio.load(channelDiv(this).html());
                if(element.attribs.hasOwnProperty("selected") && element.attribs.hasOwnProperty("value")) {
                    channelDetails.channel = parseInt(channel_details(this).html());
                }
            });

            let widthDiv = cheerio.load($('#bandwidth_switch').html());
            widthDiv('input').each(function(b, elem) {
                //we actually want the last checked value because of the way the page is set up

                if(elem.attribs.hasOwnProperty("checked")) {
                    channelDetails.channelWidth = elem.attribs['value'];
                }
            });

            if(channelDetails.channelWidth === "20MHz") {
                channelDetails.channelWidthInt = 20;
            }
            else if(channelDetails.channelWidth === "40MHz") {
                channelDetails.channelWidthInt = 40;
            }
            else if(channelDetails.channelWidth === "80MHz") {
                channelDetails.channelWidthInt = 80;
            }
            else if(channelDetails.channelWidth === "160MHz") {
                channelDetails.channelWidthInt = 160;
            }
            else {
                channelDetails.channelWidthInt = 20;
            }

            let channels = global.configuration.get("channels");
            let work_order = global.state.get('work_order');

            if(channelDetails.channel >= 36) {
                for(let i in channels['5GHz']) {
                    if(channelDetails.channelWidthInt === channels['5GHz'][i].width && channels['5GHz'][i].madeUpOf.includes(channelDetails.channel)) {
                        channelDetails.centerChannel = channels['5GHz'][i].ch;

                        work_order.currentCertification.wifiDetails.setChannel(channels['5GHz'][i]);
                    }
                }
                work_order.currentCertification.wifiDetails.setBand('5GHz');
                channelDetails.band = global.t.get$("WIFI.BAND_5GHZ");
            }
            else {
                for(let i in channels['2.4GHz']) {
                    if (channelDetails.channel == channels['2.4GHz'][i].ch) {
                        work_order.currentCertification.wifiDetails.setChannel(channels['2.4GHz'][i]);
                    }
                }
                channelDetails.centerChannel = channelDetails.channel;
                work_order.currentCertification.wifiDetails.setBand('2.4GHz');
                channelDetails.band = global.t.get$("WIFI.BAND_24GHZ");
            }
            return channelDetails;
        }).catch((e) => {
            console.log("Problem getting channel details: " + e);
            message.showToastMessage(global.t.get$('TEXT.GATEWAY_NO_CHANNEL_DETAILS'), 'danger');
            return null;
        }));
    }

    /**
     * Get the device object back using the ip address
     * @param ipAddress
     */
    async getDeviceByIp(ipAddress) {
        if (connected_devices.length > 0) {
            for (let i=0;i<connected_devices.length;i++) {
                if (connected_devices[i].details.ip.trim() === ipAddress.trim()) {
                    if(connected_devices[i].details.signal === '') {
                        message.showToastMessage(global.t.get$('TEXT.GATEWAY_NO_SIGNAL_STRENGTH'), 'danger');
                    }
                    return connected_devices[i].details;
                }
            }
            console.log("Could not get device info (device wasn't in list)");
            message.showToastMessage(global.t.get$('TEXT.GATEWAY_NO_DEVICE_INFO'), 'danger');
            return this.blank_device;
        }
        console.log("Could not get device info (list was empty)");
        message.showToastMessage(global.t.get$('TEXT.GATEWAY_NO_DEVICE_INFO'), 'danger');
        return this.blank_device;
    }

    /**
     * Parse text information from an HTML object
     * @param html
     * @param el
     * @returns {Array}
     */
    parseTextFromHtml(html, el) {
        let rawHtml = cheerio.load(html);
        let objectDetails = [];
        rawHtml(el).each(function(i, elem) {
            objectDetails.push(rawHtml(this).text());
        });
        return objectDetails;
    }

    /**
     * Parse HTML from an HTML object
     * @param html
     * @param el
     * @returns {Array}
     */
    parseHtmlFromHtml(html, el) {
        let rawHtml = cheerio.load(html);
        let objectDetails = [];
        rawHtml(el).each(function(i, elem) {
            objectDetails.push(rawHtml(this).html());
        });
        return objectDetails;
    }
}

const message = new Message();
