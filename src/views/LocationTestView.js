/**
 * Location Testing View
 */

import React from "react";
import LocationTestComponent from './LocationTest/LocationTest'

import {AppState, View, Text} from 'react-native';
import {
    Picker
} from "native-base";

// Class imports
import Global_State from '../constants/global';
import WifiManager from "../app_code/wifi/wifiservices";
import Message from '../app_code/message/service';

import GatewayManager from '../app_code/wifi/gateway/gatewaymanager';
import Results from '../app_code/certifications/results';
import Thresholds from "../app_code/certifications/thresholds";
import OsciumManager from "../app_code/wifi/oscium/manager";

export default class LocationTestView extends React.Component {
    static navigationOptions = ({ navigation }) => Global_State.getInstance().viewStyleOptions(navigation);

    Global = global.state;
    Configuration = global.configuration;
    WifiManage = new WifiManager();
    Gateway = new GatewayManager();
    Results = null;
    Thresholds = new Thresholds();
    Oscium = new OsciumManager();

    // Get the work order information
    work_order = global.state.get('work_order');

    // Timer for checking for the device details
    gateway_timer;
    connection_timer;

    // Local state
    state = {
        appState: AppState.currentState,
        finish: {label:'Finish', route:null},
        site_type:null,
        location_tests:[],
        selected_location:null,
        locations:[],
        wifi_details:null,
        currentCertification:null,
        update_list:false,
        hideLocationTestSpeeds: false,
        device: {
            signal: ""
        },
        signal_result: {
            color: '#239b56'
        },
        wifi_network24: null,
        wifi_network5: null,
        wifi_networks: {band24: [], band5: []},
        networks_list: {band24: [], band5: []},
        osciumEnabled: global.oscium.isConnected(),
        testType: this.work_order.currentCertification.testType
    };

    /**
     * Setup the databinding
     * @param props
     */
    constructor(props) {
        super(props);
        //this.ds = new ListView.DataSource({ rowHasChanged: (r1, r2) => r1 !== r2 });

        this.Results = new Results(null, {signalThresholds: this.Configuration.get('signalThresholds')});
    }

    // Set the state of the view based on an open work order details
    componentDidMount(){
        AppState.addEventListener('change', this.appStateChange);

        if (this.work_order != null) {
            this.setState({currentCertification:this.work_order.currentCertification});

            let workorderLocation = null;
            let selectNextLocation = false;
            if (this.work_order.currentCertification.location != null) {
                workorderLocation = this.work_order.currentCertification.location;
            }


            // Load the locations
            let locations = [];
            this.work_order.locations.forEach(function (location, i) {
                if (selectNextLocation) {selectNextLocation = false; workorderLocation = location;}
                else if (workorderLocation != null && location === workorderLocation) selectNextLocation = true;

                locations.push(
                    <Picker.Item key={i} label={location} value={location}/>
                )
            });
            if (workorderLocation!= null) {
                this.setState({selected_location: workorderLocation});
                this.work_order.currentCertification.location = workorderLocation;
            }
            else if (this.work_order.locations != null && this.work_order.locations.length > 0) {
                this.setState({selected_location: this.work_order.locations[0]});
            }
            this.setState({locations: locations});

            // Get the latest location test results
            let location_tests = this.getCorrectLocationTests(this.state.testType, this.work_order.currentCertification.locationTests);
            this.setState({location_tests: location_tests});
            this.setState({wifi_details: this.work_order.currentCertification.wifiDetails});
            this.setState({site_type: this.work_order.siteType});

            // Check the location test count
            if (this.work_order.currentCertification.finished) {
                this.setState({finish: {label: 'Finish', route: 'Home'}});
            }

            let hideLocationTestSpeeds = global.configuration.get('hideLocationTestSpeeds');
            if (hideLocationTestSpeeds != null) {
                this.setState({hideLocationTestSpeeds:hideLocationTestSpeeds});
            }

            if(this.work_order.currentCertification.testType === 'signalTest') {
                let latestResults = global.oscium.getLastScan();
                let latestSelectedNetworks = global.oscium.getSelectedNetworks();
                let formattedResults = {band24: [], band5:[]};
                let listLength = {band24: 0, band5: 0};
                let sortedResults = (latestResults.length > 0 ? this.Oscium.sortResults(latestResults) : []);
                let tempResults = {band24: [], band5: []};
                for(let i in sortedResults) {
                    band = (sortedResults[i].channel > 35 ? "5GHz" : "2.4GHz");
                    let key = (band === "2.4GHz" ? 'band24' : 'band5');
                    formattedResults[key].push(
                        <Picker.Item key={listLength[key]} label={<Text>{sortedResults[i].SSID} ({sortedResults[i].signal} dBm){"\n"}{sortedResults[i].BSSID}</Text>} value={listLength[key]}/>
                    );
                    tempResults[key].push(sortedResults[i]);
                    if(latestSelectedNetworks[key] !== null) {
                        if(sortedResults[i].SSID === latestSelectedNetworks[key].SSID && sortedResults[i].BSSID === latestSelectedNetworks[key].BSSID) {
                            if(key === "band24") {
                                this.setState({wifi_network24: listLength[key]});
                            }
                            else {
                                this.setState({wifi_network5: listLength[key]});
                            }
                        }
                    }
                    listLength[key]++;
                }
                this.setState({wifi_networks: formattedResults, networks_list: tempResults});
                if(this.state.osciumEnabled) {
                    this.setupWifiDropdown();
                }
            }

            if(Platform.OS === "ios") { //this only applies for iOS
                // Update the device object on an interval (any shorter and it doesn't update consistently
                this.gateway_timer = setInterval(function(_this) {
                    _this.getGatewayDetails();
                }, 20000, this);
                this.getGatewayDetails();
            }
            //else {
                //create the devices object based on Android wifi details or modify code to
                //use the ones in wifi_details later when it is actually needed
            //}

            // Check the connection details
            this.connection_timer = setInterval(function(_this) {
                _this.getConnection();
            }, 10000, this);
        }
    }

