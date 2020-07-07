/**
 * Lists the work orders that are stored in memory
 */

// Import Components
import React from "react";
import {
    StatusBar, Text,
    View
} from 'react-native';
import {
    Button,
    List, ListItem, Spinner
} from "native-base";
import { SwipeListView } from 'react-native-swipe-list-view';
import Icon from 'react-native-vector-icons/FontAwesome';

// Font Awesome 5
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faClipboardList, faTrashAlt } from '@fortawesome/pro-regular-svg-icons';

// Default style sheet
import Style from '../styles/views/location'

// Global state for navigation options
import Global_State from '../constants/global';

// Import the main parts of each view
import AnimatedStackView from '../styles/components/stack_view';
import Header from "../styles/components/view_header";

import Message from '../app_code/message/service';

export default class WorkOrdersView extends React.Component {
    static navigationOptions = ({ navigation }) => Global_State.getInstance().viewStyleOptions(navigation);

    // Global state
    Global = global.state;

    // Global configuration
    Configuration = global.configuration;

    Message = new Message();

    // Access the work order class
    work_orders = global.state.work_orders;

    // Local state
    state = {
        work_orders:[],
        update_list:false
    };

    // Constructor
    constructor(props) {
        super(props);
        //this.ds = new ListView.DataSource({ rowHasChanged: (r1, r2) => r1 !== r2 });
    }

    // View mounted and ready
    componentDidMount(){
        this.setState({work_orders:this.work_orders.list});
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

    openWorkOrder(id) {
        let woDetails = global.state.work_orders.get(id);
        global.state.set('work_order', woDetails);

        this.props.navigation.dispatch(global.state.resetNavigation("Home"));
    }

    deleteRow(id, secId, rowId, rowMap) {
        if (global.state.get('work_order') == null || global.state.get('work_order').id !== id) {
            this.setState({update_list: true});
            const updateWorkOrders = [...this.state.work_orders];
            let removeId = -1;
            for (let i=0;i< updateWorkOrders.length;i++) {
                if (updateWorkOrders[i].id === id) {
                    removeId = i;
                }
            }

            if (removeId > -1) updateWorkOrders.splice(removeId, 1);
            this.setState({work_orders: updateWorkOrders});
            global.state.work_orders.remove(id);
            setTimeout(function (_this) {
                _this.setState({update_list: false});
            }, 50, this);
        }
        else {
            this.Message.sendAlert(
                "Cannot remove",
                "Unable to remove the current active work order, please close the work order before trying to delete it",
                "OK");
        }
    }


    // Render view components
    render() {
        console.disableYellowBox = true;
        //const {navigate} = this.props.navigation;

        return (
            <AnimatedStackView>
                <View style={styles.container}>
                    <StatusBar hidden />
                    <Header style={styles.header} label={'Active Work Orders'} icon={faClipboardList}/>
                    <View style={{height: 25, flex:0, flexDirection: 'row', borderBottomColor:'#000', borderBottomWidth:1}}>
                        <View style={{flex:1, alignContent:'flex-start'}}>
                            <Text style={{textAlign:'left', marginTop:3}}> Work Order ID </Text>
                        </View>
                        <View style={{flex:1, alignContent:'flex-start'}}>
                            <Text style={{textAlign:'right', paddingRight:15, marginTop:3}}> Customer ID </Text>
                        </View>
                        <View style={{flex:1, alignContent:'flex-start'}}>
                            <Text style={{textAlign:'right', paddingRight:15, marginTop:3}}> Certifications </Text>
                        </View>
                    </View>
                    {!this.state.update_list &&
                        <SwipeListView
                            style={{backgroundColor:'#c3cad1'}}
                            disableRightSwipe={true}
                            rightOpenValue={-80}
                            data={this.state.work_orders}
                            closeOnRowOpen={true}
                            renderItem={ (data, rowMap) => (
                                <ListItem
                                    button={true} onPress={() => this.openWorkOrder(data.item.id)}
                                    style={{backgroundColor: '#c3cad1'}}>
                                    <View style={{flex: 0, flexDirection: 'row'}}>
                                        <View style={{flex: 1, flexDirection: 'row'}}>
                                            <Text style={{paddingTop: 7, paddingLeft: 0, fontSize: 16}}> {data.item.id} </Text>
                                        </View>
                                        <View style={{flex: 1, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', alignContent:'center'}}>
                                            <Text style={{paddingTop: 7, paddingLeft: 0, fontSize: 16}}> {data.item.details.customer} </Text>
                                        </View>
                                        <View style={{flex: 1, flexDirection: 'row', justifyContent:'flex-end'}}>
                                            <Text style={{paddingTop: 7, paddingLeft: 0, fontSize: 16}}> {data.item.details.certifications.length} </Text>
                                        </View>
                                    </View>
                                </ListItem>
                            )}
                            renderHiddenItem={ (data, secId, rowId, rowMap) => (
                                <View style={{flexDirection:'row', justifyContent: 'flex-end', flex:0}}>
                                    <Button full danger onPress={_ => this.deleteRow(data.item.id, secId, rowId, rowMap)} style={{paddingLeft: 10, paddingRight: 10}}>
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
            </AnimatedStackView>
        );
    }
}

/*<NavigationButtons navigation={this.props.navigation} next={{label:'Next', route:'Home'}} previous={{label:'Previous', route:'Home'}}/>*/
// Load default styles
const styles = new Style().get();