/**
 * Location Test Detail View
 */

// Import Components
import React from "react";
import {
    StatusBar,
    View,
    ScrollView
} from 'react-native';
import {
    Label
} from "native-base";
import Icon from 'react-native-vector-icons/FontAwesome';

import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faInfoSquare } from '@fortawesome/pro-regular-svg-icons';

// Default style sheet
import Style from '../styles/views/location_details'

// Global state for navigation options
import Global_State from '../constants/global';

// Import the main parts of each view
import AnimatedStackView from '../styles/components/stack_view';
import NavigationButtons from "../styles/components/navigation_buttons";
import Header from "../styles/components/view_header";

export default class LocationTestDetailView extends React.Component {
    static navigationOptions = ({ navigation }) => Global_State.getInstance().viewStyleOptions(null);

    // Global state
    Global = global.state;

    // Global configuration
    Configuration = global.configuration;

    // Local state
    state = {
        location_details:null
    };

    // Constructor
    constructor(props) {
        super(props);
    }

    // View mounted and ready
    componentDidMount(){

        // Grab the location details from the passed parameters
        //this.setState({location_details:this.props.navigate.getParam('location')});
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
        const details = this.props.navigation.getParam('location', 'unknown');

        return (
            <AnimatedStackView>
                <View style={styles.container}>
                    <StatusBar hidden />
                    <Header style={styles.header} label={'Location Test Details'} icon={faInfoSquare}/>
                    <View style={{flex:0, flexDirection:'row', marginTop:10, marginBottom:10}}>
                        <View style={{flex:1, flexDirection:'column', paddingLeft: 5}}>
                            <Label>{details.location}</Label>
                            <Label>{details.time}</Label>
                        </View>
                        <View style={{flex:1, alignItems:'flex-end', flexDirection:'column', paddingBottom: 5, paddingRight: 5}}>
                            <Icon active={true} style={[{color:details.locationResult.color, marginTop:10, fontSize:40}]} name={details.locationResult.icon} />
                        </View>
                    </View>

                    <View style={{flex:0, flexDirection:'row', borderBottomColor:'#000', borderWidth:1, minHeight: 40}}>
                        <Label style={{paddingTop: 5, paddingLeft: 5, backgroundColor:'#4dbdea', flex:1}}>{global.t.get$("WIFI.MEASUREMENT")}</Label>
                        <Label style={{paddingTop: 5, textAlign:'center', backgroundColor:'#4dbdea', flex:2}}>{global.t.get$("HEADER.RESULT")}</Label>
                    </View>
                    <ScrollView style={{flexDirection:'column', flex:0, marginBottom:-30}}>
                        {details.testType === 'speedTest' &&
                        <View style={styles.grid_container}>
                            <Label style={styles.content_item}>{global.t.get$("WIFI.SSID")}</Label>
                            <Label style={{textAlign:'center', flex:2, paddingTop: 5}}>{details.wifiDetails.getSSID()}</Label>
                        </View>
                        }
                        {details.testType === 'speedTest' &&
                        <View style={styles.grid_container}>
                            <Label style={styles.content_item}>{global.t.get$("WIFI.BSSID")}</Label>
                            <Label style={{textAlign:'center', flex:2, paddingTop: 5}}>{details.wifiDetails.getBSSID()}</Label>
                        </View>
                        }
                        {details.testType === 'signalTest' &&
                        <View style={styles.grid_container}>
                            <Label style={styles.content_item}>{global.t.get$("WIFI.SSID")}</Label>
                            {details.signalTest24.BSSID !== "" &&
                                <Label style={{textAlign:'center', flex:2, paddingTop: 5}}>{details.signalTest24.SSID}</Label>
                            }
                            {details.signalTest5.BSSID !== "" &&
                                <Label style={{textAlign:'center', flex:2, paddingTop: 5}}>{details.signalTest5.SSID}</Label>
                            }
                        </View>
                        }
                        {details.testType === 'signalTest' &&
                        <View style={styles.grid_container}>
                            <Label style={styles.content_item}>{global.t.get$("WIFI.BSSID")}</Label>
                            {details.signalTest24.BSSID !== "" &&
                                <Label style={{textAlign:'center', flex:2, paddingTop: 5}}>{details.signalTest24.BSSID}</Label>
                            }
                            {details.signalTest5.BSSID !== "" &&
                                <Label style={{textAlign:'center', flex:2, paddingTop: 5}}>{details.signalTest5.BSSID}</Label>
                            }
                        </View>
                        }
                        {details.channelDetails !== null &&
                            <View style={styles.grid_container}>
                                <Label style={styles.content_item}>{global.t.get$("WIFI.BAND")}</Label>
                                <Label style={{textAlign: 'center', flex: 2, paddingTop: 5}}>{details.channelDetails.band}</Label>
                            </View>
                        }
                        {details.testType === 'signalTest' &&
                            <View style={styles.grid_container}>
                                <Label style={styles.content_item}>{global.t.get$("WIFI.BAND")}</Label>
                                {details.signalTest24.BSSID !== "" &&
                                    <Label style={{textAlign: 'center', flex: 2, paddingTop: 5}}>{details.signalTest24.band}</Label>
                                }
                                {details.signalTest5.BSSID !== "" &&
                                    <Label style={{textAlign: 'center', flex: 2, paddingTop: 5}}>{details.signalTest5.band}</Label>
                                }
                            </View>
                        }
                        {details.channelDetails !== null &&
                            <View style={styles.grid_container}>
                                <Label style={styles.content_item}>{global.t.get$("WIFI.CENTER_CHANNEL")}</Label>
                                <Label style={{textAlign: 'center', flex: 2, paddingTop: 5}}>{details.channelDetails.centerChannel}</Label>
                            </View>
                        }
                        {details.wifiDetails.getFreq() !== "" &&
                            <View style={styles.grid_container}>
                                <Label style={styles.content_item}>{global.t.get$("WIFI.CHANNEL")}</Label>
                                <Label style={{textAlign: 'center', flex: 2}}>{details.channelDetails.channel}</Label>
                            </View>
                        }
                        {details.wifiDetails.getFreq() !== "" &&
                            <View style={styles.grid_container}>
                                <Label style={styles.content_item}>{global.t.get$("WIFI.SECURITY")}</Label>
                                <Label style={{textAlign: 'center', flex: 2}}></Label>
                            </View>
                        }
                        {details.signal !== null && details.signal !== "" &&
                            <View style={styles.grid_container}>
                                <Label style={styles.content_item}>{global.t.get$("WIFI.SIGNAL")}</Label>
                                <View style={{flex:2, flexDirection:'column', paddingBottom: 10, alignItems:'center', justifyContent:'center'}}>
                                    <Icon active={true} style={[{color:details.signalResult.color, marginTop:10, fontSize:30}]} name={details.signalResult.icon} />
                                    <Label style={{textAlign:'center', flex:0, color:details.signalResult.color}}>{details.signalResult.label}</Label>
                                    {details.signalTest24.signal !== "" &&
                                        <Label style={{textAlign:'center', flex:0}}>{details.signal} dBm</Label>
                                    }
                                </View>
                            </View>
                        }
                        {details.testType === 'signalTest' &&
                            <View style={styles.grid_container}>
                                <Label style={styles.content_item}>{global.t.get$("WIFI.SIGNAL")}</Label>
                                {details.signalTest24.BSSID !== "" &&
                                    <View style={{flex:2, flexDirection:'column', paddingBottom: 10, alignItems:'center', justifyContent:'center'}}>
                                        <Icon active={true} style={[{color:details.signalTestResults24.color, marginTop:10, fontSize:30}]} name={details.signalTestResults24.icon} />
                                        <Label style={{textAlign:'center', flex:0, color:details.signalTestResults24.color}}>{details.signalTestResults24.label}</Label>
                                        <Label style={{textAlign:'center', flex:0}}>{details.signalTest24.signal} dBm</Label>
                                    </View>
                                }
                                {details.signalTest5.BSSID !== "" &&
                                    <View style={{flex:2, flexDirection:'column', paddingBottom: 10, alignItems:'center', justifyContent:'center'}}>
                                        <Icon active={true} style={[{color:details.signalTestResults5.color, marginTop:10, fontSize:30}]} name={details.signalTestResults5.icon} />
                                        <Label style={{textAlign:'center', flex:0, color:details.signalTestResults5.color}}>{details.signalTestResults5.label}</Label>
                                        {details.signalTest5.signal !== "" &&
                                            <Label style={{textAlign:'center', flex:0}}>{details.signalTest5.signal} dBm</Label>
                                        }
                                    </View>
                                }
                            </View>
                        }
                        {details.testType !== 'signalTest' &&
                        <View>
                            <View style={styles.grid_container}>
                                <Label style={styles.content_item}>{global.t.get$("WIFI.DOWNLOAD")}</Label>
                                <View style={{flex:2, flexDirection:'column', paddingBottom: 10, alignItems:'center', justifyContent:'center'}}>
                                    <Icon active={true} style={[{color:details.downloadSpeedResult.color, marginTop:10, fontSize:30}]} name={details.downloadSpeedResult.icon} />
                                    <Label style={{textAlign:'center', flex:0, color:details.downloadSpeedResult.color}}>{details.downloadSpeedResult.label}</Label>
                                    <Label style={{textAlign:'center', flex:0}}>{details.downloadSpeed} Mbps</Label>
                                </View>
                            </View>
                            <View style={styles.grid_container}>
                                <Label style={styles.content_item}>{global.t.get$("WIFI.UPLOAD")}</Label>
                                <View style={{flex:2, flexDirection:'column', paddingBottom: 10, alignItems:'center', justifyContent:'center'}}>
                                    <Icon active={true} style={[{color:details.uploadSpeedResult.color, marginTop:10, fontSize:30}]} name={details.uploadSpeedResult.icon} />
                                    <Label style={{textAlign:'center', flex:0, color:details.uploadSpeedResult.color }}>{details.uploadSpeedResult.label}</Label>
                                    <Label style={{textAlign:'center', flex:0}}>{details.uploadSpeed} Mbps</Label>
                                </View>
                            </View>
                            <View style={styles.grid_container}>
                                <Label style={styles.content_item}>{global.t.get$("WIFI.LATENCY")}</Label>
                                <View style={{flex:2, flexDirection:'column', paddingBottom: 10, alignItems:'center', justifyContent:'center'}}>
                                    <Icon active={true} style={[{color:details.pingResult.color, marginTop:10, fontSize:30}]} name={details.pingResult.icon} />
                                    <Label style={{textAlign:'center', flex:0, color:details.pingResult.color}}>{details.pingResult.label}</Label>
                                    <Label style={{textAlign:'center', flex:0}}>{details.ping} ms</Label>
                                </View>
                            </View>
                            <View style={styles.grid_container}>
                                <Label style={styles.content_item}>{global.t.get$("SPEEDTEST.JITTER")}</Label>
                                <Label style={{textAlign:'center', flex:2, paddingTop: 5}}>{details.jitter}ms</Label>
                            </View>
                        </View>
                        }
                        {details.interference.coScore !== null &&
                            <View style={styles.grid_container}>
                                <Label style={styles.content_item}>{global.t.get$("WIFI.CO_CHANNEL_INTERFERENCE")}</Label>
                                <View style={{flex:2, flexDirection:'column', paddingBottom: 10, alignItems:'center', justifyContent:'center'}}>
                                    <Icon active={true} style={[{color:details.coInterferenceResult.color, marginTop:10, fontSize:30}]} name={details.coInterferenceResult.icon} />
                                    <Label style={{textAlign:'center', flex:0, color:details.coInterferenceResult.color}}>{details.coInterferenceResult.label}</Label>
                                    <Label style={{textAlign:'center', flex:0}}>{details.interference.coScore}</Label>
                                </View>
                            </View>
                        }
                        {details.interference.adjScore !== null &&
                            <View style={styles.grid_container}>
                                <Label style={styles.content_item}>{global.t.get$("WIFI.ADJACENT_CHANNEL_INTERFERENCE")}</Label>
                                <View style={{flex:2, flexDirection:'column', paddingBottom: 10, alignItems:'center', justifyContent:'center'}}>
                                    <Icon active={true} style={[{color:details.adjInterferenceResult.color, marginTop:10, fontSize:30}]} name={details.adjInterferenceResult.icon} />
                                    <Label style={{textAlign:'center', flex:0, color:details.adjInterferenceResult.color}}>{details.adjInterferenceResult.label}</Label>
                                    <Label style={{textAlign:'center', flex:0}}>{details.interference.adjScore}</Label>
                                </View>
                            </View>
                        }
                        {details.wifiDetails.getFreq() !== "" &&
                            <View style={styles.grid_container}>
                                <Label style={styles.content_item}>{global.t.get$("WIFI.CO_CHANNEL_INTERFERENCE")}</Label>
                                <Label style={{textAlign: 'center', flex: 2}}></Label>
                            </View>
                        }
                        {details.wifiDetails.getFreq() !== "" &&
                            <View style={styles.grid_container}>
                                <Label style={styles.content_item}>{global.t.get$("WIFI.ADJACENT_CHANNEL_INTERFERENCE")}</Label>
                                <Label style={{textAlign: 'center', flex: 2}}></Label>
                            </View>
                        }
                    </ScrollView>
                </View>
                <NavigationButtons navigation={this.props.navigation} back={{label:global.t.get$("ACTION.CLOSE"), route:'LocationTest'}}/>
            </AnimatedStackView>
        );
    }
}
// Load default styles
const styles = new Style().get();