    componentWillMount(){
    }

    // Component will unmount
    componentWillUnmount() {
        AppState.removeEventListener('change', this.appStateChange);
        clearInterval(this.gateway_timer); clearInterval(this.connection_timer);
        this.gateway_timer = null; this.connection_timer = null;
    }

    componentDidUpdate(){
    }

    /**
     * Gets the correct location tests based on the test type selected
     */
    getCorrectLocationTests(type, location_tests) {
        let locationTests = [];
        for(let i in location_tests) {
            if(location_tests[i].testType === type) {
                locationTests.push(location_tests[i]);
            }
        }
        return locationTests
    }

    /**
    * Does a scan and sets up the wifi dropdown menu
    */
    setupWifiDropdown() {
       let formattedResults = {band24: [], band5:[]};
       let networkList = {band24: [], band5: []};
       let band = "";
       let latestSelectedNetworks = global.oscium.getSelectedNetworks();
       this.Oscium.getScanResults((initialResults) => {
           let results = this.Oscium.sortResults(initialResults);
           let listLength = {band24: 0, band5: 0};
           results.forEach((result, i) => {
               if(result.SSID !== "") {
                   band = (result.channel > 35 ? "5GHz" : "2.4GHz");
                   let key = (band === "2.4GHz" ? 'band24' : 'band5');
                   formattedResults[key].push(
                       <Picker.Item key={listLength[key]} label={<Text>{result.SSID} ({result.signal} dBm){"\n"}{result.BSSID}</Text>} value={listLength[key]}/>
                   );
                   networkList[key].push(result);
                   //check and assign correct list item here
                   if(latestSelectedNetworks[key] !== null) {
                       if(result.SSID === latestSelectedNetworks[key].SSID && result.BSSID === latestSelectedNetworks[key].BSSID) {
                           if(key === "band24") {
                               this.setState({wifi_network24: listLength[key]});
                           }
                           else {
                               this.setState({wifi_network5: listLength[key]});
                           }
                       }
                   }
                   listLength[key]++;
               }
           });
           this.setState({wifi_networks: formattedResults, networks_list: networkList});
           global.oscium.setLastScan(networkList);
       });
    }

    setWifiNetwork(band, itemValue) {
       if(band === 'band24') {
           this.setState({wifi_network24:itemValue});
           global.oscium.setSelectedNetworks('band24', this.state.networks_list.band24[itemValue]);
       }
       else {
           this.setState({wifi_network5:itemValue});
           global.oscium.setSelectedNetworks('band5', this.state.networks_list.band5[itemValue]);
       }
    }

    /**
     * Get the latest gateway details if the connection can be established
     */
    getGatewayDetails() {
        if(!this.Oscium.isConnected()) {
            this.Gateway.getDetails(true, (device) => {
                if(device !== null) {
                    this.setState({device: device});
                    if (this.state.selected_location != null) {
                       //determine band, pass into getSignalResult
                       this.setState({signal_result: this.Results.getSignalResultWithBand(device.signal, device.wifi === "Wi-Fi 2.4G" ? 'band24' : 'band5', true)});
                    }
                }
            });
        }
        else {
            if(this.work_order.currentCertification.testType === "speedTest") {
                this.Oscium.getScanResults((results) => {
                    this.Oscium.getDeviceWifiInfo(results, null, (wifiInfo) => {
                        if(wifiInfo !== null) {
                            this.setState({device: {signal: wifiInfo.signal.toString()}});
                        }
                        else {
                            this.setState({device: {signal: ""}});
                        }
                    });

                });
            }
            else {
                this.setupWifiDropdown();
            }
        }
    }

