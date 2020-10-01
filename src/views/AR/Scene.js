/**
 * AR Scene View
 * This renders the AR objects into the Scene
 */

import React from "react";
import {
    ViroARScene,
    ViroConstants,
    ViroImage,
    ViroFlexView
} from 'react-viro';
//screeen timer awake 
import KeepAwake from 'react-native-keep-awake';
// AR style sheet
import Style from '../../styles/views/arscene';

// Event Listener
import { EventRegister } from 'react-native-event-listeners';

// Euclidean library
const distance = require('euclidean-distance');

// Import the AR classes
import AR from '../../app_code/ar/ar';
import SignalThresholds from '../../app_code/configuration/thresholds/signal';
import Transforms from '../../app_code/ar/classes/transforms';
import Node from './Node';
import SimpleNode from './guided/SimpleNode';

export default class Scene extends React.Component {

    // Signal Thresholds
    signalThresholds = new SignalThresholds();

    // Wifi network updates
    wifiNetworkUpdateInterval;

    // AR management
    wifi = new AR();
    scanningID;
    coolingID;
    ssUpdateID = null;
    ssUpdated = false;
    scanned = false;
    cool = false;
    lock = false;
    processing = false;
    nodes = [];

    needsRendering = true;

    // Store node/point/coords information
    pointsCollected = [];
    lastTransform = null;
    lastPosition = null;

    // Reused translations
    translation = [
        "2.4", "5.0"
    ];

    // Drop point configuration
    configuration = {
        points: {
            position: [1.5, 1.5, 1.5],
            y_offset: 1,
            reOrderDistance: 0.5
        }
    };

    // AR tracking
    tracking = false;

    //scan interval for signal strength
    scanInterval;

    // Guided flow pin naming
    guidedPinNaming = false;

    // Event listeners
    detailModeListener;
    addPointListener;
    toggleLiveListener;
    pauseLiveListener;
    nodeOptionsListener;

    // Local state
    state = {
        debug: false,
        needsRender: true,
        tracking: 'NONE',
        detailedMode: true,
        liveMode: false,
        liveModePaused: false,
        nodeItems:[],
        wifiList: [],
        icons: [],

        freq: 0,
        lastSignal: "0",
        linkSpeed: "0",
        lastInterference: {
            value: -1,
            type: 0,
            label: global.t.get('TEXT','EXCELLENT'),
            style: {color: "green"}
        },

        locationPinNaming: false,
        globalNodeUpdate: false,
        nodeOptions: {
            measurement: 'dBm',
            wifi: true,
            speed: false,
            interference: false
        }
    };

    // Animated icon needed for the nodes
    wifi_animated_icon;

    // Global classes
    GlobalState = global.state;
    GlobalClass = global.system;
    GlobalTracking = global.tracking;
    GlobalConst = global.const;
    GlobalConfiguration = global.configuration;
    maximumPins = global.configuration.get("maximumPins");

    /**
     * Constructor
     * @param props
     */
    constructor(props) {
        super(props);

        // Bind functions used by the AR scene
        this.onInitialized = this.onInitialized.bind(this);
        this.onTransformed = this.onTransformed.bind(this);
        this.onScreenSelected = this.onScreenSelected.bind(this);

        // Create all the needed event listeners
        this.createEventListeners();

        // Load any point configuration items
        this.loadPointConfiguration();

        //get signal strength scan interval
        let interval = this.GlobalConfiguration.get("scanDetailsIntervalMs");
        this.scanInterval = interval > 4000 ? interval : 4000;

        // Guided flow pin naming
        this.guidedPinNaming = global.configuration.get("guidedPinNaming");

        // Set up the AR navigation using the initial scene (weird, but needs to be done)
        global.state.set("AR_NAVIGATOR", this.props.sceneNavigator);

    }

