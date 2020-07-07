/**
 * Applications Home Screen
 */

import React from "react";
import {TouchableWithoutFeedback, Keyboard, Text, View, StatusBar} from 'react-native';
import {
    Button,
    Form,
    Input,
    Item,
    Label,
    Picker
} from "native-base";

// Font Awesome 5
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faShieldCheck, faPoll, faBallotCheck, faHeadVr } from '@fortawesome/pro-regular-svg-icons';
import { faHomeLg } from '@fortawesome/pro-solid-svg-icons';
import { faTools } from '@fortawesome/pro-light-svg-icons';

import Style from '../styles/views/home';

// Default components
import AnimatedStackView from '../styles/components/stack_view';
import Header from '../styles/components/view_header';
import NavigationButtons from "../styles/components/navigation_buttons";

import WifiManager from '../app_code/wifi/wifiservices';
import SiteVisit from '../app_code/workorders/sitevisit';

import Message from '../app_code/message/service';
import Global_State from "../constants/global";
import HttpService from "../app_code/http/service";
import Register from "../app_code/registration/register";
import Workflows from '../app_code/workflows/workflows';

import base64 from 'react-native-base64'


//import CustomModule from 'react-native-custom-module';

export default class HomeView extends React.Component {
    static navigationOptions = ({ navigation }) => Global_State.getInstance().viewStyleOptions(navigation);

    WifiManage = new WifiManager();
    Http = new HttpService();
    Workflows = new Workflows();
    Configuration = global.configuration;
    Register = new Register();
    Global = global.state;
    Message = new Message();

    // User selected information
    userSelection = {
        work_order_id: null,
        customer_id: null,
        site_type: null
    };

    // Get the current work order information
    work_order = global.state ? global.state.get('work_order') : null;
    workOrderInput;

    // Local state
    state = {
        showSearch: false,

        work_order_id: null,
        customer_id: null,
        site_type: null,
        site_types:[],
        summary_enabled:false,

        working: false,
        wo_disabled: true,
        options_disabled: true,
        wifidetails: null,
        tech_id: null
    };

    constructor(){
        super();

        /*console.log("MOUNTED");
        CustomModule.networkDetails((error, data) => {
            //console.log(data);
            if (error) {
                alert("Error");
            }
            else {
                alert(data);
                //alert("Loaded");
            }
        });*/


    }

    // Component mounted
    componentDidMount(){
        //beginning of setup can happen before we get config
        if (this.work_order != null) {

            // Check to see if the certification summary can be viewed
            if (this.work_order.currentCertification != null) this.setState({summary_enabled:this.work_order.currentCertification.finished});

            // Setup the local state based on the global state
            this.setState({
                work_order_id: this.work_order.id,
                customer_id: this.work_order.customer,
                site_type: this.work_order.siteType,
                options_disabled: false,
                wo_disabled: false
            });
        }

        // Quick check to make sure the global state is setup
        if (global.state == null) global.state = Global_State.getInstance();

        //this.checkConfig();
    }

    componentWillUnmount() {
    }

    /*componentDidUpdate(){
    }*/

    checkConfig() {
        // Check the local storage
        global.storage.getData(global.const.STORAGE_KEY_CONFIG, value => {
            if(this.Configuration.isValidConfig(value)) {
                if(this.work_order === null) { //what the hell is this
                    //let the user know we're getting configuration
                    this.Message.showToastMessage(global.t.get$('STATUS.UPDATING_CONFIG'), 'OK');
                    global.storage.getData(global.const.STORAGE_KEY_REG_CODE, (reg_code) => {
                        this.Http.get(this.Register.generate(reg_code), (response) => {
                            if (response != null && response.responseCode === 200 && response.configuration != null) {
                                if(this.Register.isLicensed(response.configuration)) {
                                    this.Configuration.merge(response.configuration);
                                    this.Workflows.update();

                                    global.storage.storeData(global.const.STORAGE_KEY_CONFIG,JSON.stringify(response.configuration));
                                }
                                else {
                                    global.storage.multiClear([
                                        global.const.STORAGE_KEY_CONFIG,
                                    ]);
                                    global.configuration.reset();
                                    this.Message.sendAlert('Registration', global.t.get$('STATUS.REGISTRATION_ERROR'), 'OK');
                                    this.props.navigation.dispatch(this.Global.resetNavigation('Register'));
                                }
                            }
                            else {
                                this.Message.showToastMessage(global.t.get$('STATUS.REGISTRATION_COMMUNICATION_ERROR'), 'danger');
                            }
                            this.finishSetup();
                        });
                    });
                }
                else {
                    this.finishSetup();
                }
            }
            else {
                this.props.navigation.dispatch(this.Global.resetNavigation('Register'));
            }
        });
    }
    /**
     * Finish the home screen setup when we get the new config
     */
    finishSetup() {
        //if switching to AR only config, go to AR
        if(global.configuration.get(global.const.AR_ONLY)) {
            this.props.navigation.dispatch(this.Global.resetNavigation('AR'));
        }
        else {
            //determine whether or not to show the search button on the home screen
            this.setState({showSearch: global.configuration.get("workOrderSearchOnHome")});

            this.workOrderInput._root.focus();

            // Get connection details
            this.getConnection();

            // Get the work order
            this.work_order = global.state.get('work_order');

            // Set up the site types
            let siteTypeObject = global.configuration.get('siteTypes');
            if (siteTypeObject != null) {
                let siteTypes = [];
                let tempValue = this.work_order != null ? this.work_order.siteType : null;
                let index = 0;
                for (let key in siteTypeObject) {
                    if (siteTypeObject.hasOwnProperty(key)) {
                        if (tempValue == null) tempValue = siteTypeObject[key];
                        let siteLabel = global.t.translate(global.t.get("SITE_TYPE", key), [siteTypeObject[key]])
                            if (siteLabel != null) {
                            siteTypes.push(
                                <Picker.Item key={index} label={siteLabel} value={siteTypeObject[key]} />
                            );
                            index++
                        }
                    }
                }
                this.setState({site_types:siteTypes});
                if (this.state.site_type == null) {
                    this.setState({site_type:tempValue});
                }
            }
        }
    }

