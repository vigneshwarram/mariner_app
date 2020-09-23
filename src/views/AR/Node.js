/**
 * AR Node Renderer
 */

import React from 'react';
import {ViroFlexView, ViroImage, ViroNode, ViroText} from 'react-viro';

// Import the style
import Style from '../../styles/views/arscene';
const distance = require('euclidean-distance');

export default class Nodes extends React.Component {

    BreakException = {};

    needsUpdate = true;
    updateTime = 1000;
    animationDone = false;

    nodeTopper;

    // Local state
    state = {
        trackingMethod: "tracking",
        needsUpdate: true,
        key: 0,
        location: "",
        renderOrder: -1,
        position: [0,0,0],
        wifiNode: null,
        wifiNodeReady: false,
        icons: [],
        detailedMode: true,
        nodeOptions: {},
        topper: null
    };

    /**
     * Construct the wifi node object
     */
    constructor(props) {
        super(props);

        // Details have not been loaded
        this.wifiLoaded = false;

        // Node selection
        this.selectNode = this.selectNode.bind(this);
        this.getWifiMaterial(this.props.wifiNode);
        this.props.wifiNode.show = false;

        global.NodeEvents.subscribe([

            // Reordering events
            {id:this.props.wifiNode.key_value, name: global.const.AR_NODE_UPDATE_RENDERORDER, callback: (key) => {
                    if (key.value === this.state.key) {
                        let renderingOrder = Number(Number(distance(key.position, this.state.position)).toFixed(0))+1;
                        this.setState({renderOrder: renderingOrder}, () => {
                            //this.updateNode();
                        });}}},

            // Node updates
            {id: this.props.wifiNode.key_value, name: global.const.AR_NODE_UPDATE, callback: (id) => {
                    if (id === null || id === this.props.wifiNode.key_value) {
                        if (id != null) { this.loadPinDetails(); }
                        else {
                            this.updateNode();
                        }
                    }}},

            // Node settings
            {id: this.props.wifiNode.key_value, name: 'AR_UPDATE_NODE_OPTIONS', callback: (data) => {
                    if (data) {
                        this.setState(data, () => {
                            //this.updateNode();
                        });
                    }}}
        ]);

    }

    // Should the node update
    shouldComponentUpdate(nextProps, nextState) {
        if (this.needsUpdate) {
            this.needsUpdate = false;
            return true;
        }
        return false;
    }

    // Component mounted
    componentDidMount(){

        this.updateTime = this.props.wifiNode.updateTime;

        // Get the wifiNode that was created
        let wifiNode = this.props.wifiNode;
        wifiNode["ssid_label"] = global.t.translate("   {0} ({1})", [this.props.wifiNode.ssid, this.props.wifiNode.freq]);
        wifiNode["bssid_label"] = global.t.translate("   {0}", [this.props.wifiNode.bssid]);

        // Set the node up
        this.setState({
            key: this.props.wifiNode.key_value,
            wifiNode: wifiNode,
            position: wifiNode.position
        }, () => {
            if (this.props.wifiNode.pinNaming) {
                this.selectNode();
            }
            else {
                this.setupNode();

                if (!this.animationDone) {
                    setTimeout(() => {
                        this.animationDone = true;
                    }, 1000);
                }
            }
        });
    }

    /**
     * Set the node states
     */
    setupNode() {
        this.state.wifiNode.show = true;

        // Set the node up
        this.setState({
            icons: this.props.controller.state.icons,
            nodeOptions: this.props.wifiNode.nodeOptions,
            detailedMode: this.props.wifiNode.detailedMode,
            wifiNodeReady:true

        });
        this.forceUpdate();
    }

    // Update the node
    updateNode() {
        this.needsUpdate = true;
    }

    // Component unmount
    componentWillUnmount() {

        // Remove event listener
        global.NodeEvents.remove(this.state.key);
    }

