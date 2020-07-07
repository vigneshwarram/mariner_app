/**
 * Launch the OOKLA Speed test site Android
 */

import React from "react";
import {StatusBar, Text, TextInput, View} from 'react-native';
import {
    Button
} from "native-base";

import Style from '../../styles/views/speedtest'

import ChannelDetails from '../../app_code/wifi/channel/channeldetails'

// Import the main parts of each view
import NavigationButtons from "../../styles/components/navigation_buttons";
import WebView from 'react-native-webview';

// Event Listener
import { EventRegister } from 'react-native-event-listeners';

export default class SpeedTestViewComponent extends React.Component {

    componentDidMount(){
        this.testConnectionStatus();
    }

    componentWillUnmount() {
        clearInterval(this.props.controller.connection_timer);
    }

    /**
     * Checking to see if it's the correct SSID while testing
     */
    testConnectionStatus() {
        this.props.controller.connection_timer = setInterval(function(_this) {
            _this.getConnection();
        },1000, this);
    }

    /**
     * Get the current connected network
     */
    getConnection() {
        this.props.controller.WifiManage.getConnectionDetails((result) => {
            if (result.getSSID() !== this.props.controller.state.ssid) {

                // Clear the timer and alert the user the test has failed
                clearInterval(this.props.controller.connection_timer);
                this.props.controller.Message.sendAlert("Connection lost", "Failed to complete speed test, SSID does not match", "OK");

                //gather available KPIs and go back to location test screen
                this.endTest();
            }
        });
        this.props.controller.WifiManage.internetConnection((result) => {
            if (!result) {
                // Clear the timer and alert the user the test has failed
                clearInterval(this.props.controller.connection_timer);
                this.props.controller.Message.sendAlert("Internet Connection Failed", "No internet connection found, testing signal strength and interference only", "OK");

                //gather available KPIs and go back to location test screen
                this.endTest();
            }
        });
    }


    /**
     * Receive post message from the ookla speedtest for Android
     * @param m
     */
    onMessage(m) {
        clearInterval(this.props.controller.connection_timer);
        let ooklaResult = JSON.parse(m.nativeEvent.data);
        this.props.controller.setState({testInProgress: false, messageResponse: ooklaResult, speedtestComplete: true});
        this.props.controller.work_order.currentCertification.currentLocation.setSpeedResults(ooklaResult);
        this.endTest()
    }

    /**
     * Handles the end of a test
     */
    endTest() {
        this.props.controller.WifiManage.getConnectionDetails((result) => {
            let channelDetails = new ChannelDetails();
            channelDetails.buildChannelDetails(result);
            this.props.controller.work_order.currentCertification.currentLocation.setChannelDetails(channelDetails);
        });
        this.props.navigation.dispatch(global.state.resetNavigation("LocationTest"));
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