    wifiState(result) {
        this.setState({wifidetails: result});
    }

    /**
     * Get connection details
     */
    getConnection() {
        this.WifiManage.getConnectionDetails((result) => {
            this.wifiState(result)
        });
    };

    /**
     * Set the work order ID
     * @param id
     */
    setWorkOrderId(id) {
        this.setState({wo_disabled: (String(id).length < 5 || this.userSelection.customer_id === null || this.userSelection.customer_id.length < 5)});
        this.userSelection.work_order_id = id;
    }

    /**
     * Set the customer id
     * @param id
     */
    setCustomerId(id) {
        this.setState({wo_disabled: (String(id).length < 5 || this.userSelection.work_order_id === null || this.userSelection.work_order_id.length < 5)});
        this.userSelection.customer_id = id;
    }

    /**
     * Set the site type for the site visit
     * @param type
     */
    setSiteType(type) {
        this.userSelection.site_type = type;
        this.setState({site_type: this.state.options_disabled ? this.userSelection.site_type : null});
    }

    /**
     * Open/Close a work order
     */
    openWorkOrder() {
        if (!this.state.options_disabled) {

            // Ask the user if this is the action they would like to do
            new Message().sendAlertWithOption(
                "Close Work order",
                "Would you like to close the current work order? It can be retrieved from the side menu: 'Active Work Orders'.",
                "Close", () => this.closeWorkorder(),
                'Cancel');
        }
        else {

            // Open a new work order
            this.setState({work_order_id: this.state.options_disabled ? this.userSelection.work_order_id : null});
            this.setState({customer_id: this.state.options_disabled ? this.userSelection.customer_id : null});

            this.setState({options_disabled: !this.state.options_disabled});

            let work_order_id = this.userSelection.work_order_id;
            global.state.work_orders.new(work_order_id, this.state.site_type, this.userSelection.customer_id);

            let woDetails = global.state.work_orders.get(work_order_id);
            global.state.set('work_order', woDetails);
            global.state.set('customer_id', this.userSelection.customer_id);
        }
    }

    /**
     * Close a currently active work order
     */
    closeWorkorder(withmessage=true) {

        // Show the toast message
        if (withmessage) {
            new Message().showToastMessage("Work Order: '" + this.state.work_order_id + "' closed. Can still be viewed by accessing the Active Work Orders menu", 'success');
        }

        this.setState({work_order_id: this.state.options_disabled ? this.userSelection.work_order_id : null});
        this.setState({customer_id: this.state.options_disabled ? this.userSelection.customer_id : null});

        this.setState({options_disabled: !this.state.options_disabled});

        if (this.state.options_disabled) {
            this.setState({wo_disabled: true});
            this.setState({summary_enabled: false});
            global.state.set('work_order', null);

            this.workOrderInput._root.focus();
        }

        this.userSelection.work_order_id = null;
        this.userSelection.customer_id = null;
        this.checkConfig();
    }

