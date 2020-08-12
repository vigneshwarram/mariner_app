/**
 * Tracking View Component
 * Animated tracking
 */

import React from "react";
import {View,Image, Text} from "react-native";

// Animations
//import Animation from 'lottie-react-native';

export default class IndoorTrack extends React.Component {

    // Local state
    state = {
    };

    constructor() {
        super();

        //this.setAnimation = this.setAnimation.bind(this);
    }

    componentDidMount(){
        //Animated.spring(this.state.slide_x, { toValue: 0 }).start();
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
                justifyContent:'space-evenly',
                backgroundColor: 'transparent'
            }}>
             
                    {global.state.pointsDistance.map((item,index)=>{
                        let degree=global.state.direction[index].split("deg")[0]
                     
                        return(
                           <View>
                       
                   {degree<-100 || degree>100 ?  <View style={ {
                        alignSelf:'center',
                        marginTop:300,
                           transform: [
                            { rotateX: "0deg" },
                            { rotateZ: "5deg" }
                          ]
       
      }}>
                   <Image source={require('../../assets/triangular.png')} style={{width:40,height:40,resizeMode:'contain',tintColor:'#fff', transform: [
        
        ]}}></Image> 
                   <Text style={{color:'#fff',fontSize:70,fontWeight:'bold',marginLeft:-20}} >{Math.round(item) +"m"}</Text>
                   </View>    :     <View style={{alignItems:degree<0?'flex-start':'flex-end',marginRight:degree<0?10:20,flexDirection:degree<0?'row':'row-reverse'}}>

<Image source={require('../../assets/triangular.png')} style={{width:20,height:20,resizeMode:'contain',tintColor:'#fff', marginRight:20,transform: [{ rotate: degree+'deg' }]}}></Image> 
<Text style={{color:'#fff',fontSize:14,fontWeight:'bold'}} >{Math.round(item) +"m"}</Text>

</View>}
                  
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
