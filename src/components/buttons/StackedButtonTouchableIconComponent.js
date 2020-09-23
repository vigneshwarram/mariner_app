import React from 'react';
import {Animated, TouchableHighlight, Easing} from 'react-native';
import {FontAwesomeIcon} from '@fortawesome/react-native-fontawesome';

class StackedButtonTouchableIconComponent extends React.Component {

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
                <Animated.View style={[this.props.style,
                    {
                        transform:[
                            {scale: this.buttonScale}
                        ],
                        textAlign: 'center',
                        justifyContent: 'center',
                        alignItems: 'center'
                    },
                    this.props.opacity
                ]}>
                  <FontAwesomeIcon active size={this.props.size[0]} color={'lightgray'} icon={this.props.source[0]}
                                         style={this.props.opacity}/>
                  <FontAwesomeIcon active size={this.props.size[1]} color={'lightgray'} icon={this.props.source[1]}
                                         style={{position: 'absolute', bottom: this.props.bottom}}/>
                </Animated.View>
            </TouchableHighlight>
        );
    }

    // Scale animation
    scale() {
        this.scaleValue.setValue(2);
        this.fadeInValue.setValue(1);
        Animated.timing(
            this.scaleValue,
            {
                toValue: 0,
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
export default StackedButtonTouchableIconComponent;