    /**
     * Load the pin details
     */
    loadPinDetails() {
        let mapItems = global.tracking.mapItems;
        try {
            mapItems.forEach((item) => {
                if (item.ID === this.props.wifiNode.key_value) {
                    if (item.location != null && item.location.length > 0) {
                        this.setState({location: item.location[0].label === "Other" ? item.location[0].text : item.location[0].label}, () => {
                            this.setupNode();

                            if (!this.animationDone) {
                                setTimeout(() => {
                                    this.animationDone = true;
                                }, 1000);
                            }
                        });
                    }
                    else {
                        this.setupNode();

                        if (!this.animationDone) {
                            setTimeout(() => {
                                this.animationDone = true;
                            }, 1000);
                        }
                    }
                    throw this.BreakException;
                }
            });
        }
        catch (e) {
            if (e !== this.BreakException) throw e;
        }
    }

    /**
     * Select node
     */
    selectNode() {
        global.Events.emit({name:global.const.SELECTOR, data: {id: this.state.key}});
    }

    /**
     * Get the material for the topper
     * @param node
     * @returns {*}
     */
    getWifiMaterial(node) {

        let iconImage = ['wifi_excellent'];

        if (node.pinType != null && node.pinType.marker != null)
            switch(node.pointType) {

                case 'router': {
                    iconImage = ['wifi_router'];
                    break;
                }

                case 'mesh': {
                    iconImage = ['wifi_mesh'];
                    break;
                }

                case 'tv': {
                    iconImage = ['wifi_tv'];
                    break;
                }
            }
        else {
            switch (node.image) {

                // Red
                case 3: {
                    iconImage = ['wifi_poor'];
                    break;
                }

                // Yellow
                case 2: {
                    iconImage = ['wifi_good'];
                    break;
                }

                // Green
                case 1: {
                    iconImage = ['wifi_ok'];
                    break;
                }
            }
        }

        if (Platform.OS === "android") {
            this.nodeTopper =
                <ViroFlexView height={2.2} width={1}
                              style={{paddingBottom: 2.5}}>
                    <ViroFlexView
                        height={0.6}
                        width={1}
                        style={[styles.image, styles.textStyleImage]}
                        materials={iconImage}
                    />
                </ViroFlexView>;
        }
        else {
            this.nodeTopper =
                <ViroFlexView
                    height={0.6}
                    width={1}
                    style={[styles.image, styles.textStyleImage, {marginRight: 0.5}]}
                    materials={iconImage}
                />;
        }
    }

