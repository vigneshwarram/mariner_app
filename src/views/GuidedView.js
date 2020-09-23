/**
 * Guided View Loader
 * Checks for any auto run flows
 **/

// Import Components
import React from "react";

// Default style sheet
import Style from '../styles/base/index'

// Global state for navigation options
import Global_State from '../constants/global';

// Import the main parts of each view
import AnimatedStackView from '../styles/components/stack_view';
import Splash from "../styles/components/splash";
import OverlayView from '../styles/components/flow_header';
import FlowLoader from "../app_code/flows/flowLoader";
import AppPermissions from '../boot/permissions';

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
        new FlowLoader().autoRun((run) => {
            if (run) this.props.navigation.dispatch(this.Global.resetNavigation(!global.configuration.get(global.const.AR_ONLY) ? 'Home' : 'AR'));
        });
    }


    // Render view components
    render() {
        console.disableYellowBox = true;
        //const {navigate} = this.props.navigation;

        return (
            <AnimatedStackView>
                <Splash/>
                <AppPermissions/>
                <OverlayView link {...this.props}/>
            </AnimatedStackView>
        );
    }
}
// Load default styles
const styles = new Style().get();
