/**
 * Template for making the views
 * Rename the class and add it to the boot/main.js to access through navigation
 */

// Import Components
import React from "react";
import {
    StatusBar,
    View,
    ActivityIndicator,
    Button,
    Text
} from 'react-native';
import {
    Label
} from "native-base";
import Icon from 'react-native-vector-icons/FontAwesome';

// Font Awesome 5
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faShieldCheck } from '@fortawesome/pro-regular-svg-icons';

// Default style sheet
import Style from '../styles/views/default'

// Global state for navigation options
import Global_State from '../constants/global';

// Import the main parts of each view
import AnimatedStackView from '../styles/components/stack_view';
import NavigationButtons from "../styles/components/navigation_buttons";
import Header from "../styles/components/view_header";
import Splash from "../styles/components/splash";
import OsciumManager from "../app_code/wifi/oscium/manager";
import Results from "../app_code/certifications/results";
import Thresholds from "../app_code/certifications/thresholds";

export default class AlternateSpeedtestView extends React.Component {
    static navigationOptions = ({ navigation }) => Global_State.getInstance().viewStyleOptions(navigation);

    // Global state
    Global = global.state;

    // Global configuration
    Configuration = global.configuration;

    // Oscium manager
    Oscium = new OsciumManager();

    // work order
    work_order = global.state.get("work_order");

    Thresholds = new Thresholds();

    testParams = {
        signalThresholds: this.Thresholds.get('signalThresholds'),
        coInterferenceScoreThresholds: this.Thresholds.get('coInterferenceScoreThresholds'),
        adjInterferenceScoreThresholds: this.Thresholds.get('adjInterferenceScoreThresholds')
    };

    Results = new Results(null, this.testParams);

    testCancelled = false;

    // Local state
    state = {
        osciumConnected: global.oscium.isConnected()
    };

    // Constructor
    constructor(props) {
        super(props);
    }

    // View mounted and ready
    componentDidMount(){
        if(this.state.osciumConnected) {
            this.Oscium.getScanResults((results) => {
                if(this.testCancelled === false) {
                    let cert = this.work_order.currentCertification;
                    cert.currentLocation.signalTest24Signal = "";
                    cert.currentLocation.signalTest24Band = "2.4GHz";
                    let band24Info = cert.currentLocation.signalTest24;
                    cert.currentLocation.signalTest5Signal = "";
                    cert.currentLocation.signalTest5Band = "5GHz";
                    let band5Info = cert.currentLocation.signalTest5;
                    this.Oscium.getDeviceWifiInfo(results, band24Info, (band24Result) => {
                        this.Oscium.getDeviceWifiInfo(results, band5Info, (band5Result) => {
                            if(band24Info !== null && band24Result !== null && this.work_order.currentCertification.currentLocation.signalTest24 !== null) {
                                this.work_order.currentCertification.currentLocation.signalTest24Signal = band24Result.signal;
                            }
                            if(band5Info !== null && band5Result !== null && this.work_order.currentCertification.currentLocation.signalTest5 !== null) {
                                this.work_order.currentCertification.currentLocation.signalTest5Signal = band5Result.signal;
                            }
                            //get the other band details here
                            this.props.navigation.dispatch(global.state.resetNavigation("LocationTest"));
                            //add other assignments here
                        });
                    });
                }
                else {
                    this.props.navigation.dispatch(global.state.resetNavigation("LocationTest"));
                }
            });
        }
        else {
            this.props.navigation.dispatch(global.state.resetNavigation("LocationTest"));
        }
    }

    // View about to unmount
    componentWillUnmount() {
    }

    // View has been updated
    componentDidUpdate(){
    }

    cancelTest = () => {
        this.testCancelled = true;
        this.work_order.currentCertification.currentLocation.signalTest24 = {signal: "", SSID: "", BSSID: "", channel: ""};
        this.work_order.currentCertification.currentLocation.signalTest5 = {signal: "", SSID: "", BSSID: "", channel: ""};
        this.props.navigation.dispatch(global.state.resetNavigation("LocationTest"));
    }

    // Render view components
    render() {
        console.disableYellowBox = true;
        //const {navigate} = this.props.navigation;

        return (
            <AnimatedStackView>
                <Splash/>
                <View style={styles.container}>
                    <StatusBar hidden />
                    <Header style={styles.header} label={'Gathering KPIs'} icon={faShieldCheck}/>
                    <View style={{flex: 1, flexDirection: 'column', marginTop: -200, justifyContent: 'center', alignItems: 'center'}}>
                        <View style={{flex: 1, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', alignSelf: 'center', marginTop: -450}}>
                            <Label style={{flex: 1, alignSelf: 'center', alignItems: 'center'}}>            Gathering KPIs, please wait...</Label>
                        </View>
                        <ActivityIndicator style={{marginTop: -500}} size="large" color="white" />
                    </View>
                </View>
                <NavigationButtons navigation={this.props.navigation} back={{label: 'Cancel', route: this.cancelTest}}/>
            </AnimatedStackView>
        );
    }
}
// Load default styles
const styles = new Style().get();