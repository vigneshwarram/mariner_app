/**
 * AR Bottom Menu Component (Simple Mode)
 * All menu items that appear at the bottom of the AR screen are located here
 */

import React from "react";
import {View} from 'react-native';

import {faTrashAlt, faUndo, faWifi, faTachometerAltFast, faWaveform} from '@fortawesome/pro-solid-svg-icons';
import {faCog, faToggleOn, faToggleOff} from '@fortawesome/pro-light-svg-icons';

// Event Listener
import { EventRegister } from 'react-native-event-listeners';

// Style sheet
import Style from '../../../styles/views/ar';

// Import the custom button component
import ButtonTouchableComponent from '../../../components/buttons/ButtonTouchableComponent';
import ButtonTouchableIconComponent from '../../../components/buttons/ButtonTouchableIconComponent';
import StackedButtonTouchableIconComponent from '../../../components/buttons/StackedButtonTouchableIconComponent';

export default class BottomSimpleMenuComponent extends React.Component {

    // Event listeners
    toggleLiveListener;
    pauseLiveListener;

    // Local state
    state = {
        liveMode: false,
        liveModePaused: false
    };

    // Create the bindings
    constructor(props) {
        super(props);

        this.onAddPoint = this.onAddPoint.bind(this);
        this.onLiveMode = this.onLiveMode.bind(this);

        // Toggle the live/manual modes
        this.toggleLiveListener = EventRegister.addEventListener(global.const.AR_TOGGLE_LIVEMODE, (data) => {
            this.setState({liveMode:data});
        });

        // Toggle the live state .. play/pause
        this.pauseLiveListener = EventRegister.addEventListener(global.const.AR_PAUSE_LIVEMODE, (data) => {
            this.setState({liveModePaused:data});
        });
    }

    // Set the states
    componentDidMount() {
        this.setState({liveMode: this.props.controller.state.liveMode,
            liveModePaused:this.props.controller.state.liveModePaused})
    }

    // Remove the event listeners
    componentWillUnmount() {
        EventRegister.removeEventListener(this.toggleLiveListener);
        EventRegister.removeEventListener(this.pauseLiveListener);
    }

    // Render the bottom menu for AR
    render() {
        return(
            <View bottomMenu key="ar_bottom_menu_button_container" style={{position: 'absolute', flex:1, flexDirection:'row', right: 0, bottom: 40, justifyContent: 'center', alignItems: 'center', height: 58}}>

                <View key="trash_container" style={{flex:1, position: 'absolute', flexDirection:'row', justifyContent: 'center', alignItems: 'center', width:58, height: 58, top:0, bottom:0, transform: [{'translate': [30, 10, 0]}]}}>
                    {this.props.controller.state.menuOptionsVisible && global.state.flowId === "ar-flow-page-0" &&
                    <ButtonTouchableIconComponent
                        source ={faTrashAlt}
                        onPress={()=>{this.props.controller.deleteAllNodes()}}
                        size={30}
                        style={{
                            width: 50,
                            height: 50,
                            opacity: 0.9,
                            resizeMode: 'stretch'}}
                    >
                    </ButtonTouchableIconComponent>}
                </View>

                <View key="undo_container" style={{flex:1, position: 'absolute', flexDirection:'row', justifyContent: 'center', alignItems: 'center', width:58, height: 58, top:0, bottom:0, transform: [{'translate': [-105, 35, 0]}]}}>
                    {this.props.controller.state.menuOptionsVisible &&
                    <ButtonTouchableIconComponent
                        source ={faUndo}
                        onPress={()=>{this.props.controller.undoNode()}}
                        size={30}
                        style={{
                            width: 50,
                            height: 50,
                            opacity: 0.9,
                            resizeMode: 'stretch'}}
                    >
                    </ButtonTouchableIconComponent>}
                </View>

                <View key="big_button_container" style={{flex:1, position: 'absolute', flexDirection:'row', justifyContent: 'center', alignItems: 'center', width:80, height: 80, top:0, bottom:0, transform: [{'translate': [-45, 0, 0]}]}}>
                    {this.state.liveMode && !this.state.liveModePaused &&
                    <ButtonTouchableComponent
                        source={global.ARimageResources.get('pause-button')}
                        onPress={this.onLiveMode}
                        style={{
                            width: 85,
                            height: 85,
                            opacity: 0.7,
                            resizeMode: 'stretch'}}
                    >

                    </ButtonTouchableComponent>}

                    {this.state.liveMode && this.state.liveModePaused &&
                    <ButtonTouchableComponent
                        source={global.ARimageResources.get('play-button')}
                        onPress={this.onLiveMode}
                        style={{
                            width: 85,
                            height: 85,
                            opacity: 0.7,
                            resizeMode: 'stretch'}}
                    >

                    </ButtonTouchableComponent>}

                    {!this.state.liveMode && global.state.flowId !== "ar-flow-page-2" &&
                    <ButtonTouchableComponent
                        source={global.ARimageResources.get('signal-button')}
                        onPress={this.onAddPoint}
                        dropPinButtonDisable={this.props.controller.state.dropPinButtonDisable}
                        style={{
                            width: 70,
                            height: 95,
                            opacity: 0.7,
                            resizeMode: 'stretch'}}
                    >

                    </ButtonTouchableComponent>}
                    {!this.state.liveMode && global.state.flowId === "ar-flow-page-2" &&
                    <ButtonTouchableComponent
                        source={global.ARimageResources.get('router-button')}
                        onPress={this.onAddPoint}
                        dropPinButtonDisable={this.props.controller.state.dropPinButtonDisable}
                        style={{
                            width: 70,
                            height: 95,
                            opacity: 0.7,
                            resizeMode: 'stretch'}}
                    >

                    </ButtonTouchableComponent>}
                </View>
            </View>
        )
    }

    /**
     * Add point to the AR scene
     */
    onAddPoint() {
        this.props.controller.addPoint();
    }

    /**
     * Pause/resume live mode
     */
    onLiveMode() {
        this.props.controller.pauseLiveMode();
    }


}
// Load default styles
const styles = new Style().get();
