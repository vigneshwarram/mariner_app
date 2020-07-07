import React from "react";
import {Text, View, StatusBar, AppState} from 'react-native';
import {
    Button,
    Picker,
    List,
    ListItem,
    Spinner,
    CheckBox
} from "native-base";
import { SwipeListView } from 'react-native-swipe-list-view';
import Icon from 'react-native-vector-icons/FontAwesome';

// Font Awesome 5
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faShieldCheck, faHistory, faHdd, faEdit, faTrashAlt } from '@fortawesome/pro-regular-svg-icons';
import { faDrawCircle } from '@fortawesome/pro-light-svg-icons';

// Style
import Style from '../styles/views/certification'

// Default components
import AnimatedStackView from "../styles/components/stack_view";
import NavigationButtons from '../styles/components/navigation_buttons';
import Header from "../styles/components/view_header";

import Global_State from "../constants/global";

import WifiManager from '../app_code/wifi/wifiservices';
import Message from "../app_code/message/service";


export default class CertificationView extends React.Component {
    static navigationOptions = ({ navigation }) => Global_State.getInstance().viewStyleOptions(navigation);
    WifiManage = new WifiManager();

    // Local state
    state = {
        finish: {label:'Finish', route:null, params:{}},
        certifications: [],

        selectedNetwork: null,
        network: null,
        listItems: null,
        wifidetails: null,

        update_list:false
    };

    // Grab reference to open work order
    work_order = global.state.get('work_order');

    // Connection timer
    connection_timer;

    // Show gateway or mesh or both
    showGateway = global.configuration.get("showGateway");
    showMesh = global.configuration.get("showMesh");

    /**
     * Setup the databinding
     * @param props
     */
    constructor(props) {
        super(props);
        //this.ds = new ListView.DataSource({ rowHasChanged: (r1, r2) => r1 !== r2 });
    }

    /**
     * Grab the stored certifications
     */
    componentWillMount() {

        //this.getConnection();
        //this.loadNetworkList();

        if (this.work_order != null) {
            let certifications = this.work_order.certifications;
            this.setState({certifications: certifications})
        }

        // Check to see if the finished button should be enabled
        if (this.work_order != null && this.work_order.currentCertification != null && this.work_order.currentCertification.finished) {
            this.setState({finish: {label: 'Finish', route: 'Home'}});
        }

        this.connection_timer = setInterval(function(_this) {
            _this.getConnection();
        }, 1000, this);
    }

    // Remove the timer
    componentWillUnmount() {
        clearInterval(this.connection_timer); this.connection_timer = null;
    }

    /**
     * Load the wifi network list
     */
    loadNetworkList() {
        let networks = [];
        this.WifiManage.getNetworks((result) => {
            //alert(this.state.network);
            if (result != null) {
                for (let i = 0; i < result.length; i++) {
                    let found = false;
                    for (let n = 0; n < networks.length; n++) {
                        if (networks[n].ssid === result[i].SSID) {
                            found = true;
                        }
                    }
                    if (!found) {
                        networks.push({
                            ssid: result[i].SSID,
                            bssid: result[i].BSSID,
                            type: result[i].capabilities,
                            freq: result[i].frequency,
                            level: result[i].level
                        })
                    }
                }
                this.setState({network:networks});
            }
            else if (this.state.wifidetails != null && this.state.network == null) {
                networks.push({
                    ssid: this.state.wifidetails.getSSID(),
                    bssid: this.state.wifidetails.getBSSID(),
                    type: this.state.wifidetails.getSignal(),
                    freq: null,
                    level: null
                })
                this.setState({network:networks});
            }
            else if(this.state.wifidetails != null && this.state.network != null) {
                this.state.network[0].ssid = this.state.wifidetails.getSSID();
            }
        });
    }

    /**
     * Get the current connected network
     */
    getConnection() {
        this.WifiManage.getConnectionDetails((result) => {
            this.setState({wifi_details: result});
            if (this.work_order != null && this.work_order.currentCertification != null) {
                this.work_order.currentCertification.wifiDetails = result;
            }
        });
    }

