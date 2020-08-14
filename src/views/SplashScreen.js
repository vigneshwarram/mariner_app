/**
 * Splashscreen for operations used to determine what to open first
 */

// Import Components
import React from "react";
import {
    Image,
    ActivityIndicator,
    StatusBar
} from 'react-native';

// Get the device information
import DeviceInformation from '../app_code/diagnostics/deviceinfo';

// Default style sheet
import Style from '../styles/base/index'

// Import the main parts of each view
import Splash from "../styles/components/splash";
import AnimatedStackView from "../styles/components/stack_view";

import HttpService from '../app_code/http/service';
import Register from '../app_code/registration/register';
import Workflows from '../app_code/workflows/workflows';
import Message from '../app_code/message/service';
import AppPermissions from "../boot/permissions";

export default class SplashScreen extends React.Component {

    // Global state
    Global = global.state;

    // Global configuration
    Configuration = global.configuration;

    // Global storage
    Storage = global.storage;

    // HTTP
    Http = new HttpService();
    Register = new Register();

    // Workflows
    Workflows = new Workflows();

    // Messages
    Message = new Message();

    // Device Information
    DeviceInfo = new DeviceInformation();

    // Constructor
    constructor(props) {
        super(props);
    }

    // View mounted and ready
    componentDidMount(){
        styles = new Style().get("SPLASH");

        //load language immediately
        global.storage.getData(global.const.STORAGE_KEY_LANGUAGE, (language_id) => {
            let languageUrl = global.configuration.get("wsbLanguageUrl");
            global.t.$load(languageUrl ? global.functions.replace("{0}{1}.json", [languageUrl, language_id]) : language_id);
        });
        // Check the local storage
        global.storage.getData(global.const.STORAGE_KEY_CONFIG, value => {
            if(this.Configuration.isValidConfig(value)) {
                global.storage.getData(global.const.STORAGE_KEY_APP_VERSION, (build_version) => {
                    if (this.DeviceInfo.buildVersion === build_version) {
                        global.storage.getData(global.const.STORAGE_KEY_REG_CODE, (reg_code) => {
                            this.Http.getWithTimeout(this.Register.generate(reg_code), 5000).then((initialResponse) => initialResponse.json()).then((response) => {
                                if (response != null && response.responseCode === 200 && response.configuration != null) {
                                    if(this.Register.isLicensed(response.configuration)) {
                                        this.Configuration.merge(response.configuration);
                                        this.Workflows.update();
                                        global.storage.storeData(global.const.STORAGE_KEY_CONFIG, JSON.stringify(response.configuration));
                                        this.props.navigation.dispatch(this.Global.resetNavigation("GuidedView"));
                                    }
                                    else {
                                        this.Message.sendAlert('Registration', global.t.get$('STATUS.REGISTRATION_ERROR'), 'OK');
                                        this.props.navigation.dispatch(this.Global.resetNavigation('Register'));
                                    }
                                } else {
                                    this.failedRegistration(value);
                                }
                            }).catch((e) => {
                                this.failedRegistration(value);
                            });

                            global.storage.getData(global.const.STORAGE_KEY_TECHID, (id) => {
                                this.Global.set("tech_id", id);
                            });
                            global.storage.getData(global.const.STORAGE_KEY_REG_CODE, (code) => {
                                this.Global.set("registration_code", code);
                            });
                            global.storage.getData(global.const.STORAGE_KEY_LANGUAGE, (lang) => {
                                this.Global.set("language", lang);
                                let languageUrl = global.configuration.get("wsbLanguageUrl");
                                if (languageUrl) {
                                     global.t.$load(global.functions.replace("{0}{1}.json", [languageUrl, lang]))
                                }
                            });
                        });
                    } else {
                        this.props.navigation.dispatch(this.Global.resetNavigation('Register'));
                    }
                });
            }
            else {
                this.props.navigation.dispatch(this.Global.resetNavigation('Register'));
            }
        });
    }



    // View about to unmount
    componentWillUnmount() {
    }

    // View has been updated
    componentDidUpdate(){
    }

    failedRegistration(value) {
        this.Message.showToastMessage(global.t.get$('STATUS.REGISTRATION_COMMUNICATION_ERROR'), 'danger');
        this.Configuration.merge(JSON.parse(value));
        this.Workflows.update();
        this.props.navigation.dispatch(this.Global.resetNavigation("GuidedView"));
    }

    // Render view components
    render() {
        console.disableYellowBox = true;
        //const {navigate} = this.props.navigation;

        return (
            <AnimatedStackView style={[{flex: 1}, styles.background]}>
                <Splash/>
                <AppPermissions/>
                <StatusBar hidden />
                <Image source={styles.splashImage}
                       style={{resizeMode: 'stretch', width: '100%', height: '100%'}} />
                <ActivityIndicator style={{marginTop: -300}} size="large" color="white" />
            </AnimatedStackView>
        );
    }
}
// Load default styles
let styles = new Style().get("SPLASH");
