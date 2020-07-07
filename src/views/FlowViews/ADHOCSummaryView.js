/**
 * AD HOC Detailed Summary View
 */

// Import Components
import React from "react";
import {
    StatusBar,
    View,
    Image,
    Alert,
    Text,
    ActivityIndicator
} from 'react-native';
import {
    Label, ListItem
} from "native-base";

// Font Awesome 5
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import {faArrowFromBottom, faArrowFromTop, faMapMarker} from '@fortawesome/pro-solid-svg-icons';

// Default style sheet
import Style from '../../styles/base/index';

// Import the main parts of each view
import AnimatedStackView from '../../styles/components/stack_view';
import CustomButtons from "../../styles/components/custom_buttons";
import ButtonTouchableTextComponent from "../../components/buttons/ButtonTouchableTextComponent";

// Other imports needed
import HttpService from "../../app_code/http/service";

import Device from '../../app_code/diagnostics/deviceinfo';
import Thresholds from '../../app_code/certifications/thresholds';

import WorkOrderBuilder from '../../app_code/workorders/workorder_builder';
import UploadResults from "../../app_code/workorders/upload_results";
import Triggers from "../../app_code/flows/triggers";
import {SwipeListView} from "react-native-swipe-list-view";

export default class ADHOCSummaryView extends React.Component {

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
        scrollMargin: 0,

        dropPoints: [],
        busy: false,
        minResults: 3
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
        if (global.tracking.mapItems != null && global.tracking.mapItems.length > 0) {
            this.setState({dropPoints: this.getDropPointInformation()});
        }

        this.setState({
            minResults : this.props.info.minResults &&
            global.functions.isTypeOf(this.props.info.minResults) === "number" ?
                this.props.info.minResults : 3});
    }

    // View about to unmount
    componentWillUnmount() {
    }

    // View has been updated
    componentDidUpdate(){
    }

    /**
     * Get the drop point information for the results list
     * @returns {Array}
     */
    getDropPointInformation() {
        let mapItems = global.tracking.allNodeData;
        let dropPoints = [];
        for(let i in mapItems) {
            dropPoints.push({
                location: mapItems[i].transform.location != null && mapItems[i].transform.location.length > 0 ?
                    mapItems[i].transform.location[0].label === "Other" ? mapItems[i].transform.location[0].text : mapItems[i].transform.location[0].label : "Point" + i.toString(),
                time: global.functions.formatDateToTime(new Date(mapItems[i].transform.timestamp)),
                typeIcon: mapItems[i].data.pinType.marker != null ? mapItems[i].data.pinType.marker : global.ARimageResources.get('select-signal-black'),
                type: mapItems[i].data.pointType,
                signalIcon: mapItems[i].data.node.icon.props.source,
                signal: mapItems[i].data.level});
        }
        return dropPoints;
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

            global.state.work_orders.remove(this.wo.id);
            this.props.controller.changeViewById("1");
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
        this.setState({busy:false});
    }

    /**
     * Upload a site visit
     */
    uploadSiteVisit(ref=this) {
        if (ref.state.dropPoints.length < ref.state.minResults) {
            Alert.alert(
                global.t.get$("TEXT.FAILED_UPLOAD"),
                global.t.replace([ref.state.minResults], "TEXT.MIN_AMOUNT_POINTS"),
                [
                    {text: 'ok', onPress: () => {}},
                ],
            );
        }
        else if (!ref.state.uploaded) {
            ref.setState({busy: true});
            new UploadResults().upload(ref.wo, ref.uploadSiteVisitComplete);
        }
        else {
            ref.showRefCode();
        }
    }

    /**
     * Show the reference code to get the results online
     */
    showRefCode() {
        this.props.controller.changeViewById("1");
    }

    // Render view components
    render() {
        console.disableYellowBox = true;

        return (
            <AnimatedStackView>
                <View style={[styles.container]}>
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
                    <View style={{flexDirection: 'row', flex: 0, marginTop: -40, width:'80%', height:250, justifyContent:'space-around', alignItems:'center', alignSelf: 'center'}}>
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
                    <View style={{height: 25, marginTop: -40, flex:0, flexDirection: 'row', borderBottomColor:'#000', borderBottomWidth:1}}>
                        <View style={{flex:3, alignContent:'flex-start'}}>
                            <Text style={{textAlign:'left', marginTop:3}}> Time/Location </Text>
                        </View>
                        <View style={{flex:3, alignContent:'flex-start', paddingLeft:10}}>
                            <Text style={{textAlign:'left', marginTop:3}}> Pin Type </Text>
                        </View>
                        <View style={{flex:0, alignContent:'flex-start'}}>
                            <Text style={{textAlign:'right', paddingRight:20, marginTop:3}}> Signal </Text>
                        </View>
                    </View>
                    {this.state.busy && <ActivityIndicator style={{marginTop: 100}} size="large" color="blue" />}
                    {!this.state.busy &&
                    <SwipeListView
                        style={{backgroundColor:'transparent'}}
                        disableRightSwipe={true}
                        disableLeftSwipe={true}
                        data={this.state.dropPoints}
                        renderItem={ (data, rowMap) => (
                            <ListItem
                                      style={{backgroundColor: 'transparent'}}>
                                <View style={{flex:1, flexDirection: 'row'}}>
                                    <View style={{flex:2, flexDirection:'column'}}>
                                        <Text style={{paddingTop:3, paddingLeft:0, fontSize:14}}> {data.item.time} </Text>
                                        <Text style={{paddingTop:1, paddingLeft:0, fontSize:12}}> {data.item.location} </Text>
                                    </View>
                                    <View style={{flex:3, flexDirection:'column', textAlign:'center', alignItems: 'center', marginLeft: -50}}>
                                        <Image resizeMode={"contain"} source={data.item.typeIcon} style={{paddingTop:3, paddingLeft:0, width:20, height: 20}}/>
                                        <Text adjustsFontSizeToFit numberOfLines={1} style={{paddingTop:1, paddingLeft:0, fontSize:14}}> {global.t.get$("TEXT." + data.item.type)} </Text>
                                    </View>
                                    <View style={{flex:0, flexDirection:'column', textAlign:'center', alignItems: 'center'}}>
                                        <Image resizeMode={"contain"} source={data.item.signalIcon} style={{marginTop:-10, paddingLeft:0, width: 30, height: 30}}/>
                                        <Text style={{paddingTop:1, paddingLeft:0, fontSize:14}}> {data.item.signal + " dBm"} </Text>
                                    </View>
                                </View>
                            </ListItem>
                        )}
                    />}
                    {!this.state.busy && <CustomButtons navigation={this.props.navigation} trigger={new Triggers(this)} parent={this.props.controller} create={this.props.info.actionButtons} />}
                </View>
            </AnimatedStackView>
        );
    }
}
// Load default styles
let styles = new Style().get("FLOWS");
