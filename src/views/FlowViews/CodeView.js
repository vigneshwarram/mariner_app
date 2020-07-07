/**
 * AD HOC Detailed Summary View
 */

// Import Components
import React from "react";
import {
    StatusBar,
    View,
    Image,
    Alert,
    Text,
    Animated
} from 'react-native';
import {
    Button,
    Label, ListItem
} from "native-base";

// Font Awesome 5
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import {faArrowFromBottom, faArrowFromTop, faMapMarker} from '@fortawesome/pro-solid-svg-icons';

// Default style sheet
import Style from '../../styles/base/index';

// Import the main parts of each view
import AnimatedStackView from '../../styles/components/stack_view';
import CustomButtons from "../../styles/components/custom_buttons";
import ButtonTouchableTextComponent from "../../components/buttons/ButtonTouchableTextComponent";

// Other imports needed
import HttpService from "../../app_code/http/service";

import Device from '../../app_code/diagnostics/deviceinfo';
import Thresholds from '../../app_code/certifications/thresholds';

import WorkOrderBuilder from '../../app_code/workorders/workorder_builder';
import UploadResults from "../../app_code/workorders/upload_results";
import Triggers from "../../app_code/flows/triggers";
import {SwipeListView} from "react-native-swipe-list-view";

export default class CodeView extends React.Component {

    // Global state
    Global = global.state;

    // Global configuration
    Configuration = global.configuration;

    // Image resources
    ImageResources = global.imageResources;
    WorkOrderBuilder = new WorkOrderBuilder();

    Device = new Device();
    Http = new HttpService();
    wo = null;
    woid = "";
    Thresholds = new Thresholds();
    excellent = 0;
    good = 0;
    fair = 0;
    poor = 0;
    coverage = false;
    uploaded = false;

    // Local state
    state = {
        excellent: 0,
        good: 0,
        fair: 0,
        poor: 0,
        coverage: false,
        uploaded: false,
        scrollMargin: 0,

        dropPoints: []
    };

    // Constructor
    constructor(props) {
        super(props);

        // Make space for the action buttons if needed
        for (let i=0;i<this.props.info.actionButtons.length;i++) {
            if (this.props.info.actionButtons[i].position === 5 || this.props.info.actionButtons[i].position === 6) {
                this.setState({scrollMargin:110});
                break;
            }
            else if (this.props.info.actionButtons[i].position === 3 || this.props.info.actionButtons[i].position === 4) {
                this.setState({scrollMargin:55});
            }
        }
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
    render() {
        console.disableYellowBox = true;

        return (
            <AnimatedStackView>
                <View style={[styles.container]}>
                    <StatusBar hidden />
                    {this.props.info.skip &&
                    <ButtonTouchableTextComponent
                        onPress={()=>{this.props.info.skip.switch ?
                            this.props.controller.changeViewById(this.props.info.skip.switch) :
                            this.props.controller.exitFlow()}}
                        size={14}
                        label={global.t.get$(this.props.info.skip.label)}
                        align={'right'}
                        iconColor={'black'}
                        style={{
                            flex:0,
                            flexDirection: 'row',
                            alignItems:'flex-end',
                            width: '100%',
                            height: 30,
                            marginTop: 10,
                            paddingRight: 10,
                            opacity: 0.9}}
                    >
                    </ButtonTouchableTextComponent>}
                    <View style={{flexDirection: "row", flex:0, alignItems:'center', justifyItems: 'start', marginTop: 10}}>
                        <View style={{flex: 1, marginLeft: 5, width:55, height:55}}>
                            <Image resizeMode={"contain"} style={{width:55, height:55}} source={styles.brandIcon}/>
                        </View>
                        <Label style={[styles.h1, {fontWeight:'bold', fontSize: 24, flex: 8, marginLeft: -30, width:'90%', textAlign:'center', alignItems:'center'}]}>{global.t.get$(this.props.info.title)}</Label>
                    </View>
                    <View style={{flexDirection: "row", flex:0, alignItems:'center', justifyItems: 'start', marginTop: 20}}>
                        <Label style={[{fontSize: 42, fontWeight: 'bold', flex: 8, paddingLeft: 10, paddingRight: 10, width:'100%', textAlign:'center', alignItems:'center'}]}>{global.upload_tracker.referenceData.ref.toUpperCase()}</Label>
                    </View>
                    <View style={{flexDirection: "row", flex:0, alignItems:'center', justifyItems: 'start', marginTop: 30}}>
                        <Label style={[{flex: 8, paddingLeft: 10, paddingRight: 10, width:'100%', textAlign:'left', alignItems:'center'}]}>{global.t.get$(this.props.info.description)}</Label>
                    </View>
                    <CustomButtons navigation={this.props.navigation} trigger={new Triggers(this)} parent={this.props.controller} create={this.props.info.actionButtons} />
                </View>
            </AnimatedStackView>
        );
    }
}
// Load default styles
let styles = new Style().get("FLOWS");
