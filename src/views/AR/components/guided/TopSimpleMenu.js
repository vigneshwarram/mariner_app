/**
 * AR Top Menu Component for Android
 * All menu items that appear at the top of the AR screen are located here which
 * includes the banner itself
 */
import React from "react";
import {Text, TouchableOpacity, TouchableWithoutFeedback, View, PermissionsAndroid} from 'react-native';
import {EventRegister} from 'react-native-event-listeners';

// Google Maps
import geolocation from '@react-native-community/geolocation';
// Style sheet
import Style from '../../../../styles/views/ar';

// Import Font Awesome
import {FontAwesomeIcon} from '@fortawesome/react-native-fontawesome';
import {faChevronDown, faChevronUp} from '@fortawesome/pro-solid-svg-icons';

// Geolocation tracking
const ASPECT_RATIO = 125 / 150;
const LAT_DELTA = 0.0922;
const LONG_DELTA = LAT_DELTA + (ASPECT_RATIO);


/**
 * Get rotation
 * @param previousPosition
 * @param currentPosition
 * @returns {number}
 */
const getRotationAngle = (previousPosition, currentPosition) => {
    const x1 = previousPosition.latitude;
    const y1 = previousPosition.longitude;
    const x2 = currentPosition.latitude;
    const y2 = currentPosition.longitude;

    const xDiff = x2 - x1;
    const yDiff = y2 - y1;

    return (Math.atan2(yDiff, xDiff) * 180.0) / Math.PI;
};


export default class TopSimpleMenuSubComponent extends React.Component {

    // Geolocation
    watchID;
    mounted = false;

    // Reference the global tracking class
    tracking = global.tracking;


    // Local state
    state = {
        ARAppProps: {},
        latestUpdatePosition: null
    };

    // isometric object
    iso = null;
    isoNodes = [];
    heatmap;

    constructor(props) {
        super(props);
    }
    /**
     * Start tracking
     */
    componentDidMount() {
        this.mounted = true;
        if (Platform.OS === 'android') {
            PermissionsAndroid.request(
                PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION
            ).then(granted => {
                if (granted && this.mounted) {
                    this.watchLocation();
                }
            });
        } else {
            this.watchLocation();
        }
    }

    // Stop tracking
    componentWillUnmount() {
        this.mounted = false;
        if (this.watchID) {
            geolocation.clearWatch(this.watchID);
        }
    }

    /**
     * Heat map canvas
     * @param canvas
     */
    handleCanvas = (canvas) => {


        /*if (canvas) {
            const ctx = canvas.getContext('2d');
            ctx.fillStyle = 'dark grey';
            ctx.fillRect(0, 0, 500, 800);
            this.heatmap = new HeatMap(canvas);

            this.heatmap.add(new Point(
                "test",
                "circle",
                [0,0,0]
            ));

            setInterval(() => {
                this.heatmap.loadPositions();
                //this.heatmap.forward();
            }, 1000);
        }*/
    };

    /**
     * Track user geolocation information
     */
    watchLocation() {
        this.getCurrentLocation();

        this.watchID = geolocation.watchPosition((position) => {
            this.tracking.location = {
                latitude: position.coords.latitude,
                longitude: position.coords.longitude,
                latitudeDelta: LAT_DELTA,
                longitudeDelta: LONG_DELTA,
                heading: position.coords.heading
            };

        }, (error)=> alert('Location services have not been enabled'), {
            enableHighAccuracy: false,
            timeout: 100,
            maximumAge: 0,
            distanceFilter: 1
        });
    }

    /**
     * Get the current location
     */
    getCurrentLocation() {
        geolocation.getCurrentPosition((position) => {

            // Track the last known location to the global tracking class
            this.tracking.location = {
                latitude: position.coords.latitude,
                longitude: position.coords.longitude,
                latitudeDelta: LAT_DELTA,
                longitudeDelta: LONG_DELTA,
                heading: position.coords.heading
            };

        }, (error)=> {}, {
            enableHighAccuracy: false,
            timeout: 100,
            maximumAge: 0,
            distanceFilter: 1
        });
    }

