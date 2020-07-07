/**
 * AR Node Renderer
 */

import React from 'react';
import {ViroFlexView, ViroImage, ViroNode, ViroText} from 'react-viro';

// Import the style
import Style from '../../styles/base/index';
import {EventRegister} from 'react-native-event-listeners';

const distance = require('euclidean-distance');

export default class Nodes extends React.Component {

    // Local state
    state = {
        needsUpdate: true,
        key: 0,
        location: "",
        renderOrder: -1,
        position: [0,0,0],
        wifiNode: null,
        wifiNodeReady: false,
        icons: []
    };

    /**
     * Construct the wifi node object
     */
    constructor(props) {
        super(props);

        // Details have not been loaded
        this.wifiLoaded = false;

        // Node selection
        this.removeNodeFromArray = this.removeNodeFromArray.bind(this);
        this.selectNode = this.selectNode.bind(this);

    }

    // Should the node update
    shouldComponentUpdate(nextProps, nextState) {
        if (this.state.needsUpdate) {
            this.setState({needsUpdate:false});
            return true;
        }
        return false;
    }

    // Component mounted
    componentDidMount(){

        // Set the node up
        this.setState({
            icons: this.props.controller.state.icons,
            wifiNode: this.props.wifiNode,
            key: this.props.wifiNode.key_value

        });
        this.createDetails();

        global.NodeEvents.subscribe([

            // Reordering events
            {id:this.props.wifiNode.key_value, name: global.const.AR_NODE_UPDATE_RENDERORDER, callback: (key) => {
                    if (key.value === this.state.key) {
                        let renderingOrder = Number(Number(distance(key.position, this.state.position)).toFixed(0))+1;
                        this.setState({renderOrder: renderingOrder, needsUpdate:true});}}},

            {id:this.props.wifiNode.key_value, name: global.const.AR_NODE_UPDATE, callback: () => {
                    this.setState({needsUpdate: true});
                    this.loadPinDetails();
                    this.forceUpdate();}}
        ]);

        this.loadPinDetails();
    }

    // Component unmounting
    componentWillUnmount() {

        // Remove event listener
        global.NodeEvents.remove(this.state.key);
    }

    /**
     * Load the pin details
     */
    loadPinDetails() {
        let mapItems = global.tracking.mapItems;
        for (let i=0;i<mapItems.length;i++) {
            if (mapItems[i].ID === this.props.wifiNode.key_value && mapItems[i].location != null && mapItems[i].location.length > 0) {
                this.setState({location: mapItems[i].location[0].label === "Other" ? mapItems[i].location[0].text : mapItems[i].location[0].label});
                break;
            }
        }
    }


    /**
     * Create the node details
     */
    createDetails() {
        if (!this.wifiLoaded) {
            this.wifiLoaded = true;

            // Get the wifiNode that was created
            let wifiNode = this.props.wifiNode;
            wifiNode["percent"] = this.props.controller.convertSignalToPercent(wifiNode.level).toString();

            // Update the node object
            this.setState({
                wifiNode: wifiNode,
                position: wifiNode.position,
                wifiNodeReady: true});
        }
    }

    /**
     * Remove node from the points array
     */
    removeNodeFromArray(source) {
        EventRegister.emit(global.const.AR_NODE_DELETE, this.props.index);
    }

    /**
     * Select node
     */
    selectNode() {
        global.Events.emit({name:global.const.SELECTOR, data: {id: this.state.key}});
    }