    /**
     * Create all the needed event listeners
     */
    createEventListeners() {

        // Set up AR events
        global.AREvents.subscribe([

            // Scene updates
            {id:this, name: this.GlobalConst.AR_SCENE_STATE_UPDATE, callback:(state) => {
                this.setState(state, () => {
                    global.NodeEvents.emit({name:'AR_UPDATE_NODE_OPTIONS', data: state});
                });
            }},

            // Generic options update
            {id:this, name: "AR_CHANGE_STATE_OPTIONS", callback:(state) => {
                    this.setState(state);
            }}
        ]);

        // Set up button events
        global.ButtonEvents.subscribe([

            // Delete Nodes Event
            {id:this, name: this.GlobalConst.AR_DELETE_ALL_POINTS, callback:(data) => {
                    if (data === "undo") {
                        this.GlobalTracking.undo();
                        this.pointsCollected.pop();
                        this.state.nodeItems.pop();
                        this.lastDropped = null;
                        this.needsRender();
                    }
                    else {
                        this.pointsCollected = [];
                        this.lastDropped = null;
                        this.setState({nodeItems: []});
                        this.needsRender();
                        this.GlobalTracking.clearAll();
                    }

                    EventRegister.emit(this.GlobalConst.AR_UPDATE_HEAT_MAP_ITEMS, null);
                    this.coolDownTimeout();}}
        ]);

        // Change the AR objects based on user selected detail
        this.detailModeListener = EventRegister.addEventListener(this.GlobalConst.AR_DETAILED_TOGGLE, (data) => {
            this.setState({detailedMode: data}, () => {
                global.NodeEvents.emit({name:'AR_UPDATE_NODE_OPTIONS', data: {detailedMode: data}});
            });
        });

        // Toggle the live/manual modes
        this.addPointListener = EventRegister.addEventListener(this.GlobalConst.AR_ADD_POINT, (data) => {
            this.coolDownTimeout();
            this.getLatestSignal(
                this.lastTransform,
                true,
                true,
                this.getTransformInformation(this.lastTransform, this.lastPosition));
               

            this.GlobalTracking.modified = true;
        });

        // Toggle the live/manual modes
        this.toggleLiveListener = EventRegister.addEventListener(this.GlobalConst.AR_TOGGLE_LIVEMODE, (data) => {
            this.setState({liveMode:data});
        });

        // Toggle the live state .. play/pause
        this.pauseLiveListener = EventRegister.addEventListener(this.GlobalConst.AR_PAUSE_LIVEMODE, (data) => {
            this.setState({liveModePaused:data});
        });

        // Update the detailed node options
        this.nodeOptionsListener = EventRegister.addEventListener(this.GlobalConst.AR_NODE_OPTIONS, (data) => {
            this.setState({nodeOptions:data}, () => {
                global.NodeEvents.emit({name:'AR_UPDATE_NODE_OPTIONS', data: {nodeOptions:data}});
            });
        });
    }

    /**
     * Component mounted
     */
    componentDidMount() {

        // Pre-load translations
        this.translation["2.4"] = global.t.get$("TEXT.24");
        this.translation["5.0"] = global.t.get$("TEXT.50");
        //screen timer wake always
        KeepAwake.activate();
        // Create the icons used by the node renderer
        this.setState({icons: [
                this.createWifiIcon(),
                this.createSpeedIcon(),
                this.createInterferenceIcon()
        ]});

        // Load the initial connection details
        this.getConnectionDetails();
        this.getInterference();

        // Set a polling interval for wifi details
        this.wifiNetworkUpdateInterval = setInterval(() => {
            this.updateConnectionDetails();
        }, 2000);
    }

    // View about to unmount
    componentWillUnmount() {

        // Remove timers
        clearInterval(this.wifiNetworkUpdateInterval);

        // Remove listeners
        global.AREvents.remove(this);
        global.ButtonEvents.remove(this);

        EventRegister.removeEventListener(this.detailModeListener);
        EventRegister.removeEventListener(this.addPointListener);
        EventRegister.removeEventListener(this.toggleLiveListener);
        EventRegister.removeEventListener(this.pauseLiveListener);
        EventRegister.removeEventListener(this.nodeOptionsListener);
    }

    /**
     * Prevent the component from rendering if it has already been done
     * @param nextProps
     * @param nextState
     * @returns {boolean}
     */
    shouldComponentUpdate(nextProps, nextState) {
        if (this.needsRendering) {
            this.needsRendering = false;
            return true;
        }
        else {
            return false;
        }
    }

