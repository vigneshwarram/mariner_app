/**
 * History View
 * Currently displays the privacy policy, this will be changed shortly
 */

// Import Components
import React from "react";
import {
    StatusBar,
    View,
    ActivityIndicator
} from 'react-native';
import {
    Label
} from "native-base";
import Icon from 'react-native-vector-icons/FontAwesome';

// Font Awesome 5
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faShieldCheck } from '@fortawesome/pro-regular-svg-icons';

// Default style sheet
import Style from '../styles/views/default'

// Global state for navigation options
import Global_State from '../constants/global';

// Import the main parts of each view
import AnimatedStackView from '../styles/components/stack_view';
import NavigationButtons from "../styles/components/navigation_buttons";
import Header from "../styles/components/view_header";
import Splash from "../styles/components/splash";
import WebView from 'react-native-webview';

export default class HistoryView extends React.Component {
    static navigationOptions = ({ navigation }) => Global_State.getInstance().viewStyleOptions(navigation);

    // Global state
    Global = global.state;

    // Global configuration
    Configuration = global.configuration;

    // Local state
    state = {
        privacyPolicy: global.configuration.get("privacyUrl"),
        loading: true
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
            <AnimatedStackView style={{flex: 1}}>
                <StatusBar hidden />
                <WebView
                    originWhitelist={['*']}
                    source={{uri: this.state.privacyPolicy}}
                    javaScriptEnabled={true}
                    onLoad={() => this.setState({loading: false})}
                />
                {this.state.loading &&
                    <ActivityIndicator
                        style={{ position: "absolute", left: 0, right: 0, bottom: 0, top: 0}}
                        size="large"
                    />
                }
            </AnimatedStackView>
        );
    }
}
// Load default styles
const styles = new Style().get();