    /**
     * Set the test location for the speed test
     * @param location
     */
    setTestLocation(location) {
        this.setState({selected_location:location});
        this.work_order.currentCertification.location = location;
    }

    /**
     * Delete a location test row
     * @param secId
     * @param rowId
     * @param rowMap
     */
    deleteRow(secId, rowId, rowMap) {
        this.setState({update_list:true});
        const updateLocations = [...this.state.location_tests];
        let removeId = -1;
        for (let i=0;i< updateLocations.length;i++) {
            if (updateLocations[i].id === rowId) {
                removeId = i;
            }
        }

        if (removeId > -1) updateLocations.splice(removeId, 1);
        this.setState({ location_tests: updateLocations });

        this.work_order.currentCertification.locationTests = updateLocations;
        setTimeout(function(_this) {
            _this.setState({update_list:false});

            // Check to make sure that there are still the correct amount of valid tests
            _this.setState({finish: {label: 'Finish', route: _this.work_order.currentCertification.finished ? 'Home' : null}});
        }, 50, this);
    }

    /**
     * Add a location test entry and begin a speed test
     */
    runSpeedTest() {
        clearInterval(this.gateway_timer);
        let band = ''
        if(this.state.device !== null) {
            band = this.state.device['wifi'] == "Wi-Fi 2.4G" ? 'band24' : 'band5';
        }
        let speedTestParams = {
            latencyTimeThresholds: this.Thresholds.get('latencyTimeThresholds', band),
            signalThresholds: this.Thresholds.get('signalThresholds', band),
            coInterferenceScoreThresholds: this.Thresholds.get('coInterferenceScoreThresholds', band),
            adjInterferenceScoreThresholds: this.Thresholds.get('adjInterferenceScoreThresholds', band)
        };
        this.work_order.currentCertification.addLocationTest(this.state.selected_location, speedTestParams, (typeof this.state.networks_list.band24[this.state.wifi_network24] !== 'undefined' ? this.state.networks_list.band24[this.state.wifi_network24] : null), (typeof this.state.networks_list.band5[this.state.wifi_network5] !== 'undefined' ? this.state.networks_list.band5[this.state.wifi_network5] : null));
        let all_locations = this.work_order.currentCertification.locationTests;
        this.setState({location_tests: all_locations});
        if(this.work_order.currentCertification.testType === 'speedTest') {
            this.props.navigation.dispatch(global.state.resetNavigation("SpeedTest"));
        }
        else {
            this.props.navigation.dispatch(global.state.resetNavigation("AlternateSpeedtest"));
        }
    }

    /**
     * Open location test details
     * @param id
     */
    openDetailView(id) {
        let locationTest = this.work_order.currentCertification.getLocationTest(id);

        // Navigate to the location test details with location details
        if (locationTest != null) {
            this.props.navigation.dispatch(
                global.state.resetNavigation(
                    "LocationTestDetail",
                    {location: locationTest}
                ));
        }
    }

    /**
     * If the application comes back from the background
     * @param nextAppState
     */
    appStateChange = (nextAppState) => {
        if (this.state.appState.match(/inactive|background/) && nextAppState === 'active') {
            this.getConnection();
        }
        this.setState({appState: nextAppState});
    }

    /**
     * Get the current connected network
     */
    getConnection() {
        this.WifiManage.getConnectionDetails((result) => {
            this.setState({wifi_details: result});
            this.work_order.currentCertification.wifiDetails = result;
            if(Platform.OS === "android") {//Android will return the signal in the wifi details so we will assign it here
                this.setState({signal_result: this.Results.getSignalResult(result.getSignal(), false)}); // don't have band yet but should add it in later
            }
        });
    }

    /**
     * Open the external wifi settings screen
     */
    openWifiSettings() {
        new Message().sendAlertWithOption("Change Connection", "Would you like to open the Wi-Fi settings of your device and change networks?", "Continue", () => {
            this.WifiManage.openSettings()
        }, "Cancel");
    }

    render() {
        console.disableYellowBox = true;
        return (
            <LocationTestComponent controller={this} link {...this.props}/>
        );
    }
}
