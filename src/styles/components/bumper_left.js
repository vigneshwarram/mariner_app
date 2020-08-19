import React from "react";
import {Animated, Dimensions, Text, TouchableWithoutFeedback, Alert} from "react-native";
import {EventRegister} from "react-native-event-listeners";
import {FontAwesomeIcon} from "@fortawesome/react-native-fontawesome";
import {faChevronLeft} from '@fortawesome/pro-light-svg-icons';

import Style from '../base/index';

export default class BumperLeft extends React.Component {

    // Listener
    bumpSlideListener;

    constructor(props) {
        super(props);

        this.animatedMargin = new Animated.Value(-200);

        // Slide animation
        this.bumpSlideListener = EventRegister.addEventListener('APPLICATION_INTERNAL_BUMP_LEFT', (data) => {
            
            if (data === "in" && global.state.bumpers != null && global.state.bumpers.previous && global.state.bumpers.previous.enabled) {
              
                this.animatedMargin = new Animated.Value(-200);
                Animated.timing(this.animatedMargin, {
                    toValue: 0,
                    duration: 1000
                }).start();
            }
            this.forceUpdate();
        });
    }

    componentDidMount(){
        styles = new Style().get("BUMPERS");
    }

    componentWillUnmount() {
        EventRegister.removeEventListener(this.bumpSlideListener);
    }

    render() {
        if (global.state.bumpers != null && global.state.bumpers.previous && global.state.bumpers.previous.enabled) {
            return (
                <TouchableWithoutFeedback onPress={() => {
                
                    EventRegister.emit("APPLICATION_INTERNAL_FLOW_BUMP", "previous");
                }}>
                    <Animated.View style={{borderRadius: 10, opacity: 0.9, position:'absolute', top: (Math.round(Dimensions.get('window').height)/2)-125, left:0, height: 200, width: 30, backgroundColor:'white', transform: [{translateX: this.animatedMargin}]}}>
                        <FontAwesomeIcon active size={16} color={styles.bumper.color} icon={faChevronLeft} style={{position: 'absolute', top: 7, right: 7}}/>
                        <Text style={[styles.bumper, {position: 'absolute', bottom: 100, left: -60, paddingRight: 25, textAlign: 'center', width: 150, transform: [{ rotate: "-90deg" }]}]}>{global.state.bumpers.previous.label}</Text>
                    </Animated.View>
                </TouchableWithoutFeedback>
            )
        }
        else return null;
    }
}
let styles = new Style().get("BUMPERS");