    /**
     * Get the connection details
     */
    getConnectionDetails() {
        // Collect required information
        this.wifi.getSSID((ssid) => {
            if (ssid != null) {
                this.setState({ssid: ssid});
                this.wifi.getBSSID((bssid) => {
                    if (bssid != null) {
                        this.setState({bssid: bssid});
                    }
                });
                this.wifi.getFrequency((freq) => {
                    if (freq != null) {
                        this.setState({freq: freq});
                    }
                    global.AREvents.emit({name: global.const.AR_WIFI_DETAILS_HEADER, data:{
                            name: this.state.ssid,
                            signal: "",
                            color: {color: null},
                            signal_label: "",
                            signal_type: null,
                            bssid: this.state.bssid,
                            freq: this.state.freq ? (this.state.freq < 2500 ? global.t.get("TEXT", "24") : global.t.get("TEXT", "50")) : ""
                        }});
                });
            }
        });
    }

    /**
     * Get the connection details
     */
    updateConnectionDetails() {

        // Collect required information
        this.wifi.getSSID((ssid) => {
            if (ssid != null) {
                this.setState({ssid: ssid});
                this.wifi.getBSSID((bssid) => {
                    if (bssid != null) {
                        this.setState({bssid: bssid});
                    }
                });
                this.wifi.getFrequency((freq) => {
                    if (freq != null) {
                        this.setState({freq: freq});
                    }
                });
            }
        });
    }


    /**
     * Load the drop point configuration
     */
    loadPointConfiguration() {
        let pointConfiguration = global.configuration.get("AR");

        // Configure the points
        if (pointConfiguration.points != null) {
            if (global.configuration.typeOf(pointConfiguration.points.position) === 'array' && pointConfiguration.points.position.length === 3) {
                this.configuration.points.position = pointConfiguration.points.position;
            }

            if (global.configuration.typeOf(pointConfiguration.points.y_offset) === "number") {
                this.configuration.points.y_offset = pointConfiguration.points.y_offset;
            }

            if (global.configuration.typeOf(pointConfiguration.points.reOrderDistance) === "number") {
                this.configuration.points.reOrderDistance = pointConfiguration.points.reOrderDistance;
            }
        }
    }

    /**
     * AR Initialized
     * @param state
     * @private
     */
    onInitialized(state,reason) {
        if (state === ViroConstants.TRACKING_NORMAL) {
            this.tracking = true;
            this.setState({
                tracking: global.const.AR_TRACKING_TYPE_NORMAL, needsRender:true
            });
            global.AREvents.emit({name:global.const.OPTIMIZATION_TIPS, data:''});
            // AR is tracking
            global.AREvents.emit({name:global.const.AR_TRACKING, data: global.const.AR_TRACKING_TYPE_NORMAL});
        }
        else if (state === ViroConstants.TRACKING_UNAVAILABLE || state === ViroConstants.TRACKING_LIMITED) {
            this.setState({
                tracking: global.const.AR_TRACKING_TYPE_NONE
            });
            global.AREvents.emit({name:global.const.AR_TRACKING, data: global.const.AR_TRACKING_TYPE_NONE});
              if(reason===4){
                global.AREvents.emit({name:global.const.OPTIMIZE_EXECPTION, data: {value:global.t.$.AR.DARK_EXCEPTION,status:true}});
              }
              else if(reason===2){
                global.AREvents.emit({name:global.const.OPTIMIZE_EXECPTION, data: {value:global.t.$.AR.MOVE_EXCEPTION,status:true}});
              }
              else if(reason===3) {
                global.AREvents.emit({name:global.const.OPTIMIZE_EXECPTION, data: {value:global.t.$.AR.SENSOR_EXCEPTION,status:true}});
              }
              else{
                 
                    global.AREvents.emit({name:global.const.OPTIMIZE_EXECPTION, data: {value:global.t.$.AR.CALIBRATING,status:true}});
        
              }
            // AR is not tracking

           // global.AREvents.emit({name:global.const.AR_TRACKING, data: global.const.AR_TRACKING_TYPE_NONE});
        }
    }


