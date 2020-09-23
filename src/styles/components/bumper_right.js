import React from "react";
import {Animated, Dimensions, Text, TouchableWithoutFeedback, View} from "react-native";
import {EventRegister} from "react-native-event-listeners";
import {faChevronRight} from "@fortawesome/pro-light-svg-icons";
import {FontAwesomeIcon} from "@fortawesome/react-native-fontawesome";

import Style from '../base/index';

export default class BumperRight extends React.Component {

    // Listener
    bumpSlideListener;

    constructor(props) {
        super(props);

        this.animatedMargin = new Animated.Value(200);

        // Slide animation
        this.bumpSlideListener = EventRegister.addEventListener('APPLICATION_INTERNAL_BUMP_RIGHT', (data) => {
            if (data === "in" && global.state.bumpers != null && global.state.bumpers.next && global.state.bumpers.next.enabled) {
                this.animatedMargin = new Animated.Value(200);
                Animated.timing(this.animatedMargin, {
                    toValue: 0,
                    duration: 1000,
                    useNativeDriver: true
                }).start();
            }
            this.forceUpdate();
        });
    }

    componentDidMount(){
        new Style().get("BUMPERS", (style) => {
            styles = style;
            this.forceUpdate();
        });
    }

    componentWillUnmount() {
        EventRegister.removeEventListener(this.bumpSlideListener);
    }

    render() {
        if (global.state.bumpers != null && global.state.bumpers.next && global.state.bumpers.next.enabled) {
            return (
                <TouchableWithoutFeedback onPress={() => {
                    EventRegister.emit("APPLICATION_INTERNAL_FLOW_BUMP", "next");
                }}>
                    <Animated.View style={{borderRadius: 10, opacity: 0.9, position:'absolute', top: (Math.round(Dimensions.get('window').height)/2)-125, right: 0, height: 200, width: 30, backgroundColor:'white', transform: [{translateX: this.animatedMargin}]}}>
                        <FontAwesomeIcon active size={16} color={styles.bumper.color} icon={faChevronRight} style={{position: 'absolute', top: 7, right: 5}}/>
                        <Text style={[styles.bumper, {position: 'absolute', bottom: 100, right: -60, paddingRight: 25, textAlign: 'center', width: 150, transform: [{ rotate: "-90deg" }]}]}>{global.state.bumpers.next.label}</Text>
                    </Animated.View>
                </TouchableWithoutFeedback>
            )
        }
        else return null;
    }
}
let styles = new Style().get();