    /**
     * Update the wifi image from the Node
     * @param level
     * @returns {*}
     */
    getWifiIcon(level) {
        let pin = global.system.Pins.get;
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

        if (this.state.wifiNode.pinType != null && this.state.wifiNode.pinType.marker != null)
            iconImage =  this.state.wifiNode.pinType.marker;

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



    // Add a highlight to injected nodes
    highlight() {

        // Return the image
        return (
            <ViroImage
                height={6}
                width={6}
                opacity={0.5}
                position={[0,-1,0]}
                rotation={[0,-90,-90]}
                rotationPivot={[0.4,0,0]}
                source={require("../../assets/images/green_glow.png")}
                animation={{name:'shadedRed', run: true}}
            />
        )
    }

    /**
     * Build the node details into the object
     * @returns {*}
     */
    buildNodeObject() {
        let nodeObject = [];

        // Adjust the flex box width based and font size on detailed options
        let nodeFlexWidth = 1;
        let nodeFontSize = 32;
        let nodeLabelFontSize = 16;
        if (this.props.controller.state.detailedMode &&
            (this.props.controller.state.nodeOptions.speed &&
            this.props.controller.state.nodeOptions.interference)) {
            nodeFlexWidth = 0.5;
            nodeFontSize = 18;
            nodeLabelFontSize = 7;
        }
        else if (this.props.controller.state.detailedMode &&
            (this.props.controller.state.nodeOptions.speed ||
            this.props.controller.state.nodeOptions.interference)) {
            nodeFlexWidth = 0.7;
            nodeFontSize = 22;
            nodeLabelFontSize = 12;
        }

        // Set the wifi information
        let ssid = global.t.translate("   {0} ({1})", [this.state.wifiNode.ssid, this.state.wifiNode.freq]);
        let bssid = global.t.translate("   {0}", [this.state.wifiNode.bssid]);


        // Add the interference
        if (this.props.controller.state.detailedMode && this.props.controller.state.nodeOptions.interference) {
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
        if (this.props.controller.state.detailedMode && this.props.controller.state.nodeOptions.speed) {
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

        // Return the built node objects
        return (
            <ViroNode key={this.state.wifiNode.child_keys[0]} style={{backgroundColor: 'transparent'}}
                      opacity={this.state.wifiNode.show && this.state.wifiNodeReady ? 0.9 : 0} position={this.state.wifiNode.position}
                      transformBehaviors={["billboardY"]} scalePivot={[0,0,0]} renderingOrder={this.state.renderOrder} onClick={this.selectNode}
            >
                <ViroFlexView style={styles.card} opacity={0.95} renderingOrder={this.state.renderOrder}
                >
                    {this.props.controller.state.detailedMode && this.getWifiIcon(this.state.wifiNode.node.image)}
                    <ViroFlexView
                        materials={this.props.controller.state.detailedMode ? this.state.wifiNode.material : this.state.wifiNode.markerMaterial}
                                  height={this.props.controller.state.detailedMode ? 1.2 : 1}
                                  width={this.props.controller.state.detailedMode ? 1.3 : 0.7}
                                  style={styles.cardBorder}>

                        {this.props.controller.state.detailedMode &&
                        <ViroFlexView
                            style={{
                                flexDirection: 'column',
                                flex: .2,
                                alignItems: 'flex-start',
                                marginLeft: 10
                            }}
                        >
                            <ViroText
                                textClipMode="None"
                                outerStroke={{type: "Outline", width: 0, color: '#000000'}}
                                text={ssid}
                                style={{
                                    flex: .5,
                                    paddingLeft: 3,
                                    marginLeft: .8,
                                    fontFamily: 'Times',
                                    fontSize: 9,
                                    color: '#000000',
                                    textAlignVertical: 'top',
                                    textAlign: 'left',
                                    fontWeight: '800'
                                }}
                            />
                            <ViroText
                                textClipMode="None"
                                outerStroke={{type: "Outline", width: 0, color: '#000000'}}
                                text={bssid}
                                style={{
                                    flex: .5,
                                    paddingLeft: 3,
                                    marginLeft: .8,
                                    fontFamily: 'Times',
                                    fontSize: 9,
                                    color: '#000000',
                                    textAlignVertical: 'top',
                                    textAlign: 'left',
                                    fontWeight: '800'
                                }}
                            />
                        </ViroFlexView>}

                        {this.props.controller.state.detailedMode &&
                        <ViroFlexView
                            style={{
                                flexDirection: 'column',
                                flex: .6,
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
                                        text={this.props.controller.state.measurement !== 'dBm' ? this.state.wifiNode.percent + "%" : this.state.wifiNode.level}
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
                                        text={this.props.controller.state.measurement !== 'dBm' ? '' : 'dBm'}
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
                        </ViroFlexView>}
                    </ViroFlexView>
                    <ViroText
                        outerStroke={{type: "Outline", width: 1, color: '#000000'}}
                        key={this.state.wifiNode.child_keys[3]}
                        textClipMode="None"
                        text={this.state.location}
                        style={{
                            flex: .2,
                            fontFamily: 'Roboto',
                            fontSize: 18,
                            color: '#ffffff',
                            textAlignVertical: 'right',
                            textAlign: 'center',
                            fontWeight: '400',
                            paddingTop: .25
                        }}
                    />
                </ViroFlexView>
                {this.state.wifiNode.highlight && this.highlight()}
            </ViroNode>);
    }


    /**
     * Render the object
     * @returns {*}
     */
    render() {
        if (this.state.wifiNode) {
            return (this.buildNodeObject())
        }
        else return null
    }
}
// Load default styles
const styles = new Style().get("ARSCENE");
