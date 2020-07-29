/**
 * AR Bottom Menu Component
 * All menu items that appear at the bottom of the AR screen are located here
 */

import React from "react";
import {View} from 'react-native';

import {
    faTrashAlt,
    faUndo,
    faUpload,
    faListUl
} from '@fortawesome/pro-solid-svg-icons';
import {faCog, faToggleOn, faToggleOff} from '@fortawesome/pro-light-svg-icons';

// Event Listener
import { EventRegister } from 'react-native-event-listeners';
// Style sheet
import Style from '../../styles/base/index';

// Import the custom button component
import ButtonTouchableComponent from '../../components/buttons/ButtonTouchableComponent';
import ButtonTouchableIconComponent from '../../components/buttons/ButtonTouchableIconComponent';
import ButtonTouchableTextComponent from '../../components/buttons/ButtonTouchableTextComponent';
import StackedButtonTouchableIconComponent from '../../components/buttons/StackedButtonTouchableIconComponent';

export default class BottomMenuComponent extends React.Component {

    // Event listeners   
    toggleLiveListener;
    pauseLiveListener;

    translations = {
        advancedDisplay:global.t.get$$([
            ['AR.ADVANCED_DISPLAY_ON'],
            ['AR.ADVANCED_DISPLAY_OFF']]),
        autoPin:global.t.get$$([
            ['AR.AUTO_PIN_MODE_ON'],
            ['AR.AUTO_PIN_MODE_OFF']]),
        promptPinDetails:global.t.get$$([
            ['AR.PIN_LOCATION_ON'],
            ['AR.PIN_LOCATION_OFF']]),
        linkSpeed:global.t.get$$([
            ['AR.LINKSPEED_ON'],
            ['AR.LINKSPEED_OFF']]),
        interference:global.t.get$$([
            ['AR.INTERFERENCE_ON'],
            ['AR.INTERFERENCE_OFF']])
    };

    // Local state
    state = {
        liveMode: false,
        liveModePaused: false,
        showPinOptions: false
    };

    // Create the bindings
    constructor() {
        super();

        this.onAddPoint = this.onAddPoint.bind(this);
        this.onLiveMode = this.onLiveMode.bind(this);
        this.onBigButton = this.onBigButton.bind(this);
        this.onChangePinType = this.onChangePinType.bind(this);
        this.onOpenSettings = this.onOpenSettings.bind(this);

        // AR Events
        global.TouchEvents.subscribe([

            // Touch events
            {id:this, name:global.const.AR_TOUCH, callback:()=> {
                this.setState({showPinOptions:false});}}
        ]);

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
        global.TouchEvents.remove(this, global.const.AR_TOUCH);

        EventRegister.removeEventListener(this.toggleLiveListener);
        EventRegister.removeEventListener(this.pauseLiveListener);
    }

    getPinTypeImage() {
        let pinType = this.props.controller.getPinType();
        if (pinType.name === "signal") {
            return global.ARimageResources.get('signal-button');
        }
        else if(pinType.name === "router") {
            return global.ARimageResources.get('router-button');
        }
        else if(pinType.name === "mesh") {
            return global.ARimageResources.get('mesh-button');
        }
        else if(pinType.name === "tv") {
            return global.ARimageResources.get('tv-button');
        }
    }