    /**
     * Render the top menu items
     * @returns {*}
     */
    render() {

        if (this.props.parent.state.menuOptionsVisible) {
            return (
                <View style={{
                    backgroundColor: '#000000',
                    opacity: this.props.parent.state.menuOptionsVisible ? 0.7 : 0,
                    flex: 1,
                    position: 'absolute',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: this.props.parent.state.expandedMode ? 200 : 50
                }}>
                    {!this.props.parent.state.expandedMode &&
                    <View style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        flexDirection: 'row',
                        alignItems: 'flex-start',
                        width: 20,
                        flex: 0.1,
                        marginLeft: 5,
                        marginTop: 15
                    }}>
                        {this.props.controller.renderSignalStrengthIcon(true, true)}
                    </View>}
                    <View style={{
                        flex: .45,
                        flexDirection: 'row',
                        justifyContent: 'space-evenly',
                        alignItems: 'flex-start',
                        left: 0,
                        top: 0,
                        right: 0,
                        width: '100%'
                    }}>
                        <TouchableOpacity onPress={() => {
                            this.props.parent.setState({detailedMode: true});
                            global.AREvents.emit({name:global.const.AR_SCENE_STATE_UPDATE, data:{detailedMode: true, needsRender:true}})
                        }}>
                            <View style={{
                                width: 500,
                                borderRadius: 5,
                                alignItems: 'flex-start',
                                height: 160,
                                marginTop: 0,
                                paddingLeft: 0,
                                paddingRight: 0
                            }}>
                                <View style={{
                                    flex: 1,
                                    flexDirection: 'row',
                                    justifyContent: 'flex-start',
                                    width: 500,
                                    paddingTop: 0
                                }}>
                                    <View style={{
                                        flexDirection: 'column',
                                        flex: 0.9,
                                        marginLeft: 5,
                                        marginTop: 0
                                    }}>
                                        <View style={{
                                            flexDirection: 'row',
                                            flex: 0.5,
                                            marginLeft: 0,
                                            marginTop: 10,
                                            marginBottom: 30
                                        }}>
                                            <View style={{
                                                flexDirection: 'column',
                                                flex: 0.9,
                                                marginLeft: this.props.parent.state.expandedMode ? 5 : 25,
                                                marginTop: 5,
                                                height: 100
                                            }}>
                                                <View style={{flexDirection: 'row'}}>
                                                    <Text style={[styles.plainTextHeader, {
                                                        textAlign: 'left',
                                                        color: '#0093f6',
                                                        fontSize: 14
                                                    }]}>{this.props.controller.state.wifiDetails.name}</Text>
                                                    {this.props.controller.state.wifiDetails.freq !== "" &&
                                                    <Text style={[styles.plainTextHeader, {
                                                        textAlign: 'left',
                                                        color: '#0093f6',
                                                        fontSize: 14
                                                    }]}> ({this.props.controller.state.wifiDetails.freq})</Text>
                                                    }
                                                </View>
                                            </View>
                                        </View>

                                        <View style={{
                                            flexDirection: 'row',
                                            flex: 10,
                                            marginLeft: -20,
                                            marginTop: 10,
                                            opacity: this.props.parent.state.expandedMode ? 1 : 0
                                        }}>
                                            <View style={{
                                                flexDirection: 'column',
                                                height: 135,
                                                flex: 1,
                                                marginLeft: 0,
                                                marginTop: 0
                                            }}>
                                                <View style={{
                                                    flexDirection: 'row',
                                                    flex: 3,
                                                    marginLeft: 10,
                                                    marginTop: 20
                                                }}>
                                                    {this.props.parent.state.expandedMode && this.props.controller.renderSignalStrengthIcon()}
                                                </View>
                                                <View style={{
                                                    flexDirection: 'row',
                                                    flex: 1,
                                                    marginLeft: 5,
                                                    marginTop: 40
                                                }}>
                                                </View>
                                                <Text style={[styles.plainTextHeader, {
                                                    flex: 0,
                                                    textAlign: 'center',
                                                    fontSize: 20,
                                                    color: '#0093f6',
                                                    marginTop: 25,
                                                    height: 35,
                                                    width: 160
                                                }, this.props.controller.state.wifiDetails.color.style]}>{this.props.controller.state.wifiDetails.signal_label}</Text>
                                            </View>
                                            <View style={{
                                                flex: 1,
                                                flexDirection: 'column',
                                                alignItems: 'stretch',
                                                opacity: 0.4,
                                                marginTop: -10,
                                                width: 125,
                                                height: 150,
                                                backgroundColor: 'transparent'
                                            }}>
                                            </View>
                                        </View>
                                    </View>
                                </View>
                            </View>
                        </TouchableOpacity>
                    </View>

                    <TouchableOpacity onPress={() => {
                        global.AREvents.emit({name:global.const.AR_MENU_TOGGLE, data:null});
                        //EventRegister.emit(global.const.AR_MENU_TOGGLE, null);
                    }} style={{
                        position: 'absolute',
                        top: 0,
                        right: 0,
                        width: 50,
                        height: 50,
                        textAlign: 'center',
                        justifyContent: 'center',
                        alignItems: 'center',
                        opacity: 0.5,
                    }}>
                        <FontAwesomeIcon active size={30} color={'white'} icon={this.props.parent.state.expandedMode ? faChevronUp : faChevronDown}/>
                    </TouchableOpacity>

                    {global.state.flowId !== "ar-flow-page-2" &&
                    <View style={{
                        position: 'absolute',
                        top: 0,
                        right: 45,
                        width: 80,
                        height: 50,
                        textAlign: 'center',
                        justifyContent: 'center',
                        alignItems: 'center',
                    }}>
                        <View style={{
                            flexDirection: 'column',
                            justifyContent: 'center',
                            alignItems: 'center'
                        }}>
                            <Text style={{color:'#ffffff', fontSize: 16, textAlign: 'center', marginRight: 10}}>{global.t.get$('AR.PINS')}: {global.tracking.mapItems.length > 1 ? global.tracking.mapItems.length-1 : 0}</Text>
                        </View>
                    </View>}
                    <View style={{
                        left: 0,
                        top: 100,
                        width: 600,
                        height: 200
                    }}>

                    </View>
                </View>
            )
        }
        else return null;
    }
}

/*
<Canvas>
                                                            <mesh>
                                                                <planeBufferGeometry attach="geometry" args={[1, 1]} />
                                                                <meshBasicMaterial attach="material" color="hotpink" opacity={0.5} transparent />
                                                            </mesh>
                                                        </Canvas>





                                                        <View style={{flex: 0, flexDirection: 'column'}}>
                <Text style={{fontSize: 15, color: '#000000'}}>{global.tracking.magnetometerDirection ? String(global.tracking.moving)  + " " + global.tracking.magnetometerDirection[2] + " " + global.tracking.heading : 'null'}</Text>
                <HeatMap/>
            </View>
 */
// Load default styles
const styles = new Style().get();