    /**
     * AR transform updates
     * @param transform
     * @private
     */
    onTransformed(transform) {

        global.tracking.moving = (distance(transform, this.lastTransform) > 0) ? 1 : 0
        //if (this.wifi_animated_icon == null) return;

        // Check the rendering order and
        // update the latest transform
        this.checkLatestTransform(transform);
        this.GlobalTracking.current = transform.cameraTransform.position;
        //global.tracking.currentCamera = transform.cameraTransform;

        // Update the signal strength information
        if (!this.ssUpdated) {
            this.ssUpdated = true;
            this.wifi.getCurrentSignalStrength((level) => {
                let currentSignal = this.getSignalStyle(level);
                global.AREvents.emit({name:this.GlobalConst.AR_WIFI_DETAILS_HEADER, data:{
                        name: this.state.ssid,
                        signal: level.toString(),
                        color: currentSignal,
                        signal_label: currentSignal.label,
                        signal_type: currentSignal.image,
                        bssid: this.state.bssid,
                        freq: this.state.freq ? (this.state.freq < 2500 ? global.t.get("TEXT", "24") : global.t.get("TEXT", "50")) : ""
                    }});

                this.setState({lastSignal: level.toString()});

                // Get latest link speed
                this.wifi.getLinkSpeed((speed) => {
                    this.setState({linkSpeed: speed.toString()});
                    EventRegister.emit(this.GlobalConst.AR_WIFI_LINK_SPEED, speed);
                });

                // Launch timer to wait for next request
                this.clearSSUpdate();
            });
        }

        // Get latest points when transform changes
        if ((!this.lock && !this.cool) && (this.state.liveMode && !this.state.liveModePaused)) {

            // Lock process
            this.lock = true;
            this.cool = true;

            // Grab transform information based on the current location
            let currentTransform = transform;
            let transformInformation = new Transforms(currentTransform, this.lastPosition);

            // Show the point in the AR view
            let showPoint = this.pointsCollected.length > 0;
            let foundPoint = false;

            // Grab a copy of the array
            let pointsCollected = this.pointsCollected.slice(0).reverse();
            let x = Number(this.configuration.points.position[0]);
            let y = Number(this.configuration.points.position[1]);
            let z = Number(this.configuration.points.position[2]);
            transformInformation.thresholds = [x, y, z];


            // Check the collected points
            for (let i=0; i<pointsCollected.length;i++) {
                let collectedPoint = pointsCollected[i].position;

                // Check to see if the position is already taken
                if (this.pointCollected(transformInformation.position, collectedPoint,  transformInformation.thresholds)) {
                    this.coolDownTimeout();
                    this.lock = false;
                    foundPoint = true;

                    break;
                }
            }

            // A point was not found, add a new one
            if (!foundPoint) {
                this.getLatestSignal(currentTransform, false, showPoint, transformInformation);
            }

            this.lock = false;
        }
    }

    /**
     * Create and return transform information
     * @param transform
     * @param location
     * @param style
     * @returns {Transforms}
     */
    getTransformInformation(transform, location = null, style = null) {

        // Grab transform information based on the current location
        let transformInformation = new Transforms(transform, location, style);

        // Get threshold information
        let x = Number(this.configuration.points.position[0]);
        let y = Number(this.configuration.points.position[1]);
        let z = Number(this.configuration.points.position[2]);
        transformInformation.thresholds = [x, y, z];
         
 
        this.GlobalTracking.current = transform.cameraTransform.position;
        this.GlobalTracking.currentCamera = transform.cameraTransform;

        return transformInformation;
    }

    /**
     * Check the latest render order if moving a distance greater than 1
     * @param transform
     */
    checkLatestTransform(transform) {
        if (distance(transform, this.lastTransform) > Number(this.configuration.points.reOrderDistance)) {
            this.updateRenderingOrder(transform.cameraTransform.position);
        }

        this.lastTransform = transform;
    }

    /**
     * Cool down timeout
     */
    coolDownTimeout() {
        clearTimeout(this.coolingID);
        this.coolingID = setTimeout(()=> {
            this.cool = false;
        }, 1000);
    }

    /**
     * Clear the signal strength
     */
    clearSSUpdate() {
        clearTimeout(this.ssUpdateID);
        this.ssUpdateID = setTimeout(()=> {
            this.ssUpdated = false;
        }, this.scanInterval);
    }

