/**
 * Network Setup View
 */

import React from "react";
import {AppState, StatusBar, View} from 'react-native';
import {
    Label,
    Button,
    Item,
    Input,
    Form,
    Picker,
    Text
} from "native-base";

import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faBarcodeRead } from '@fortawesome/pro-regular-svg-icons';
import { faTachometerAltFast} from '@fortawesome/pro-light-svg-icons';
import { faWifi } from '@fortawesome/pro-solid-svg-icons';

// Import style
import Style from '../../styles/views/network'

import Global_State from '../../constants/global';

// Import view
import AnimatedStackView from '../../styles/components/stack_view';
import NavigationButtons from '../../styles/components/navigation_buttons';
import Header from "../../styles/components/view_header";
import OsciumManager from "../../app_code/wifi/oscium/manager";

// Import wifi manager
import WifiManager from "../../app_code/wifi/wifiservices";

export default class NetworkSetupComponent extends React.Component {
    static navigationOptions = ({ navigation }) => Global_State.getInstance().viewStyleOptions(navigation);

    Global = global.state;
    Configuration = global.configuration;
    WifiManage = new WifiManager();
    Oscium = new OsciumManager();

    work_order = global.state.get('work_order');

    // Connection timer
    connection_timer;

    // Local state
    state = {
        appState: AppState.currentState,
        gateway_id: null,
        hsi_profile: null,
        hsi_profiles:[],

        gateway_model: null,
        gateway_models: [],

        wifi_details:null,

        hsi_profile_locked:false,
        wifi_network: null,
        wifi_networks: [],
        networks_list: [],
        osciumEnabled: global.oscium.isConnected(),
        testType: this.work_order.currentCertification.testType
    };

    // Constructor
    constructor(props) {
        super(props)
    }

    // Set the view up with details from the work order
    componentDidMount(){
        AppState.addEventListener('change', this.appStateChange);

        // Get the HSI profile information
        let hsiProfiles = [];
        this.work_order.hsiProfiles.forEach(function(profile, i) {
            hsiProfiles.push(
                <Picker.Item key={i} label={profile.name} value={i} />
            );
        });
        this.setState({hsi_profiles:hsiProfiles});

        // Setup the gateway models
        this.setupGatewayModels();

        // Setup the details
        if (this.work_order != null) {
            this.setState({
                gateway_id:this.work_order.currentCertification.gateway,
                hsi_profile:this.work_order.currentCertification.hsi,
                hsi_profile_locked:this.work_order.currentCertification.hsi == null
            });
        }

        // Poll the connection
        this.connection_timer = setInterval(function(_this) {
            _this.getConnection();
        }, 1000, this);

        // Get the connection
        this.getConnection();
    }

    // Remove the event listener
    componentWillUnmount() {
        AppState.removeEventListener('change', this.appStateChange);
        clearInterval(this.connection_timer); this.connection_timer = null;
    }

    // Component update
    componentDidUpdate(){
    }

    /**
     * Setup the gateway models to choose from
     */
    setupGatewayModels() {
        let gateways = [];

        let gatewayModels = global.configuration.get('waveguide_gateway_models');
        if (gatewayModels != null) {
            gatewayModels.forEach(function (gateway, i) {
                gateways.push(
                    <Picker.Item key={i} label={gateway.gateway_name} value={i}/>
                );
            });
        }

        let storedIndex = global.configuration.get('gateway_index');
        this.setState({gateway_models:gateways, gateway_model:storedIndex ? storedIndex : 0});
    }

    /**
     * Set up the gateway ID
     * @param id
     */
    setGatewayId(id) {
        this.props.navigation.state.params = null;
        this.work_order.currentCertification.gateway = id;
        this.setState({gateway_id:id});
    }

    /**
     * Set up the gateway model
     * @param model
     * @param index
     */
    setGatewayModel(index) {
          let gatewayDetails = global.configuration.get('waveguide_gateway_models');
          this.setState({gateway_model:index});
          this.props.navigation.dispatch(this.Global.resetNavigation('GatewaySetup', {gateway: gatewayDetails[index], index: index}));
    }