    /**
     * Create a new certification
     */
    createNewCertification(testType) {
        this.work_order.addCertification(testType);
        let all_certifications = this.work_order.certifications;
        this.setState({certifications: all_certifications});

        this.props.navigation.dispatch(global.state.resetNavigation("NetworkSetup"));
    }

    /**
     * Delete a certification row
     * @param secId
     * @param rowId
     * @param rowMap
     */
    deleteRow(secId, rowId, rowMap) {

        new Message().sendAlertWithOption(
            "Delete Certification",
            "Are you sure you would like to delete this certification. This cannot be undone.",
            "Delete", () => this.confirmedDelete(secId, rowId, rowMap),
            'Cancel');
    }

    /**
     * Certification delete confirmation
     * @param secId
     * @param rowId
     * @param rowMap
     */
    confirmedDelete(secId, rowId, rowMap) {
        this.setState({ update_list: true });
        //rowMap.props.closeRow
        //rowMap[`${secId}${rowId}`].props.close();
        const updateCertifications = [...this.state.certifications];
        let removeId = -1;
        for (let i=0;i< updateCertifications.length;i++) {
            if (updateCertifications[i].id === rowId) {
                removeId = i;
            }
        }

        if (removeId > -1) updateCertifications.splice(removeId, 1);
        this.setState({ certifications: updateCertifications });

        this.work_order.certifications = updateCertifications;
        setTimeout(function(_this) {
            _this.setState({ update_list: false });
        }, 50, this);
    }

    /**
     * Reopen a certification
     * @param id
     */
    selectCertification(id) {
        if(this.work_order.openCertification(id) != null) {
            this.props.navigation.dispatch(global.state.resetNavigation("Certification"))
        }
        else {
            alert("ID: " + id + " was not found");
        }
    }

    /**
     * Reopen a certification
     * @param data
     */
    reopenCertification(data) {
        if(this.work_order.openCertification(data.id) != null) {
            this.props.navigation.dispatch(global.state.resetNavigation("NetworkSetup"))
        }
        else {
            alert("That ID: " + id + " was not found");
        }
    }

    finishTest() {
        //alert("FInished");
    }