    /**
     * Render the object
     * @returns {*}
     */
    render() {
        if (this.state.wifiNode && this.state.wifiNode.show) {
            let nodeName = [];

            if (!this.props.controller.state.detailedMode) {
                if (this.state.location != null && this.state.location !== "") {
                    nodeName.push(<ViroFlexView
                        key={this.state.wifiNode.child_keys[2]}
                        style={{
                            flex: 1,
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            paddingBottom: 1

                        }}
                    >
                        <ViroText
                            outerStroke={{type: "Outline", width: 1, color: '#000000'}}
                            key={this.state.wifiNode.child_keys[3]}
                            textClipMode="None"
                            text={this.state.location}
                            style={{
                                flex: .2,
                                fontFamily: 'Roboto',
                                fontSize: 12,
                                color: '#ffffff',
                                textAlignVertical: 'right',
                                textAlign: 'center',
                                fontWeight: '400',
                                paddingBottom: .25
                            }}
                        /></ViroFlexView>);
                }
                return (
                    <ViroNode onClick={this.selectNode} key={global.functions.generateGuid()} style={{backgroundColor: 'transparent'}}
                              opacity={this.state.wifiNode.show && this.state.wifiNodeReady ? 0.9 : 0} position={this.state.position}
                              transformBehaviors={["billboardY"]} renderingOrder={this.state.renderOrder} animation={!this.animationDone ? {name:'jumpAndLand', run:true} : {name:'stay', run:true}}
                    >
                        <ViroFlexView opacity={0.95} renderingOrder={this.state.renderOrder}
                                      materials={this.state.wifiNode.markerMaterial}
                                      height={1}
                                      width={0.7}
                                      style={styles.cardBorder}>
                            {nodeName}
                        </ViroFlexView>
                    </ViroNode>);
            }
            else {
                if (Platform.OS === 'android') {
                    let nodeObject = [];

                    // Adjust the flex box width based and font size on detailed options
                    let nodeFlexWidth = 1;
                    let nodeFontSize = 32;
                    let nodeLabelFontSize = 16;
                    if ((this.state.nodeOptions.speed &&
                        this.state.nodeOptions.interference)) {
                        nodeFlexWidth = 0.5;
                        nodeFontSize = 18;
                        nodeLabelFontSize = 7;
                    } else if ((this.state.nodeOptions.speed ||
                        this.state.nodeOptions.interference)) {
                        nodeFlexWidth = 0.7;
                        nodeFontSize = 22;
                        nodeLabelFontSize = 12;
                    }

                    // Add the interference
                    if (this.state.nodeOptions.interference) {
                        nodeObject.push(<ViroFlexView
                            key={this.state.wifiNode.child_keys[1]}
                            style={{
                                flexDirection: 'column',
                                flex: nodeFlexWidth,
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}
                        >
                            <ViroText
                                textClipMode="None"
                                outerStroke={{type: "Outline", width: 1, color: '#000000'}}
                                text={this.state.wifiNode.interference ? this.state.wifiNode.interference.value.toString() : "0"}
                                style={{
                                    flex: .3,
                                    fontFamily: 'Roboto',
                                    fontSize: nodeFontSize,
                                    color: '#000000',
                                    textAlignVertical: 'bottom',
                                    textAlign: 'center',
                                    fontWeight: '200',
                                    paddingTop: .15
                                }}
                            />
                            <ViroText
                                textClipMode="None"
                                text={'Networks'}
                                style={{
                                    flex: .1,
                                    fontFamily: 'Roboto',
                                    fontSize: nodeLabelFontSize,
                                    color: '#000000',
                                    textAlignVertical: 'center',
                                    textAlign: 'center',
                                    fontWeight: '400',
                                    paddingTop: .25
                                }}
                            />
                        </ViroFlexView>)
                    }

                    // Add the speed
                    if (this.state.nodeOptions.speed) {
                        nodeObject.push(<ViroFlexView
                            key={this.state.wifiNode.child_keys[2]}
                            style={{
                                flexDirection: 'column',
                                flex: nodeFlexWidth,
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}
                        >

                            <ViroText
                                textClipMode="None"
                                outerStroke={{type: "Outline", width: 1, color: '#000000'}}
                                text={this.state.wifiNode.linkspeed ? this.state.wifiNode.linkspeed.toString() : "0"}
                                style={{
                                    flex: .3,
                                    fontFamily: 'Roboto',
                                    fontSize: nodeFontSize,
                                    color: '#000000',
                                    textAlignVertical: 'bottom',
                                    textAlign: 'center',
                                    fontWeight: '200',
                                    paddingTop: .15
                                }}
                            />
                            <ViroText
                                textClipMode="None"
                                text={'Mbps'}
                                style={{
                                    flex: .1,
                                    fontFamily: 'Roboto',
                                    fontSize: nodeLabelFontSize,
                                    color: '#000000',
                                    textAlignVertical: 'center',
                                    textAlign: 'center',
                                    fontWeight: '400',
                                    paddingTop: .25
                                }}
                            />
                        </ViroFlexView>)
                    }

                    if (this.state.location != null && this.state.location !== "") {
                        nodeName.push(<ViroText
                            outerStroke={{type: "Outline", width: 0.5, color: '#000000'}}
                            key={this.state.wifiNode.child_keys[3]}
                            textClipMode="None"
                            text={this.state.location}
                            style={{
                                flex: .2,
                                fontFamily: 'Roboto',
                                fontSize: 16,
                                color: '#000000',
                                textAlignVertical: 'right',
                                textAlign: 'center',
                                fontWeight: '400',
                                paddingTop: .25
                            }}
                        />);
                    }

                    // Return the built node objects
                    return (
                        <ViroNode key={global.functions.generateGuid()} style={{backgroundColor: 'transparent'}}
                                  opacity={this.state.wifiNode.show && this.state.wifiNodeReady ? 0.9 : 0}
                                  position={this.state.position}
                                  transformBehaviors={["billboardY"]} onClick={this.selectNode}
                                  renderingOrder={this.state.renderOrder}
                                  animation={!this.animationDone ? {name: 'jumpAndLand', run: true} : {
                                      name: 'stay',
                                      run: true
                                  }}
                        >
                            {this.nodeTopper}
                            <ViroFlexView opacity={0.95} renderingOrder={this.state.renderOrder}
                                          materials={this.state.wifiNode.material}
                                          height={1.2}
                                          width={1.3}
                                          style={styles.cardBorder}>

                                <ViroFlexView
                                    style={{
                                        flexDirection: 'column',
                                        flex: 1,
                                        alignItems: 'flex-start',
                                        marginLeft: 10

                                    }}
                                >
                                    <ViroText
                                        textClipMode="None"
                                        outerStroke={{type: "Outline", width: 0.5, color: '#000000'}}
                                        text={this.state.wifiNode.ssid_label}
                                        style={{
                                            flex: .3,
                                            paddingLeft: 3,
                                            marginLeft: .8,
                                            fontFamily: 'Roboto',
                                            fontSize: 9,
                                            color: '#000000',
                                            textAlignVertical: 'top',
                                            textAlign: 'left',
                                            fontWeight: '200',
                                            width: 500,
                                            paddingBottom: .05,
                                        }}
                                    />
                                    <ViroText
                                        textClipMode="None"
                                        outerStroke={{type: "Outline", width: 0.5, color: '#000000'}}
                                        text={this.state.wifiNode.bssid_label}
                                        style={{
                                            flex: .3,
                                            paddingLeft: 3,
                                            marginLeft: .8,
                                            fontFamily: 'Roboto',
                                            fontSize: 9,
                                            color: '#000000',
                                            textAlignVertical: 'top',
                                            textAlign: 'left',
                                            fontWeight: '200',
                                            paddingTop: .25,
                                        }}
                                    />
                                    <ViroFlexView
                                        style={{
                                            marginLeft: -.5,
                                            flexDirection: 'row',
                                            flex: 3,
                                            alignItems: 'center',
                                            justifyContent: 'center'
                                        }}
                                    >
                                        <ViroFlexView
                                            style={{
                                                flexDirection: 'column',
                                                flex: nodeFlexWidth,
                                                alignItems: 'center',
                                                justifyContent: 'center'
                                            }}
                                        >
                                            <ViroText
                                                textClipMode="None"
                                                outerStroke={{type: "Outline", width: 1, color: '#000000'}}
                                                text={this.state.nodeOptions.measurement !== 'dBm' ? this.state.wifiNode.percent + "%" : this.state.wifiNode.level}
                                                style={{
                                                    flex: .3,
                                                    fontFamily: 'Roboto',
                                                    fontSize: nodeFontSize,
                                                    color: '#000000',
                                                    textAlignVertical: 'bottom',
                                                    textAlign: 'center',
                                                    justifyContent: 'center',
                                                    fontWeight: '200',
                                                    paddingTop: .25
                                                }}
                                            />
                                            <ViroText
                                                textClipMode="None"
                                                text={this.state.nodeOptions.measurement !== 'dBm' ? '' : 'dBm'}
                                                style={{
                                                    flex: .1,
                                                    fontFamily: 'Roboto',
                                                    fontSize: nodeLabelFontSize,
                                                    color: '#000000',
                                                    textAlignVertical: 'center',
                                                    textAlign: 'center',
                                                    fontWeight: '400',
                                                    paddingTop: .25,
                                                    justifyContent: 'center',
                                                }}
                                            />
                                        </ViroFlexView>
                                        {nodeObject}
                                    </ViroFlexView>
                                </ViroFlexView>
                                {nodeName}
                            </ViroFlexView>
                        </ViroNode>);
                }
                else {
                    return (this.buildIOS(nodeName));
                }
            }
        }
        else return null;
    }

    /**
     * Build the node details into the object for IOS
     * @returns {*}
     */
    buildIOS(nodeName) {
        let nodeObject = [];

        // Adjust the flex box width based and font size on detailed options
        let nodeFlexWidth = 2;
        let nodeFontSize = 32;
        let nodeLabelFontSize = 16;

        // Set the wifi information
        let ssid = global.t.translate("   {0}", [this.state.wifiNode.ssid]);
        let bssid = global.t.translate("   {0}", [this.state.wifiNode.bssid]);


        if (this.state.location != null && this.state.location !== "") {
            nodeName.push(<ViroText
                outerStroke={{type: "Outline", width: 0.5, color: '#000000'}}
                key={this.state.wifiNode.child_keys[3]}
                textClipMode="None"
                text={this.state.location}
                style={{
                    flex: .3,
                    fontFamily: 'Roboto',
                    fontSize: 16,
                    color: '#000000',
                    textAlignVertical: 'right',
                    textAlign: 'center',
                    fontWeight: '400',
                    width: 2,
                    marginTop: -0.3
                }}
            />);
        }

        // Return the built node objects
        return (
            <ViroNode key={this.state.wifiNode.child_keys[0]} style={{backgroundColor: 'transparent'}} onTouch={this.selectNode}
                      opacity={this.state.wifiNode.show && this.state.wifiNodeReady ? 0.9 : 0} position={this.state.wifiNode.position}
                      transformBehaviors={["billboardY"]} renderingOrder={this.state.renderOrder} animation={{name:'jumpAndLand', run:true}}
            >
                <ViroFlexView style={styles.card} opacity={0.95} renderingOrder={this.state.renderOrder} onClick={this.selectNode}
                >
                    {this.nodeTopper}
                    <ViroFlexView
                        materials={this.state.wifiNode.material}
                        height={1.2}
                        width={1.3}
                        style={styles.cardBorder}>

                        <ViroFlexView
                            style={{
                                flexDirection: 'column',
                                flex: .2,
                                alignItems: 'flex-start'
                            }}
                        >
                            <ViroText
                                textClipMode="None"
                                outerStroke={{type: "Outline", width: 0, color: '#000000'}}
                                text={ssid}
                                style={{
                                    flex: .5,
                                    paddingLeft: .1,
                                    marginLeft: .1,
                                    fontFamily: 'Times',
                                    fontSize: 9,
                                    color: '#000000',
                                    textAlignVertical: 'top',
                                    textAlign: 'left',
                                    width: .2,
                                    fontWeight: '800'
                                }}
                            />
                            <ViroText
                                textClipMode="None"
                                outerStroke={{type: "Outline", width: 0, color: '#000000'}}
                                text={bssid}
                                style={{
                                    flex: .5,
                                    paddingLeft: .1,
                                    marginLeft: .1,
                                    fontFamily: 'Times',
                                    fontSize: 9,
                                    color: '#000000',
                                    textAlignVertical: 'top',
                                    textAlign: 'left',
                                    fontWeight: '800'
                                }}
                            />
                        </ViroFlexView>

                        <ViroFlexView
                            style={{
                                paddingTop: 0.3,
                                flexDirection: 'column',
                                flex: .5,
                                alignItems: 'flex-start'
                            }}
                        >
                            <ViroFlexView
                                style={{
                                    flexDirection: 'row',
                                    flex: 3,
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                }}
                            >
                                <ViroFlexView
                                    style={{
                                        flexDirection: 'column',
                                        flex: nodeFlexWidth,
                                        alignItems: 'center',
                                        justifyContent: 'center'
                                    }}
                                >

                                    <ViroText
                                        textClipMode="None"
                                        outerStroke={{type: "Outline", width: 1, color: '#000000'}}
                                        text={this.props.controller.state.nodeOptions.measurement !== 'dBm' ? this.state.wifiNode.percent + "%" : this.state.wifiNode.level}
                                        style={{
                                            flex: .3,
                                            fontFamily: 'Roboto',
                                            fontSize: nodeFontSize,
                                            color: '#000000',
                                            textAlignVertical: 'bottom',
                                            textAlign: 'center',
                                            fontWeight: '200',
                                            paddingTop: .15
                                        }}
                                    />
                                    <ViroText
                                        textClipMode="None"
                                        text={this.props.controller.state.nodeOptions.measurement !== 'dBm' ? '' : 'dBm'}
                                        style={{
                                            flex: .1,
                                            fontFamily: 'Roboto',
                                            fontSize: nodeLabelFontSize,
                                            color: '#000000',
                                            textAlignVertical: 'center',
                                            textAlign: 'center',
                                            fontWeight: '400',
                                            paddingTop: .25
                                        }}
                                    />
                                </ViroFlexView>
                                {nodeObject}
                            </ViroFlexView>
                        </ViroFlexView>
                    </ViroFlexView>
                    {nodeName}
                </ViroFlexView>
            </ViroNode>);
    }
}
// Load default styles
const styles = new Style().get();
