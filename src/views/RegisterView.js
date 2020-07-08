/**
 * Register Application Controller
 */

import React from "react";
import { Picker } from 'native-base';
import RegisterViewComponent from "./Registration/RegisterView";
import Style from '../styles/views/register';

import Global_State from '../constants/global';

import DeviceInformation from '../app_code/diagnostics/deviceinfo';
import Register from '../app_code/registration/register';
import Message from '../app_code/message/service';
import HttpService from '../app_code/http/service';
import Workflows from '../app_code/workflows/workflows';
import _ispList from '../res/ispList';

export default class RegisterView extends React.Component {
    static navigationOptions = ({ navigation }) => Global_State.getInstance().viewStyleOptions(null);

    Global = global.state;
    Configuration = global.configuration;

    Http = new HttpService();
    Message = new Message();
    Register = new Register();
    DeviceInfo = new DeviceInformation();

    regCodeInput;

    //Workflows
    Workflows = new Workflows();

    ispList = _ispList.ispList;
    supportedLanguages = global.t.supportedLanguages;
    easter_egg_tracker = {count: 0, last: 'header'};

//this.Global.get("registration_code")
    state = {
        registered: this.Global.getBoolean("registered"),
        registration_code: "",
        registration_display: 0,
        language_selection: 0,
        language_options: [],
        tech_id: this.Global.get("tech_id"),
        language: this.Global.get("language"),
        code_error: false,
        tech_error: false,
        form_submitted: false,
        selectedLanguage: "ENG",
        qa_mode: false,
        registration_options: [],

        test:null,
        popup: null
    };

    componentDidMount(){
        //this.regCodeInput._root.focus();
        //my attempt at getting correct language to display on startup, was holding up the build, will
        //get working properly after
        /*global.storage.getData(global.const.STORAGE_KEY_LANGUAGE, (language_id) => {
            for(let i=0;i<this.supportedLanguages.length;i++){
                console.log(">>>STUFF");
                console.log(this.supportedLanguages[i].value);
                console.log(language_id);
                if(language_id === this.supportedLanguages[i].value) {
                    this.setState({language_selection: i});
                }
            }
        });*/
        let regOptions = [];
        for(let i=0;i<this.ispList.length; i++) {
            regOptions.push(
                <Picker.Item key={i} label={this.ispList[i].name} value={i} />
            );
        }
        this.setState({registration_options: regOptions});
        this.updateLanguage();
    }

    componentWillUnmount() {
    }

    componentDidUpdate(){
    }


    /**
     * Update language information
     */
    updateLanguage() {
        let languageOptions = [];
        for(let i=0;i<this.supportedLanguages.length;i++) {
            languageOptions.push(
                <Picker.Item
                    key={i}
                    label={global.t.get$(global.functions.replace("{0}.{1}", ["LANGUAGE", this.supportedLanguages[i].label]))}
                    value={i} />
            );
        }
        this.setState({language_options: languageOptions});
    }

    updateEasterEggTracker(id) {
        if(!(this.easter_egg_tracker.last === id)) {
            this.easter_egg_tracker.count++;
            this.easter_egg_tracker.last = id;
        }
        else {
            this.easter_egg_tracker.count = 0;
            this.easter_egg_tracker.last = 'header';
        }
        if(this.easter_egg_tracker.count >= 9) {
            this.setState({qa_mode: true});
        }
    }

    /**
     * Set the registration code
     * @param code
     */
    setRegistrationCode(code) {
        this.setState({code_error:false});
        this.setState({registration_code:code});
    }

    /**
     * Set the tech id
     * @param id
     */
    setTechId(id) {
        this.setState({tech_error:false});
        this.setState({tech_id:id})
    }

    /**
     * Set the ISP
     * @param id
     */
    setIspSelection(value) {
        this.setState({registration_display: value, registration_code: this.ispList[value].regCode});
    }

    /**
     * Set the language
     * @param id
     */
    setLanguageSelection(id) {
        let languageUrl = this.supportedLanguages[id].url;
        this.setState({language:this.supportedLanguages[id].value, language_selection: id});

        global.t.$load(languageUrl ? global.functions.replace("{0}{1}.json", [languageUrl, this.supportedLanguages[id].value]) : this.supportedLanguages[id].value);
        this.updateLanguage();
    }

    /**
     * Register the application
     */
    registerApplication() {

        this.setState({form_submitted:true});
        if (this.state.registration_code != null && this.state.registration_code !== "") {

            // Make a call to the registration server
            this.Http.get(this.Register.generate(this.state.registration_code), (response) => {

                if (response != null && response.responseCode === 200 && response.configuration != null) {
                    if(this.Register.isLicensed(response.configuration)) {
                        this.Configuration.merge(response.configuration);
                        this.Workflows.update();
                           
                        this.Global.set("tech_id", this.DeviceInfo.uuid);
                        this.Global.set("registration_code", this.state.registration_code);
                        this.Global.set("language", this.state.language);

                        // Store information
                        global.storage.storeData(global.const.STORAGE_KEY_W,'');
                        global.storage.storeData(global.const.STORAGE_KEY_CONFIG,JSON.stringify(response.configuration));
                        global.storage.storeData(global.const.STORAGE_KEY_REG_CODE, this.state.registration_code);
                        //global.storage.storeData(global.const.STORAGE_KEY_TECHID, this.state.tech_id);
                        //if we don't store something this will cause problems when trying to do a site upload
                        global.storage.storeData(global.const.STORAGE_KEY_TECHID, this.DeviceInfo.uuid);
                        global.storage.storeData(global.const.STORAGE_KEY_LANGUAGE, this.state.language);
                        global.storage.storeData(global.const.STORAGE_KEY_APP_VERSION, this.DeviceInfo.buildVersion);

                        // Check for AR configuration
                        this.props.navigation.dispatch(this.Global.resetNavigation('GuidedView'));
                    }
                    else {
                        this.setState({form_submitted:false});
                        this.Message.sendAlert('Registration', global.t.get$('STATUS.VT_REGISTRATION_ERROR'), 'OK');
                    }
                }
                else {
                    this.setState({form_submitted:false});
                    this.Message.sendAlert('Registration', global.t.get('STATUS','VT_REGISTRATION_COMMUNICATION_ERROR'), 'OK');
                }
            });
        }
        else {

            // Some required fields have not been set correctly
            this.setState({form_submitted:false});
            if (this.state.registration_code == null || this.state.registration_code === "") {
                this.setState({code_error:true});
            }
            if (this.state.tech_id == null || this.state.tech_id === "") {
                this.setState({tech_error:true});
            }

            this.Message.sendAlert(global.t.get('HEADER','VT_REGISTRATION_CODE'), global.t.get('STATUS','VT_REGISTRATION_ERROR'), 'OK');
        }
    }


    render() {
        console.disableYellowBox = true;
        return (
            <RegisterViewComponent controller={this} link {...this.props}/>
        )
    }
}
// Load styles for Register
const styles = new Style().get();
