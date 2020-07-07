/**
 * Location Testing View (IOS)
 */

import React from "react";
import {StatusBar, Text, View} from 'react-native';
import {
    Label,
    Button,
    Item,
    Form,
    Picker,
    List,
    ListItem,
    Card,
    CardItem,
    Body,
    Spinner,
    CheckBox
} from "native-base";
import { SwipeListView } from 'react-native-swipe-list-view';
import Icon from 'react-native-vector-icons/FontAwesome';

// Font Awesome 5
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faTrashAlt, faMapMarkerAlt, faHistory, faHdd, faEdit } from '@fortawesome/pro-regular-svg-icons';
import { faArrowFromBottom, faArrowFromTop, faWifi } from '@fortawesome/pro-solid-svg-icons';
import {
    faTachometerAltFast,
    faEnvelopeOpenText,
    faGamepad,
    faMusic,
    faPlayCircle,
    faSearch,
    faDrawCircle
} from '@fortawesome/pro-light-svg-icons';

// Style import
import Style from '../../styles/views/location';

// Import the main parts of each view
import AnimatedStackView from '../../styles/components/stack_view';
import NavigationButtons from "../../styles/components/navigation_buttons";
import Header from "../../styles/components/view_header";

export default class LocationTestComponent extends React.Component {

    // Render the view
    render() {
        console.disableYellowBox = true;
        //const {navigate} = this.props.navigation;

        return (
            <AnimatedStackView>
                <View style={styles.container}>
                    <StatusBar hidden />
                    <Header style={styles.header} label={'Location Testing'} icon={faMapMarkerAlt}/>
                    {this.props.controller.work_order != null && this.props.controller.work_order.currentCertification != null &&
                        <View style={{flexDirection: 'row', flex: 0, justifyContent: 'flex-end'}}>
                            <Text style={{marginTop:3}}>Status:</Text>
                            <Icon style={{color: this.props.controller.work_order.currentCertification.results.color, fontSize: 20, marginLeft: 8, marginTop: 2}}
                                  active={true} name={this.props.controller.work_order.currentCertification.results.icon}/>
                        </View>
                    }
                    <Form style={{flex:4, marginTop:-20, backgroundColor:'transparent'}}>
                        {this.props.controller.state.wifi_details && this.props.controller.work_order.currentCertification.testType !== 'signalTest' &&
                        <Item style={[styles.item]} stackedLabel onPress={() => this.props.controller.openWifiSettings()}>
                            <View style={{flexDirection: 'row', flex: 3, alignItems: 'stretch', backgroundColor:'transparent'}}>
                                <View style={{flex: 3, alignItems: 'stretch', backgroundColor:'transparent'}}>
                                    <Card transparent style={[styles.card, {marginLeft: -15, width: 300, height: 100, backgroundColor:'transparent'}]}>
                                        <CardItem style={[styles.card, {backgroundColor:'transparent'}]} bordered>
                                            <Body>
                                                <View style={{flexDirection: 'column', backgroundColor:'transparent'}}>
                                                    <View style={{flexDirection: 'column', marginBottom: 10}}>
                                                        <Label style={[styles.card, {fontWeight: 'bold'}]}>Selected Network</Label>
                                                        {this.props.controller.state.currentCertification.testType === 'speedTest' &&
                                                            <View>
                                                            <Label style={[styles.card, {paddingLeft:5}]}>{this.props.controller.state.wifi_details.getSSID()}</Label>
                                                            <Label style={[styles.card, {paddingLeft:5, fontSize: 12}]}>({this.props.controller.state.wifi_details.getBSSID()})</Label>
                                                            </View>
                                                        }

                                                        {this.props.controller.state.device != null && this.props.controller.state.device.signal !== '' &&
                                                        <View style={{flexDirection: 'row'}}>
                                                            <Label style={[styles.card, {
                                                                paddingLeft: 5,
                                                                paddingTop: 10,
                                                                fontSize: 37,
                                                                color: this.props.controller.state.signal_result.color
                                                            }]}>{this.props.controller.state.device.signal}</Label>
                                                            <Label
                                                                style={[styles.card, {marginTop:30, fontSize: 12}]}>dBm</Label>
                                                        </View>
                                                        }
                                                    </View>
                                                </View>
                                            </Body>
                                        </CardItem>
                                    </Card>
                                </View>
                            </View>
                        </Item>
                        }
                        {this.props.controller.work_order.currentCertification.testType === 'signalTest' &&
                            <View>
                                <Item style={[styles.item, {marginTop: -7}]} stackedLabel>
                                    <Label style={[styles.text]}>2.4GHz network</Label>
                                </Item>
                                <Picker
                                    mode="dropdown"
                                    selectedValue={this.props.controller.state.wifi_network24}
                                    style={[styles.picker, {marginTop: -50, marginLeft: 15, backgroundColor: '#e9e9e9', height: 45, width:'90%'}]}
                                    onValueChange={(itemValue) => this.props.controller.setWifiNetwork('band24', itemValue)}>
                                    {this.props.controller.state.wifi_networks.band24}
                                </Picker>
                            </View>
                        }
                        {this.props.controller.work_order.currentCertification.testType === 'signalTest' &&
                            <View>
                                <Item style={[styles.item, {marginTop:-10}]} stackedLabel>
                                    <Label style={[styles.text]}>5GHz network</Label>
                                </Item>
                                <Picker
                                    mode="dropdown"
                                    selectedValue={this.props.controller.state.wifi_network5}
                                    style={[styles.picker, {marginTop: -50, marginLeft: 15, backgroundColor: '#e9e9e9', height: 45, width:'90%'}]}
                                    onValueChange={(itemValue) => this.props.controller.setWifiNetwork('band5', itemValue)}>
                                    {this.props.controller.state.wifi_networks.band5}
                                </Picker>
                            </View>
                        }
                        <View style={[styles.menu_container, {backgroundColor:'transparent', marginTop:45, marginBottom: 0}, (this.props.controller.work_order.currentCertification.testType === 'signalTest' ? {marginTop:45} : {marginTop: 0})]}>
                            <View style={[styles.button_container, {backgroundColor:'transparent', justifyContent: 'center', alignItems: 'center', alignContent:'center'}]}>
                                <Button rounded style={[styles.test_icon_button, {marginLeft:-10}]}
                                        onPress={() => this.props.controller.runSpeedTest()}>
                                    <FontAwesomeIcon active={true} style={styles.button_icon_fa} size={75} color={'white'} icon={this.props.controller.work_order.currentCertification.testType === 'signalTest' ? faWifi : faTachometerAltFast} />
                                </Button>
                            </View>
                        </View>
                        <Item style={[styles.item, {marginTop: 0}]} stackedLabel>
                            <Label style={[styles.text]}>Wifi Test Locations</Label>
                        </Item>
                        <Picker
                            mode="dropdown"
                            selectedValue={this.props.controller.state.selected_location}
                            style={[styles.picker, {marginTop:-50, backgroundColor: '#e9e9e9', height: 45, width:'95%'}]}
                            onValueChange={(itemValue) => this.props.controller.setTestLocation(itemValue)}>
                            {this.props.controller.state.locations}
                        </Picker>
                    </Form>

                    <View style={{flex:1, backgroundColor:'#c3cad1', marginLeft:1, marginTop: 65, marginRight:5}}>
                        <Header style={styles.header} label={'Test History'} icon={faHistory}>
                            <View style={{marginTop:12, marginLeft:-35}}>
                                <Text style={
                                    [this.props.controller.state.currentCertification != null && this.props.controller.state.currentCertification.locationTests.length < this.props.controller.state.site_type ? styles.site_type_red : styles.site_type_green, {fontSize: 20}]
                                }>{global.functions.replace('{0}/{1}', [this.props.controller.state.currentCertification != null ? this.props.controller.state.currentCertification.locationTests.length : 0, this.props.controller.state.site_type])}</Text>
                            </View>
                        </Header>
                        {this.props.controller.state.testType === 'speedTest' &&
                            <View style={{height: 25, flex:0, flexDirection: 'row', borderBottomColor:'#000', borderBottomWidth:1}}>
                                <View style={{flex:2, alignContent:'flex-start'}}>
                                    <Text style={{textAlign:'left', marginTop:3}}> {global.t.get$("HEADER.ROOM")} </Text>
                                </View>
                                <View style={{flex:2, alignContent:'flex-start'}}>
                                    <Text style={{textAlign:'left', marginTop:3}}> {global.t.get$("WIFI.NETWORK")} </Text>
                                </View>
                                <View style={{flex:1, alignContent:'flex-start'}}>
                                    <Text style={{textAlign:'right', paddingRight:15, marginTop:3}}> {global.t.get$("HEADER.RESULT")} </Text>
                                </View>
                            </View>
                        }
                        {this.props.controller.state.testType === 'signalTest' &&
                            <View style={{height: 25, flex:0, flexDirection: 'row', borderBottomColor:'#000', borderBottomWidth:1}}>
                                <View style={{flex:2, alignContent:'flex-start'}}>
                                    <Text style={{textAlign:'left', marginTop:3}}> {global.t.get$("HEADER.ROOM")} </Text>
                                </View>
                                <View style={{flex:2, alignContent:'flex-start'}}>
                                    <Text style={{textAlign:'left', marginTop:3}}> {global.t.get$("WIFI.BAND_24GHZ")} </Text>
                                </View>
                                <View style={{flex:1, alignContent:'flex-start'}}>
                                    <Text style={{textAlign:'right', paddingRight:15, marginTop:3}}> {global.t.get$("WIFI.BAND_5GHZ")} </Text>
                                </View>
                            </View>
                        }
                        {!this.props.controller.state.update_list && this.props.controller.state.testType === 'speedTest' &&
                            <SwipeListView
                                style={{backgroundColor:'#c3cad1'}}
                                disableRightSwipe={true}
                                rightOpenValue={-80}
                                data={this.props.controller.state.location_tests}
                                closeOnRowOpen={true}
                                renderItem={ (data, rowMap) => (
                                    <ListItem closeOnRowPress={false} closeOnRowBeginSwipe={false}
                                              button={true} onPress={() => this.props.controller.openDetailView(data.item.id)}
                                              style={{backgroundColor: '#c3cad1'}}>
                                        <View style={{flex:1, flexDirection: 'row'}}>
                                            <View style={{flex:2, flexDirection:'column'}}>
                                                <Text style={{paddingTop:7, paddingLeft:0, fontSize:16}}> {data.item.location} </Text>
                                                <Text style={{paddingTop:1, paddingLeft:0, fontSize:12}}> {data.item.time} </Text>
                                            </View>
                                            <View style={{flex:2, flexDirection:'row', textAlign:'center'}}>
                                                <Text style={{paddingTop:7, paddingLeft:0, fontSize:16, marginLeft:-10}}>{data.item.wifiDetails.getSSID()}</Text>
                                            </View>
                                            {!this.props.controller.state.hideLocationTestSpeeds &&
                                                <View style={{flex:1, justifyContent: 'flex-end', alignItems: 'flex-end', alignContent:'flex-end'}}>
                                                    <View style={{flexDirection:"row"}}>
                                                        <Text style={{paddingLeft:5, fontSize:14}}> {data.item.downloadSpeed} </Text>
                                                        <FontAwesomeIcon active size={14} color={'black'} icon={faArrowFromTop} />
                                                      </View>
                                                      <View style={{flexDirection:"row"}}>
                                                          <Text style={{paddingLeft:5, fontSize:14}}> {data.item.uploadSpeed} </Text>
                                                          <FontAwesomeIcon active size={14} color={'black'} icon={faArrowFromBottom} />
                                                      </View>
                                                </View>
                                            }
                                            <View style={{flex:0, flexDirection:'row'}}>
                                                <Icon style={{color:data.item.locationResult.color, fontSize:20, paddingLeft:8, marginTop:5}} active={true} name={data.item.locationResult.icon} />
                                            </View>
                                        </View>
                                    </ListItem>
                                )}
                                renderHiddenItem={ (data, secId, rowId, rowMap) => (
                                    <View style={{flexDirection:'row', justifyContent: 'flex-end', flex:0}}>
                                        <Button full danger onPress={_ => this.props.controller.deleteRow(secId, data.item.id, rowMap)} style={{paddingLeft: 10, paddingRight: 10}}>
                                            <FontAwesomeIcon active size={20} color={'white'} icon={faTrashAlt}/>
                                        </Button>
                                    </View>
                                )}
                            />
                        }
                        {!this.props.controller.state.update_list && this.props.controller.state.testType === 'signalTest' &&
                            <SwipeListView
                                style={{backgroundColor:'#c3cad1'}}
                                disableRightSwipe={true}
                                rightOpenValue={-80}
                                data={this.props.controller.state.location_tests}
                                closeOnRowOpen={true}
                                renderItem={ (data, rowMap) => (
                                    <ListItem closeOnRowPress={false} closeOnRowBeginSwipe={false}
                                              button={true} onPress={() => this.props.controller.openDetailView(data.item.id)}
                                              style={{backgroundColor: '#c3cad1'}}>
                                        <View style={{flex:1, flexDirection: 'row'}}>
                                            <View style={{flex:2, flexDirection:'column'}}>
                                                <Text style={{paddingTop:7, paddingLeft:0, fontSize:16}}> {data.item.location} </Text>
                                                <Text style={{paddingTop:1, paddingLeft:0, fontSize:12}}> {data.item.time} </Text>
                                            </View>
                                            {data.item.testType === 'speedTest' &&
                                            <View style={{flex:2, flexDirection:'row', textAlign:'center'}}>
                                                <Text style={{paddingTop:7, paddingLeft:0, fontSize:16, marginLeft:-10}}>{data.item.wifiDetails.getSSID()}</Text>
                                            </View>
                                            }
                                            {data.item.testType === 'signalTest' &&
                                            <View style={{flex:2, flexDirection:'column', textAlign:'center'}}>
                                                {data.item.signalTest24.BSSID !== "" &&
                                                    <View style={{justifyContent: 'center', alignItems: 'center'}}>
                                                        {data.item.signalTest24.signal !== "" &&
                                                            <Text style={{paddingTop:7, paddingLeft:0, fontSize:16, marginLeft:-10, color: data.item.signalTestResults24.color}}>{data.item.signalTest24.signal} dBm</Text>
                                                        }
                                                        {data.item.signalTest24.signal === "" &&
                                                            <Text style={{paddingTop:7, paddingLeft:0, fontSize:16, marginLeft:-10}}>INC</Text>
                                                        }
                                                        <Text style={{paddingTop:7, paddingLeft:0, fontSize:11, marginLeft:-10}}>{data.item.signalTest24.BSSID}</Text>
                                                    </View>
                                                }
                                                {data.item.signalTest24.BSSID === "" &&
                                                    <View style={{justifyContent: 'center', alignItems: 'center'}}>
                                                        <Text style={{paddingTop:7, paddingLeft:0, fontSize:16, marginLeft:-10}}>N/A</Text>
                                                    </View>
                                                }
                                            </View>
                                            }
                                            {data.item.testType === 'signalTest' &&
                                            <View style={{flex:2, flexDirection:'column', textAlign:'center'}}>
                                                {data.item.signalTest5.BSSID !== "" &&
                                                    <View style={{justifyContent: 'center', alignItems: 'center', alignSelf: 'flex-end'}}>
                                                        {data.item.signalTest5.signal !== "" &&
                                                            <Text style={{paddingTop:7, paddingLeft:0, fontSize:16, marginLeft:-10, color: data.item.signalTestResults5.color}}>{data.item.signalTest5.signal} dBm</Text>
                                                        }
                                                        {data.item.signalTest5.signal === "" &&
                                                            <Text style={{paddingTop:7, paddingLeft:0, fontSize:16, marginLeft:-10}}>INC</Text>
                                                        }
                                                        <Text style={{paddingTop:7, paddingLeft:0, fontSize:11, marginLeft:-10}}>{data.item.signalTest5.BSSID}</Text>
                                                    </View>
                                                }
                                                {data.item.signalTest5.BSSID === "" &&
                                                    <View style={{justifyContent: 'center', alignItems: 'center'}}>
                                                        <Text style={{paddingTop:7, paddingLeft:0, fontSize:16, marginLeft:-10}}>N/A</Text>
                                                    </View>
                                                }
                                            </View>
                                            }
                                            {data.item.testType === 'speedTest' &&
                                            <View style={{flex:0, flexDirection:'row'}}>
                                                <Icon style={{color:data.item.locationResult.color, fontSize:20, paddingLeft:8, marginTop:5}} active={true} name={data.item.locationResult.icon} />
                                            </View>
                                            }
                                        </View>
                                    </ListItem>
                                )}
                                renderHiddenItem={ (data, secId, rowId, rowMap) => (
                                    <View style={{flexDirection:'row', justifyContent: 'flex-end', flex:0}}>
                                        <Button full danger onPress={_ => this.props.controller.deleteRow(secId, data.item.id, rowMap)} style={{paddingLeft: 10, paddingRight: 10}}>
                                            <FontAwesomeIcon active size={20} color={'white'} icon={faTrashAlt}/>
                                        </Button>
                                    </View>
                                )}
                            />
                        }
                        {this.props.controller.state.update_list &&
                            <Spinner color="blue"/>
                        }
                    </View>
                    <NavigationButtons navigation={this.props.navigation} next={this.props.controller.state.finish} previous={{label:'Previous', route:'NetworkSetup'}}/>
                </View>
            </AnimatedStackView>
        );
    }
}