    getPinTypeButton() {
        if (this.props.controller.state.pinTypeSelected.signal) {
            return (
                <View key="big_button_container" style={{
                    flex: 1,
                    position: 'absolute',
                    flexDirection: 'row',
                    justifyContent: 'center',
                    alignItems: 'center',
                    width: 80,
                    height: 80,
                    top: 0,
                    bottom: 90,
                    transform: [{'translate': [-45, 0, 0]}]
                }}>
                    <ButtonTouchableComponent
                        source={global.ARimageResources.get('signal-button')}
                        onPress={this.onAddPoint}
                        onLongPress={this.onBigButton}
                        style={{
                            width: 95,
                            height: 95,
                            opacity: 0.7,
                            resizeMode: 'stretch'
                        }}
                    >

                    </ButtonTouchableComponent>
                </View>)
        }
        else if (this.props.controller.state.pinTypeSelected.router) {
            return (
                <View key="big_button_container" style={{
                    flex: 1,
                    position: 'absolute',
                    flexDirection: 'row',
                    justifyContent: 'center',
                    alignItems: 'center',
                    width: 80,
                    height: 80,
                    top: 0,
                    bottom: 90,
                    transform: [{'translate': [-45, 0, 0]}]
                }}>
                    <ButtonTouchableComponent
                        source={global.ARimageResources.get('router-button')}
                        onPress={this.onAddPoint}
                        onLongPress={this.onBigButton}
                        style={{
                            width: 95,
                            height: 95,
                            opacity: 0.7,
                            resizeMode: 'stretch'
                        }}
                    >

                    </ButtonTouchableComponent>
                </View>)
        }
        if (this.props.controller.state.pinTypeSelected.mesh) {
            return (
                <View key="big_button_container" style={{
                    flex: 1,
                    position: 'absolute',
                    flexDirection: 'row',
                    justifyContent: 'center',
                    alignItems: 'center',
                    width: 80,
                    height: 80,
                    top: 0,
                    bottom: 90,
                    transform: [{'translate': [-45, 0, 0]}]
                }}>
                    <ButtonTouchableComponent
                        source={global.ARimageResources.get('mesh-button')}
                        onPress={this.onAddPoint}
                        onLongPress={this.onBigButton}
                        style={{
                            width: 95,
                            height: 95,
                            opacity: 0.7,
                            resizeMode: 'stretch'
                        }}
                    >

                    </ButtonTouchableComponent>
                </View>)
        }
        if (this.props.controller.state.pinTypeSelected.tv) {
            return (
                <View key="big_button_container" style={{
                    flex: 1,
                    position: 'absolute',
                    flexDirection: 'row',
                    justifyContent: 'center',
                    alignItems: 'center',
                    width: 80,
                    height: 80,
                    top: 0,
                    bottom: 90,
                    transform: [{'translate': [-45, 0, 0]}]
                }}>
                    <ButtonTouchableComponent
                        source={global.ARimageResources.get('tv-button')}
                        onPress={this.onAddPoint}
                        onLongPress={this.onBigButton}
                        style={{
                            width: 95,
                            height: 95,
                            opacity: 0.7,
                            resizeMode: 'stretch'
                        }}
                    >

                    </ButtonTouchableComponent>
                </View>)
        }
    }

