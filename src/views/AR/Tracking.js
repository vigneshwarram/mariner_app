/**
 * Tracking View Component
 * Animated tracking
 */

import React from "react";
import {View, Text} from "react-native";

// Animations
//import Animation from 'lottie-react-native';

export default class TrackingView extends React.Component {

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
TrackingView.defaultProps = {
    width: 172.075,
    height: 100
};
