/**
 * AR Node Renderer
 */

import React from 'react';
import {ViroFlexView, ViroImage, ViroNode} from 'react-viro';

// Import the style
import Style from '../../../styles/views/arscene';
import {EventRegister} from 'react-native-event-listeners';

const distance = require('euclidean-distance');

export default class SimpleNodes extends React.Component {

    // Local state
    state = {
        needsUpdate: true,
        key: 0,
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

            {id:this.props.wifiNode.key_value, name: global.const.AR_NODE_UPDATE_RENDERORDER, callback: (key) => {
                    if (key.value === this.state.key) {
                        let renderingOrder = Number(Number(distance(key.position, this.state.position)).toFixed(0))+1;
                        this.setState({renderOrder: renderingOrder, needsUpdate: true});}}},

            {id:this.props.wifiNode.key_value, name: global.const.AR_NODE_UPDATE, callback: () => {
                    this.setState({needsUpdate: true});
                    this.forceUpdate();}}
        ]);
    }

    // Component unmounting
    componentWillUnmount() {

        // Remove event listener
        global.NodeEvents.remove(this.state.key);
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
     * Create the node details
     */
    createDetails() {
        if (!this.wifiLoaded) {
            this.wifiLoaded = true;

            // Get the wifiNode that was created
            let wifiNode = this.props.wifiNode;
            //alert(JSON.stringify(wifiNode.camera.forward));
            //wifiNode.position[1] = 0;
            if (wifiNode.camera.forward) {
                wifiNode.position =
                    [wifiNode.position[0] + wifiNode.camera.forward[0],
                        wifiNode.position[1],
                        wifiNode.position[2] + wifiNode.camera.forward[2]]
                ;
            }
            wifiNode["percent"] = this.props.controller.convertSignalToPercent(wifiNode.level).toString();

            // Update the node object
            this.setState({
                wifiNode: wifiNode,
                position: wifiNode.position,
                wifiNodeReady: true});
        }
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
                source={require("../../../assets/images/green_glow.png")}
                animation={{name:'shadedRed', run: true}}
            />
        )
    }

    /**
     * Build the node details into the object
     * @returns {*}
     */
    buildNodeObject() {

        // Return the built node objects
        return (
            <ViroNode key={this.state.wifiNode.child_keys[0]} style={{backgroundColor: 'transparent'}}
                      opacity={this.state.wifiNode.show && this.state.wifiNodeReady ? 0.9 : 0} position={this.state.wifiNode.position}
                      transformBehaviors={["billboardY"]} renderingOrder={this.state.renderOrder} animation={{name:'jumpAndLand', run:true}}
            >
                <ViroFlexView opacity={0.95} renderingOrder={this.state.renderOrder}
                    materials={this.state.wifiNode.material}
                    height={1}
                    width={0.7}
                    style={styles.cardBorder}>
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
const styles = new Style().get();
