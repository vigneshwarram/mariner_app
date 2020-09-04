/**
 * AR Top Menu Component
 * All menu items that appear at the top of the AR screen are located here which
 * includes the banner itself
 */
import React from "react";
import {Image} from 'react-native';
import {EventRegister} from 'react-native-event-listeners';
import {FontAwesomeIcon} from '@fortawesome/react-native-fontawesome';
import {faCheckCircle, faExclamationTriangle, faTimesCircle} from '@fortawesome/pro-solid-svg-icons';
import SignalThresholds from "../../app_code/configuration/thresholds/signal";

// Style sheet
import Style from '../../styles/base/index'
import TopMenuSubComponent from './components/TopMenu';
import TopSimpleMenuSubComponent from './components/guided/TopSimpleMenu';

export default class TopMenuComponent extends React.Component {

    // Generate an ID for events
    eventID = global.Events.generateId();

    // Signal Thresholds
    signalThresholds = new SignalThresholds();

    // Listener
    wifiListener;
    linkspeedListener;
    interferenceListener;
    wifiListenerUpdate;
    deletePointListener;

    // Collection of signal strengths
    signalStrengths = [];
    processing = false;

    // Local state
    state = {
        wifiDetails: {
            signal: 0,
            color: {
              style:null
            },
            textColor:'#0093f6',
            signal_label: '',
            signal_type: 0,
            name: '',
            bssid: ''
        },
        signalStrengthDetails: {
            average: {
                value: -127,
                color: "green",
                icon: "0",
                label: global.t.get$('TEXT.EXCELLENT')
            },
            min: {
                value: -127,
                color: "green",
                icon: "0",
                label: global.t.get$('TEXT.EXCELLENT')
            },
            max: {
                value: 0,
                color: "green",
                icon: "0",
                label: global.t.get$('TEXT.EXCELLENT')
            }
        },
        linkSpeed: null,
        interference: {
            type: 0,
            value: 10,
            label: global.t.get$('TEXT.EXCELLENT'),
            color: "green"
        },
        debugValues: {
            x: 0,
            y: 0,
            z: 0
        }
    };

    // Constructor
    constructor() {
        super();

        global.AREvents.subscribe([
            {id:this.eventID, name: global.const.AR_WIFI_DETAILS_HEADER, callback:(data) => {
                    this.setState({wifiDetails:data});}}
        ]);

        global.ButtonEvents.subscribe([
            {id:this.eventID, name: global.const.AR_DELETE_ALL_POINTS, callback:(data) => {
                    this.signalStrengths = [];
                    this.setState({signalStrengthDetails: {
                            average: {
                                value: -127,
                                color: "green",
                                icon: "0",
                                label: global.t.get$('TEXT.EXCELLENT')
                            },
                            min: {
                                value: 0,
                                color: "green",
                                icon: "0",
                                label: global.t.get$('TEXT.EXCELLENT')
                            },
                            max: {
                                value: -127,
                                color: "green",
                                icon: "0",
                                label: global.t.get$('TEXT.EXCELLENT')
                            }
                        }});}}
        ]);

        // Get the latest link speed
        this.linkspeedListener = EventRegister.addEventListener(global.const.AR_WIFI_LINK_SPEED, (data) => {
            this.setState({linkSpeed:data});
        });

        // Get the latest interference speed
        this.interferenceListener = EventRegister.addEventListener(global.const.AR_WIFI_INTERFERENCE, (data) => {
            this.setState({interference:data});
        });

        // Listen for wifi signal changes
        this.wifiListenerUpdate = EventRegister.addEventListener(global.const.AR_WIFI_DETAILS_HEADER_UPDATE, (data) => {
            if (data != null) {
                this.signalStrengths.push(data);
            }
            if (!this.processing) this.getSignalAverage();
        });
    }

    // Component unmounting
    componentWillUnmount() {

        // Remove listeners
        global.AREvents.remove(this.eventID);
        global.ButtonEvents.remove(this.eventID);

        EventRegister.removeEventListener(this.linkspeedListener);
        EventRegister.removeEventListener(this.interferenceListener);
        EventRegister.removeEventListener(this.wifiListenerUpdate);
    }

    // Calculate the signal strength average
    getSignalAverage() {
        this.processing = true;
        let processed = 1;

        let sum = 0;
        let min = this.state.signalStrengthDetails.max.value;
        let max = this.state.signalStrengthDetails.min.value;
        this.signalStrengths.forEach((strength) => {
            if (strength <= this.state.signalStrengthDetails.max.value || strength <= max) {
                max = strength;
            }
            if (strength >= this.state.signalStrengthDetails.min.value || strength >= min) {
                min = strength;
            }
            sum += parseInt( strength, 10 );

            // How many items processed
            processed ++;

            // If at the end of the array.. complete
            if (processed >= this.signalStrengths.length) {
                let avg = Math.round(sum / this.signalStrengths.length);

                this.setState({
                    signalStrengthDetails: {
                        average: this.getStrengthObject(avg),
                        min: this.getStrengthObject(min),
                        max: this.getStrengthObject(max)
                    }
                });
                this.processing = false;
            }
        });
    }

