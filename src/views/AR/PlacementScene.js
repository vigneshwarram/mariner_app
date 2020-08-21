/**
 * AR Placements Scene View
 * This renders the placement objects from the optimization service into a scene
 */

import React from "react";
import {Alert,StyleSheet} from "react-native";
import {
    ViroARScene,
    ViroConstants,
    ViroMaterials,
    ViroText,
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
import geolocation from '@react-native-community/geolocation';
let Initialscene = require('./Scene');
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
        this.onTransformed = this.onTransformed.bind(this);
      //this.createEventListeners();
    }
   /**
     * Create all the needed event listeners
     */
  
    createEventListeners() {

        // Set up AR events
        global.AREvents.subscribe([
   // Scene updates
   {id:this, name: global.const.HIDE_ARROW, callback:() => {
    this.props.sceneNavigator.replace({scene:Initialscene});
   ;}},
       
        ]);
    }
    componentWillUnmount() {


        // Remove listeners
        global.AREvents.remove(this);
       
    }
    _latLongToMerc(lat_deg, lon_deg) {
        var lon_rad = (lon_deg / 180.0 * Math.PI)
        var lat_rad = (lat_deg / 180.0 * Math.PI)
        var sm_a = 6378137.0
        var xmeters  = sm_a * lon_rad
        var ymeters = sm_a * Math.log((Math.sin(lat_rad) + 1) / Math.cos(lat_rad))
        return ({x:xmeters, y:ymeters});
     }
     
     _transformPointToAR() {
     //  var objPoint = {x:}
  let obj=   geolocation.getCurrentPosition((position) => {

        // Track the last known location to the global tracking class
       let latitude= position.coords.latitude;
       let longitude= position.coords.longitude;
       var devicePoint=  this._latLongToMerc(latitude, longitude);
       return ({x:devicePoint.x, y:devicePoint.y});
    })
       return obj;
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
   /**
     * AR screen was touched and should toggle the menu items
     */
   
 
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
            // Alert.alert(
            //     "Actual Placements?",
            //     JSON.stringify(placements),
            //     [
            //         {text: 'ok', onPress: () => {}},
            //     ]
            // )
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
     <ViroFlexView  transformBehaviors={"billboardY"}  height={0.2}  style={{flexDirection: "column", alignItems: 'center', justifyContent: 'center',borderRadius:20,borderColor:'#fff'}}
                   width={0.3} backgroundColor={stylesPop.callout.backgroundColor}  position={position} >
         <ViroFlexView  style={{flex:0.8,flexDirection: 'row'}} >
        		<ViroText
              style={{color: '#ffffff', flex:1}}
            
        			text={'1 of x mesh devices should be placed as close to this area as possible for optimal WiFi coverage'}
        			fontSize={12} />
        	</ViroFlexView>
            </ViroFlexView>
               
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

onTransformed(transform){
    const {position}=transform;
    const {rotation}=transform
   // let obj=this._transformPointToAR();
    let p1={
      x:rotation[0],
      y:rotation[1],
      z:rotation[2],  
    }
     // let objectPosition=[0,-0.5,-1]
     let rotations= this.calcAngleDegrees(p1)
     let distance=this.calculatePosition(position)
//    let assendingDistance=  distance.sort(function(a, b){
//        return a - b;
//    });

     global.AREvents.emit({name:global.const.AR_DISTACE_UPDATING, data: {distance:distance,rotations:rotations}});
   //  global.AREvents.emit({name:global.const.AR_TRACKING, data: global.const.AR_TRACKING_TYPE_NORMAL});
    
}
calcAngleDegrees(p1) {
    let rotationArray=[]
    let placements = global.state.get("placementList");
    let actualPlacements = placements.recommendations[0].placements;
    actualPlacements.map((item,index)=>{
     var angleDeg = Math.atan2(p1.y-item.position[2] ,   p1.x-item.position[0]) * 360 / Math.PI;
      let total= angleDeg+'deg'
     rotationArray.push(total)
   })
  
   return rotationArray;
 }
  /**
     * Calculate the difference between 2 Vector points
     * @param currentPosition
     * @param storedPosition
     * @returns {number}
     */
    calculatePosition(currentPosition) {
        let distanceaRRAY=[]
        let placements = global.state.get("placementList");
        let actualPlacements = placements.recommendations[0].placements;
        actualPlacements.map((item,index)=>{
          try {
            distanceaRRAY.push(distance(currentPosition, [item.position[0],item.position[1],item.position[2]]));
        }
        catch(err) {
            return -1;
        }
        })
        return distanceaRRAY;
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
        //const {navigate} = this.props.navigation;

        return (
            <ViroARScene ref="PLACEMENT_AR_SCENE" onTrackingUpdated={(state)=>this.onInitialized(state)}   onCameraTransformUpdate={this.onTransformed}>
                              {this.state.placementItems}

            </ViroARScene>
        );
    }
}
          
var styless = StyleSheet.create({
    boldFont: {
         color: '#FFFFFF',
         flex: 1,
         textAlignVertical: 'center',
         textAlign: 'center',
         fontWeight: 'bold',
    },
});

ViroMaterials.createMaterials({
    frontMaterial: {
      diffuseColor: '#FFFFFF',
    },
    backMaterial: {
      diffuseColor: '#FF0000',
    },
    sideMaterial: {
      diffuseColor: '#0000FF',
    },
});
// Load default styles
const styles = new Style().get();
let stylesPop = new Style().get("FLOW_HEADER");
module.exports = PlacementScene;