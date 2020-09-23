/**
 * Tracking View Component
 * Animated tracking
 */

import React from "react";
import {View,Image, Text} from "react-native";

export default class IndoorTrack extends React.Component {

    constructor() {
        super();
        this.state={pointsDistance:[],direction:[]}
        this.createEventListener()
    }

    componentDidMount(){

    }

    createEventListener(){
        global.AREvents.subscribe([

            // Menu toggle
            {id:this, name: global.const.AR_DISTACE_UPDATING, callback:(data) => {
                this.setState({pointsDistance: data.distance,direction:data.rotations});
            }},
        ])
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
                    return(
                        <View>
                            {degree >= -70 && degree <= 70?
                                <View style={{alignItems:degree>0?'flex-end':'flex-start',marginRight:degree>0?0:10,flexDirection:degree>0?'row':'row-reverse',marginBottom:20,marginTop:10}}>
                                    <Image source={require('../../assets/triangular.png')} style={{width:20,height:20,resizeMode:'contain',tintColor:'#fff', marginRight:20,transform: [{ rotate:degree>0? -90+'deg':90+'deg' }]}}></Image>
                                    <Text style={{color:'#fff',fontSize:14,fontWeight:'bold'}} >{Math.round(item) +"m"}</Text>
                                </View>
                            :null}
                        </View>
                    )
                })}
            </View>
        )
    }
}

IndoorTrack.defaultProps = {
    width: 172.075,
    height: 100
};
