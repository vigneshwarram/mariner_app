import React from "react";
import {View, BackHandler, Animated, Text, Dimensions} from "react-native";
import {Badge} from "native-base";
import {EventRegister} from "react-native-event-listeners";

// Default style sheet
import Style from '../../styles/base/index';

export default class AnimatedStackView extends React.Component {

    popListener;
    popupBubbleTimer = null;

    state = {
        popup: null
    };

    // Set up the listeners
    constructor(props) {
        super(props);
    }

    // Remove the listeners
    componentWillUnmount() {
        EventRegister.removeEventListener(this.popupBubbleTimer);
    }

    // Disable the back button
    componentDidMount(){
        new Style().get(null, (style) => {
            styles = style;
            this.forceUpdate();
        });

        this.springValue = new Animated.Value(0.6);
        this.popListener = EventRegister.addEventListener('APPLICATION_INTERNAL_POPUP_BUBBLE', (data) => {
            if (this.popupBubbleTimer === null) {
                this.setState({popup: data});

                this.springValue.setValue(0.6);
                Animated.spring(this.springValue, {toValue: 1}).start();

                this.popupBubbleTimer = setTimeout(() => {
                    clearTimeout(this.popupBubbleTimer);
                    this.popupBubbleTimer = null;
                    this.setState({popup: null});
                }, data.timeout);
            }
        });
    }

    render() {
        return (
            <View style={{flex: 1, height: '100%', backgroundColor: '#fff'}}>
                {this.state.popup &&
                <Animated.View style={[{position: 'absolute', zIndex: 2000, left:(Math.round(Dimensions.get('window').width)/2)-125, top: (Math.round(Dimensions.get('window').height)/2)-100, transform: [{scale: this.springValue}]}]}>
                    <Badge style={[{opacity: 1, width: 250, height: "100%", borderColor: 'white', borderWidth: 0, borderStyle: 'solid', backgroundColor: styles.callout.backgroundColor, paddingHorizontal: 5}]}>
                        <Text style={[{alignSelf: 'center', fontSize: 16, marginTop: 7, marginRight: 7, marginLeft: 7, marginBottom: 7, color: styles.callout.color}]}>{this.state.popup.text}</Text>
                    </Badge>
                </Animated.View>}
                {this.props.children}
            </View>
        )
    }
}
let styles = new Style().get();
