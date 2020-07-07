/**
 * Template for making the overlay views
 * Rename the class
 */

// Import Components
import React from "react";
import {
    StatusBar,
    View,
    Image
} from 'react-native';
import {
    Label
} from "native-base";

// Font Awesome 5
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';

// Default style sheet
import Style from '../../styles/base/index';

// Import the main parts of each view
import AnimatedStackView from '../../styles/components/stack_view';
import CustomButtons from "../../styles/components/custom_buttons";
import ButtonTouchableTextComponent from "../../components/buttons/ButtonTouchableTextComponent";
import {EventRegister} from "react-native-event-listeners";

export default class BubbleView extends React.Component {

    // Global state
    Global = global.state;

    // Global configuration
    Configuration = global.configuration;

    // Image resources
    ImageResources = global.imageResources;

    // Local state
    state = {

    };

    // Constructor
    constructor(props) {
        super(props);
    }

    // View mounted and ready
    componentDidMount(){
    }

    // View about to unmount
    componentWillUnmount() {
    }

    // View has been updated
    componentDidUpdate(){
    }

    testFunction() {
        EventRegister.emit(global.const.AR_PAUSE_LIVEMODE, this.state.liveModePaused);
    }


    // Render view components
    render() {
        console.disableYellowBox = true;

        return (
                <View>
                    <StatusBar hidden />

                </View>
        );
    }
}
// Load default styles
const styles = new Style().get("FLOWS");
