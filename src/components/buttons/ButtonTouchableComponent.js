import React from 'react';
import {Animated, TouchableHighlight, View, Easing, Text} from 'react-native';

class ButtonTouchableComponent extends React.Component {

    constructor() {
        super();

        this.scaleValue = new Animated.Value(0);
        this.fadeInValue = new Animated.Value(0);

        this.scale = this.scale.bind(this);
        this.onPress = this.onPress.bind(this);
        this.onLongPress = this.onLongPress.bind(this);
        this.crossFade = this.crossFade.bind(this);

        this.buttonScale = this.scaleValue.interpolate({
            inputRange: [0, 0.5, 0.8, 1],
            outputRange: [1, 0.8, 1.1, 1]
        });

        this.opacity = this.fadeInValue.interpolate({
            inputRange: [0,1],
            outputRange: [0,1]
        });
    }

    onPress() {
        this.scale();
        requestAnimationFrame(() => {
            if (this.props.onPress) this.props.onPress();
        });
    }

    onLongPress() {
        this.scale();
        requestAnimationFrame(() => {
            if (this.props.onLongPress) this.props.onLongPress();
        });
    }

    render() {
        return (
            <TouchableHighlight style={{opacity:global.state.ButtonDisable?0.3:1}} disabled={global.state.ButtonDisable} underlayColor="#00000000" onPress={this.onPress} onLongPress={this.onLongPress} delayLongPress={500}>
                <View style={{
                    textAlign: 'center',
                    justifyContent: 'center',
                    alignItems: 'center'}}>
                    {this.props.text && <Text style={{position: 'absolute', fontWeight: 'bold', color:'white', right: 50, top: 15, width: 300, textAlign: 'right'}}>{this.props.text}</Text>}
                    <Animated.Image
                        source={this.props.source}
                        style={[this.props.style,
                            {
                                transform:[
                                    {scale: this.buttonScale}
                                ]
                            }
                        ]} />
                </View>
            </TouchableHighlight>
        );
    }

    // Scale animation
    scale() {
        this.scaleValue.setValue(0);
        this.fadeInValue.setValue(0);
        Animated.timing(
            this.scaleValue,
            {
                toValue: 1,
                duration: 300,
                easing: Easing.easeInOutBack,
                useNativeDriver: true,
            }
        ).start(() => {
            this.crossFade();
        });
    }

    // Crossfade animation
    crossFade() {
        this.fadeInValue.setValue(0);
        Animated.timing(
            this.fadeInValue,
            {
                toValue: 1,
                duration: 100,
                easing: Easing.linear,
                useNativeDriver: true,
            }
        ).start();
    }
}
export default ButtonTouchableComponent;