    /**
     * Check for stored positions
     * @param currentPosition
     * @param storedPosition
     * @param configuredPosition
     * @returns {boolean}
     */
    pointCollected(currentPosition, storedPosition, configuredPosition) {
        let position = Number(this.calculatePosition(currentPosition, storedPosition)).toFixed(1);
        return (Number(position) === 0 || (Number(position) <= Number(configuredPosition[0])));
    }

    /**
     * AR screen was touched and should toggle the menu items
     */
    onScreenSelected() {
        global.TouchEvents.emit({name:global.const.AR_TOUCH});
        //EventRegister.emit(global.const.AR_MENU_TOGGLE, null);
    }

    /**
     * Allow a new scan of the networks
     */
    clearScan() {
        clearTimeout(this.scanningID);
        this.scanningID = setTimeout(()=> {
            this.scanned = false;
        }, 5000);
    }

    /**
     * Get the latest information to populate the AR objects
     * @param transform
     * @param clicked
     * @param showpoint
     * @param transformInformation
     * @param params
     */
    getLatestSignal(transform, clicked=false, showpoint=true, transformInformation=null, params={highlight:false, type:"wifi", signal:null, mapCoords:[]}) {

        // Added inserted positioning data
        let iParams = params ? params : {highlight:false, type:"wifi", signal:null, mapCoords:[]};
        if (global.state.ARMode === global.const.AR_WORKFLOW_MODE) {
            global.system.Pins.change("signal");
        }

        if (iParams.signal == null) {

            // Scan for interference
            if (!this.scanned) {
                this.scanned = true;
                this.getInterference();
            }

            // Collect required information
            this.wifi.getSSID((ssid) => {
                this.setState({ssid: ssid});
                this.wifi.getBSSID((bssid) => {
                    if (bssid != null) {
                        this.setState({bssid: bssid});
                    }
                });
                this.wifi.getFrequency((freq) => {
                    if (freq != null) {
                        this.setState({freq: freq});
                    }
                });

            });
        }

            try {
                let pointType = global.system.Pins.get.name;

                // Update the last geolocation from tracking
                this.lastPosition = this.GlobalTracking.location;

                // Adjust the location of the node's Y axis
                if (transform) transform.cameraTransform.position[1] -= Number(this.configuration.points.y_offset);
                transform.cameraTransform.position[1] += 2;

            // Get the node style information
            let node = this.getSignalStyle(Number(iParams.signal ? iParams.signal : this.state.lastSignal));
            let ID = global.functions.generateGuid();

                // Generate some child keys for the child elements
                let children_keys = [];
                for (let i=0;i<5;i++) {
                    children_keys.push(global.functions.generateGuid());
                }

                let pin = global.system.Pins.get;
                if((global.state.ARMode === global.const.AR_WORKFLOW_MODE && this.state.nodeItems.length === 0) || (iParams.type && iParams.type === "router")) {
                    pointType = "router";
                    node.material = ["simple_bg_router"];
                }

                // Populate the nodeInformation object
                let collectedInformation = {
                    updateTime: ((this.state.nodeItems.length+1)*100)+(this.state.nodeItems.length+1)+300,
                    key_value: ID,
                    nodeOptions: this.state.nodeOptions,
                    detailedMode: this.state.detailedMode,
                    pinNaming: global.state.ARMode === global.const.AR_WORKFLOW_MODE ? this.guidedPinNaming : this.state.locationPinNaming,
                    level: this.state.lastSignal,
                    freq: this.state.freq ? (this.state.freq < 2500 ? this.translation["2.4"] : this.translation["5.0"]) : "",
                    ssid: this.state.ssid ? this.state.ssid.toString() : "",
                    bssid: this.state.bssid ? this.state.bssid.toString() : "",
                    percent: this.convertSignalToPercent(this.state.lastSignal).toString(),
                    linkspeed: this.state.linkSpeed,
                    interference: this.state.lastInterference,
                    position: transform.cameraTransform.position,
                    camera: transform.cameraTransform,
                    pinType: pin,
                    pointType: pointType,
                    show: showpoint,
                    node: node,
                    child_keys: children_keys,
                    marker: this.GlobalTracking.heatmapNode,
                    highlight: false
                };
                let nodeInformation = Object.assign({}, node, collectedInformation);

            // Push the node object to the array
            this.setState({
                nodeItems: [...this.state.nodeItems,{key: ID, order: -1, details: nodeInformation, node:
                    global.state.ARMode === global.const.AR_WORKFLOW_MODE ?
                        <SimpleNode index={this.state.nodeItems.length} key={global.functions.generateGuid()} keyIndex={ID} controller={this} wifiNode={nodeInformation} link {...this.props}/> :
                        <Node index={this.state.nodeItems.length} key={global.functions.generateGuid()} keyIndex={ID} controller={this}
                    wifiNode={nodeInformation} link {...this.props}/>}], needsRender: true
            });

            // Update the rendering order
            this.updateRenderingOrder(transform.cameraTransform.position);

            // Update the header
            EventRegister.emit(global.const.AR_WIFI_DETAILS_HEADER_UPDATE, this.state.lastSignal);

                // Update the global map item positioning for the mapping
                if (transformInformation) {
                    transformInformation.ID = ID;
                    transformInformation.heatmapCoords = this.GlobalTracking.heatmapNode;
                    transformInformation.style = nodeInformation.color;
                    transformInformation.pathStyle = nodeInformation.pathColor;
                    let maximumPins=global.configuration.get("maximumPins");
                    if(this.pointsCollected.length<maximumPins){
                        this.pointsCollected.push(transformInformation);
                        let allNodes = global.tracking.allNodeData;
                        allNodes.push({time: global.functions.getCurrentTimeStamp(), data: nodeInformation, transform: transformInformation});
                        global.tracking.allNodeData = allNodes;

                    }
                    this.GlobalTracking.mapItems = this.pointsCollected.slice(0);
                }

                this.setState({nodeItems: this.state.nodeItems.concat({key: ID, order: -1, details: nodeInformation, node:
                            global.state.ARMode === global.const.AR_WORKFLOW_MODE ?
                                <SimpleNode index={this.state.nodeItems.length} key={global.functions.generateGuid()} keyIndex={ID} controller={this} wifiNode={nodeInformation} link {...this.props}/> :
                                <Node index={this.state.nodeItems.length} key={global.functions.generateGuid()} keyIndex={ID} controller={this}
                                      wifiNode={nodeInformation} link {...this.props}/>})}, () => {
                    EventRegister.emit(this.GlobalConst.AR_UPDATE_HEAT_MAP_ITEMS);
                    this.needsRender();
                });
                // Cool down the manager
                this.coolDownTimeout();
            }
            catch(error) {this.coolDownTimeout();}
    }