    /**
     * Set up the HSI profile
     * @param profile
     */
    setHSIProfile(profile) {
        this.work_order.currentCertification.hsi = profile;
        this.work_order.currentCertification.hsiProfile = this.work_order.hsiProfiles[profile];
        this.setState({hsi_profile:profile});
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
        });
    }

    /**
     * Enable the barcode scanning functionality
     */
    enableScanMode() {
        this.props.navigation.dispatch(this.Global.resetNavigation('BarcodeScan'));
    }


    render() {
        console.disableYellowBox = true;
        //const {navigate} = this.props.navigation;

        // Grab the barcode results when returning from the scanner
        const barcode = this.props.navigation.getParam('codeValue', '');
        if (barcode !== '' && (this.state.gateway_id == null || this.state.gateway_id === '')) {
            this.setState({gateway_id: barcode});
            this.work_order.currentCertification.gateway = barcode;
        }

        return (
            <AnimatedStackView>
                <View style={styles.container}>
                    <StatusBar hidden/>
                    <Header style={styles.header} label={'Certification Setup'} icon={faWifi}/>
                    <Form style={[styles.form_top, {paddingBottom: 300}]}>
                        <Item style={[styles.item, {width:'100%'}]} stackedLabel>
                            <Label style={styles.text}>Gateway Serial Number</Label>
                            <View style={{flexDirection: 'row', flex: 4, alignItems: 'flex-start'}}>
                                <View style={{flex: 4, alignItems: 'flex-start'}}>
                                    <Input underline style={[styles.input, {width:'99%', marginRight: -35}]}
                                           onChangeText={(text) => this.setGatewayId(text)}
                                           value={this.state.gateway_id}
                                    />
                                </View>
                                <View style={{flex: 2, marginLeft:30, marginTop:-40}}>
                                    <Button disabled={false} rounded style={[styles.icon_button, {marginRight:10}]}
                                            onPress={() => this.enableScanMode()}>
                                        <FontAwesomeIcon style={styles.button_icon_fa} color={'white'} size={50} icon={faBarcodeRead} />
                                    </Button>
                                </View>
                            </View>
                        </Item>
                        {!this.state.osciumEnabled &&
                            <Item style={[styles.item, {marginTop: 20}]} stackedLabel>
                                <Label style={[styles.text]}>Gateway Model</Label>
                            </Item>
                        }
                        {!this.state.osciumEnabled &&
                            <Picker
                                mode="dropdown"
                                selectedValue={this.state.gateway_model}
                                style={[styles.picker, {marginTop: -50, marginLeft: 15, backgroundColor: '#e9e9e9', height: 45, width:'90%'}]}
                                onValueChange={(itemValue) => this.setGatewayModel(itemValue)}>
                                {this.state.gateway_models}
                            </Picker>
                        }
                        <Item style={[styles.item, {marginTop: 20}]} stackedLabel>
                            <Label style={[styles.text]}>Speed Package</Label>
                        </Item>
                        <Picker
                            mode="dropdown"
                            selectedValue={this.state.hsi_profile}
                            style={[styles.picker, {marginTop: -50, marginLeft: 15, backgroundColor: '#e9e9e9', height: 45, width:'90%'}]}
                            enabled={this.state.hsi_profile_locked}
                            textStyle={this.state.hsi_profile_locked ? null : styles.input_disabled}
                            onValueChange={(itemValue) => this.setHSIProfile(itemValue)}>
                            {this.state.hsi_profiles}
                        </Picker>
                        {this.state.osciumEnabled &&
                            <View style={{flexDirection: 'row', justifyContent: 'center'}}>
                                <View style={styles.button_container}>
                                    <Button rounded
                                            style={[
                                                styles.icon_button,
                                                this.state.testType === 'speedTest' ? styles.button_selected : null
                                            ]}
                                            onPress={() => {
                                                this.setState({testType: 'speedTest'});
                                                this.work_order.currentCertification.testType = 'speedTest';
                                            }}>
                                        <FontAwesomeIcon active={true} style={styles.button_icon_fa} size={75} color={'white'} size={55} icon={faTachometerAltFast} />
                                    </Button>
                                    <Text style={{width: 100, textAlign: 'center', fontSize:16, marginTop:-50}}>{global.t.$.TITLE.SPEEDTEST}</Text>
                                </View>
                                <View style={styles.button_container}>
                                    <Button rounded
                                            style={[
                                                styles.icon_button,
                                                this.state.testType === 'signalTest' ? styles.button_selected : null
                                            ]}
                                            onPress={() => {
                                                this.setState({testType: 'signalTest'});
                                                this.work_order.currentCertification.testType = 'signalTest';
                                                this.work_order.currentCertification.network = {SSID: "null", BSSID: "null"};
                                            }}>
                                        <FontAwesomeIcon active={true} style={styles.button_icon_fa} size={75} color={'white'} size={55} icon={faWifi} />
                                    </Button>
                                    <Text style={{width: 100, textAlign: 'center', fontSize:16, marginTop:-50}}>{global.t.$.TITLE.SIGNAL_TEST}</Text>
                                </View>
                            </View>
                        }
                    </Form>
                    <NavigationButtons navigation={this.props.navigation}
                        next={{
                            label: 'Next',
                            route: this.state.gateway_id != null &&
                            this.state.gateway_id !== '' &&
                            this.state.wifi_details != null &&
                            this.state.wifi_details.getSSID() !== '' &&
                            this.state.hsi_profile != null ? 'LocationTest' : null
                        }}
                        previous={{
                            label: 'Previous',
                            route: 'Certification'
                        }}
                    />
                </View>
            </AnimatedStackView>
        )
    }
}
// Load default styles
const styles = new Style().get();