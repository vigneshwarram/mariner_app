/**
 * AR Placements Scene View
 * This renders the placement objects from the optimization service into a scene
 */

import React from "react";
import {StyleSheet} from "react-native";
import {
    ViroARScene,
    ViroConstants,
    ViroText,
    ViroImage,
    ViroFlexView
} from 'react-viro';

// AR style sheet
import Style from '../../styles/base/index';
import geolocation from '@react-native-community/geolocation';

const distance = require('euclidean-distance');

// Event Listener
import { EventRegister } from 'react-native-event-listeners';

export default class PlacementScene extends React.Component {
    // Local state
    state = {
        placementItems: []
    };

    // Constructor
    constructor(props) {
        super(props);
        this.onTransformed = this.onTransformed.bind(this);
    }

    /**
      * Create all the needed event listeners
      */
    createEventListeners() {

    }

    componentWillUnmount() {
        // Remove listeners
        global.AREvents.remove(this);
    }

    // View mounted and ready
    componentDidMount(){
       this.createEventListeners();
       new Style().get("PLACEMENTSCENE", (style) => {
           styles = style;
           this.setState({placementItems: this.getAllPlacements()}, () => {
                this.forceUpdate();
           });
       });
    }


    // View has been updated
    componentDidUpdate(){
    }

    /**
     * Creates the array of placement items for this mode
     */

     getAllPlacements() {
        let placements = this.props.data;
        let formattedPlacementItems = [];

        let actualPlacements = [];

        if(placements && placements.recommendations && placements.recommendations.length > 0) {
            actualPlacements = placements.recommendations[0].placements;
        }
        for(i=0;i<actualPlacements.length;i++) {
            formattedPlacementItems.push(this.getPlacementIcon(actualPlacements[i].type, actualPlacements[i].position, i, actualPlacements.length, placements.recommendations[0].algorithm));
        }
        EventRegister.emit(global.const.AR_UPDATE_HEAT_MAP_ITEMS);
        return formattedPlacementItems;
    }

    /**
    * Get placement marking object
    * @param placement type
    * @returns {*}
    */
    getPlacementIcon(pinType, position, number, total, algorithmType) {
       console.log("pin type: " + pinType);
       console.log("algorithm type " + algorithmType)
       let nodeText = "";
       if(algorithmType === "gatewayOnly") {
            if(pinType === "router") {
                nodeText = "Your router should be placed as close to this area as possible for optimal WiFi coverage";
            }
            else {
                nodeText = "";
            }
       }
       else if(algorithmType === "addPodsOnly") {
            if(pinType === "router") {
                nodeText = "You will need to wire mesh pod 1 of " + total + " to your router here";
            }
            else if(pinType === "mesh") {
                nodeText = "Mesh device " + (number + 1) + " of " + total + " should be placed as close to this area as possible for optimal WiFi coverage";
            }
            else {
                nodeText = "";
            }
       }
       else {
            nodeText = "";
       }

       return (
           <ViroFlexView key={global.functions.generateGuid()}
               style={styles.nodeFlexViewTop}
               position={position}>
               <ViroFlexView  transformBehaviors={"billboardY"}  height={1.0}  style={styles.nodeFlexViewMid}
                       width={1.5} backgroundColor={styles.background.backgroundColor}>
                   <ViroFlexView  style={styles.nodeFlexViewBottom} >
            	       <ViroText
                        style={styles.nodeText}
            		    text={nodeText}
            		    fontSize={12} />
                   </ViroFlexView>
               </ViroFlexView>

               <ViroImage
                   height={0.5}
                   width={1.5}
                   source={require("../../assets/images/all-rings.png")}
                   transformBehaviors={"billboardY"}
               />
           </ViroFlexView>
       )
    }

    onTransformed(transform){
        const {position}=transform;
        const {rotation}=transform
        let p1={
            x:rotation[0],
            y:rotation[1],
            z:rotation[2],
        }
        let rotations= this.calcAngleDegrees(p1)
        let distance=this.calculatePosition(position)

        global.AREvents.emit({name:global.const.AR_DISTACE_UPDATING, data: {distance:distance,rotations:rotations}});

    }

    calcAngleDegrees(p1) {
        let rotationArray=[]
        let placements = this.props.data;
        if (placements.recommendations && placements.recommendations.length > 0) {
            let actualPlacements = placements.recommendations[0].placements;
            actualPlacements.map((item, index) => {
                let angleDeg = Math.atan2(p1.y - item.position[2], p1.x - item.position[0]) * 360 / Math.PI;
                let total = angleDeg + 'deg'
                rotationArray.push(total)
            });
        }

        return rotationArray;
    }

    /**
     * Calculate the difference between 2 Vector points
     * @param currentPosition
     * @param storedPosition
     * @returns {number}
     */
    calculatePosition(currentPosition) {
        let distanceArray=[]
        let placements = this.props.data;

        if (placements.recommendations && placements.recommendations.length > 0) {
            let actualPlacements = placements.recommendations[0].placements;
            actualPlacements.map((item, index) => {
                try {
                    distanceArray.push(distance(currentPosition, [item.position[0], item.position[1], item.position[2]]));
                } catch (err) {
                    return -1;
                }
            })
        }
        return distanceArray;
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
        }
        else if (state === ViroConstants.TRACKING_LIMITED) {
            this.setState({
                tracking: global.const.AR_TRACKING_TYPE_NONE
            });
        }
    }
    // Render view components
    render() {
        console.disableYellowBox = true;

        return (
            <ViroARScene ref="PLACEMENT_AR_SCENE" onTrackingUpdated={(state)=>this.onInitialized(state)}   onCameraTransformUpdate={this.onTransformed}>
                  {this.state.placementItems}
            </ViroARScene>
        );
    }
}

// Load placement scene styles
let styles = new Style().get();
//export
module.exports = PlacementScene;
