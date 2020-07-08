/**
 * Splashscreen for operations used to determine what to open first
 */

// Import Components
import React from "react";
import {
    Image,
    ActivityIndicator,
    StatusBar,
    Linking,
    Alert,
    Platform
} from 'react-native';

// Get the device information
import DeviceInformation from '../app_code/diagnostics/deviceinfo';
import Translate from "../../src/constants/translate";
// Default style sheet
import Style from '../styles/views/default'

// Import the main parts of each view
import Splash from "../styles/components/splash";
import AnimatedStackView from "../styles/components/stack_view";

import HttpService from '../app_code/http/service';
import Register from '../app_code/registration/register';
import Workflows from '../app_code/workflows/workflows';
import Message from '../app_code/message/service';
import AppPermissions from "../boot/permissions";

import _ispList from '../res/ispList';
import { contains } from "cheerio";
var service_value=''
var service_message=''
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

    // list
    ispList = _ispList.ispList;

    // Constructor
    constructor(props) {
        super(props);
    }

    // View mounted and ready
    componentDidMount() {
        service_value=global.t.get$("HEADER.CHANGE_SERVICE_PROVIDER")
        service_message=global.t.get$("STATUS.CHANGE_INTERNET_SERVICE_PROVIDER")
        Linking.addEventListener('url', this.handleUrl);
        Linking.getInitialURL().then(url => {
            if (url !== null) {
                this.navigate(url);
            } else {
                // Check the local storage
                global.storage.getData(global.const.STORAGE_KEY_CONFIG, value => {
                    if (this.Configuration.isValidConfig(value)) {
                        global.storage.getData(global.const.STORAGE_KEY_APP_VERSION, (build_version) => {
                            if (this.DeviceInfo.buildVersion === build_version) {
                                global.storage.getData(global.const.STORAGE_KEY_REG_CODE, (reg_code) => {
                                    this.Http.getWithTimeout(this.Register.generate(reg_code), 5000).then((initialResponse) => initialResponse.json()).then((response) => {
                                        if (response != null && response.responseCode === 200 && response.configuration != null) {
                                            if (this.Register.isLicensed(response.configuration)) {
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

        });


        global.storage.getData(global.const.STORAGE_KEY_LANGUAGE, (language_id) => {
            let languageUrl = global.configuration.get("wsbLanguageUrl");
            global.t.$load(languageUrl ? global.functions.replace("{0}{1}.json", [languageUrl, language_id]) : language_id);
        });

    }

    handleUrl({ url }) {
        //alert(url)
    }
    navigate = (url) => {
        console.log('url---',url)
        const { navigate } = this.props.navigation;
        var regex = /[?&]([^=#]+)=([^&#]*)/g,
            params = {},
            match;
        while (match = regex.exec(url)) {
            params[match[1]] = match[2];
        }
        console.log(params);
        console.log("svvalue", params.s)
        if(params.w != null && params.w !== ""){
            console.log('params.w',params.w)
            //store the w value for refrenece code
            global.storage.storeData(global.const.STORAGE_KEY_W,params.w)
        }
        if(params.c != null && params.c !== ""){
            console.log('params.w',params.w)
            //store the w value for refrenece code
            global.storage.storeData(global.const.STORAGE_KEY_C,params.c)
        }
        if (params.s != null && params.s !== "") {
            let regOptions = [];
            for (let i = 0; i < this.ispList.length; i++) {
                regOptions.push(
                    this.ispList[i].regCode
                );
            }
            // Checking , is URL s value present in ISP network List
           
            if (regOptions.includes(params.s)) {

                global.storage.getData(global.const.STORAGE_KEY_CONFIG, value => {
                    if (this.Configuration.isValidConfig(value)) {
                        global.storage.getData(global.const.STORAGE_KEY_APP_VERSION, (build_version) => {
                            if (this.DeviceInfo.buildVersion === build_version) {
                                global.storage.getData(global.const.STORAGE_KEY_REG_CODE, (reg_code) => {

                                    if (reg_code === params.s) {

                                        //this.callRegCodeIsSame(params)

                                        // Clear the global options
                                        global.state.clearWorkOrders();
                                        global.configuration.reset();
                                        global.storage.multiClear([
                                            global.const.STORAGE_KEY_CONFIG,
                                            global.const.STORAGE_KEY_REG_CODE,
                                            global.const.STORAGE_KEY_TECHID,
                                            global.const.STORAGE_KEY_LANGUAGE,
                                            global.const.STORAGE_KEY_APP_VERSION,
                                            global.const.STORAGE_KEY_BUILD_NUMBER
                                        ]);


                                        this.Http.get(this.Register.generate(reg_code), (response) => {

                                            if (response != null && response.responseCode === 200 && response.configuration != null) {
                                                console.log("response.configuration-->", response.configuration)
                                                if (this.Register.isLicensed(response.configuration)) {
                                                    this.Configuration.merge(response.configuration);
                                                    this.Workflows.update();

                                                    this.Global.set("tech_id", this.DeviceInfo.uuid);
                                                    this.Global.set("registration_code", reg_code);
                                                    this.Global.set("language", "en");

                                                    // Store information
                                                    global.storage.storeData(global.const.STORAGE_KEY_CONFIG, JSON.stringify(response.configuration));
                                                    global.storage.storeData(global.const.STORAGE_KEY_REG_CODE, reg_code);
                                                    //global.storage.storeData(global.const.STORAGE_KEY_TECHID, this.state.tech_id);
                                                    //if we don't store something this will cause problems when trying to do a site upload
                                                    global.storage.storeData(global.const.STORAGE_KEY_TECHID, this.DeviceInfo.uuid);
                                                    global.storage.storeData(global.const.STORAGE_KEY_LANGUAGE, "EN");
                                                    global.storage.storeData(global.const.STORAGE_KEY_APP_VERSION, this.DeviceInfo.buildVersion);


                                                    // Check for AR configuration

                                                    let flowList = response.configuration.flows.map(function (item) {
                                                        return item['id'];
                                                    });

                                                    if (flowList.includes(params.v)) {
                                                        if (params.v === "ar-workflow") {
        
                                                            global.state.ARMode = "PLAYGROUND_MODE";
                                                            global.state.exitFlows(() => {
                                                                this.props.navigation.dispatch(this.Global.resetNavigation('AR'));
                                                                global.ButtonEvents.emit({ name: global.const.AR_DELETE_ALL_POINTS });
                                                            });
                                                        } else if (params.v === "welcome-workflow") {
                                                            console.log('welcome-workflow')
                                                            this.props.navigation.dispatch(this.Global.resetNavigation('GuidedView'));
                                                        }
                                                    } else {
                                                        alert("No flow")

                                                    }

                                                }
                                                else {
                                                    this.setState({ form_submitted: false });
                                                    this.Message.sendAlert('Registration', global.t.get$('STATUS.VT_REGISTRATION_ERROR'), 'OK');
                                                }
                                            }
                                            else {
                                                this.setState({ form_submitted: false });
                                                this.Message.sendAlert('Registration', global.t.get$('STATUS', 'VT_REGISTRATION_COMMUNICATION_ERROR'), 'OK');
                                            }
                                        });
                                    } else {
                                        // show dialog of network change
                                        this.clearAllWorkOrders(params)
                                    }

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
                        //this.props.navigation.dispatch(this.Global.resetNavigation('Register'));

                        this.Http.get(this.Register.generate(params.s), (response) => {

                            if (response != null && response.responseCode === 200 && response.configuration != null) {
                                if (this.Register.isLicensed(response.configuration)) {
                                    this.Configuration.merge(response.configuration);
                                    this.Workflows.update();

                                    this.Global.set("tech_id", this.DeviceInfo.uuid);
                                    this.Global.set("registration_code", params.s);
                                    this.Global.set("language", "en");

                                    // Store information
                                    global.storage.storeData(global.const.STORAGE_KEY_CONFIG, JSON.stringify(response.configuration));
                                    global.storage.storeData(global.const.STORAGE_KEY_REG_CODE, params.s);
                                    //global.storage.storeData(global.const.STORAGE_KEY_TECHID, this.state.tech_id);
                                    //if we don't store something this will cause problems when trying to do a site upload
                                    global.storage.storeData(global.const.STORAGE_KEY_TECHID, this.DeviceInfo.uuid);
                                    global.storage.storeData(global.const.STORAGE_KEY_LANGUAGE, "EN");
                                    global.storage.storeData(global.const.STORAGE_KEY_APP_VERSION, this.DeviceInfo.buildVersion);

                                    // Check for AR configuration
                                    let flowList = response.configuration.flows.map(function (item) {
                                        return item['id'];
                                    });

                                    if (flowList.includes(params.v)) {
                                        if (params.v === "ar-workflow") {
                                            //this.props.navigation.dispatch(this.Global.resetNavigation('AR'));
                                            global.state.ARMode = "PLAYGROUND_MODE";
                                            global.state.exitFlows(() => {
                                                this.props.navigation.dispatch(this.Global.resetNavigation('AR'));
                                                global.ButtonEvents.emit({ name: global.const.AR_DELETE_ALL_POINTS });
                                            });
                                        } else if (params.v === "welcome-workflow") {
                                            this.props.navigation.dispatch(this.Global.resetNavigation('GuidedView'));
                                        }
                                    } else {
                                        alert("No flow")

                                    }
                                }
                                else {
                                    this.setState({ form_submitted: false });
                                    this.Message.sendAlert('Registration', global.t.get$('STATUS.VT_REGISTRATION_ERROR'), 'OK');
                                }
                            }
                            else {
                                this.setState({ form_submitted: false });
                                this.Message.sendAlert('Registration', global.t.get('STATUS', 'VT_REGISTRATION_COMMUNICATION_ERROR'), 'OK');
                            }
                        });
                    }
                });

            } else {
                // Checking is value Not present in ISP network List
                global.storage.getData(global.const.STORAGE_KEY_CONFIG, value => {
                    if (this.Configuration.isValidConfig(value)) {
                        global.storage.getData(global.const.STORAGE_KEY_APP_VERSION, (build_version) => {
                            if (this.DeviceInfo.buildVersion === build_version) {
                                global.storage.getData(global.const.STORAGE_KEY_REG_CODE, (reg_code) => {
                                    this.Http.getWithTimeout(this.Register.generate(reg_code), 5000).then((initialResponse) => initialResponse.json()).then((response) => {
                                        if (response != null && response.responseCode === 200 && response.configuration != null) {
                                            if (this.Register.isLicensed(response.configuration)) {
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

        }


    }


    //Show if found already registerd any network
    clearAllWorkOrders = (params) => {
        new Message().sendAlertWithOption(service_value, service_message, "Continue", () => {

            // Clear the global options
           // alert(params.s)
            this.loadDeepLinkNetwork(params);
            global.state.clearWorkOrders();
            global.configuration.reset();
            global.storage.multiClear([
                global.const.STORAGE_KEY_CONFIG,
                global.const.STORAGE_KEY_REG_CODE,
                global.const.STORAGE_KEY_TECHID,
                global.const.STORAGE_KEY_LANGUAGE,
                global.const.STORAGE_KEY_APP_VERSION,
                global.const.STORAGE_KEY_BUILD_NUMBER
            ]);          

        }, "Cancel", () => {
            this.loadPreviousRegisterNetwork();
        });
    }

    // Load Previous Register Network
    loadPreviousRegisterNetwork = () => {

        global.storage.getData(global.const.STORAGE_KEY_CONFIG, value => {
            if (this.Configuration.isValidConfig(value)) {
                global.storage.getData(global.const.STORAGE_KEY_APP_VERSION, (build_version) => {
                    if (this.DeviceInfo.buildVersion === build_version) {
                        global.storage.getData(global.const.STORAGE_KEY_REG_CODE, (reg_code) => {
                            this.Http.getWithTimeout(this.Register.generate(reg_code), 5000).then((initialResponse) => initialResponse.json()).then((response) => {
                                if (response != null && response.responseCode === 200 && response.configuration != null) {
                                    if (this.Register.isLicensed(response.configuration)) {
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

    // Load URL s value Network
    loadDeepLinkNetwork = (params) => {

        //Register with url s params
        console.log('params.s',params.s)
        this.Http.get(this.Register.generate(params.s), (response) => {

            if (response != null && response.responseCode === 200 && response.configuration != null) {
                console.log("response.configuration-->", response.configuration)
                if (this.Register.isLicensed(response.configuration)) {
                    this.Configuration.merge(response.configuration);
                    this.Workflows.update();

                    this.Global.set("tech_id", this.DeviceInfo.uuid);
                    this.Global.set("registration_code", params.s);
                    this.Global.set("language", "en");

                    // Store information
                    global.storage.storeData(global.const.STORAGE_KEY_CONFIG, JSON.stringify(response.configuration));
                    global.storage.storeData(global.const.STORAGE_KEY_REG_CODE, params.s);
                    //global.storage.storeData(global.const.STORAGE_KEY_TECHID, this.state.tech_id);
                    //if we don't store something this will cause problems when trying to do a site upload
                    global.storage.storeData(global.const.STORAGE_KEY_TECHID, this.DeviceInfo.uuid);
                    global.storage.storeData(global.const.STORAGE_KEY_LANGUAGE, "EN");
                    global.storage.storeData(global.const.STORAGE_KEY_APP_VERSION, this.DeviceInfo.buildVersion);

                    // Check for AR configuration

                    let flowList = response.configuration.flows.map(function (item) {
                        return item['id'];
                    });

                    if (flowList.includes(params.v)) {
                        if (params.v === "ar-workflow") {
                           // this.props.navigation.dispatch(this.Global.resetNavigation('AR'));
                           global.state.ARMode = "PLAYGROUND_MODE";
                           global.state.exitFlows(() => {
                               this.props.navigation.dispatch(this.Global.resetNavigation('AR'));
                               global.ButtonEvents.emit({ name: global.const.AR_DELETE_ALL_POINTS });
                           });
                        } else if (params.v === "welcome-workflow") {
                            this.props.navigation.dispatch(this.Global.resetNavigation('GuidedView'));
                        }
                    } else {
                        alert("No flow")

                    }


                }
                else {
                    this.setState({ form_submitted: false });
                    this.Message.sendAlert('Registration', global.t.get$('STATUS.VT_REGISTRATION_ERROR'), 'OK');
                }
            }
            else {
                this.setState({ form_submitted: false });
                this.Message.sendAlert('Registration', global.t.get$('STATUS', 'VT_REGISTRATION_COMMUNICATION_ERROR'), 'OK');
            }
        });
    }

    callRegCodeIsSame = (params) => {
        //  // Clear the global options
//                                         global.state.clearWorkOrders();
//                                         global.configuration.reset();
//                                         global.storage.multiClear([
//                                             global.const.STORAGE_KEY_CONFIG,
//                                             global.const.STORAGE_KEY_REG_CODE,
//                                             global.const.STORAGE_KEY_TECHID,
//                                             global.const.STORAGE_KEY_LANGUAGE,
//                                             global.const.STORAGE_KEY_APP_VERSION,
//                                             global.const.STORAGE_KEY_BUILD_NUMBER
//                                         ]);
        global.storage.getData(global.const.STORAGE_KEY_CONFIG, value => {
            if (this.Configuration.isValidConfig(value)) {
                global.storage.getData(global.const.STORAGE_KEY_APP_VERSION, (build_version) => {
                    if (this.DeviceInfo.buildVersion === build_version) {
                        global.storage.getData(global.const.STORAGE_KEY_REG_CODE, (reg_code) => {
                            this.Http.getWithTimeout(this.Register.generate(reg_code), 5000).then((initialResponse) => initialResponse.json()).then((response) => {
                                if (response != null && response.responseCode === 200 && response.configuration != null) {
                                    if (this.Register.isLicensed(response.configuration)) {
                                        this.Configuration.merge(response.configuration);
                                        this.Workflows.update();
                                        global.storage.storeData(global.const.STORAGE_KEY_CONFIG, JSON.stringify(response.configuration));

                                        //this.props.navigation.dispatch(this.Global.resetNavigation("GuidedView"));

                                        let flowList = response.configuration.flows.map(function (item) {
                                            return item['id'];
                                        });

                                        if (flowList.includes(params.v)) {
                                            if (params.v === "ar-workflow") {
                                                global.state.ARMode = "PLAYGROUND_MODE";
                                                            global.state.exitFlows(() => {
                                                                this.props.navigation.dispatch(this.Global.resetNavigation('AR'));
                                                                global.ButtonEvents.emit({ name: global.const.AR_DELETE_ALL_POINTS });
                                                            });
                                            } else if (params.v === "welcome-workflow") {
                                                this.props.navigation.dispatch(this.Global.resetNavigation('GuidedView'));
                                            }
                                        } else {
                                            alert("No flow")

                                        }
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
        //Linking.removeEventListener('url', this.handleOpenURL);
    }

    // View has been updated
    componentDidUpdate() {
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
            <AnimatedStackView style={{ flex: 1 }}>
                <Splash />
                <AppPermissions />
                <StatusBar hidden />
                <Image source={require('../assets/splash-portrait-xhdpi.png')}
                    style={{ resizeMode: 'stretch', width: '100%', height: '100%' }} />
                <ActivityIndicator style={{ marginTop: -300 }} size="large" color="white" />
            </AnimatedStackView>
        );
    }
}
// Load default styles
const styles = new Style().get();
