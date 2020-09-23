/**
 * Scrollable Description View
 */

// Import Components
import React from "react";
import {
    StatusBar,
    View,
    Image,
    ScrollView
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
import Triggers from "../../app_code/flows/triggers";

export default class ScrollableView extends React.Component {

    // Global state
    Global = global.state;

    // Global configuration
    Configuration = global.configuration;

    // Image resources
    ImageResources = global.imageResources;

    // Local state
    state = {
        scrollMargin:0
    };

    // Constructor
    constructor(props) {
        super(props);
    }

    // View mounted and ready
    componentDidMount(){
        new Style().get("FLOWS", (style) => {
            styles = style;
            this.forceUpdate();
        });

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
                <View style={styles.container}>
                    <StatusBar hidden />
                    {this.props.info.skip &&
                    <ButtonTouchableTextComponent
                        onPress={()=>{this.props.info.skip.switch ?
                            this.props.controller.changeViewById(this.props.info.skip.switch) :
                            this.props.controller.exitFlow()}}
                        size={14}
                        align={'right'}
                        iconColor={'black'}
                        label={this.props.info.skip.label}
                        style={{
                            flex:0,
                            flexDirection: 'row',
                            alignItems:'flex-end',
                            width: '100%',
                            height: 25,
                            marginTop: 10,
                            paddingRight: 10,
                            opacity: 0.7}}
                    >
                    </ButtonTouchableTextComponent>}
                    {!this.props.info.skip &&
                        <View style={{height: 10, backgroundColor: 'transparent'}}/>
                    }
                    {this.props.info.title &&
                    <View style={{flexDirection: "row", flex:0, alignItems:'center', justifyItems: 'start', marginTop: 10}}>
                        <View style={{flex: 1, marginLeft: 20, width: 30, height: 30}}>
                            <Image resizeMode={"contain"} style={{width:30, height:30}} source={styles.brandIcon}/>
                        </View>
                        <Label style={[styles.h1, {fontWeight:'bold', fontSize: 18, flex: 8, marginLeft: -50, width:'90%', textAlign:'center', alignItems:'center'}]}>{this.props.info.title}</Label>
                    </View>}
                    <ScrollView style={{flex:0, height: '100%', justifyItems: 'start', marginTop: 10, marginBottom:this.state.scrollMargin}}>
                        <Label style={[{paddingLeft: 10, paddingRight: 10}]}>{this.props.info.description}</Label>
                    </ScrollView>
                    <CustomButtons navigation={this.props.navigation} trigger={new Triggers(this)} parent={this.props.controller} create={this.props.info.actionButtons}/>
                </View>
            </AnimatedStackView>
        );
    }
}
// Load default styles
let styles = new Style().get();