    render() {
        console.disableYellowBox = true;

        const {navigate} = this.props.navigation;
        let listItems = null;
        //this.getConnection();
        //this.loadNetworkList();

        // Check the network state
        if (this.state.network != null) {
            listItems = this.state.network.map((s, i) => {
                return <Picker.Item key={i} value={s.ssid} label={s.ssid}/>
            });
        }

        return (
            <AnimatedStackView>
            <View style={styles.container}>
                <StatusBar hidden />
                <Header style={styles.header} label={'Certification'} icon={faShieldCheck}/>

                <View style={[styles.menu_container, {justifyContent: 'space-evenly', alignContent:'stretch', marginTop:0, marginLeft:0, height: '70%'}]}>
                    {this.showGateway &&
                        <View style={styles.button_container}>
                            <Button disabled={false} rounded style={styles.icon_button}
                                    onPress={() => this.createNewCertification("GATEWAY")}>
                                <FontAwesomeIcon active={!this.state.options_disabled} style={styles.button_icon_fa} color={'white'} size={60} icon={faHdd} />
                            </Button>
                            <Text style={{width: 110, textAlign: 'center', fontSize:16, marginLeft:-5, marginTop:-50}}>Gateway</Text>
                        </View>
                    }
                    {this.showMesh &&
                        <View style={styles.button_container}>
                            <Button disabled={false} rounded style={styles.icon_button}
                                    onPress={() => this.createNewCertification("MESH")}>
                                <FontAwesomeIcon active={!this.state.options_disabled} style={styles.button_icon_fa} color={'white'} size={60} icon={faDrawCircle} />
                            </Button>
                            <Text style={{width: 110, textAlign: 'center', fontSize:16, marginLeft:-5, marginTop:-50}}>Mesh</Text>
                        </View>
                    }
                </View>

                <View style={styles.test_results}>
                    <Header style={styles.header} label={'Test History'} icon={faHistory}/>
                    <View style={{height: 40, flex:0, flexDirection: 'row', borderBottomColor:'#000', borderBottomWidth:1}}>
                        <View style={{flex:1, justifyContent:'center'}}>
                            <Text style={{marginLeft:15}}> Time </Text>
                        </View>
                        <View style={{flex:1, alignContent:'flex-start'}}>
                            <Text style={{textAlign:'center'}}> Rooms Tested </Text>
                        </View>
                        <View style={{flex:1, alignContent:'flex-start'}}>
                            <Text style={{textAlign:'center'}}> Rooms Passed </Text>
                        </View>
                        <View style={{flex:1, alignContent:'flex-start'}}>
                            <Text style={{textAlign:'center'}}> Network Type </Text>
                        </View>
                        <View style={{flex:1, alignContent:'flex-start'}}>
                            <Text style={{textAlign:'center'}}> Result </Text>
                        </View>
                    </View>
                    {!this.state.update_list &&
                        <SwipeListView
                            disableRightSwipe={true}
                            rightOpenValue={-80}
                            data={this.state.certifications}
                            closeOnRowOpen={true}
                            renderItem={ (data, rowMap) => (
                                <ListItem
                                    button={true} onPress={() => this.selectCertification(data.item.id)}
                                    style={{backgroundColor: '#c3cad1', marginLeft: 0}}>
                                    <View style={{flex:1, flexDirection: 'row'}}>
                                        <View style={{flex:2, flexDirection:'row'}}>
                                            <CheckBox style={{marginTop:-3}} checked={data.selected} onPress={() => this.selectCertification(data.item.id)}/>
                                            <Text style={{paddingLeft:5, fontSize:12}}> {data.item.time} </Text>
                                        </View>
                                        <View style={{flex:1, marginLeft: -55, alignItems: 'flex-end', alignContent:'flex-start'}}>
                                            <Text style={{fontSize:12}}> {data.item.tested} </Text>
                                        </View>
                                        <View style={{flex:1, marginLeft: 60}}>
                                            <Text style={{fontSize:12}}> {data.item.passed} </Text>
                                        </View>
                                        <View style={{flex:1, justifyContent: 'center', alignItems: 'center', alignContent:'center'}}>
                                            <FontAwesomeIcon style={{color:'#2F95D6', fontSize:20, marginTop:-2}} color={'#2F95D6'} size={20} icon={data.item.typeIcon === 1 ? faDrawCircle : faHdd} />
                                        </View>
                                        <View style={{flex:1, alignItems:'flex-end', justifyContent:'flex-end'}}>
                                            <Icon style={{color:data.item.results.color, fontSize:20, paddingBottom:4, paddingRight:8}} name={data.item.results.icon} />
                                        </View>
                                    </View>
                                </ListItem>
                            )}
                            renderHiddenItem={ (data, secId, rowId, rowMap) => (
                                <View style={{flexDirection:'row', justifyContent: 'flex-end', flex:0}}>
                                    <Button full success onPress={_ => this.reopenCertification(data.item)} style={{paddingLeft: 10, paddingRight: 10}}>
                                        <FontAwesomeIcon active size={20} color={'white'} icon={faEdit}/>
                                    </Button>
                                    <Button full danger onPress={_ => this.deleteRow(secId, data.item.id, rowMap)} style={{paddingLeft: 10, paddingRight: 10}}>
                                        <FontAwesomeIcon active size={20} color={'white'} icon={faTrashAlt}/>
                                    </Button>
                                </View>
                            )}
                        />
                    }
                    {this.state.update_list &&
                        <Spinner color="blue"/>
                    }
                </View>
                <NavigationButtons navigation={this.props.navigation} next={this.state.finish} previous={{label:'Previous', route:'Home'}}/>
            </View>
            </AnimatedStackView>
        );
    }
}
// Load styles for Home
const styles = new Style().get();
