/**
 * Gateway setup view
 */

// Import Components
import React from "react";
import {
    StatusBar, Text,
    View
} from 'react-native';
import {
    Button, Form,
    Input,
    Item,
    Label,
    Spinner
} from "native-base";
import Icon from 'react-native-vector-icons/FontAwesome';

// Font Awesome 5
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faCogs } from '@fortawesome/pro-regular-svg-icons';

// Default style sheet
import Style from '../styles/views/register'

// Global state for navigation options
import Global_State from '../constants/global';

import Message from '../app_code/message/service';
import GatewayScraper from '../app_code/wifi/gateway/scraper';

// Import the main parts of each view
import AnimatedStackView from '../styles/components/stack_view';
import NavigationButtons from "../styles/components/navigation_buttons";
import Header from "../styles/components/view_header";
import Splash from "../styles/components/splash";

export default class GatewaySetupView extends React.Component {
    static navigationOptions = ({ navigation }) => Global_State.getInstance().viewStyleOptions(navigation);

    // Global state
    Global = global.state;

    // Global configuration
    Configuration = global.configuration;

    Gateway = new GatewayScraper();

    // Local state
    state = {
        username:"",
        password: "",
        ipaddress: "",
        back: {},
        testing_gateway: false

    };

    // Constructor
    constructor(props) {
        super(props);

        // Bind the function
        this.testGateway = this.testGateway.bind(this);
    }

    // View mounted and ready
    componentDidMount(){
        this.setState({back: {label:'Save', route:global.state.lastView}});

        // If coming from network setup screen (ios), populate fields with info tied to picker option
        let selected_gateway = this.props.navigation.getParam('gateway', null);
        if (selected_gateway !== null) {
            this.setIPAddress(selected_gateway.gateway_ip ? selected_gateway.gateway_ip : "");
            this.setUsername(selected_gateway.gateway_username ? selected_gateway.gateway_username : "");
            this.setPassword(selected_gateway.gateway_password ? selected_gateway.gateway_password : "");

            let selected_gateway_index  = this.props.navigation.getParam('index', -1);
            if (selected_gateway_index !== -1) global.configuration.update('gateway_index', selected_gateway_index)
        }
        else {

            // Set the fields from the default configuration
            this.setState({ipaddress: global.configuration.get("waveguide_gateway_ip")});
            this.setState({username: global.configuration.get("waveguide_gateway_username")});
            this.setState({password: global.configuration.get("waveguide_gateway_password")});
        }
    }

    // View about to unmount
    componentWillUnmount() {
    }

    // View has been updated
    componentDidUpdate(){
    }

    /**
     * Set the ip address
     * @param text
     */
    setIPAddress(text) {
        this.setState({ipaddress: text});
        global.configuration.update("waveguide_gateway_ip", text);
    }

    /**
     * Set the username
     * @param text
     */
    setUsername(text) {
        this.setState({username: text});
        global.configuration.update("waveguide_gateway_username", text);

    }

    /**
     * Set the password
     * @param text
     */
    setPassword(text) {
        this.setState({password: text});
        global.configuration.update("waveguide_gateway_password", text);
    }

    /**
     * Test the gateway connection
     */
    testGateway() {
        this.setState({testing_gateway: true});
        this.Gateway.connectToServer((response) => {
            let message = new Message();
            let timeout = setTimeout(() => {
                 message.showToastMessage(global.t.get$('TEXT.GATEWAY_FAIL_CONNECTION'), 'danger');
                 this.setState({testing_gateway: false});
            }, global.configuration.get('postTimeout'));
            // handle success/failure scenarios of gateway login attempt
            if (response) {
                if (response.status === 200) {

                    if (response['responseURL'] === global.functions.replace("http://{0}/at_a_glance.php", [global.configuration.get("waveguide_gateway_ip")])) {
                        // success
                        message.showToastMessage(global.t.get$('TEXT.GATEWAY_SUCCESS'), 'success');
                    }
                    else if (response['_response'] && response['_response'].indexOf('Incorrect user')) {
                        // bad username
                        message.showToastMessage(global.t.get$('TEXT.GATEWAY_FAIL_USERNAME'), 'danger');
                    }
                    else if (response['_response'] && response['_response'].indexOf('Incorrect password')) {
                        // bad password
                        message.showToastMessage(global.t.translate('TEXT.GATEWAY_FAIL_PASSWORD', [global.configuration.get("waveguide_gateway_username")]), 'danger');
                    }
                    else {
                        // other..
                        message.showToastMessage(global.t.get$('TEXT.GATEWAY_FAIL_CONNECTION'), 'danger');
                    }
                    clearTimeout(timeout);
                }
                else if (response.readyState === 4 && response.status === 0 ) {
                    //timeout, wrong ip, etc...
                    message.showToastMessage(global.t.get$('TEXT.GATEWAY_FAIL_CONNECTION'), 'danger');
                    clearTimeout(timeout);
                }
            }
            else {
                //failed to get response for callback.
                message.showToastMessage(global.t.get$('TEXT.GATEWAY_FAIL_UNKNOWN'), 'danger');
                clearTimeout(timeout);
            }

            this.setState({testing_gateway: false});
        });
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
                    <Header style={styles.header} label={'Gateway Setup'} icon={faCogs}/>

                    <Form style={[styles.form_top, {paddingBottom:50, marginLeft:0, justifyContent:'flex-start', alignContent:'flex-start'}]}>
                        <Item style={[styles.item, {alignContent:'flex-start'}]} stackedLabel>
                            <Label style={styles.text}>IP</Label>
                            <Input style={styles.input} value={this.state.ipaddress}
                                   onChangeText={(text) => this.setIPAddress(text)}
                            />
                        </Item>
                        <Item style={[styles.item, {marginTop:0}]} stackedLabel>
                            <Label style={styles.text}>Username</Label>
                            <Input style={styles.input} value={this.state.username}
                                   onChangeText={(text) => this.setUsername(text)}
                            />
                        </Item>
                        <Item style={[styles.item, {marginTop:0}]} stackedLabel>
                            <Label style={styles.text}>Password</Label>
                            <Input style={styles.input} value={this.state.password}
                                   onChangeText={(text) => this.setPassword(text)}
                            />
                        </Item>
                    </Form>
                    {this.state.testing_gateway &&
                        <View style={{marginRight: 40, flexDirection: 'column', flex:0, textAlign: 'center', justifyItems: 'center'}}>
                            <Spinner style={{marginLeft: 0}} color="blue"/>
                            <Label style={[styles.text, {textAlign: 'center'}]}>Please wait.. testing gateway connection</Label>
                        </View>
                    }
                </View>
                <NavigationButtons navigation={this.props.navigation} previous={{label: global.t.get$('ACTION.TEST_CONNECTION'), route: this.testGateway}} next={this.state.back}/>
            </AnimatedStackView>
        );
    }
}
// Load default styles
const styles = new Style().get();