    /**
     * Submit all workorders
     */
    submitWorkOrders() {
        let submitUrl = global.configuration.get("wsbSiteVisitUrl");
        let username = global.configuration.get("wsbUsername");
        let password = global.configuration.get("wsbPassword");

        let work_order_id = this.work_order.id;

        if (submitUrl != null) {

            let woPayload = new SiteVisit().generate(this.work_order);
            let woHeaders = username && password ? {
                'Authorization': 'Basic ' + base64.encode(username + ":" + password),
                'Content-Type': 'application/json'
            } : {
                'Content-Type': 'application/json'
            };

            this.Http.post(submitUrl, woHeaders, woPayload, (response) => {
                console.log(response);
                if (response != null && response.status === 200) {

                    if (response.url != null && response.url.indexOf("login") > -1) {
                        new Message().sendAlert("Authentication", "This server contains Microsoft authentication in which this application does not support, please re-register to a different server", "OK");
                    }
                    else {
                        new Message().showToastMessage("Work order '" + this.state.work_order_id + "' submitted", 'success');
                        this.closeWorkorder(false);
                        global.state.work_orders.remove(work_order_id);
                        this.work_order.currentCertification = null;
                        this.setState({summary_enabled: false});
                    }
                }
                else {
                    new Message().showToastMessage("Work order '" + this.state.work_order_id + "' failed to submit", 'danger');
                }
            });
        }
        else {
            new Message().sendAlert("Authentication", "Application is not configured correctly, unable to submit work orders", "OK");
        }
    }

