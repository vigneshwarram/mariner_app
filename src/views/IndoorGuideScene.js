
'use strict';
import React, { Component } from 'react';
import {StyleSheet} from 'react-native';
import {
  ViroARScene,
  ViroText,
  ViroImage,
  ViroConstants,
  ViroMaterials,
  ViroBox
} from 'react-viro';
// Google Maps
import geolocation from '@react-native-community/geolocation';
const distance = require('euclidean-distance');
const allNodes=[
  {x:0,y:-0.5,z:-4},
  {x:0,y:-1,z:-3},
  {x:0,y:-0.5,z:3},
  {x:0,y:1,z:-2},
  {x:0,y:1,z:3},
  {x:0,y:2,z:3},
]
export default class IndoorGuideScene extends Component{
   // Global state
   Global = global.state;

   // Global configuration
   Configuration = global.configuration;
  constructor(props) {
    super(props);
    // Set initial state here
    this.state = {
      pointsDistance:[],
      pointsofDistance : "",
      northPointX: 0,
      northPointZ: 0,
      ObjectPosiion:[0,0,0],
      Direction:[0,0,0]
    };
    // bind 'this' to functions

    this._latLongToMerc = this._latLongToMerc.bind(this);
    this.onTransformed = this.onTransformed.bind(this);
  }
  onTransformed=(transform)=>{
   const {position}=transform;
   global.AREvents.emit({name:global.const.AR_TRACKING, data: global.const.AR_TRACKING_TYPE_NORMAL});
   let p1={
     x:position[0],
     y:position[1],
     z:position[2],
   }
    // let objectPosition=[0,-0.5,-1]
    let rotations= this.calcAngleDegrees(p1,allNodes)
    let distance=this.calculatePosition(position,allNodes)
  let assendingDistance=  distance.sort(function(a, b){
      return a - b;
  });
  
    global.state.direction=[...rotations]
    global.state.pointsDistance=[...assendingDistance];

   
   
  }
  render() {
    return (
      <ViroARScene  onCameraTransformUpdate={this.onTransformed}>
          {allNodes.map((item,index)=>{
                        return(                
  <ViroImage position={[item.x,item.y,item.z]}  scale={[.15, .15, .15]} source={ require('../assets/splash-portrait-xhdpi.png')} />
              
                        )
                    })}
         
       
      </ViroARScene>
    );
  }
   calcAngleDegrees(p1, allNodes) {
     let rotationArray=[]
    allNodes.map((item,index)=>{
      const {x,y,z}=item;
      var angleDeg = Math.atan2(y - p1.y, x - p1.x) * 180 / Math.PI;
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
    calculatePosition(currentPosition, storedPosition) {
      let distanceaRRAY=[]
      storedPosition.map((item,index)=>{
        try {
          const {x,y,z}=item
          distanceaRRAY.push(distance(currentPosition, [x,y,z]));
      }
      catch(err) {
          return -1;
      }
      })
      return distanceaRRAY;
  }


  // DirectionofTwoPoints(){
  //   let points={};
  //     points.x1=this.state.ObjectPosiion[0];
  //     points.x2=0;

  //     points.y1=this.state.ObjectPosiion[1];
  //     points.y2=-0.5;

  //     points.z1=this.state.ObjectPosiion[2];
  //     points.z2=-2;

  //   let x1=points.x2-points.x1;
  //   let y1=points.y2-points.y1;
  //   let z1=points.z2-points.z1;
  //   return [x1,y1,z1];
  // }

    /**
     * AR Initialized
     * @param state
     * @private
     */
  //   onInitialized(state) {
  //     if (state === ViroConstants.TRACKING_NORMAL) {
  //         this.tracking = true;
  //         this.setState({
  //             tracking: global.const.AR_TRACKING_TYPE_NORMAL, needsRender:true
  //         });

  //         // AR is tracking
  //         global.AREvents.emit({name:global.const.AR_TRACKING, data: global.const.AR_TRACKING_TYPE_NORMAL});
  //     }
  //     else if (state === ViroConstants.TRACKING_UNAVAILABLE) {
  //         this.setState({
  //             tracking: global.const.AR_TRACKING_TYPE_NONE
  //         });

  //         // AR is not tracking
  //         global.AREvents.emit({name:global.const.AR_TRACKING, data: global.const.AR_TRACKING_TYPE_NONE});
  //     }
  //     else if (state === ViroConstants.TRACKING_LIMITED) {
  //         this.setState({
  //             tracking: global.const.AR_TRACKING_TYPE_NONE
  //         });
  //     }
  // }
 _latLongToMerc(lat_deg, lon_deg) 
 {
   var lon_rad = (lon_deg / 180.0 * Math.PI)
   var lat_rad = (lat_deg / 180.0 * Math.PI)
   var sm_a = 6378137.0
   var xmeters  = sm_a * lon_rad
   var ymeters = sm_a * Math.log((Math.sin(lat_rad) + 1) / Math.cos(lat_rad))
   return ({x:xmeters, y:ymeters});
}
_transformPointToAR(lat, long) 
{
  var objPoint = this._latLongToMerc(9.1891428, 77.5259337);
  var devicePoint = this._latLongToMerc(lat, long);
  console.log("objPointZ: " + objPoint.y + ", objPointX: " + objPoint.x)
  // latitude(north,south) maps to the z axis in AR
  // longitude(east, west) maps to the x axis in AR
  var objFinalPosZ = objPoint.y - devicePoint.y;
  var objFinalPosX = objPoint.x - devicePoint.x;
  //flip the z, as negative z(is in front of us which is north, pos z is behind(south).
  return ({x:objFinalPosX, z:-objFinalPosZ});
}
}

var styles = StyleSheet.create({
  helloWorldTextStyle: {
    fontFamily: 'Arial',
    fontSize: 20,
    color: '#fff',
    textAlignVertical: 'center',
    textAlign: 'center',
  },
});



module.exports = IndoorGuideScene;