/**
 * Launch the OOKLA Speed test site
 */

import React from "react";
import SpeedTestViewComponent from './SpeedTest/SpeedTestView';

import Style from '../styles/views/speedtest'
import Global_State from '../constants/global';
import Message from '../app_code/message/service';
import WifiManager from "../app_code/wifi/wifiservices";
import GatewayScraper from "../app_code/wifi/gateway/scraper";
import DeviceInformation from '../app_code/diagnostics/deviceinfo';
import InterferenceService from '../app_code/wifi/interference/interferenceservices';
import GatewayManager from '../app_code/wifi/gateway/gatewaymanager';
import HttpService from '../app_code/http/service';

// Event Listener
import { EventRegister } from 'react-native-event-listeners';

export default class SpeedTestView extends React.Component {
    static navigationOptions = ({ navigation }) => Global_State.getInstance().viewStyleOptions(null);

    WifiManage = new WifiManager();
    Message = new Message();
    Interference = new InterferenceService();
    Http = new HttpService();

    Global = global.state;
    Configuration = global.configuration;

    work_order = global.state.get('work_order');
    connection_timer;

    cancelled = false;

    // Local state
    state = {
        ooklaSpeedTest: "",
        testInProgress: true,
        messageResponse: null,
        ssid:null,
        testSignal:null,
        channelDetails:null,
        scanResults:null,
        scanComplete:false,
        speedtestComplete:false,
    };

    constructor(props) {
        super(props);
    }

    componentDidMount(){
        let ooklaSpeedTest = global.configuration.get('ooklaSpeedTestUrl');
        if (ooklaSpeedTest != null) {
            this.setState({ooklaSpeedTest:ooklaSpeedTest});
        }
        // Check the work order for details
        if (this.work_order != null &&
            this.work_order.currentCertification != null &&
            this.work_order.currentCertification.currentLocation != null) {
            this.setState({ssid:this.work_order.currentCertification.wifiDetails.getSSID()})
        }

        //clear these in case they are still hanging around from the last test
        this.setState({testSignal: null, channelDetails: null, scanResults: null});
    }

    componentWillMount(){
    }

    // Component unmounted, clear timer function
    componentWillUnmount() {
        this.cancelled = true;
        clearInterval(this.connection_timer);
    }

    componentDidUpdate(){
    }


    /**
     * Makes assignments at the end of a test
     */
    assignResults(device) {
        console.log(">>>THE DEVICE");
        console.log(device);
        if(this.state.scanComplete === true) {
            if(device !== null) {
                this.work_order.currentCertification.currentLocation.signal = device.signal;
            }
            //if we have scan results from the gateway, calculate interference
            if(this.state.scanResults !== null && this.state.channelDetails !== null) {
                this.work_order.currentCertification.currentLocation.setChannelDetails(this.state.channelDetails);
                this.work_order.currentCertification.currentLocation.setInterference(this.Interference.calculateInterferenceSingleChannel(this.state.channelDetails, this.state.scanResults));
            }
            //clear these values so that they don't persist into the next test
            this.setState({testSignal: null, channelDetails: null, scanResults: null});
            this.props.navigation.dispatch(global.state.resetNavigation("LocationTest"));
        }
    }

    /**
     * Checks to see if Ookla is reachable
     */
    isOoklaReachable(callback) {
        this.Http.getWithTimeout(this.state.ooklaSpeedTest, this.Configuration.get("isOoklaReachableTimeout")).then((result) => {
            let reachable = result.status === 200 ? true : false;
            callback(reachable);
        }).catch((e) => {
            callback(false);
        });
    }

    render() {
        console.disableYellowBox = true;
        //const {navigate} = this.props.navigation;
        return (
            <SpeedTestViewComponent controller={this} link {...this.props}/>
        )
    }
}
// Load default styles
const styles = new Style().get();
