/**
 * AR View
 * This is the Augmented Reality View
 */

import React from "react";
import {
    StatusBar,
    Alert,
    ActivityIndicator,
    Image, View, TouchableWithoutFeedback, Text, Dimensions
} from 'react-native';
const height=Dimensions.get('window').height
const width=Dimensions.get('window').width
import {Button} from 'native-base';

// Import AR
import {
    ViroARSceneNavigator
} from 'react-viro';

// Default style sheet
import Style from '../styles/base/index';

// Global state for navigation options
import Global_State from '../constants/global';

// Import the main parts of each view
import AppPermissions from '../boot/permissions';
import OverlayView from '../styles/components/flow_header';
import AnimatedStackView from '../styles/components/stack_view';
import TrackingView from './AR/Tracking';

// Event Listener
import { EventRegister } from 'react-native-event-listeners';

// Get the AR Scene for the navigator
let InitialScene = require('./AR/Scene');

// AR Child Component Views
import TopMenuComponent from './AR/TopMenu';
import BottomMenuComponent from './AR/BottomMenu';
import BottomSimpleMenuComponent from './AR/guided/BottomSimpleMenu';
import HeatMap from "./AR/HeatMap";

import BumperLeft from '../styles/components/bumper_left';
import BumperRight from '../styles/components/bumper_right';
import SiteVisit from "../app_code/workorders/sitevisit";
import base64 from "react-native-base64";
import Message from "../app_code/message/service";
import HttpService from "../app_code/http/service";
import Device from "../app_code/diagnostics/deviceinfo";
import Thresholds from "../app_code/certifications/thresholds";
import WorkOrderBuilder from '../app_code/workorders/workorder_builder';
import SelectorComponent from "../components/other/SelectorComponent";

const min_map = {
    top: 50,
    right: 0,
    height: 145,
    width: 125
};
const max_map = {
    top: 200,
    left: 0,
    height: '45%',
    width: '100%'
};
const simple_map = {
    top: 50,
    right: 0,
    height: 145,
    width: 200
};

export default class ARSceneView extends React.Component {
    static navigationOptions = ({ navigation }) => Global_State.getInstance().viewStyleOptions(navigation);
    isiOS13 = global.state.iOS13_available();

    Http = new HttpService();
    Device = new Device();
    Thresholds = new Thresholds();

    // AR scene navigator
    arNavigator;

    // Upload listener
    uploadARDataListener;

    // Global state
    Global = global.state;

    // Global configuration
    Configuration = global.configuration;

    WorkOrderBuilder = new WorkOrderBuilder();

    // AR configuration options
    configuration = {
        liveMode: false
    };

    // Local state
    state = {
        loadComplete: false,
        ARAppProps: {},
        tracking: 'NONE',
        menuOptionsVisible: true,
        settingsVisible: false,
        detailedMode: true,
        expandedMode: false,
        measurement: 'dBm',

        menuActive: false,
        liveMode: false,
        liveModeState: false,
        locationPinNaming: false,
        liveModePaused: false,

        nodeOptions: {
            wifi: true,
            speed: false,
            interference: false
        },

        heatmap: {
            width: 125,
            height: 150,
            style: min_map
        },

        // Flow Requirements
        router: false,

        // Pin type selection
        pinTypeSelected: []



    };