    /**
     * Get the strength object back based on value
     * @param value
     */
    getStrengthObject(value) {
        let result = this.signalThresholds.getResult(value);

        let object = {
            value: value,
            color: "green",
            icon: "0",
            label: ""
        };

        switch(result) {
            case global.const.THRESHOLD_CRITICAL:
                object.color = "red";
                object.icon = "3";
                object.label = global.t.get$('TEXT.POOR');
                return object;
            case global.const.THRESHOLD_MAJOR:
                object.color = "yellow";
                object.icon = "2";
                object.label = global.t.get$('TEXT.FAIR');
                return object;
            case global.const.THRESHOLD_MINOR:
                object.color = "green";
                object.icon = "1";
                object.label = global.t.get$('TEXT.GOOD');
                return object;
            default:
                object.color = "green";
                object.icon = "0";
                object.label = global.t.get$('TEXT.EXCELLENT');
        }
        return object;
    }

    /**
     * Render the health icon based on signal average
     * @returns {*}
     */
    renderHealthIcon() {
        if (this.state.signalStrengthDetails.average.icon === '3') {
            return (
                <FontAwesomeIcon style={{
                    flex: 0.3,
                    marginTop: 0,
                    marginRight: 10,
                    textAlign: 'left'
                }} color={'red'} size={26} icon={faTimesCircle}/>
            )
        }
        else if (this.state.signalStrengthDetails.average.icon === '2') {
            return (
                <FontAwesomeIcon style={{
                    flex: 0.3,
                    marginTop: 0,
                    marginRight: 10,
                    textAlign: 'left'
                }} color={'yellow'} size={26} icon={faExclamationTriangle}/>
            )
        }
        else {
            return (
                <FontAwesomeIcon style={{
                    flex: 0.3,
                    marginTop: 0,
                    marginRight: 10,
                    textAlign: 'left'
                }} color={'green'} size={26} icon={faCheckCircle}/>
            )
        }
    }

    /**
     * Render the wifi icon on the banner
     * @returns {*}
     */
    renderSignalStrengthIcon(resize=false, min=false) {
        let iconImage = global.ARimageResources.get('wifi-excellent');
        switch(this.state.wifiDetails.signal_type) {

            // Red
            case 3: {
                iconImage = global.ARimageResources.get('wifi-poor');
                break;
            }

            // Yellow
            case 2: {
                iconImage = global.ARimageResources.get('wifi-good');
                break;
            }

            // Green
            case 1: {
                iconImage = global.ARimageResources.get('wifi-ok');
                break;
            }
        }

        return (
            <Image style={{
                flex: resize ? 1 : 0.5,
                height: min ? 15 : 65,
                resizeMode: 'contain',
                marginLeft: resize ? 0 : 20,
                marginTop: 0
            }}
                   source={iconImage}
            />
        )
    }

    /**
     * Render the speed icon on the banner
     * @returns {*}
     */
    renderinterferenceIcon(resize=false) {

        let iconImage = global.ARimageResources.get('speed-excellent');
        switch(this.state.interference.type) {

            // Red
            case 3: {
                iconImage = global.ARimageResources.get('speed-poor');
                break;
            }

            // Yellow
            case 2: {
                iconImage = global.ARimageResources.get('speed-good');
                break;
            }
             // Yellow
             case 1: {
                iconImage = global.ARimageResources.get('speed-excellent');
                break;
            }
        }

        return (
            <Image style={{
                flex: resize ? 1 : 0.5,
                height: 45,
                resizeMode: 'contain',
                marginLeft: resize ? 0 : 20,
                marginTop: 15
            }}
                   source={iconImage}
            />
        );
    }

    /**
     * Render the interference icon on the banner
     * @returns {*}
     */
    renderSpeedIcon(resize=false) {

        let iconImage = global.ARimageResources.get('interference-excellent');
        switch(this.state.wifiDetails.signal_type) {

            // Red
            case 3: {
                iconImage = global.ARimageResources.get('interference-poor');
                break;
            }

            // Yellow
            case 2: {
                iconImage = global.ARimageResources.get('interference-good');
                break;
            }
              // green
              case 1: {
                iconImage = global.ARimageResources.get('interference-excellent');
                break;
            }
        }

        return (
            <Image style={{
                flex: resize ? 1 : 0.5,
                height: 45,
                resizeMode: 'contain',
                marginLeft: resize ? 0 : 20,
                marginTop: 15
            }}
                   source={iconImage}
            />
        );
    }

    /**
     * Render the top menu components
     * @returns {*}
     */
    renderMenu() {
        if (global.state.ARMode === global.const.AR_WORKFLOW_MODE) {
            return (
                <TopSimpleMenuSubComponent parent={this.props.controller} controller={this} link {...this}/>
            );
        }
        return (
            <TopMenuSubComponent parent={this.props.controller} controller={this} link {...this}/>
        );
    }


    /**
     * Render the top menu items
     * @returns {*}
     */
    render() {
        console.disableYellowBox = true;
        return (
            this.renderMenu()
        )
    }
}


// Load default styles
const styles = new Style().get("AR");
