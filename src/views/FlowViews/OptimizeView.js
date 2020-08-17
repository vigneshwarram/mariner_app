/**
 * Guide View
 */

// Import Components
import React from "react";
import {
    StatusBar,
    View,
    Image,
    Alert
} from 'react-native';
import {
    Label
} from "native-base";

// Font Awesome 5
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';

// Default style sheet
import Style from '../../styles/base/index';
import { faHomeLg } from '@fortawesome/pro-solid-svg-icons';
import UploadResults from "../../app_code/workorders/upload_results";
// Import the main parts of each view
import AnimatedStackView from '../../styles/components/stack_view';
import Device from '../../app_code/diagnostics/deviceinfo';
import Global_State from '../../constants/global';
import Header from '../../styles/components/view_header';
import CustomButtons from "../../styles/components/custom_buttons";
import ButtonTouchableTextComponent from "../../components/buttons/ButtonTouchableTextComponent";
import Triggers from "../../app_code/flows/triggers";
import WorkOrderBuilder from '../../app_code/workorders/workorder_builder';
import HttpService from "../../app_code/http/service";
import Thresholds from '../../app_code/certifications/thresholds';
export default class WifiRouterView extends React.Component {
    static navigationOptions = ({ navigation }) => Global_State.getInstance().viewStyleOptions(navigation);
    isiOS13 = global.state.iOS13_available();
    // Global state
    Global = global.state;

    // Global configuration
    Configuration = global.configuration;

    // Image resources
    ImageResources = global.imageResources;
    // Constructor
    constructor(props) {
        super(props);
        
    }     
    // View mounted and ready
    componentDidMount(){
        styles = new Style().get("FLOWS");
    }

    // View about to unmount
    componentWillUnmount() {
    }

    // View has been updated
    componentDidUpdate(){
    }
    // Render view components
    GetLocationPoints(){
        this.props.navigation.navigate('IndoorSceneView')
    }
    render() {
        console.disableYellowBox = true;

        return (
            <AnimatedStackView>
                <View style={styles.container}>
                <StatusBar hidden={this.isiOS13}/>
                      <View style={{flexDirection: "row", flex:0, alignItems:'center', justifyItems: 'start', marginTop: 10}}>
                        <View style={{flex: 1, marginLeft: 5, width:55, height:55}}>
                            <Image resizeMode={"contain"} style={{width:55, height:55}} source={styles.brandIcon}/>
                        </View>
                        <Label style={[styles.h1, {fontWeight:'bold', fontSize: 24, flex: 8, marginLeft: -30, width:'90%', textAlign:'center', alignItems:'center'}]}>{this.props.info.title}</Label>
                    </View>
                    <View style={{flexDirection: "row", flex:0, alignItems:'center', justifyItems: 'start', marginTop: 10}}>
                        <Label style={[styles.h6, {flex: 8, paddingLeft: 15, paddingRight: 15, width:'100%', textAlign:'left', alignItems:'center'}]}>{this.props.info.description}</Label>
                    </View>
                    <CustomButtons navigation={this.props.navigation} parent={this.props.controller} create={this.props.info.actionButtons}/>
                </View>
            </AnimatedStackView>
        );
    }
}
// Load default styles
let styles = new Style().get("FLOWS");
