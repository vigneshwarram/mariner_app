/**
 * AR Node Renderer
 */

import React from 'react';
import {ViroFlexView, ViroImage, ViroNode, ViroText} from 'react-viro';

// Import the style
import Style from '../../../styles/views/arscene';
const distance = require('euclidean-distance');

export default class SimpleNodes extends React.Component {

    BreakException = {};

    needsUpdate = true;
    animationDone = false;

    // Local state
    state = {
        needsUpdate: true,
        key: 0,
        renderOrder: -1,
        location: "",
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
        this.selectNode = this.selectNode.bind(this);

        // Node selection
        this.selectNode = this.selectNode.bind(this);
        this.props.wifiNode.show = false;

        global.NodeEvents.subscribe([

            {id:this.props.wifiNode.key_value, name: global.const.AR_NODE_UPDATE_RENDERORDER, callback: (key) => {
                    if (key.value === this.state.key) {
                        let renderingOrder = Number(Number(distance(key.position, this.state.position)).toFixed(0))+1;
                        this.setState({renderOrder: renderingOrder, needsUpdate: true});}}},

            {id:this.props.wifiNode.key_value, name: global.const.AR_NODE_UPDATE, callback: (id) => {
                    if (id === null || this.props.wifiNode.key_value === id) {
                        if (id != null) { this.loadPinDetails(); }
                        else {
                            this.forceUpdate();
                        }
                    }}}
        ]);

    }

    // Component mounted
    componentDidMount(){

        let wifiNode = this.props.wifiNode;
        if (wifiNode.camera.forward) {
            wifiNode.position =
                [wifiNode.position[0] + wifiNode.camera.forward[0],
                    wifiNode.position[1],
                    wifiNode.position[2] + wifiNode.camera.forward[2]]
            ;
        }

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
                this.state.wifiNode.show = true;
                this.forceUpdate();

                if (!this.animationDone) {
                    setTimeout(() => {
                        this.animationDone = true;
                    }, 1000);
                }
            }
        });

        // Set the node up
        this.setState({
            icons: this.props.controller.state.icons,
            wifiNodeReady:true

        });
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
        for (let i=0;i<mapItems.length;i++) {
            if (mapItems[i].ID === this.props.wifiNode.key_value && mapItems[i].location != null && mapItems[i].location.length > 0) {
                this.setState({location: mapItems[i].location[0].label === "Other" ? mapItems[i].location[0].text : mapItems[i].location[0].label});
                break;
            }
        }
    }

    // Should the node update
    shouldComponentUpdate(nextProps, nextState) {
        if (this.state.needsUpdate) {
            this.setState({needsUpdate:false});
            return true;
        }
        return false;
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
                            this.state.wifiNode.show = true;
                            this.forceUpdate();

                            if (!this.animationDone) {
                                setTimeout(() => {
                                    this.animationDone = true;
                                }, 1000);
                            }
                        });
                    }
                    else {
                        this.state.wifiNode.show = true;
                        this.forceUpdate();

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
     * Render the object
     * @returns {*}
     */
    render() {
        if (this.state.wifiNode && this.state.wifiNode.show) {
            let nodeName = [];

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
                <ViroNode onTouch={this.selectNode} key={global.functions.generateGuid()} style={{backgroundColor: 'transparent'}}
                          opacity={this.state.wifiNode.show && this.state.wifiNodeReady ? 0.9 : 0} position={this.state.wifiNode.position}
                          transformBehaviors={["billboardY"]} renderingOrder={this.state.renderOrder} animation={!this.animationDone ? {name:'jumpAndLand', run:true} : {name:'stay', run:true}}
                >
                    <ViroFlexView onClick={this.selectNode} opacity={0.95} renderingOrder={this.state.renderOrder}
                                  materials={this.state.wifiNode.material}
                                  height={1}
                                  width={0.7}
                                  style={styles.cardBorder}>
                        {nodeName}
                    </ViroFlexView>
                </ViroNode>);
        }
        else return null
    }
}
// Load default styles
const styles = new Style().get();
