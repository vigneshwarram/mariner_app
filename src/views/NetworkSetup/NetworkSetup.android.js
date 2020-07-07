/**
 * Network Setup View
 */

import React from "react";
import {AppState, StatusBar, Text, View} from 'react-native';
import {
    Label,
    Button,
    Item,
    Input,
    Form,
    Picker,
    Card,
    CardItem,
    Body
} from "native-base";
import Icon from 'react-native-vector-icons/FontAwesome';

import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faBarcodeRead, faWifi } from '@fortawesome/pro-regular-svg-icons';

import Style from '../../styles/views/network'

import Global_State from '../../constants/global';

import AnimatedStackView from '../../styles/components/stack_view';
import NavigationButtons from '../../styles/components/navigation_buttons';
import Header from "../../styles/components/view_header";

import WifiManager from "../../app_code/wifi/wifiservices";

export default class NetworkSetupComponent extends React.Component {
    static navigationOptions = ({ navigation }) => Global_State.getInstance().viewStyleOptions(navigation);

    Global = global.state;
    Configuration = global.configuration;
    WifiManage = new WifiManager();

    work_order = global.state.get('work_order');

    // Local state
    state = {
        appState: AppState.currentState,
        gateway_id: null,
        hsi_profile: null,
        hsi_profiles:[],
        wifi_details:null,

        hsi_profile_locked:false
    };

    constructor(props) {
        super(props)
    }

    // Set the view up with details from the work order
    componentDidMount(){
        AppState.addEventListener('change', this.appStateChange);

        let hsiProfiles = [];
        this.work_order.hsiProfiles.forEach(function(profile, i) {
            hsiProfiles.push(
                <Picker.Item key={i} label={profile.name} value={i} />
            );
        });
        this.setState({hsi_profiles:hsiProfiles});

        if (this.work_order != null) {
            this.setState({
                gateway_id:this.work_order.currentCertification.gateway,
                hsi_profile:this.work_order.currentCertification.hsi,
                hsi_profile_locked:this.work_order.currentCertification.hsi == null
            });
        }

        this.getConnection();
    }

    componentWillMount(){
    }

    // Remove the event listener
    componentWillUnmount() {
        AppState.removeEventListener('change', this.appStateChange);
    }

    componentDidUpdate(){
        this.getConnection();
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
        const signal = this.state.wifi_details != null ? this.state.wifi_details.getSignal() : 0;

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
                        <Item style={styles.item} underline stackedLabel>
                            <Label style={styles.text}>Gateway Serial Number</Label>
                            <View style={{flexDirection: 'row', flex: 4, alignItems: 'stretch'}}>
                                <View style={{flex: 3, alignItems: 'stretch'}}>
                                    <Input underline style={[styles.input, {marginRight: -50}]}
                                           onChangeText={(text) => this.setGatewayId(text)}
                                           value={this.state.gateway_id}
                                    />
                                </View>
                                <View style={{flex: 1, marginRight: -60}}>
                                    <Button rounded style={[styles.circle_button, {
                                        marginTop: -15,
                                        marginLeft: 10,
                                        marginRight: 0
                                    }]}
                                            onPress={() => this.enableScanMode()}>
                                        <Text style={styles.button_text_round}>Scan</Text>
                                    </Button>
                                </View>
                            </View>
                        </Item>
                        <Item style={[styles.item, {marginTop: 20}]} stackedLabel>
                            <Label style={[styles.text]}>Speed Package</Label>
                        </Item>
                        <Picker
                            mode="dropdown"
                            selectedValue={this.state.hsi_profile}
                            style={[styles.picker, {marginTop: -50, backgroundColor: '#e9e9e9', width:'95%', height: 45}]}
                            enabled={this.state.hsi_profile_locked}
                            textStyle={this.state.hsi_profile_locked ? null : styles.input_disabled}
                            onValueChange={(itemValue) => this.setHSIProfile(itemValue)}>
                            {this.state.hsi_profiles}
                        </Picker>
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
                                       }}/>
                </View>
            </AnimatedStackView>
        )
    }
}
// Load default styles
const styles = new Style().get();