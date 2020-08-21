/**
 * Tracking View Component
 * Animated tracking
 */

import React from "react";
import {View,Image, Text} from "react-native";

// Animations
//import Animation from 'lottie-react-native';

export default class IndoorTrack extends React.Component {

  

    constructor() {
        super();
this.state={pointsDistance:[],direction:[]}
this.createEventListerner()
        //this.setAnimation = this.setAnimation.bind(this);
    }

    componentDidMount(){
        //Animated.spring(this.state.slide_x, { toValue: 0 }).start();
    }
    createEventListerner(){
        global.AREvents.subscribe([

            // Menu toggle
            {id:this, name: global.const.AR_DISTACE_UPDATING, callback:(data) => {
                    this.setState({pointsDistance: data.distance,direction:data.rotations});
                    }},
        ])
    }
    /**
     * Set the tracking animation
     * @param animation
     */
    setAnimation(/*animation*/) {
        /*this.animation = animation;
        if (this.animation !== undefined) {
            try {
                this.animation.play();
            }catch(err){}
        }*/
    }

    /**
     * Tracking renderer
     * @returns {*}
     */
    calcAngleDegrees() {
        let rotationArray=[]
        let placements = global.state.get("placementList");
        let actualPlacements = placements.recommendations[0].placements;
        actualPlacements.map((item,index)=>{
         var angleDeg = Math.atan2(0-item.position[1] ,   -1-item.position[0]) * 180 / Math.PI;
          let total= angleDeg+'deg'
         rotationArray.push(total)
       })
      
       return rotationArray;
     }
    render() {
        return (
            <View style={{
                position: 'absolute',
                top: 0,
                left: 10,
                right: 0,
                bottom: 0,
                width: '100%',
                height: '100%',
                flexDirection: 'column',
              
                backgroundColor: 'transparent'
            }}>
             
                    {this.state.pointsDistance.map((item,index)=>{
                        let degrees=this.state.direction[index].split("deg")[0]
                       
                       let degree= Math.round(-degrees)
                       // let rotations= this.calcAngleDegrees(p1)
                        return(
                           <View>
                    {/* <View style={ {
                        alignSelf:'center',
                        marginTop:500,
                        transform: [{ rotate: degree+'deg' }]
      }}>
                   <Image source={require('../../assets/triangular.png')} style={{width:40,height:40,resizeMode:'contain',tintColor:'#fff', transform: [       
        ]}}></Image> 
                   <Text style={{color:'#fff',fontSize:70,fontWeight:'bold',marginLeft:-20}} >{Math.round(item) +"m"}</Text>
                   </View>      */}
                   {degree >= -290 && degree <= 290?       
                   <View style={{alignItems:degree>0?'flex-end':'flex-start',marginRight:degree>0?0:10,flexDirection:degree>0?'row':'row-reverse',marginBottom:20,marginTop:10}}>
                         
                         <Image source={require('../../assets/triangular.png')} style={{width:20,height:20,resizeMode:'contain',tintColor:'#fff', marginRight:20,transform: [{ rotate:degree>0? -90+'deg':90+'deg' }]}}></Image> 
                         <Text style={{color:'#fff',fontSize:14,fontWeight:'bold'}} >{Math.round(item) +"m"}</Text>
                         
                         </View>
                                   :null} 
                      
                   </View>
                        )
                    })}
                       {/* <View style={ {
                           alignSelf:'center',
        transform: [
          { rotateX: "45deg" },
          { rotateZ: "19deg" }
        ]
      }}>
                   <Image source={require('../../assets/triangular.png')} style={{width:40,height:40,resizeMode:'contain',tintColor:'#fff'}}></Image> 
                   <Text style={{color:'#fff',fontSize:70,fontWeight:'bold',marginLeft:-20}} >{4 +"m"}</Text>
                   </View>     */}
              
            </View> 
        )
    }
}
IndoorTrack.defaultProps = {
    width: 172.075,
    height: 100
};
