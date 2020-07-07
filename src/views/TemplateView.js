/**
 * Template for making the views
 * Rename the class and add it to the boot/main.js to access through navigation
 */

// Import Components
import React from "react";
import {
    StatusBar,
    View
} from 'react-native';
import {
    Label
} from "native-base";
import Icon from 'react-native-vector-icons/FontAwesome';

// Font Awesome 5
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faShieldCheck } from '@fortawesome/pro-regular-svg-icons';

// Default style sheet
import Style from '../styles/base/index'

// Global state for navigation options
import Global_State from '../constants/global';

// Import the main parts of each view
import AnimatedStackView from '../styles/components/stack_view';
import NavigationButtons from "../styles/components/navigation_buttons";
import Header from "../styles/components/view_header";
import Splash from "../styles/components/splash";
import OverlayView from '../styles/components/flow_header';

export default class TemplateView extends React.Component {
    static navigationOptions = ({ navigation }) => Global_State.getInstance().viewStyleOptions(navigation);

    // Global state
    Global = global.state;

    // Global configuration
    Configuration = global.configuration;

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


    // Render view components
    render() {
        console.disableYellowBox = true;
        //const {navigate} = this.props.navigation;

        return (
            <AnimatedStackView>
                <Splash/>
                <OverlayView/>
                <View style={styles.container}>
                    <StatusBar hidden />
                    <Header style={styles.header} label={'Template'} icon={faShieldCheck}/>
                    <Label>Template</Label>
                    <FontAwesomeIcon size={20} icon={faShieldCheck} color={'white'}/>
                    <NavigationButtons navigation={this.props.navigation} next={{label:'Next', route:'Home'}} previous={{label:'Previous', route:'Home'}}/>
                </View>
            </AnimatedStackView>
        );
    }
}
// Load default styles
const styles = new Style().get();
