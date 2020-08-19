/**
 * Tracking View Component
 * Animated tracking
 */

import React from "react";
import {View,Alert, Text} from "react-native";
import { EventRegister } from 'react-native-event-listeners';
// Animations
//import Animation from 'lottie-react-native';

export default class TrackingView extends React.Component {

    // Local state
   

    constructor() {
        super();
        this. state = {
            Arflow:true
        };
     
     
        //this.setAnimation = this.setAnimation.bind(this);
    }
    componentWillUnmount() {
       // EventRegister.removeEventListener(this.heatMapListener);
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
        if(this.state.Arflow){
        return (
            <View style={{
                position: 'absolute',
                top: 300,
                left: 0,
                right: 0,
                bottom: 100,
                width: '100%',
                height: '100%',
                flexDirection: 'column',
                justifyContent: 'space-between',
                alignItems: 'center',
                backgroundColor: 'transparent'
            }}>
                <View style={{width: 200, height: 200}}>
                    <Text style={{textAlign: 'center', fontSize: 16, color: '#ffffff'}}>{global.t.$.AR.CALIBRATING}</Text>
                </View>
            </View>
        )
        }

    }
}
TrackingView.defaultProps = {
    width: 172.075,
    height: 100
};