    // Render the bottom menu for AR
    render() {
        return(
            <View bottomMenu key="ar_bottom_menu_button_container" style={{position: 'absolute', flex:1, flexDirection:'row', right: 0, bottom: 40, justifyContent: 'center', alignItems: 'center', height: 58}}>
                <View key="delete_all_container" style={{flex:1, position: 'absolute', flexDirection:'row', justifyContent: 'center', alignItems: 'center', width:58, height: 58, top:0, bottom:0, transform: [{'translate': [-160, 35, 0]}]}}>
                    {this.props.controller.state.menuOptionsVisible &&
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

                <View key="settings_container" style={{flex:1, zIndex: 1000, position: 'absolute', flexDirection:'row', justifyContent: 'center', alignItems: 'center', width:58, height: 58, top:0, bottom:0, transform: [{'translate': [-45, -70, 0]}]}}>
                    <ButtonTouchableIconComponent
                            source ={faCog}
                            onPress={this.onOpenSettings}
                            size={30}
                            style={{
                                width: 50,
                                height: 50,
                                opacity: 0.7,
                                resizeMode: 'stretch'}}
                    >
                    </ButtonTouchableIconComponent>
                </View>
                {this.props.controller.state.settingsVisible &&
                <View key="detailed_basic_container" style={{flex:1, zIndex: 1000, position: 'absolute', flexDirection:'row', justifyContent: 'center', alignItems: 'center', width:58, height: 58, top:0, bottom:0, transform: [{'translate': [-45, -120, 0]}]}}>
                    <ButtonTouchableIconComponent
                        source ={this.props.controller.state.detailedMode ? faToggleOn : faToggleOff}
                        onPress={()=>{
                            let state = this.props.controller.state.detailedMode;
                            this.props.controller.setState({detailedMode: !state});
                            global.AREvents.emit({name:global.const.AR_SCENE_STATE_UPDATE, data:{detailedMode: !state, needsRender:true}})
                        }}
                        text={this.props.controller.state.detailedMode ? this.translations.advancedDisplay[0] : this.translations.advancedDisplay[1]}
                        size={25}
                        opacity={1}
                        iconColor={this.props.controller.state.detailedMode ? styles.selected.color : 'white'}
                        style={{
                            width: 50,
                            height: 50,
                            resizeMode: 'stretch'}}
                    >
                    </ButtonTouchableIconComponent>
                </View>}

                {this.props.controller.state.settingsVisible &&
                <View key="manual_auto_container" style={{flex:1, zIndex: 1000, position: 'absolute', flexDirection:'row', justifyContent: 'center', alignItems: 'center', width:58, height: 58, top:0, bottom:0, transform: [{'translate': [-45, -160, 0]}]}}>
                    <ButtonTouchableIconComponent
                        source ={this.props.controller.state.liveMode ? faToggleOn : faToggleOff}
                        onPress={()=>{
                            this.props.controller.toggleLiveMode();
                        }}
                        text={this.props.controller.state.liveMode ? this.translations.autoPin[0] : this.translations.autoPin[1]}
                        size={25}
                        iconColor={this.props.controller.state.liveMode ? styles.selected.color : 'white'}
                        opacity={1}
                        style={{
                            width: 50,
                            height: 50,
                            resizeMode: 'stretch'}}
                    >
                    </ButtonTouchableIconComponent>
                </View>}

                {this.props.controller.state.settingsVisible && !this.props.controller.state.liveMode &&
                <View key="auto_naming_container" style={{flex:1, zIndex: 1000, position: 'absolute', flexDirection:'row', justifyContent: 'center', alignItems: 'center', width:58, height: 58, top:0, bottom:0, transform: [{'translate': [-45, -200, 0]}]}}>
                    <ButtonTouchableIconComponent
                        source ={this.props.controller.state.locationPinNaming ? faToggleOn : faToggleOff}
                        onPress={()=>{
                            this.props.controller.toggleLocationNaming();
                        }}
                        text={this.props.controller.state.locationPinNaming ? this.translations.promptPinDetails[0] : this.translations.promptPinDetails[1]}
                        size={25}
                        iconColor={this.props.controller.state.locationPinNaming ? styles.selected.color : 'white'}
                        opacity={1}
                        style={{
                            width: 50,
                            height: 50,
                            resizeMode: 'stretch'}}
                    >
                    </ButtonTouchableIconComponent>
                </View>}

                {this.props.controller.state.settingsVisible && this.props.controller.state.detailedMode &&
                <View key="speed_container" style={{flex:1, zIndex: 1000, position: 'absolute', flexDirection:'row', justifyContent: 'center', alignItems: 'center', width:58, height: 58, top:0, bottom:0, transform: [{'translate': [-45, this.props.controller.state.liveMode ? -200 : -240, 0]}]}}>
                    <ButtonTouchableIconComponent
                        source ={this.props.controller.state.nodeOptions.speed ? faToggleOn : faToggleOff}
                        onPress={()=>{
                            this.props.controller.toggleNodeDetail(1);
                        }}
                        text={this.props.controller.state.nodeOptions.speed ? this.translations.linkSpeed[0] : this.translations.linkSpeed[1]}
                        size={25}
                        opacity={1}
                        iconColor={this.props.controller.state.nodeOptions.speed ? styles.selected.color : 'white'}
                        style={{
                            width: 50,
                            height: 50,
                            resizeMode: 'stretch'}}
                    >
                    </ButtonTouchableIconComponent>
                </View>}

                {this.props.controller.state.settingsVisible && this.props.controller.state.detailedMode &&
                <View key="interference_container" style={{flex:1, zIndex: 1000, position: 'absolute', flexDirection:'row', justifyContent: 'center', alignItems: 'center', width:58, height: 58, top:0, bottom:0, transform: [{'translate': [-45, this.props.controller.state.liveMode ? -240 : -280, 0]}]}}>
                    <ButtonTouchableIconComponent
                        source ={this.props.controller.state.nodeOptions.interference ? faToggleOn : faToggleOff}
                        onPress={()=>{
                            this.props.controller.toggleNodeDetail(2);
                        }}
                        text={this.props.controller.state.nodeOptions.interference ? this.translations.interference[0] : this.translations.interference[1]}
                        size={25}
                        opacity={1}
                        iconColor={this.props.controller.state.nodeOptions.interference ? styles.selected.color : 'white'}
                        style={{
                            width: 50,
                            height: 50,
                            resizeMode: 'stretch'}}
                    >
                    </ButtonTouchableIconComponent>
                </View>}

                {this.props.controller.state.settingsVisible && this.props.controller.state.detailedMode &&
                <View key="measurement_dbm_container" style={{flex:1, zIndex: 1000, position: 'absolute', flexDirection:'row', justifyContent: 'center', alignItems: 'center', width:58, height: 58, top:0, bottom:0, transform: [{'translate': [-45, this.props.controller.state.liveMode ? -280 : -320, 0]}]}}>
                    <ButtonTouchableTextComponent
                        onPress={()=>{
                            this.props.controller.changeStrengthUnits('dBm');
                        }}
                        label={"dBm"}
                        size={25}
                        opacity={1}
                        iconColor={this.props.controller.state.measurement === 'dBm' ? styles.selected.color : 'white'}
                        style={{
                            width: 50,
                            height: 50,
                            resizeMode: 'stretch'}}
                    >
                    </ButtonTouchableTextComponent>
                </View>}

                {this.props.controller.state.settingsVisible && this.props.controller.state.detailedMode &&
                <View key="measurement_percent_container" style={{flex:1, zIndex: 1000, position: 'absolute', flexDirection:'row', justifyContent: 'center', alignItems: 'center', width:58, height: 58, top:0, bottom:0, transform: [{'translate': [-85, this.props.controller.state.liveMode ? -280 : -320, 0]}]}}>
                    <ButtonTouchableTextComponent
                        onPress={()=>{
                            this.props.controller.changeStrengthUnits('%');
                        }}
                        label={"%"}
                        text={global.t.get$('AR.SIGNAL_LEVEL_UNITS')}
                        size={25}
                        opacity={1}
                        iconColor={this.props.controller.state.measurement === '%' ? styles.selected.color : 'white'}
                        style={{
                            width: 50,
                            height: 50,
                            resizeMode: 'stretch'}}
                    >
                    </ButtonTouchableTextComponent>
                </View>}

                <View key="upload_button_container" style={{flex:1, position: 'absolute', flexDirection:'row', justifyContent: 'center', alignItems: 'center', width:58, height: 58, top:0, bottom:0, transform: [{'translate': [-215, 35, 0]}]}}>
                    <ButtonTouchableIconComponent
                        source ={faListUl}
                        onPress={()=>{
                            this.props.controller.uploadSiteVisit();
                        }}
                        size={30}
                        opacity={1}
                        style={{
                            width: 50,
                            height: 50,
                            resizeMode: 'stretch'}}
                    >
                    </ButtonTouchableIconComponent>
                </View>


                {!this.state.showPinOptions &&
                <View key="big_button_container" style={{flex:1, position: 'absolute', flexDirection:'row', justifyContent: 'center', alignItems: 'center', width:80, height: 80, top:0, bottom:90, transform: [{'translate': [-45, 0, 0]}]}}>
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

                    {!this.state.liveMode &&
                    <ButtonTouchableComponent
                        source={this.props.controller.pinType}
                        onPress={this.onAddPoint}
                        onLongPress={this.onBigButton}
                        style={{
                            width: 75,
                            height: 95,
                            opacity: 0.7,
                            resizeMode: 'stretch'}}
                    >

                    </ButtonTouchableComponent>}
                </View>}

                {this.state.showPinOptions &&
                <View key="big_button_container" style={{flex:1, position: 'absolute', flexDirection:'row', justifyContent: 'center', alignItems: 'center', width:80, height: 80, top:0, bottom:90, transform: [{'translate': [-45, 0, 0]}]}}>
                    <ButtonTouchableComponent
                        source={this.props.controller.pinType}
                        onPress={this.onAddPoint}
                        onLongPress={this.onBigButton}
                        style={{
                            width: 75,
                            height: 95,
                            opacity: 0.7,
                            resizeMode: 'stretch'}}
                    >

                    </ButtonTouchableComponent>
                </View>}

                {this.state.showPinOptions &&
                <View key="big_button_tv_option_container" style={{flex:1, zIndex: 1000, position: 'absolute', flexDirection:'row', justifyContent: 'center', alignItems: 'center', width:58, height: 58, top:0, bottom:0, transform: [{'translate': [-100, -50, 0]}]}}>
                    <ButtonTouchableComponent
                        source ={global.ARimageResources.get('select-tv')}
                        onPress={()=>{
                            this.onChangePinType("tv");
                        }}
                        text={"TV Box"}
                        size={25}
                        opacity={1}
                        top={20}
                        style={{
                            width: 30,
                            height: 30,
                            resizeMode: 'stretch'}}
                    >
                    </ButtonTouchableComponent>
                </View>}

                {this.state.showPinOptions &&
                    <View key="big_button_router_option_container" style={{flex:1, zIndex: 1000, position: 'absolute', flexDirection:'row', justifyContent: 'center', alignItems: 'center', width:58, height: 58, top:0, bottom:0, transform: [{'translate': [-140, -90, 0]}]}}>
                        <ButtonTouchableComponent
                            source ={global.ARimageResources.get('select-router')}
                            onPress={()=>{
                                this.onChangePinType("router");
                            }}
                            text={"Router"}
                            size={25}
                            opacity={1}
                            top={20}
                            style={{
                                width: 30,
                                height: 30,
                                resizeMode: 'stretch'}}
                        >
                        </ButtonTouchableComponent>
                    </View>}

                {this.state.showPinOptions &&
                <View key="big_button_mesh_option_container" style={{flex:1, zIndex: 1000, position: 'absolute', flexDirection:'row', justifyContent: 'center', alignItems: 'center', width:58, height: 58, top:0, bottom:0, transform: [{'translate': [-180, -130, 0]}]}}>
                    <ButtonTouchableComponent
                        source ={global.ARimageResources.get('select-mesh')}
                        onPress={()=>{
                            this.onChangePinType("mesh");
                        }}
                        text={"Mesh"}
                        size={25}
                        opacity={1}
                        top={20}
                        style={{
                            width: 25,
                            height: 30,
                            resizeMode: 'stretch'}}
                    >
                    </ButtonTouchableComponent>
                </View>}

                {this.state.showPinOptions &&
                <View key="big_button_signal_option_container" style={{flex:1, zIndex: 1000, position: 'absolute', flexDirection:'row', justifyContent: 'center', alignItems: 'center', width:58, height: 58, top:0, bottom:0, transform: [{'translate': [-220, -170, 0]}]}}>
                    <ButtonTouchableComponent
                        source ={global.ARimageResources.get('select-signal')}
                        onPress={()=>{
                            this.onChangePinType("signal");
                        }}
                        text={"Signal"}
                        size={25}
                        opacity={1}
                        top={20}
                        style={{
                            marginTop: 5,
                            width: 30,
                            height: 25,
                            resizeMode: 'stretch'}}
                    >
                    </ButtonTouchableComponent>
                </View>}
            </View>
        )
    }

    /**
     * Open settings
     */
    onOpenSettings() {
        global.AREvents.emit({name:global.const.AR_SETTINGS_TOGGLE});
    }

    /**
     * Add point to the AR scene
     */
    onAddPoint() {      
            global.state.processing = true;
            this.props.controller.addPoint();
    }

    /**
     * Pause/resume live mode
     */
    onLiveMode() {
        global.TouchEvents.emit({name:global.const.AR_TOUCH});
        this.props.controller.pauseLiveMode();
    }

    /**
     * Show more pin options
     */
    onBigButton() {
        global.TouchEvents.emit({name:global.const.AR_TOUCH});
        this.setState({showPinOptions: true});
    }

    /**
     * Change the pin type
     */
    onChangePinType(name) {
        this.props.controller.changePinType(name);
        this.setState({showPinOptions: false});
    }


}
// Load default styles
const styles = new Style().get("AR");

/*
<View key="list_points_container" style={{flex:1, position: 'absolute', flexDirection:'row', justifyContent: 'center', alignItems: 'center', width:58, height: 58, top:0, bottom:0, transform: [{'translate': [-215, 35, 0]}]}}>
                    {this.props.controller.state.menuOptionsVisible &&
                    <ButtonTouchableIconComponent
                        source ={faListUl}
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
 */
