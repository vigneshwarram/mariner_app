/**
 * About Waveguide
 */

// Import Components
import React from "react";
import {
    StatusBar,
    View
} from 'react-native';

// Font Awesome 5
import { faInfoCircle } from '@fortawesome/pro-light-svg-icons';

// Default style sheet
import Style from '../styles/views/default'

// Global state for navigation options
import Global_State from '../constants/global';

// Import the main parts of each view
import AnimatedStackView from '../styles/components/stack_view';
import Header from "../styles/components/view_header";
import Splash from "../styles/components/splash";
import About from "./About/about";

export default class AboutView extends React.Component {
    static navigationOptions = ({ navigation }) => Global_State.getInstance().viewStyleOptions(navigation);

    // Global state
    Global = global.state;

    // Global configuration
    Configuration = global.configuration;

    // Local state
    state = {
        config_version: "0.0.0",
        sp_name: "Unknown"


    };

    // Constructor
    constructor(props) {
        super(props);
    }

    // View mounted and ready
    componentDidMount(){

        let config_version = global.configuration.get("configVersion");
        if (config_version != null) {
            this.setState({config_version: config_version});
        }

        let sp_name = global.configuration.get("providerName")
        if (sp_name != null) {
            this.setState({sp_name: sp_name});
        }
    }

    // View about to mount
    componentWillMount(){
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
                <View style={styles.container}>
                    <StatusBar hidden />
                    <Header style={styles.header} label={global.t.get$('TITLE.ABOUT_VIRTUAL_TECH')} icon={faInfoCircle}/>
                    <About controller={this} link {...this.props} />
                </View>
            </AnimatedStackView>
        );
    }
}

/*
<Card>
                        <CardItem>
                            <Left>
                                <Thumbnail source={this.state.images[0]} />
                                <Body>
                                    <Text>Mariner WaveGuide</Text>
                                    <Text note>{this.state.version}</Text>
                                </Body>
                            </Left>
                        </CardItem>
                        <CardItem cardBody>
                            <Image source={this.state.images[1]} style={{height: 200, width: null, flex: 1}}/>
                        </CardItem>
                        <CardItem>
                        </CardItem>
                    </Card>
 */
// Load default styles
const styles = new Style().get();