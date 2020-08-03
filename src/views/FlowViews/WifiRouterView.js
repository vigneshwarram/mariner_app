/**
 * Guide View
 */

// Import Components
import React from "react";
import {
    StatusBar,
    View,
    Image,
    Alert
} from 'react-native';
import {
    Label
} from "native-base";

// Font Awesome 5
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';

// Default style sheet
import Style from '../../styles/base/index';
import { faHomeLg } from '@fortawesome/pro-solid-svg-icons';
import UploadResults from "../../app_code/workorders/upload_results";
// Import the main parts of each view
import AnimatedStackView from '../../styles/components/stack_view';
import Device from '../../app_code/diagnostics/deviceinfo';
import Global_State from '../../constants/global';
import Header from '../../styles/components/view_header';
import CustomButtons from "../../styles/components/custom_buttons";
import ButtonTouchableTextComponent from "../../components/buttons/ButtonTouchableTextComponent";
import Triggers from "../../app_code/flows/triggers";
import WorkOrderBuilder from '../../app_code/workorders/workorder_builder';
import HttpService from "../../app_code/http/service";
import Thresholds from '../../app_code/certifications/thresholds';
export default class WifiRouterView extends React.Component {
    static navigationOptions = ({ navigation }) => Global_State.getInstance().viewStyleOptions(navigation);
    isiOS13 = global.state.iOS13_available();
    // Global state
    Global = global.state;

    // Global configuration
    Configuration = global.configuration;

    // Image resources
    ImageResources = global.imageResources;

    WorkOrderBuilder = new WorkOrderBuilder();

    Device = new Device();
    Http = new HttpService();
    wo = null;
    woid = "";
    Thresholds = new Thresholds();
    excellent = 0;
    good = 0;
    fair = 0;
    poor = 0;
    coverage = false;
    uploaded = false;

    // Local state
    state = {
        excellent: 0,
        good: 0,
        fair: 0,
        poor: 0,
        coverage: false,
        uploaded: false,
        scrollMargin:0
    };


    // Constructor
    constructor(props) {
        super(props);
        this.uploadSiteVisitComplete = this.uploadSiteVisitComplete.bind(this);
        let modified = global.upload_tracker.hasBeenModified();
        if(modified) {
            let woDetails = this.WorkOrderBuilder.build();
            let locationTests = woDetails.currentCertification.locationTests;
            if (locationTests != null && locationTests.length > 0) {
                locationTests.forEach((test) => {
                    let signalResult = test.signalResult;
                    if (test.pointType === "signal") {
                        switch(signalResult.designation) {
                            case "ok": {
                                this.excellent++;
                                break;
                            }
                            case "minor": {
                                this.good++;
                                break;
                            }
                            case "major": {
                                this.fair++;
                                break;
                            }
                            case "critical": {
                                this.poor++;
                                break;
                            }
                        }
                    }
                })
            }
            this.coverage = woDetails.currentCertification.coverage;
            this.wo = woDetails;
        }
        else {
            //load in last work order
            this.uploaded = true;
            let data = global.upload_tracker.referenceData;
            this.excellent = data.excellent;
            this.good = data.good;
            this.fair = data.fair;
            this.poor = data.poor;
            this.coverage = data.coverage;
            this.woid = data.ref;
            this.setState({excellent: this.excellent, good: this.good, fair: this.fair, poor: this.poor, coverage: this.coverage});
        }

        // Make space for the action buttons if needed
        for (let i=0;i<this.props.info.actionButtons.length;i++) {
            if (this.props.info.actionButtons[i].position === 5 || this.props.info.actionButtons[i].position === 6) {
                this.setState({scrollMargin:110});
                break;
            }
            else if (this.props.info.actionButtons[i].position === 3 || this.props.info.actionButtons[i].position === 4) {
                this.setState({scrollMargin:55});
            }
        }
    }

    // View mounted and ready
    componentDidMount(){
        styles = new Style().get("FLOWS");
        this.setState({excellent: this.excellent, good: this.good, fair: this.fair, poor: this.poor, coverage: this.coverage, uploaded: this.uploaded});
    }

    // View about to unmount
    componentWillUnmount() {
    }

    // View has been updated
    componentDidUpdate(){
    }
  /**
     * Site visit upload results
     * @param result
     */
    uploadSiteVisitComplete(result) {
       
        if (result === "success") {
            this.setState({uploaded: true});
          //set modified to false until we drop more points
            let allNodeData = global.tracking.allNodeData;
            global.upload_tracker.lastUploaded = allNodeData;
            global.upload_tracker.referenceData = {excellent: this.excellent, good: this.good, fair: this.fair, poor: this.poor, coverage: this.coverage, ref: this.wo.id};
            this.woid = this.wo.id;
            Alert.alert(
                global.t.get$("TEXT.SUCCESSFUL_UPLOAD"),
                '' + global.t.get$("TEXT.HERE_IS_CODE") + this.wo.id.toUpperCase(),
                [
                    {text: 'ok', onPress: () => {}},
                ],
            );
            global.state.work_orders.remove(this.wo.id);
        }
        else {
            Alert.alert(
                global.t.get$("TEXT.FAILED_UPLOAD"),
                global.t.get$("TEXT.ERROR_UPLOADING"),
                [
                    {text: 'ok', onPress: () => {}},
                ],
            );
        }
    }
    /**
     * Navigate to default views
     */
    continueNavigation(ref=this) {
        global.state.exitFlows();
        ref.props.navigation.dispatch(ref.Global.resetNavigation(!global.configuration.get(global.const.AR_ONLY) ? 'Home' : 'AR'));
    }

    /**
     * Upload a site visit
     */
    uploadSiteVisit() {
        //alert('hello')
        new UploadResults().upload(this.wo, this.uploadSiteVisitComplete);
    }

    showRefCode() {
        Alert.alert(
            global.t.get$("HEADER.REFERENCE_CODE"),
            '' + global.t.get$("TEXT.ALREADY_UPLOADED") + this.woid.toUpperCase(),
            [
                {text: 'ok', onPress: () => {}},
            ],
        );
    }
    // Render view components
    render() {
        console.disableYellowBox = true;

        return (
            <AnimatedStackView>
                <View style={styles.container}>
                <StatusBar hidden={this.isiOS13}/>
                      <View style={{flexDirection: "row", flex:0, alignItems:'center', justifyItems: 'start', marginTop: 10}}>
                        <View style={{flex: 1, marginLeft: 5, width:55, height:55}}>
                            <Image resizeMode={"contain"} style={{width:55, height:55}} source={styles.brandIcon}/>
                        </View>
                        <Label style={[styles.h1, {fontWeight:'bold', fontSize: 24, flex: 8, marginLeft: -30, width:'90%', textAlign:'center', alignItems:'center'}]}>{this.props.info.title}</Label>
                    </View>
                    <View style={{flexDirection: "row", flex:0, alignItems:'center', justifyItems: 'start', marginTop: 10}}>
                        <Label style={[styles.h6, {flex: 8, paddingLeft: 15, paddingRight: 15, width:'100%', textAlign:'left', alignItems:'center'}]}>{this.props.info.description}</Label>
                    </View>
                    <CustomButtons navigation={this.props.navigation} parent={this.props.controller} create={this.props.info.actionButtons} inject={[
                        {position: 4, label: global.t.get$("ACTION.SHARE_RESULTS"),  route: () => (this.state.uploaded ? this.showRefCode() : this.uploadSiteVisit())}]}/>
                </View>
            </AnimatedStackView>
        );
    }
}
// Load default styles
let styles = new Style().get("FLOWS");
