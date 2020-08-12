/**
 * AR Placements Scene View
 * This renders the placement objects from the optimization service into a scene
 */

import React from "react";
import {Alert} from "react-native";
import {
    ViroARScene,
    ViroConstants,
    ViroMaterials,
    ViroAnimatedImage,
    ViroImage,
    ViroAnimations,
    ViroQuad,
    ViroARPlane,
    ViroAmbientLight,
    ViroParticleEmitter,
    ViroFlexView
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

class PlacementScene extends React.Component {
    // Local state
    state = {
        placementItems: this.getAllPlacements()
    };

    // Constructor
    constructor(props) {
        super(props);
    }

    // View mounted and ready
    componentDidMount(){
       /* {id:this, name: global.const.AR_STOP_PLACEMENT_MODE, callback:(placements) => {
            try {
                this.props.sceneNavigator.replace({scene: InitialScene});
            } catch (e) {
                Alert.alert(
                    "ERROR",
                    e.message,
                    [
                        {text: "ok", onPress: () => {}}
                    ]
                );
            }
        }}*/

    }

    // View about to unmount
    componentWillUnmount() {
    }

    // View has been updated
    componentDidUpdate(){
    }

    // Create the AR Materials needed for the billboard
    /*ViroMaterials.createMaterials({
        bg_excellent: {
            diffuseTexture: require('../../res/AR/background_excellent.png')
        },
        all_rings: {
            diffuseTexture: require('../../res/AR')
        }
    });*/

    /**
     * Creates the array of placement items for this mode
     */
    getAllPlacements() {
        let placements = global.state.get("placementList");
        let formattedPlacementItems = [];
        try {
            let actualPlacements = placements.recommendations[0].placements;
            Alert.alert(
                "Actual Placements?",
                JSON.stringify(placements),
                [
                    {text: 'ok', onPress: () => {}},
                ]
            )
            for(i=0;i<actualPlacements.length;i++) {
                formattedPlacementItems.push(this.getPlacementIcon(actualPlacements[i].type, actualPlacements[i].position));
            }

            EventRegister.emit(global.const.AR_UPDATE_HEAT_MAP_ITEMS);
        } catch (e) {
            Alert.alert(
                "ERROR",
                e.message,
                [
                    {text: 'ok', onPress: () => {}},
                ]
            );
        }
        return formattedPlacementItems;
    }

    /**
    * Get placement marking object
    * @param placement type
    * @returns {*}
    */
    getPlacementIcon(pinType, position) {
       let iconImage = require("../../assets/pins/mesh_point.png");
       let ringsPosition = [position[0]+4, position[1]-0.5, position[2]];
       switch(pinType) {
           case "router": {
               iconImage =  require("../../assets/pins/router_point.png");
           }
       }
       return (
           <ViroFlexView
               style={{flexDirection: "column", alignItems: 'center', justifyContent: 'center'}}
               >

               <ViroImage
                   height={0.5}
                   width={0.5}
                   source={iconImage}
                   position={position}
                   transformBehaviors={"billboardY"}
               />
               <ViroImage
                   height={0.5}
                   width={1.5}
                   source={require("../../assets/images/all-rings.png")}
                   position={position}
                   transformBehaviors={"billboardY"}
               />
           </ViroFlexView>
       )
    }


    // Render view components
    render() {
        console.disableYellowBox = true;
        //const {navigate} = this.props.navigation;

        return (
            <ViroARScene ref="PLACEMENT_AR_SCENE" onClick={this.onScreenSelected} onTrackingUpdated={this.onInitialized} onCameraTransformUpdate={this.onTransformed}>
                {this.state.placementItems}
            </ViroARScene>
        );
    }
}

// Load default styles
const styles = new Style().get();

module.exports = PlacementScene;