/*
<View style={{flex:1, justifyContent: 'flex-end', alignItems: 'flex-end', alignContent:'flex-end'}}>
                                                  <View style={{flexDirection:"row"}}>
                                                      <Text style={{paddingLeft:5, fontSize:14}}> {data.downloadSpeed} </Text>
                                                      <Icon style={{color:'black', fontSize:14, marginTop:0}} name="arrow-down" />
                                                  </View>
                                                  <View style={{flexDirection:"row"}}>
                                                      <Text style={{paddingLeft:5, fontSize:14}}> {data.uploadSpeed} </Text>
                                                      <FontAwesomeIcon active size={14} color={'black'} icon={faArrowFromBottom} />
                                                  </View>
                                              </View>
 */

/*

                            <List style={{backgroundColor:'#c3cad1'}}
                                  rightOpenValue={-75}
                                  leftOpenValue={255}
                                  closeOnRowBeginSwipe={false}
                                  closeOnRowPress={false}
                                  dataSource={this.props.controller.ds.cloneWithRows(this.props.controller.state.location_tests)}
                                  renderRow={data =>
                                      <ListItem closeOnRowPress={false} closeOnRowBeginSwipe={false}
                                          button={true} onPress={() => this.props.controller.openDetailView(data.id)}
                                          style={{backgroundColor: '#c3cad1'}}>
                                          <View style={{flex:1, flexDirection: 'row'}}>
                                              <View style={{flex:2, flexDirection:'column'}}>
                                                  <Text style={{paddingTop:7, paddingLeft:0, fontSize:16}}> {data.location} </Text>
                                                  <Text style={{paddingTop:1, paddingLeft:0, fontSize:12}}> {data.time} </Text>
                                              </View>
                                              <View style={{flex:2, flexDirection:'row', textAlign:'center'}}>
                                                  <Text style={{paddingTop:7, paddingLeft:0, fontSize:16, marginLeft:-10}}>{data.wifiDetails.getSSID()}</Text>
                                              </View>
                                              <View style={{flex:0, flexDirection:'row'}}>
                                                  <Icon style={{color:data.locationResult.color, fontSize:20, paddingLeft:8, marginTop:5}} active={true} name={data.locationResult.icon} />
                                              </View>
                                          </View>
                                      </ListItem>}
                                  renderLeftHiddenRow={(data, secId, rowId, rowMap) =>
                                      <View style={{flexDirection:'row', flex:0, paddingTop:5}}>
                                          <Button full transparent>
                                              <View style={{flexDirection:'column', flex:0}}>
                                                  <FontAwesomeIcon active size={35} color={data.downloadSpeedResult.color} icon={faEnvelopeOpenText}/>
                                                  <Text style={{fontSize:12}}> Email </Text>
                                              </View>
                                          </Button>
                                          <Button full transparent>
                                              <View style={{flexDirection:'column', flex:0}}>
                                                  <FontAwesomeIcon active size={35} color={data.downloadSpeedResult.color} icon={faSearch}/>
                                                  <Text style={{fontSize:12}}> Web </Text>
                                              </View>
                                          </Button>
                                          <Button full transparent>
                                              <View style={{flexDirection:'column', flex:0}}>
                                                  <FontAwesomeIcon active size={35} color={data.downloadSpeedResult.color} icon={faPlayCircle}/>
                                                  <Text style={{fontSize:12}}> Stream </Text>
                                              </View>
                                          </Button>
                                          <Button full transparent>
                                              <View style={{flexDirection:'column', flex:0}}>
                                                  <FontAwesomeIcon active size={40} color={data.pingResult.color} icon={faGamepad}/>
                                                  <Text style={{fontSize:12, marginTop:-5}}> Game </Text>
                                              </View>
                                          </Button>
                                          <Button full transparent>
                                              <View style={{flexDirection:'column', flex:0}}>
                                                  <FontAwesomeIcon active size={35} color={data.downloadSpeedResult.color} icon={faMusic}/>
                                                  <Text style={{fontSize:12}}> Music </Text>
                                              </View>
                                          </Button>
                                      </View>
                                      }
                                  renderRightHiddenRow={(data, secId, rowId, rowMap) =>
                                      <Button full danger onPress={_ => this.props.controller.deleteRow(secId, rowId, rowMap)}>
                                          <FontAwesomeIcon active size={20} color={'white'} icon={faTrashAlt}/>
                                      </Button>}
                            />
 */

// Load default styles
const styles = new Style().get();