    /**
     * Update the rendering order for the nodes
     */
    updateRenderingOrder(currentPosition) {
        this.state.nodeItems.map((nodeObject) => {
            global.NodeEvents.emit({name:global.const.AR_NODE_UPDATE_RENDERORDER, data:{value:nodeObject.key, position:currentPosition}});
        });
    }

    /**
     * Calculate the difference between 2 Vector points
     * @param currentPosition
     * @param storedPosition
     * @returns {number}
     */
    calculatePosition(currentPosition, storedPosition) {
        try {
            return distance(currentPosition, storedPosition);
        }
        catch(err) {
            return -1;
        }
    }
/**
     * Get the latest interference results
     */
     degrees_to_radians(degrees)
    {
      var pi = Math.PI;
      return degrees * (pi/180);
    }
    /**
     * Get the latest interference results
     */
    getInterference() {
        if (this.pointsCollected.length > 0 || this.state.lastInterference.value === -1) {
            this.wifi.loadWifiList((list) => {
                this.setState({wifiList: list});

                let co_count = this.getCoChannels();
                let aj_count = this.getAJChannels();

                let lowFrequency = this.state.freq < 2500;
                if (!lowFrequency) {
                    co_count = co_count + aj_count;
                    aj_count = 0;
                }

                // Store information to local state
                this.setState({coChannelCount: co_count});
                this.setState({ajChannelCount: aj_count});

                // Create object
                let interferenceData = {
                    value: 0,
                    type: 0,
                    label: global.t.get('TEXT','EXCELLENT'),
                    style: {color: "lightgreen"}
                };

                // Combine interference counts
                let total_interference = co_count + aj_count;
                interferenceData.value = total_interference;
                if (total_interference >= 10) {
                    interferenceData.type = 2;
                    interferenceData.label = global.t.get('TEXT','POOR');
                    interferenceData.style = {color: "red"};
                }
                else if (total_interference >= 4) {
                    interferenceData.type = 1;
                    interferenceData.label = global.t.get('TEXT','GOOD');
                    interferenceData.style = {color: "yellow"};
                }

                // Update the top menu
                EventRegister.emit(global.const.AR_WIFI_INTERFERENCE, interferenceData);
                this.setState({lastInterference: interferenceData});

                // Start timeout
                this.clearScan();
            });
        }
    }

