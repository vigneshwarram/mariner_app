/**
 * Template for making the overlay views
 * Rename the class
 */

// Import Components
import React from "react";
import {
    StatusBar,
    View,
    Image,
    Alert,
    ScrollView
} from 'react-native';
import {
    Label
} from "native-base";

// Font Awesome 5
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faMapMarker } from '@fortawesome/pro-solid-svg-icons';

// Default style sheet
import Style from '../../styles/base/index';

// Import the main parts of each view
import AnimatedStackView from '../../styles/components/stack_view';
import CustomButtons from "../../styles/components/custom_buttons";
import ButtonTouchableTextComponent from "../../components/buttons/ButtonTouchableTextComponent";

// Other imports needed
import SiteVisit from '../../app_code/workorders/sitevisit';

import base64 from 'react-native-base64';
import HttpService from "../../app_code/http/service";

import Message from '../../app_code/message/service';

import Certification from '../../app_code/certifications/certification';
import Device from '../../app_code/diagnostics/deviceinfo';
import WifiDetails from '../../app_code/wifi/wifidetails';
import Thresholds from '../../app_code/certifications/thresholds';
import Triggers from "../../app_code/flows/triggers";

import WorkOrderBuilder from '../../app_code/workorders/workorder_builder';
import UploadResults from '../../app_code/workorders/upload_results';


export default class SummaryView extends React.Component {

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

    recommendationReturned(result) {
        Alert.alert(
            "Recommendation",
            JSON.stringify(result),
            [
                {text: 'ok', onPress: () => {}},
            ]
        );
    }

    /**
     * Upload a site visit
     */
    uploadSiteVisit() {
        new UploadResults().upload(this.wo, this.uploadSiteVisitComplete);
    }

    /*
     * Get recommendations from optimize service
     */
    getRecommendations(algorithmType) {
        new UploadResults().getRecommendation(algorithmType, this.recommendationReturned);
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
                    <StatusBar hidden />
                    {this.props.info.skip &&
                    <ButtonTouchableTextComponent
                        onPress={()=>{this.props.info.skip.switch ?
                            this.props.controller.changeViewById(this.props.info.skip.switch) :
                            this.props.controller.exitFlow()}}
                        size={14}
                        label={global.t.get$(this.props.info.skip.label)}
                        align={'right'}
                        iconColor={'black'}
                        style={{
                            flex:0,
                            flexDirection: 'row',
                            alignItems:'flex-end',
                            width: '100%',
                            height: 30,
                            marginTop: 10,
                            paddingRight: 10,
                            opacity: 0.9}}
                    >
                    </ButtonTouchableTextComponent>}
                    <View style={{flexDirection: "row", flex:0, alignItems:'center', justifyItems: 'start', marginTop: 10}}>
                        <View style={{flex: 1, marginLeft: 5, width:55, height:55}}>
                            <Image resizeMode={"contain"} style={{width:55, height:55}} source={styles.brandIcon}/>
                        </View>
                        <Label style={[styles.h1, {fontWeight:'bold', fontSize: 24, flex: 8, marginLeft: -30, width:'90%', textAlign:'center', alignItems:'center'}]}>{global.t.get$(this.props.info.title)}</Label>
                    </View>
                    <View style={{flexDirection: 'row', flex: 0, width:'80%', height:250, justifyContent:'space-around', alignItems:'center', alignSelf: 'center'}}>
                        <View style={{flexDirection: 'column', justifyContent:'space-around', alignItems: 'center', width: '25%', height: 130}}>
                            <Label style={{fontSize: 24, fontWeight: '600'}}>{this.state.excellent}</Label>
                            <Image resizeMode={"contain"} style={{width:55, height:55}} source={this.ImageResources.get("excellent_point")}/>
                            <Label style={{fontWeight: '600'}}>Excellent</Label>
                        </View>
                        <View style={{flexDirection: 'column', justifyContent:'space-around', alignItems: 'center', width: '25%', height: 130}}>
                            <Label style={{fontSize: 24, fontWeight: '600'}}>{this.state.good}</Label>
                            <Image resizeMode={"contain"} style={{width:55, height:55}} source={this.ImageResources.get("good_point")}/>
                            <Label style={{fontWeight: '600'}}>Good</Label>
                        </View>
                        <View style={{flexDirection: 'column', justifyContent:'space-around', alignItems: 'center', width: '25%', height: 130}}>
                            <Label style={{fontSize: 24, fontWeight: '600'}}>{this.state.fair}</Label>
                            <Image resizeMode={"contain"} style={{width:55, height:55}} source={this.ImageResources.get("fair_point")}/>
                            <Label style={{fontWeight: '600'}}>Fair</Label>
                        </View>
                        <View style={{flexDirection: 'column', justifyContent:'space-around', alignItems: 'center', width: '25%', height: 130}}>
                            <Label style={{fontSize: 24, fontWeight: '600'}}>{this.state.poor}</Label>
                            <Image resizeMode={"contain"} style={{width:55, height:55}} source={this.ImageResources.get("critical_point")}/>
                            <Label style={{fontWeight: '600'}}>Poor</Label>
                        </View>
                    </View>
                    {this.state.coverage &&
                        <ScrollView style={{flexDirection:'column', flex:0, marginBottom:this.state.scrollMargin}}>
                            <Label style={[{flex: 8, paddingLeft: 10, paddingRight: 10, width:'100%', textAlign:'left', alignItems:'center'}]}>{global.t.get$(this.props.info.description_pass)}</Label>
                        </ScrollView>
                    }
                    {!this.state.coverage &&
                        <ScrollView style={{flexDirection: "column", flex:0, marginBottom:this.state.scrollMargin}}>
                            <Label style={[{flex: 8, paddingLeft: 10, paddingRight: 10, width:'100%', textAlign:'left', alignItems:'center'}]}>{global.t.get$(this.props.info.description_fail)}</Label>
                        </ScrollView>
                    }
                    <CustomButtons navigation={this.props.navigation} trigger={new Triggers(this)} parent={this.props.controller} create={this.props.info.actionButtons} inject={[
                        {position: 2, label: global.t.get$("ACTION.NEED_MORE_HELP"),switch:"Help",direction:"right", type: "Help",}, {position: 6, label: global.t.get$("ACTION.OPTIMIZE_WIFI"),switch:"WifiOptimize",direction:"right", type: "Help",}
                    ]} />
                </View>
            </AnimatedStackView>
        );
    }
}
// Load default styles
let styles = new Style().get("FLOWS");