    // Constructor
    constructor(props) {
        super(props);

        // Load all the images required for AR
        global.ARimageResources.load([
            {name:"wifi-poor", image:require('../assets/images/wifi/poor.png')},
            {name:"wifi-good", image:require('../assets/images/wifi/good.png')},
            {name:"wifi-ok", image:require('../assets/images/wifi/ok.png')},
            {name:"wifi-excellent", image:require('../assets/images/wifi/excellent.png')},

            {name:"speed-poor", image:require('../assets/images/wifi/speed_poor.png')},
            {name:"speed-good", image:require('../assets/images/wifi/speed_good.png')},
            {name:"speed-excellent", image:require('../assets/images/wifi/speed_excellent.png')},

            {name:"interference-poor", image:require('../assets/images/wifi/interference_poor.png')},
            {name:"interference-good", image:require('../assets/images/wifi/interference_good.png')},
            {name:"interference-excellent", image:require('../assets/images/wifi/interference_excellent.png')},

            {name:"pause-button", image:require('../assets/buttons/dropper/pause.png')},
            {name:"play-button", image:require('../assets/buttons/dropper/play.png')},
            {name:"add-point-button", image:require('../assets/buttons/add_point.png')},

            {name:"select-signal-black", image:require('../assets/icons/signal_black.png')},
            {name:"select-signal", image:require('../assets/icons/signal.png')},
            {name:"select-router", image:require('../assets/icons/router.png')},
            {name:"select-mesh", image:require('../assets/icons/mesh.png')},
            {name:"select-tv", image:require('../assets/icons/tv.png')},

            {name:"signal-button", image:require('../assets/buttons/dropper/signal.png')},
            {name:"router-button", image:require('../assets/buttons/dropper/router.png')},
            {name:"mesh-button", image:require('../assets/buttons/dropper/mesh.png')},
            {name:"tv-button", image:require('../assets/buttons/dropper/tv.png')},

            {name:"router-topper", image:require('../assets/toppers/router.png')},
            {name:"mesh-topper", image:require('../assets/toppers/mesh.png')},
            {name:"tv-topper", image:require('../assets/toppers/tv.png')}
        ]);

        // Add the pin types
        global.system.Pins.load([
            {
                name: 'router',
                selected: false,
                image: require('../assets/buttons/dropper/router.png'),
                color: "#4DBEEA",
                markerMaterial: ['simple_bg_router'],
                marker: require('../assets/toppers/router.png')
            },
            {
                name: 'signal',
                selected: true,
                image: require('../assets/buttons/dropper/signal.png'),
                color: "",
                markerMaterial: null,
                marker: null
            },
            {
                name: 'mesh',
                selected: false,
                image: require('../assets/buttons/dropper/mesh.png'),
                color: "#AB8DE5",
                markerMaterial: ['simple_bg_mesh'],
                marker: require('../assets/toppers/mesh.png')
            },
            {
                name: 'tv',
                selected: false,
                image: require('../assets/buttons/dropper/tv.png'),
                color: "#5F6368",
                markerMaterial: ['simple_bg_tv'],
                marker: require('../assets/toppers/tv.png')
            }
        ]);

        // Const setup
        this.CONST = {
            flowMode: global.const.AR_WORKFLOW_MODE,
            toggleLiveMode: global.const.AR_TOGGLE_LIVEMODE,
            pauseLiveMode: global.const.AR_PAUSE_LIVEMODE,
            nodeOptions: global.const.AR_NODE_OPTIONS,
            addPoint: global.const.AR_ADD_POINT
        };

        // Set up the events
        global.Events.subscribe([
            // Camera permission
            {id:this, name: global.const.CAMERA_PERMISSION_GRANTED, callback:() => {
                    this.setState({loadComplete: true});}},

            // Updates
            {id:this, name: global.const.PEFORM_UPDATE, callback:() => {
                    this.setState({heatmap: global.state.ARMode === this.CONST.flowMode ?
                            {width: 200, height: 150, style: simple_map} :
                            {width: 150, height: 150, style: min_map}});
                    this.forceUpdate();}}
        ]);

        // AR Events
        global.AREvents.subscribe([

            // Menu toggle
            {id:this, name: global.const.AR_MENU_TOGGLE, callback:() => {
                    this.setState({expandedMode: !this.state.expandedMode});
                    global.tracking.loaded = !this.state.menuOptionsVisible;}},

                    {id:this, name: 'Internal_track', callback:(data) => {
                       
                        EventRegister.emit("APPLICATION_INTERNAL_BUBBLE", [
                            {
                              "type": "callout",
                              "text": data.value,
                              "position": {"left": 90, "top":"40%" ,},
                              "size": {"width": 240, "height": "100%"},
                              "backgroundColor": "#4dbdea",
                              "textColor": "white",
                              "point": {"bottom": "center"},
                              "switch": "close",
                              "hideStatus":data.status
                            }
                          ] );
                        }},
            // Tracking
            {id:this, name: global.const.AR_TRACKING, callback:(trackingState) => {
                    this.setState({tracking: trackingState});}},

            // Settings toggle
            {id:this, name: global.const.AR_SETTINGS_TOGGLE, callback:() => {
                    this.setState({settingsVisible: !this.state.settingsVisible});}},

            // Resets
            {id:this, name: global.const.AR_RESET_STATES, callback:() => {
                    this.setState({router: null});
                    global.state.setBumperNext(false);}},
        ]);

        // Touch Events
        global.TouchEvents.subscribe([

            // Touch events
            {id:this, name:global.const.AR_TOUCH, callback:()=> {
                    this.setState({settingsVisible:false});}}
        ]);

        // Add listener for uploading AR data
        this.uploadARDataListener = EventRegister.addEventListener(global.const.AR_UPLOAD_DATA, () => {
            let woDetails = this.WorkOrderBuilder.build();
            let submitUrl = global.configuration.get("wsbSiteVisitUrl");
            let username = global.configuration.get("wsbUsername");
            let password = global.configuration.get("wsbPassword");
            if (submitUrl != null) {

                let woPayload = new SiteVisit().generate(woDetails);
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
                            new Message().showToastMessage(global.t.get$("TEXT.FAILED_UPLOAD"), 'danger');
                        }
                        else {
                            new Message().showToastMessage(global.t.get$("TEXT.SUCCESSFUL_UPLOAD"), 'success');
                            this.closeWorkorder(false);
                            global.state.work_orders.remove(work_order_id);
                            this.work_order.currentCertification = null;
                            this.setState({summary_enabled: false});
                        }
                    }
                    else {
                        new Message().showToastMessage(global.t.get$("TEXT.FAILED_UPLOAD"), 'danger');
                    }
                });
            }
            else {
                new Message().sendAlert("Authentication", "Application is not configured correctly, unable to submit work orders", "OK");
            }
        });

        // Load AR configuration
        this.loadARConfiguration();

        // Reset the heat map onload rotation
        global.tracking.resetmapRotationOnLoad();
    }


    // View mounted and ready
    componentDidMount(){
        styles = new Style().get("AR");

        // Set the AR Mode
        if (global.state.ARMode == null || global.state.ARMode === this.CONST.flowMode) {
           this.setupSimpleMode();
        }

        // Set up live/manual modes
        this.setState({liveMode: this.configuration.liveMode});
        EventRegister.emit(this.CONST.toggleLiveMode, this.configuration.liveMode);
    }

    // View about to unmount
    componentWillUnmount() {

        // Unload the AR view
        this.setState({loadComplete: false});

        // Remove listeners
        global.Events.remove(this);
        global.AREvents.remove(this);
        global.TouchEvents.remove(this);


        EventRegister.removeEventListener(this.uploadARDataListener);
    }

    // View has been updated
    componentDidUpdate(){
        styles = new Style().get("AR");
    }

    /**
     * Set up simple guided mode
     */
    setupSimpleMode() {
        global.state.ARMode = this.CONST.flowMode;
        this.setState({heatmap: {width: 200, height: 150, style: simple_map}});
        setTimeout(() => {
            global.Flow("ar-workflow");
        });
    }

    // Set the AR Navigator
    setARNavigatorRef(ARNavigator){
        this.arNavigator = ARNavigator;
    }

    /**
     * Load AR configuration
     */
    loadARConfiguration() {
        let ARConfiguration = global.configuration.get("AR");

        // Get the AR init
        if (ARConfiguration.init != null) {

            // Start AR in manual mode
            if (global.configuration.typeOf(ARConfiguration.init.startInManualMode) === "boolean") {
                this.configuration.liveMode = !ARConfiguration.init.startInManualMode;
            }
        }
    }


    /**
     * Toggle the live/manual mode used for dropping nodes
     */
    toggleLiveMode() {
        let translated = global.t.get$$([
            ['AR.MANUAL_CAPTURE_HEADER'],
            ['AR.LIVE_CAPTURE_HEADER'],
            ['AR.MANUAL_CAPTURE_TEXT'],
            ['AR.LIVE_CAPTURE_TEXT'],
            ['TEXT.NO'],
            ['TEXT.YES']
        ]);

        Alert.alert(
            this.state.liveMode ? translated[0] : translated[1],
            this.state.liveMode ? translated[2] : translated[3],
            [
                {text: translated[4], onPress: () => {}},
                {text: translated[5], onPress: () => {
                        global.system.Pins.change("signal");
                        let currentLiveState = this.state.liveMode;
                        this.setState({liveMode: !currentLiveState, liveModeState: !currentLiveState});
                        EventRegister.emit(this.CONST.toggleLiveMode, !currentLiveState);
                    }},
            ],
        );
    }

    /**
     * Toggle location naming of the pins
     */
    toggleLocationNaming() {
        let currentState = this.state.locationPinNaming;
        let currentLiveState = this.state.liveMode;
        this.setState({locationPinNaming: !currentState});

        if (currentState && currentLiveState) {
            this.setState({liveMode: false, liveModeState: currentLiveState});
            EventRegister.emit(this.CONST.toggleLiveMode, false);
        }
        else {
            let currentLiveState = this.state.liveModeState;
            this.setState({liveMode: currentLiveState});
            EventRegister.emit(this.CONST.toggleLiveMode, currentLiveState);
        }
    }

    /**
     * Pause the live drop mode
     */
    pauseLiveMode() {
        this.setState({liveModePaused: !this.state.liveModePaused});
        EventRegister.emit(this.CONST.pauseLiveMode, this.state.liveModePaused);
    }

    /**
     * Toggle the details presented on the AR nodes and Banner
     * @param option
     */
    toggleNodeDetail(option) {
        switch (option) {
            case 1: {
                this.state.nodeOptions.speed = !this.state.nodeOptions.speed;
                this.forceUpdate();

                // Send the update to the AR scene
                EventRegister.emit(this.CONST.nodeOptions, this.state.nodeOptions);

                break;
            }
            case 2: {
                this.state.nodeOptions.interference = !this.state.nodeOptions.interference;
                this.forceUpdate();

                // Send the update to the AR scene
                EventRegister.emit(this.CONST.nodeOptions, this.state.nodeOptions);

                break;
            }
            default: {
                this.setState({menuActive: !this.state.menuActive});
            }
        }
    }

    /**
     * Cycle through the measurement units
     */
    cycleStrengthUnits() {
        switch(this.state.measurement) {
            case 'dBm': {
                this.setState({measurement:'%'});
                break;
            }
            case '%': {
                this.setState({measurement:'dBm'});
                break;
            }
            default: {
                this.setState({measurement:'dBm'});
            }
        }
        global.AREvents.emit({name:global.const.AR_SCENE_STATE_UPDATE, data: {measurement: this.state.measurement}});
        global.NodeEvents.emit({name:global.const.AR_NODE_UPDATE});
    }

    /**
     * Cycle through the measurement units
     */
    changeStrengthUnits(unit) {
        this.setState({measurement:unit});
        global.AREvents.emit({name:global.const.AR_SCENE_STATE_UPDATE, data: {measurement: this.state.measurement}});
        global.NodeEvents.emit({name:global.const.AR_NODE_UPDATE});
    }

    /**
     * Change the pin type being used
     * @param name
     */
    changePinType(name) {
        if (global.system.Pins) global.system.Pins.change(name);
    }

    /**
     * Get the pin type image back
     * @returns {*}
     */
    get pinType() {
        return global.system.Pins ? global.system.Pins.image : global.ARimageResources.get("signal-button");
    }

    /**
     * Add new point to the screen
     */
    addPoint() {
        global.TouchEvents.emit({name:global.const.AR_TOUCH});
        if (global.state.ARMode === this.CONST.flowMode) {
            if (global.state.flowId === "ar-flow-page-2") {
                if (!this.state.router) {
                    EventRegister.emit(this.CONST.addPoint);
                    this.setState({router: global.tracking.mapItems[0]});
                }
                global.state.setBumperNext(true);

            }
            else if (global.state.flowId !== "ar-flow-page-2") {
                EventRegister.emit(this.CONST.addPoint);
                global.state.setBumperNext(true);
            }
            EventRegister.emit("APPLICATION_INTERNAL_BUBBLE", "next");
        }
        else {
            EventRegister.emit(this.CONST.addPoint);
            if (this.state.locationPinNaming) {
                global.Events.emit({name:global.const.SELECTOR, data:'show'});
                this.forceUpdate();
            }
        }
    }

    /**
     * Delete all nodes on in the AR view
     */
    deleteAllNodes() {
        global.TouchEvents.emit({name:global.const.AR_TOUCH});
        Alert.alert(
            global.t.get$("AR.DELETE_ALL_POINTS_HEADER"),
            global.t.get$("AR.DELETE_ALL_POINTS_TEXT"),
            [
                {text: global.t.get$("TEXT.NO"), onPress: () => {}},
                {text: global.t.get$("TEXT.YES"), onPress: () => {
                    global.state.processing = true;
                    global.ButtonEvents.emit({name:global.const.AR_DELETE_ALL_POINTS});

                    if (global.state.ARMode === this.CONST.flowMode) {
                        this.setState({router: null});
                        EventRegister.emit("APPLICATION_INTERNAL_FLOW_BUMP", {switch: "ar-flow-page-2"});
                    }
                }},
            ],
        );
    }

    /**
     * Undo the last dropped node
     */
    undoNode() {
        global.state.processing = true;
        global.TouchEvents.emit({name:global.const.AR_TOUCH});
        if (global.state.ARMode === this.CONST.flowMode) {
            if (global.state.flowId === "ar-flow-page-2") {
                this.setState({router: null});
                global.state.setBumperNext(false);
                global.ButtonEvents.emit({name:global.const.AR_DELETE_ALL_POINTS, data:"undo"});
            }
            else if (global.state.flowId === "ar-flow-page-3") {
                if (global.tracking.mapItems.length > 1) {
                    global.ButtonEvents.emit({name:global.const.AR_DELETE_ALL_POINTS, data:"undo"});
                    this.nodePinRemoved();
                }
            }
            else if (!global.state.flow) {
                if (global.tracking.mapItems.length > 0) {
                    this.nodePinRemoved();
                }
                global.ButtonEvents.emit({name:global.const.AR_DELETE_ALL_POINTS, data:"undo"});
            }
        }
        else {
            if (global.tracking.mapItems.length > 0) {
                this.nodePinRemoved();
            }
            global.ButtonEvents.emit({name:global.const.AR_DELETE_ALL_POINTS, data:"undo"});
        }
    }

    /**
     * Node pin removed notification
     */
    nodePinRemoved() {
        EventRegister.emit('APPLICATION_INTERNAL_POPUP_BUBBLE', {
            text: global.t.get$("AR.LAST_PIN_REMOVED"),
            timeout: 3000
        });
    }

    /**
     * Toggle settings
     */
    toggleSettings() {
        global.AREvents.emit({name:global.const.AR_SETTINGS_TOGGLE});
    }

    /**
     * Toggle map zoom
     */
    toggleMapZoom() {
        if (global.state.ARMode !== this.CONST.flowMode) {
            this.setState({
                heatmap: this.state.heatmap.style.top === 50 ?
                    {width: 250, height: 250, style: max_map} :
                    global.state.ARMode === this.CONST.flowMode ?
                        {width: 200, height: 150, style: simple_map} :
                        {width: 150, height: 150, style: min_map}
            });
        }
    }

    /**
     * Upload site visit info
     */
    uploadSiteVisit() {
        global.Flow("toolbox-workflow");
    }




    // Render view components
    render() {
        console.disableYellowBox = true;

        const mapPinch = React.createRef();
        const mapRotation = React.createRef();


        //const {navigate} = this.props.navigation;
        if (this.state.loadComplete) {
            return (
                <AnimatedStackView>
                    <StatusBar hidden={this.isiOS13}/>
                    <ViroARSceneNavigator
                        style={styles.arView}
                        debug={true} 
                        apiKey={global.const.API_KEY}
                        initialScene={{scene: InitialScene}}
                        ref={this.setARNavigatorRef}
                        viroAppProps={this.state.ARAppProps}/>

                    {/* {this.state.tracking === 'NONE'  && global.tracking.location == null &&
                        <TrackingView style={{
                            position: 'absolute',
                            top: 150,
                            left: 0,
                            right: 0,
                            width: '100%',
                            height: 140,
                            flexDirection: 'column',
                            justifyContent: 'space-between',
                            alignItems: 'center'
                        }}/>
                    } */}

                    {global.state.ARMode === this.CONST.flowMode && <BumperLeft bumpers={global.state.bumpers} link {...this.props}/>}
                    {global.state.ARMode === this.CONST.flowMode && this.state.router && <BumperRight bumpers={global.state.bumpers} link {...this.props}/>}

                    <TopMenuComponent controller={this} link {...this.props}/>
                    {global.state.ARMode === this.CONST.flowMode && <BottomSimpleMenuComponent controller={this} link {...this.props}/>}
                    {global.state.flow == null && global.state.ARMode !== this.CONST.flowMode && <BottomMenuComponent controller={this} link {...this.props}/>}

                    <TouchableWithoutFeedback onPress={() => {
                        this.toggleMapZoom();
                    }}>
                        <View style={[this.state.heatmap.style, {
                            position: 'absolute',
                            opacity: this.state.expandedMode ? 1 : 0
                        }]}>
                        <HeatMap controller={this} link {...this.props}/>
                        </View>
                    </TouchableWithoutFeedback>

                    <OverlayView link {...this.props}/>
                    <SelectorComponent title={global.t.get$('TITLE.LOCATION_SELECTOR_TITLE')} data={global.configuration.get('locations')}  link {...this.props}/>
                </AnimatedStackView>
            );
        }
        else {
            return (
                <AnimatedStackView style={{flex: 1}}>
                    <AppPermissions/>
                    <StatusBar hidden={this.isiOS13}/>
                    <Image source={styles.splashImage}
                           style={{resizeMode: 'stretch', width: '100%', height: '100%'}} />
                    <ActivityIndicator style={{marginTop: -300}} size="large" color="white" />
                </AnimatedStackView>
            );
        }
    }
}

// Load default styles
let styles = new Style().get("AR");