    /**
     * Render the components to the view
     * @returns {*}
     */
    render() {
        console.disableYellowBox = true;
        const {navigate} = this.props.navigation;

        return (
            <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
                <AnimatedStackView>
                <View style={styles.container}>
                    <StatusBar hidden />
                    <Header style={styles.header} label={global.t.$.TITLE.HOME} icon={faHomeLg}/>

                    <View style={styles.child_container}>
                        <Form style={[styles.form_top, {paddingBottom:300, width:'100%'}]}>
                            <Item style={styles.item} underline stackedLabel>
                                <Label style={styles.text}>{global.t.$.ID.WORK_ORDER}</Label>
                                <Input underline disabled={!this.state.options_disabled}
                                       style={[styles.input, this.state.options_disabled ? null : styles.input_disabled]}
                                       ref={c => this.workOrderInput = c}
                                       onChangeText={(text) => this.setWorkOrderId(text)}
                                       value={this.state.work_order_id}
                                />
                            </Item>
                            <Item style={styles.item} underline stackedLabel>
                                <Label style={styles.text}>{global.t.$.ID.CUSTOMER}</Label>
                                <Input disabled={!this.state.options_disabled}
                                       style={[styles.input, this.state.options_disabled ? null : styles.input_disabled]}
                                       onChangeText={(text) => this.setCustomerId(text)}
                                       value={this.state.customer_id}
                                />
                            </Item>
                            <Item style={[styles.item]} stackedLabel>
                                <Label style={[styles.text]}>{global.t.$.HEADER.SITE_TYPE}</Label>
                            </Item>
                            <Picker
                                mode="dropdown"
                                enabled={this.state.options_disabled}
                                selectedValue={this.state.site_type}
                                textStyle={this.state.options_disabled ? null : styles.input_disabled}
                                style={[styles.picker, {marginTop:-50, backgroundColor: '#e9e9e9', height: 45, width:'70%'}]}
                                onValueChange={(itemValue) => this.setSiteType(itemValue)}>
                                {this.state.site_types}
                            </Picker>
                        </Form>

                        <View style={[styles.open_search_container, {marginBottom:-200}]}>
                            {this.state.showSearch &&
                                <Button disabled={!this.state.wo_disabled} rounded
                                        style={[
                                            styles.circle_button,
                                            !this.state.wo_disabled ? styles.button_disabled : null
                                        ]}>
                                    <Text style={styles.button_text_round}>{global.t.$.ACTION.SEARCH}</Text>
                                </Button>
                            }
                            <Button disabled={this.state.wo_disabled} rounded
                                    style={[
                                        styles.circle_button, this.state.showSearch ? {marginTop:-40} : null, this.state.options_disabled ? null : styles.button_closed,
                                        this.state.wo_disabled ? styles.button_disabled : null
                                    ]}
                                    onPress={() => this.openWorkOrder()}>
                                <Text style={styles.button_text_round}>{this.state.options_disabled ? global.t.$.ACTION.OPEN : global.t.$.ACTION.CLOSE}</Text>
                            </Button>
                        </View>
                    </View>

                    <View style={styles.menu_container}>

                        {this.Workflows.config.siteSurvey && !this.Workflows.config.siteSurvey.hidden &&
                        <View style={styles.button_container}>
                            <Button disabled={true} rounded style={[styles.icon_button, styles.button_disabled]}
                                    onPress={() => this.props.navigation.dispatch(global.state.resetNavigation("Certification"))}>
                                <FontAwesomeIcon active={!this.state.options_disabled} color={'white'} style={styles.button_icon_home}  size={55} icon={faPoll} />
                            </Button>
                            <Text style={{width: 100, textAlign: 'center', fontSize:16, marginTop:-50}}>{global.t.$.TITLE.SITE_SURVEY}</Text>
                        </View>
                        }

                        {this.Workflows.config.siteCertification && !this.Workflows.config.siteCertification.hidden &&
                        <View style={styles.button_container}>
                            <Button disabled={this.state.options_disabled} rounded
                                    style={[
                                        this.work_order != null && this.work_order.currentCertification != null &&  this.work_order.currentCertification.finished ? styles.icon_button_green : styles.icon_button,
                                        this.state.options_disabled ? styles.button_disabled : null
                                    ]}
                                    onPress={() => this.props.navigation.dispatch(global.state.resetNavigation("Certification"))}>
                                <FontAwesomeIcon style={styles.button_icon_home} color={'white'} size={55} icon={faShieldCheck} />
                            </Button>
                            <Text style={{width: 100, textAlign: 'center', fontSize:16, marginTop:-50}}>{global.t.$.TITLE.CERTIFICATION}</Text>
                        </View>
                        }

                        {this.Workflows.config.summary && !this.Workflows.config.summary.hidden &&
                        <View style={styles.button_container}>
                            <Button disabled={this.state.options_disabled || !this.state.summary_enabled} rounded
                                    style={[
                                        this.work_order != null && this.work_order.currentCertification != null &&  this.work_order.currentCertification.summaryViewed ? styles.icon_button_green : styles.icon_button,
                                        this.state.options_disabled ? styles.button_disabled : null,
                                        this.work_order == null || this.work_order.currentCertification == null || !this.work_order.currentCertification.finished  ? styles.button_disabled : null
                                    ]}
                                    onPress={() => this.props.navigation.dispatch(global.state.resetNavigation("CertificationSummary"))}>
                                <FontAwesomeIcon active={!this.state.options_disabled && this.state.summary_enabled} color={'white'} style={styles.button_icon_home} size={55} icon={faBallotCheck} />
                            </Button>
                            <Text style={{width: 100, textAlign: 'center', fontSize:16, marginTop:-50}}>{global.t.$.TITLE.SUMMARY}</Text>
                        </View>
                        }

                    </View>
                    <View style={[styles.menu_container, {marginTop:30, marginLeft:15}]}>

                        {this.Workflows.config.troubleShooting && !this.Workflows.config.troubleShooting.hidden &&
                        <View style={styles.button_container}>
                            <Button disabled={true} rounded style={[styles.icon_button, styles.button_disabled]}
                                    onPress={() => this.props.navigation.dispatch(global.state.resetNavigation("Certification"))}>
                                <FontAwesomeIcon active={!this.state.options_disabled} style={styles.button_icon_home} style={styles.button_icon_home} size={55} icon={faTools} />
                            </Button>
                            <Text style={{width: 120, textAlign: 'center', fontSize:16, marginLeft:-5, marginTop:-50}}>{global.t.$.TITLE.TROUBLESHOOTING}</Text>
                        </View>
                        }

                        {this.Workflows.config.AR && !this.Workflows.config.AR.hidden &&
                        <View style={styles.button_container}>
                            <Button disabled={this.state.options_disabled} rounded style={[
                                styles.icon_button,
                                this.state.options_disabled ? styles.button_disabled : null
                            ]}
                                    onPress={() => this.props.navigation.dispatch(global.state.resetNavigation("AR"))}>
                                <FontAwesomeIcon active={true} style={styles.button_icon_home} style={styles.button_icon_home} size={55} icon={faHeadVr} />
                            </Button>
                            <Text style={{width: 120, textAlign: 'center', fontSize:16, marginLeft:-5, marginTop:-50}}>3D View</Text>
                        </View>
                        }

                    </View>
                </View>
                    {this.state.summary_enabled && this.work_order && this.work_order.currentCertification.summaryViewed
                        && (this.work_order.currentCertification.reviewed || !global.configuration.get("customerReviewMandatory")) &&
                        <NavigationButtons navigation={this.props.navigation}
                                       submit={{label: global.t.$.ACTION.SUBMIT_WORK_ORDERS, route: () => this.submitWorkOrders()}}/>
                    }
                </AnimatedStackView>
            </TouchableWithoutFeedback>
        )
    }
}
// Load styles for Home
const styles = new Style().get();
