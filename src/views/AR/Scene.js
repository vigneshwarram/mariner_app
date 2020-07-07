/**
 * AR Scene View
 * This renders the AR objects into the Scene
 */

import React from "react";
import {Alert, Platform} from 'react-native';
import {
    ViroARScene,
    ViroConstants,
    ViroMaterials,
    ViroAnimatedImage,
    ViroImage,
    ViroAnimations,
    ViroQuad,
    ViroARPlane,
    ViroAmbientLight
} from 'react-viro';

// AR style sheet
import Style from '../../styles/base/index';

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

class Scene extends React.Component {

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
        measurement: 'dBm',
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

        globalNodeUpdate: false,
        nodeOptions: {
            wifi: true,
            speed: false,
            interference: false
        }
    };

    // Animated icon needed for the nodes
    wifi_animated_icon;

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
        let interval = global.configuration.get("scanDetailsIntervalMs");
        this.scanInterval = interval > 2000 ? interval : 2000;

        // Create the AR Materials needed for the billboard
        ViroMaterials.createMaterials({
            bg_excellent: {
                diffuseTexture: require('../../res/AR/background_excellent.png')
            },
            bg_green: {
                diffuseTexture: require('../../res/AR/background_green.png')
            },
            bg_yellow: {
                diffuseTexture: require('../../res/AR/background_yellow.png')
            },
            bg_red: {
                diffuseTexture: require('../../res/AR/background_red.png')
            },
            simple_bg_router: {
                diffuseTexture: require('../../assets/pins/router_point.png')
            },
            simple_bg_mesh: {
                diffuseTexture: require('../../assets/pins/mesh_point.png')
            },
            simple_bg_tv: {
                diffuseTexture: require('../../assets/pins/tv_point.png')
            },
            simple_bg_excellent: {
                diffuseTexture: require('../../assets/pins/excellent_point.png')
            },
            simple_bg_green: {
                diffuseTexture: require('../../assets/pins/green_point.png')
            },
            simple_bg_yellow: {
                diffuseTexture: require('../../assets/pins/yellow_point.png')
            },
            simple_bg_red: {
                diffuseTexture: require('../../assets/pins/red_point.png')
            }
        });
        ViroAnimations.registerAnimations({
            jump:{properties:{positionY:"+=2"}, easing:"Bounce", duration: 500},
            land:{properties:{positionY:"-=2"}, easing:"Bounce", duration:500},
            shadedYellow:{properties:{color:"#fff33e"}, easing:"Linear", duration:500},
            shadedRed:{properties:{color:"#ff2a21"}, easing:"Linear", duration:500},
            jumpAndLand:[
                ["jump", "land"]
            ]
        });
    }

    /**
     * Create all the needed event listeners
     */
    createEventListeners() {

        // Set up AR events
        global.AREvents.subscribe([

            // Scene updates
            {id:this, name: global.const.AR_SCENE_STATE_UPDATE, callback:(state) => {
                    this.setState(state); global.NodeEvents.emit({name:global.const.AR_NODE_UPDATE});}}
        ]);

        // Set up button events
        global.ButtonEvents.subscribe([

            // Delete Nodes Event
            {id:this, name: global.const.AR_DELETE_ALL_POINTS, callback:(data) => {
                    if (data === "undo") {
                        global.tracking.undo();
                        this.pointsCollected.pop();
                        this.state.nodeItems.pop();
                        this.setState({needsRender: true});
                    }
                    else {
                        this.pointsCollected = [];
                        this.setState({nodeItems: [], needsRender: true});
                        global.tracking.clearAll();
                    }

                    EventRegister.emit(global.const.AR_UPDATE_HEAT_MAP_ITEMS, null);
                    this.coolDownTimeout();}}
        ]);

        // Change the AR objects based on user selected detail
        this.detailModeListener = EventRegister.addEventListener(global.const.AR_DETAILED_TOGGLE, (data) => {
            this.setState({detailedMode: data, needsRender:true});
            global.NodeEvents.emit({name:global.const.AR_NODE_UPDATE});
        });

        // Toggle the live/manual modes
        this.addPointListener = EventRegister.addEventListener(global.const.AR_ADD_POINT, (data) => {
            this.coolDownTimeout();
            this.getLatestSignal(
                this.lastTransform,
                true,
                true,
                this.getTransformInformation(this.lastTransform, this.lastPosition));

            /*let randomNumber = [
                Math.round((Math.random() *30) -40),
                Math.round((Math.random() *10) -10),
                Math.round((Math.random() *20) -20)
            ];
            let randomNumber2 = Math.round((Math.random() *-30) -65);
            this.getLatestSignal({cameraTransform:{position:[randomNumber[0],0,randomNumber[2]]}},
                true,
                true,
                this.getTransformInformation({cameraTransform:{position:[randomNumber[0],0,randomNumber[2]]}}, this.lastPosition),
                {highlight:true, signal:randomNumber2, mapCoords:[]});*/
            global.tracking.modified = true;
        });

        // Toggle the live/manual modes
        this.toggleLiveListener = EventRegister.addEventListener(global.const.AR_TOGGLE_LIVEMODE, (data) => {
            this.setState({liveMode:data});
        });

        // Toggle the live state .. play/pause
        this.pauseLiveListener = EventRegister.addEventListener(global.const.AR_PAUSE_LIVEMODE, (data) => {
            this.setState({liveModePaused:data});
        });

        // Update the detailed node options
        this.nodeOptionsListener = EventRegister.addEventListener(global.const.AR_NODE_OPTIONS, (data) => {
            this.setState({nodeOptions:data, needsRender:true});
            global.NodeEvents.emit({name:global.const.AR_NODE_UPDATE});
        });
    }

    /**
     * Component mounted
     */
    componentDidMount() {

        // Pre-load translations
        this.translation["2.4"] = global.t.get$("TEXT.24");
        this.translation["5.0"] = global.t.get$("TEXT.50");

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
        }, 1000);


        // Register the AR Animated Image properties
        /*ViroAnimations.registerAnimations({
            scale_up:{properties:{positionY:0.4},
                easing:"Bounce",
                duration: 250},
            scale_down:{properties:{positionY:"+=0.1"},
                easing:"Bounce",
                duration: 500},
            bounce_image:[
                ["scale_up", "scale_down"]
            ]
        });*/

        // Create the animated image for the nodes
        this.wifi_animated_icon = this.getAnimatedWifiIcon();
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
        if (!this.state.needsRender) {
            return false;
        }
        else {
            this.setState({needsRender: false});
            return true;
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
    onInitialized(state) {
        if (state === ViroConstants.TRACKING_NORMAL) {
            this.tracking = true;
            this.setState({
                tracking: global.const.AR_TRACKING_TYPE_NORMAL, needsRender:true
            });

            // AR is tracking
            global.AREvents.emit({name:global.const.AR_TRACKING, data: global.const.AR_TRACKING_TYPE_NORMAL});
        }
        else if (state === ViroConstants.TRACKING_UNAVAILABLE) {
            this.setState({
                tracking: global.const.AR_TRACKING_TYPE_NONE
            });

            // AR is not tracking
            global.AREvents.emit({name:global.const.AR_TRACKING, data: global.const.AR_TRACKING_TYPE_NONE});
        }
        else if (state === ViroConstants.TRACKING_LIMITED) {
            this.setState({
                tracking: global.const.AR_TRACKING_TYPE_NONE
            });
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
        global.tracking.current = transform.cameraTransform.position;
        //global.tracking.currentCamera = transform.cameraTransform;

        // Update the signal strength information
        if (!this.ssUpdated) {
            this.ssUpdated = true;
            this.wifi.getCurrentSignalStrength((level) => {
                let currentSignal = this.getSignalStyle(level);
                global.AREvents.emit({name:global.const.AR_WIFI_DETAILS_HEADER, data:{
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
                    EventRegister.emit(global.const.AR_WIFI_LINK_SPEED, speed);
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
            this.lastPosition = global.tracking.location;

            // Adjust the location of the node's Y axis
            if (transform) transform.cameraTransform.position[1] -= Number(this.configuration.points.y_offset);

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
                key_value: ID,
                level: this.state.lastSignal,
                freq: this.state.freq ? (this.state.freq < 2500 ? this.translation["2.4"] : this.translation["5.0"]) : "",
                ssid: this.state.ssid ? this.state.ssid.toString() : "",
                bssid: this.state.bssid ? this.state.bssid.toString() : "",
                percent: this.convertSignalToPercent(iParams.signal ? iParams.signal.toString() : this.state.lastSignal).toString(),
                linkspeed: this.state.linkSpeed,
                interference: this.state.lastInterference,
                position: transform.cameraTransform.position,
                camera: transform.cameraTransform,
                pinType: pin,
                pointType: pointType,
                show: showpoint,
                node: node,
                child_keys: children_keys,
                marker: iParams.mapCoords  && iParams.mapCoords.length >= 1 ? iParams.mapCoords : global.tracking.heatmapNode,
                highlight: iParams.highlight ? iParams.highlight : false
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
                transformInformation.heatmapCoords = iParams.mapCoords  && iParams.mapCoords.length >= 1 ? iParams.mapCoords : global.tracking.heatmapNode;
                transformInformation.style = nodeInformation.color;
                transformInformation.pathStyle = nodeInformation.pathColor;
                this.pointsCollected.push(transformInformation);

                // Send the point information to the tracking global class to be accessed later when upload the work order
                let allNodes = global.tracking.allNodeData;
                allNodes.push({time: global.functions.getCurrentTimeStamp(), data: nodeInformation, transform: transformInformation});
                global.tracking.allNodeData = allNodes;
            }

            // Put the latest map tracking items into the global tracking class
            global.tracking.mapItems = this.pointsCollected.slice(0);
            EventRegister.emit(global.const.AR_UPDATE_HEAT_MAP_ITEMS);

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
     * Get the animated WIFI icon
     * @returns {*}
     */
    getAnimatedWifiIcon() {
        return (
            <ViroAnimatedImage
                height={0.6}
                width={0.8}
                source={require('../../res/animations/wifi_animated_icon_button.gif')}
                animation={{name:'bounce_image',
                    run:true, loop:true}}
            />
        )
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
     * Main renderer
     * @returns {*}
     */
    render() {
        return (
            <ViroARScene ref="AR_SCENE" onClick={this.onScreenSelected} onTrackingUpdated={this.onInitialized} onCameraTransformUpdate={this.onTransformed}>
                {this.state.nodeItems.map((wifiNode) => {
                    return(wifiNode.node)
                })}
            </ViroARScene>
        );
    }
}

// Load AR Styles
const styles = new Style().get("ARSCENE");

module.exports = Scene;
