import React from 'react';
import {Animated, TouchableHighlight, Easing, Text, View} from 'react-native';
import {Label} from "native-base";

class ButtonTouchableTextComponent extends React.Component {

    constructor() {
        super();

        this.scaleValue = new Animated.Value(1);
        this.fadeInValue = new Animated.Value(1);

        this.scale = this.scale.bind(this);
        this.onPress = this.onPress.bind(this);
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
        this.props.onPress();
        /*requestAnimationFrame(() => {
            this.props.onPress();
        });*/
    }

    render() {
        return (
            <TouchableHighlight underlayColor="#00000000" onPress={this.onPress}>
                <View>
                    {this.props.text && <Text style={{position: 'absolute', fontWeight: 'bold', color:'white', right: 50, top: 15, width: 300, textAlign: 'right'}}>{this.props.text}</Text>}
                    <Animated.View style={[this.props.style,
                        {
                            transform:[
                                {scale: this.buttonScale}
                            ]
                        },
                        this.props.opacity
                    ]}>
                        <Label style={{marginTop: 15, fontSize: 14, color: this.props.iconColor ? this.props.iconColor : 'white', fontWeight: 'bold', width:'100%', textAlign:this.props.align ? this.props.align : 'center'}}>{this.props.label}</Label>
                    </Animated.View>
                </View>
            </TouchableHighlight>
        );
    }

    // Scale animation
    scale() {
        this.scaleValue.setValue(1);
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
                duration: 500,
                easing: Easing.easeInOutBack,
                useNativeDriver: true,
            }
        ).start();
    }
}
export default ButtonTouchableTextComponent;
