/**
 * Launch the OOKLA Speed test site IOS
 */

import React from "react";
import {StatusBar, Text, TextInput, View} from 'react-native';
import {
    Button
} from "native-base";

import Style from '../../styles/views/speedtest'

// Import the main parts of each view
import NavigationButtons from "../../styles/components/navigation_buttons";
import WebView from 'react-native-webview';
import GatewayScraper from "../../app_code/wifi/gateway/scraper";
import DeviceInformation from '../../app_code/diagnostics/deviceinfo';
import InterferenceService from '../../app_code/wifi/interference/interferenceservices';
import GatewayManager from '../../app_code/wifi/gateway/gatewaymanager';
import OsciumManager from '../../app_code/wifi/oscium/manager';

// Event Listener
import { EventRegister } from 'react-native-event-listeners';

export default class SpeedTestViewComponent extends React.Component {

    Gateway = new GatewayManager();
    Oscium = new OsciumManager();
    endTestListener;
    usingOscium;

    componentDidMount(){
        if(!this.Oscium.isConnected()) {
            this.usingOscium = false;
            this.Gateway.getDetails(false, (device) => {
                if(device !== null && this.props.controller.cancelled === false) { //only proceed if the user hasn't cancelled the test
                    this.props.controller.setState({testSignal: device.signal});
                    this.Gateway.getScanDetails(device['wifi'], (channelDetails, scanResults) => {
                        this.props.controller.setState({channelDetails: channelDetails, scanResults: scanResults, scanComplete: true});
                        this.endTest(); //will only end test if speedtest is also complete
                        this.testConnectionStatus();
                    });
                }
                else { //can't get any information so don't bother trying
                    this.props.controller.setState({scanComplete: true});
                    this.endTest(); //will only end test if speedtest is also complete
                    this.testConnectionStatus();
                }
            });
        }
        else {
            this.usingOscium = true;
            if(this.props.controller.cancelled === false) {
    
                this.Oscium.getScanResults((results) => {
                    this.Oscium.getDeviceWifiInfo(results, null, (wifiInfo) => {
                        if(wifiInfo !== null) {
                            this.props.controller.work_order.currentCertification.currentLocation.signal = wifiInfo.signal;
                        }
                        this.props.controller.setState({scanComplete: true});
                        this.endTest();
                        this.testConnectionStatus();
                    });
                });
            }
            else {
                this.props.controller.setState({scanComplete: true});
                this.endTest();
                this.testConnectionStatus();
            }
        }
    }

    componentWillUnmount() {
    }

    /**
     * Checking to see if it's the correct SSID while testing
     */
    testConnectionStatus() {
        this.props.controller.isOoklaReachable((reachable) => {
            if(!reachable) { //end test if we can't reach speedtest page
                this.props.controller.setState({speedtestComplete: true}, () => {
                    
                      this.endTest();
                });
            }
        });
    }

    /**
     * handles the end of a test for IOS
     */
    endTest() {
        if(this.props.controller.cancelled === false) {//only do this if test has not been cancelled
            if(this.props.controller.state.scanComplete === true && this.props.controller.state.speedtestComplete === true) {
                if(!this.usingOscium) {
                    this.Gateway.getDetails(false, (device) => {
                        this.props.controller.assignResults(device);
                        this.props.controller.setState({testInProgress: false});
                        this.props.navigation.dispatch(global.state.resetNavigation("LocationTest"));
                    });
                }
                else {
                    this.props.controller.setState({testInProgress: false});
                    this.props.navigation.dispatch(global.state.resetNavigation("LocationTest"));
                }
            }
        }
    }

    /**
     * Receive post message from the ookla speedtest for IOS
     * @param m
     */
    onMessage(m) {
        let ooklaResult = JSON.parse(m.nativeEvent.data);
        this.props.controller.setState({messageResponse: ooklaResult, speedtestComplete: true});
        this.props.controller.work_order.currentCertification.currentLocation.setSpeedResults(ooklaResult);
        //end of test
        this.props.controller.setState({speedtestComplete: true}, () => {
            this.endTest();
        });
    }

    render() {
        console.disableYellowBox = true;
        //const {navigate} = this.props.navigation;

        if (this.props.controller.state.testInProgress) {
            return (
                <View style={styles.container}>
                    <StatusBar hidden />
                    <WebView
                        originWhitelist={['*']}
                        source={{uri: this.props.controller.state.ooklaSpeedTest}}
                        javaScriptEnabled={true}
                        onMessage={m => this.onMessage(m)}
                    />
                    <View style={{flexDirection:"row", backgroundColor:'#2F95D6', height: 40, justifyContent: 'center', alignItems: 'center', alignContent:'center'}}>
                        <Text style={{fontWeight:'bold'}}>{this.props.controller.state.ssid}</Text>
                    </View>
                    <NavigationButtons exit={{route:'LocationTest'}} navigation={this.props.navigation}/>
                </View>
            );
        }
        else {
            return (
                <View style={styles.container}>
                    <StatusBar hidden />
                    <TextInput style={styles.input} value={this.props.controller.state.ooklaSpeedTest} onChangeText={(text) => this.props.controller.setState({ooklaSpeedTest:text})}/>
                    <Button
                        onPress={() => this.props.controller.startTest()}
                        title="Start Test">
                    </Button>

                    <NavigationButtons navigation={this.props.navigation} next={{label:'Finish', route:null}} previous={{label:'Previous', route:'LocationTest'}}/>
                </View>
            );
        }
    }
}
// Load default styles
const styles = new Style().get();