    /**
     * Get the co-channel count
     * @returns {number}
     */
    getCoChannels() {
        let co_count = 0;

        for (let i = 0; i < this.state.wifiList.length; i++) {
            let network = this.state.wifiList[i];
            if (network.SSID !== this.state.ssid && network.frequency === this.state.freq) {
                co_count++;
            }
        }
        return co_count;
    }

    /**
     * Get the adjacent channel count
     * @returns {number}
     */
    getAJChannels() {
        let aj_count = 0;

        let lowFrequency = this.state.freq < 2500;
        for (let i=0;i<this.state.wifiList.length;i++) {
            let network = this.state.wifiList[i];


            if (network.SSID !== this.state.ssid) {
                let channelWidth = 0;
                switch(network.channelWidth) {
                    case 1: {
                        channelWidth = 20;
                        break;
                    }
                    case 2: {
                        channelWidth = 40;
                        break;
                    }
                    default: {
                        channelWidth = 10;
                    }
                }

                if (lowFrequency && network.centerFreq0 < 2500) {
                    if (network.centerFreq0 >= (this.state.freq - channelWidth) && network.centerFreq0 <= (this.state.freq + channelWidth)) {
                        aj_count++;
                    }
                }
                else {
                    if (network.frequency >= (this.state.freq - channelWidth) && network.frequency <= (this.state.freq + channelWidth)) {
                        aj_count++;
                    }
                }
            }
        }

        return aj_count;
    }

    /**
     * Get the signal style based on Wifi thresholds
     * @param level
     * @returns {{image: number, color: string, material: string[], style: (signalStyle_Green|{color})}|{image: number, color: string, material: string[], style: (signalStyle_Red|{color})}|{image: number, color: string, material: string[], style: (signalStyle_Yellow|{color})}}
     */
    getSignalStyle(level) {

        let result = this.signalThresholds.getResult(level);
        let pin = global.system.Pins.get;

        switch(result) {
            case global.const.THRESHOLD_CRITICAL:
                return {
                    image: 3,
                    label: global.t.get('TEXT', 'POOR'),
                    iconFile: "poor.png",
                    icon: this.getWifiIcon(3),
                    color: global.state.ARMode === global.const.AR_WORKFLOW_MODE && this.state.nodeItems.length === 0 ? '#2be9ff' : global.system.Pins.getColor(global.const.THRESHOLD_CRITICAL),
                    pathColor: global.system.Pins.getColor(global.const.THRESHOLD_CRITICAL, true),
                    style: styles.signalStyle_Red,
                    hm: 'red',
                    material: global.state.ARMode === global.const.AR_WORKFLOW_MODE ? ["simple_bg_red"] : ["bg_red"],
                    markerMaterial: pin.markerMaterial != null ? pin.markerMaterial : ["simple_bg_red"]
                };
            case global.const.THRESHOLD_MAJOR:
                return {
                    image: 2,
                    label: global.t.get('TEXT', 'FAIR'),
                    iconFile: "good.png",
                    icon: this.getWifiIcon(2),
                    color: global.state.ARMode === global.const.AR_WORKFLOW_MODE && this.state.nodeItems.length === 0 ? '#2be9ff' : global.system.Pins.getColor(global.const.THRESHOLD_MAJOR),
                    pathColor: global.system.Pins.getColor(global.const.THRESHOLD_MAJOR, true),
                    hm: 'yellow',
                    style: styles.signalStyle_Yellow,
                    material: global.state.ARMode === global.const.AR_WORKFLOW_MODE ? ["simple_bg_yellow"] : ["bg_yellow"],
                    markerMaterial: pin.markerMaterial != null ? pin.markerMaterial : ["simple_bg_yellow"]
                };
            case global.const.THRESHOLD_MINOR:
                return {
                    image: 1,
                    label: global.t.get('TEXT', 'GOOD'),
                    iconFile: "ok.png",
                    icon: this.getWifiIcon(1),
                    color: global.state.ARMode === global.const.AR_WORKFLOW_MODE && this.state.nodeItems.length === 0 ? '#2be9ff' : global.system.Pins.getColor(global.const.THRESHOLD_MINOR),
                    pathColor: global.system.Pins.getColor(global.const.THRESHOLD_MINOR, true),
                    hm: 'green',
                    style: styles.signalStyle_Green,
                    material: global.state.ARMode === global.const.AR_WORKFLOW_MODE ? ["simple_bg_green"] : ["bg_green"],
                    markerMaterial: pin.markerMaterial != null ? pin.markerMaterial : ["simple_bg_green"]
                };
            default:
                return {
                    image: 0,
                    label: global.t.get('TEXT','EXCELLENT'),
                    iconFile: "excellent.png",
                    icon: this.getWifiIcon(0),
                    color: global.state.ARMode === global.const.AR_WORKFLOW_MODE && this.state.nodeItems.length === 0 ? '#2be9ff' : global.system.Pins.getColor("excellent"),
                    pathColor: global.system.Pins.getColor("excellent", true),
                    hm: 'lightgreen',
                    style: styles.signalStyle_Excellent,
                    material: global.state.ARMode === global.const.AR_WORKFLOW_MODE ? ["simple_bg_excellent"] : ["bg_excellent"],
                    markerMaterial: pin.markerMaterial != null ? pin.markerMaterial : ["simple_bg_excellent"]
                };
        }
    }

