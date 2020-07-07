/**
 * Diagnostic View
 */

// Import Components
import React from "react";
import {StatusBar, Text, View, ScrollView} from 'react-native';
import {
    List,
    ListItem
} from "native-base";
import Icon from 'react-native-vector-icons/FontAwesome';

import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faBug } from '@fortawesome/pro-regular-svg-icons';

// Default style sheet
import Style from '../styles/views/location'

// Global state for navigation options
import Global_State from '../constants/global';

// Import the main parts of each view
import AnimatedStackView from '../styles/components/stack_view';
import NavigationButtons from "../styles/components/navigation_buttons";
import Header from "../styles/components/view_header";

export default class DiagnosticView extends React.Component {
    static navigationOptions = ({ navigation }) => Global_State.getInstance().viewStyleOptions(navigation);

    // Global state
    Global = global.state;

    // Global configuration
    Configuration = global.configuration;

    // Local state
    state = {
        diagnostics:[],
    };

    // Constructor
    constructor(props) {
        super(props);
        //this.ds = new ListView.DataSource({ rowHasChanged: (r1, r2) => r1 !== r2 });
    }

    // View mounted and ready
    componentDidMount(){
        this.setState({diagnostics: global.state.diagnostic.log});
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

    submitDiagnostics() {
        alert("Feature currently disabled");
    }


    // Render view components
    render() {
        console.disableYellowBox = true;
        //const {navigate} = this.props.navigation;

        return (
            <AnimatedStackView>
                <View style={styles.container}>
                    <StatusBar hidden />
                    <Header style={styles.header} label={'Diagnostics'} icon={faBug}/>
                    <ScrollView>
                        {
                            this.state.diagnostics.map(( item, key ) =>
                                (
                                    <View key = { key } style = {{flex:0}}>
                                        <Text style = {[styles.text, {fontSize:10}]}>{item.timeStamp}</Text>
                                        <Text style = {styles.text}>{item.message}</Text>
                                        <View style = {styles.separator}/>
                                    </View>
                                ))
                        }

                    </ScrollView>
                    <NavigationButtons navigation={this.props.navigation} back={{label: 'Submit', route: this.submitDiagnostics}}/>
                </View>
            </AnimatedStackView>
        );
    }
}
// Load default styles
const styles = new Style().get();