    /**
     * Get the wifi icon that matches the level
     * @param level
     * @returns {*}
     */
    getWifiIcon(level) {

        let iconImage = global.ARimageResources.get('wifi-excellent');
        switch(level) {

            // Red
            case 3: {
                iconImage = global.ARimageResources.get('wifi-poor');
                break;
            }

            // Yellow
            case 2: {
                iconImage = global.ARimageResources.get('wifi-good');
                break;
            }

            // Green
            case 1: {
                iconImage = global.ARimageResources.get('wifi-ok');
                break;
            }
        }
        // Return the image
        return (
            <ViroImage
                renderingOrder={this.state.renderOrder}
                height={0.6}
                width={1}
                style={[styles.image, styles.textStyleImage]}
                source={iconImage}
            />
        )
    }

    /**
     * Create the icon needed for node Wifi icon
     * @returns {*}
     */
    createWifiIcon() {
        return (<ViroImage
            height={0}
            width={0.4}
            style={{
                flex: .7,
                alignItems:'center',
                justifyContent:'center'
            }}
            source={global.ARimageResources.get('wifi-good')}
        />);
    }

    /**
     * Create the icon needed for node Speed icon
     * @returns {*}
     */
    createSpeedIcon() {
        return (<ViroImage
            height={0}
            width={0.4}
            style={{
                flex: .7,
                alignItems:'center',
                justifyContent:'center'
            }}
            source={global.ARimageResources.get('wifi-good')}
        />);
    }

    /**
     * Create the icon needed for node Interference icon
     * @returns {*}
     */
    createInterferenceIcon() {
        return (<ViroImage
            height={0}
            width={0.4}
            style={{
                flex: .7,
                alignItems:'center',
                justifyContent:'center'
            }}
            source={global.ARimageResources.get('wifi-good')}
        />);
    }

    /**
     * Convert a signal strength to percentage
     * @param value
     * @returns {number}
     */
    convertSignalToPercent(value) {
        return global.functions.convertSignalToPercent(value);
    }

    /**
     * Update the rendering
     */
    needsRender() {
        if (!this.needsRendering) {
            this.needsRendering = true;
        }
    }

    /**
     * Main renderer
     * @returns {*}
     */
    render() {
        return (
            <ViroARScene onClick={this.onScreenSelected} onTrackingUpdated={this.onInitialized} onCameraTransformUpdate={this.onTransformed}>
                <>{this.state.nodeItems.map(item => item.node)}</>
            </ViroARScene>
        );
    }
}

// Load AR Styles
const styles = new Style().get();
module.exports = Scene;
