/**
 * Side menu
 */
import React from "react";
import {
    Text,
    View,
    ScrollView
} from 'react-native';
import {
    Label
} from "native-base";

import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faTrashAlt, faUserHardHat } from '@fortawesome/pro-solid-svg-icons';
import { faInfoCircle, faPalette } from '@fortawesome/pro-light-svg-icons';

// Default style sheet
import Style from '../styles/base/index';
import Workflows from '../app_code/workflows/workflows';
import Message from "../app_code/message/service";

// Import components
import HomeSideMenuComponent from './SideMenu/HomeSideMenu';
import SurveySideMenuComponent from './SideMenu/SurveySideMenu';
import CertificationSideMenuComponent from './SideMenu/CertificationSideMenu';
import TroubleshootingSideMenuComponent from './SideMenu/TroubleshootingSideMenu';
import ARSideMenuComponent from './SideMenu/ARSideMenu';
import ARViewSideMenuComponent from './SideMenu/ARViewSideMenu';
import HistorySideMenuComponent from './SideMenu/HistorySideMenu';
import DiagnosticSideMenuComponent from './SideMenu/DiagnosticSideMenu';
import WorkorderSideMenuComponent from './SideMenu/WorkorderSideMenu';
import GatewaySideMenuComponent from './SideMenu/GatewaySideMenu';
import AboutSideMenuComponent from './SideMenu/AboutSideMenu';
import ClearSideMenuComponent from './SideMenu/ClearSideMenu';

// Import popup views
import AboutView from '../views/AboutView';
import DiagnosticView from '../views/DiagnosticView';
import HistoryView from '../views/HistoryView';

// Flows
import welcome_workflow from "../res/workflows/welcome-workflow";

export default class SideMenu extends React.Component {

    // Local state
    state = {
        workflows: new Workflows(),
        guided_flows: []
    };

    constructor(props) {
        super(props);
    }

    componentDidMount() {
        let flows = global.configuration.get("flows");
        if (flows) {
            this.createFlows(flows);
        }
    }

    // Theme system updates
    componentDidUpdate(prevProps, prevState, snapshot) {
        styles = new Style().get();
    }

    /**
     * Create the flows in the navigation
     * @param flows
     */
    createFlows(flows) {
        let flowData = [];
        for (let i = 0; i < flows.length; i++) {
            if (flows[i].showInNavigation) {
                flowData.push(<View style={styles.navSectionStyle}>
                    <View style={{flex: 0, flexDirection: 'row', paddingBottom: 20}}>
                        <FontAwesomeIcon active={true} style={styles.fa_style} icon={faUserHardHat} size={20}
                                         color={'#4dbdea'}
                                         onPress={() => this.startFlow(flows[i].id)}
                        />
                        <Label style={[{flex: 0, color: '#0aa5ff', fontSize: 16, marginTop: 10}]}
                               onPress={() => this.startFlow(flows[i].id)}
                        >{global.t.get$(flows[i].label)}</Label>
                    </View>
                </View>)
            }
        }
        this.setState({guided_flows: flowData});
    }

    /**
     * Navigate to the view
     * @param view
     * @param flow
     */
    navigateToView(view, flow=null) {
        setTimeout(() => {
            global.Pop(null);

            if (global.state.currentNavigationView !== view) {
                this.props.navigation.dispatch(global.state.resetNavigation(view));
            }
            else {
                this.props.navigation.closeDrawer();
            }
            global.state.performUpdate();
        }, 100);
    }

    /**
     * Navigate to view by popup
     * @param view
     */
    navigateByPopup(view) {
        global.state.exitFlows();
        global.Pop(null);
        this.props.navigation.closeDrawer();

        setTimeout(() => {
            switch(view) {
                case "About": {
                    global.Pop(<AboutView/>);
                    break;
                }
                case "Diagnostics": {
                    global.Pop(<DiagnosticView/>);
                    break;
                }
                case "History": {
                    global.Pop(<HistoryView/>);
                    break;
                }
            }
        }, 100);
    }

    /**
     * Start a new flow
     * @param flow
     */
    startFlow(flow) {
        global.state.flow = null; global.Flow(null, 0);
        this.props.navigation.closeDrawer();
        setTimeout(() => {
            global.Flow(flow);
        }, 300);
    }

    /**
     * Delete all configuration information
     */
    clearAllWorkOrders() {
        new Message().sendAlertWithOption(global.t.get$("HEADER.CHANGE_SERVICE_PROVIDER"), global.t.get$("STATUS.CHANGE_INTERNET_SERVICE_PROVIDER"), "Continue", () => {

            // Clear the global options
            global.state.clearWorkOrders();
            global.configuration.reset();
            global.storage.multiClear([
                global.const.STORAGE_KEY_CONFIG,
                global.const.STORAGE_KEY_REG_CODE,
                global.const.STORAGE_KEY_TECHID,
                global.const.STORAGE_KEY_LANGUAGE,
                global.const.STORAGE_KEY_APP_VERSION,
                global.const.STORAGE_KEY_BUILD_NUMBER
            ]);

            // Navigate to the register screen
            this.navigateToView("Register");

        }, "Cancel");
    }

    changeTheme(theme) {
        global.theme = theme;
        this.props.navigation.closeDrawer();
        this.navigateToView("SplashScreen");
    }

    // Render side menu items
    render () {
        //if (global.state.drawerLocked && this.props.navigation.state.isDrawerOpen) this.props.navigation.closeDrawer();
        const work_order = global.state.get('work_order');
        const displayable_work_orders = global.state.work_orders.displayCount;

        if (!global.state.drawerLocked) {
            return (
                <View style={styles.side_container}>
                    <ScrollView>
                        <View style={{flexDirection:'column', flex:0}}>
                            <HomeSideMenuComponent controller={this} link {...this.props}/>
                            {work_order != null &&
                            <View>
                                <SurveySideMenuComponent controller={this} link {...this.props}/>
                                <CertificationSideMenuComponent controller={this} link {...this.props}/>
                                <TroubleshootingSideMenuComponent controller={this} link {...this.props}/>
                            </View>
                            }
                            <ARSideMenuComponent controller={this} link {...this.props}/>
                            <ARViewSideMenuComponent controller={this} link {...this.props}/>
                            <HistorySideMenuComponent controller={this} link {...this.props}/>
                            <DiagnosticSideMenuComponent controller={this} link {...this.props}/>
                            <GatewaySideMenuComponent controller={this} link {...this.props}/>
                            {this.state.guided_flows.map((flow) => {
                                return(flow)
                            })}
                        </View>
                    </ScrollView>
                    <View style={styles.footerContainer}>
                        {displayable_work_orders > 0 &&
                        <WorkorderSideMenuComponent controller={this} link {...this.props}/>
                        }
                        <AboutSideMenuComponent controller={this} link {...this.props}/>
                        <ClearSideMenuComponent controller={this} link {...this.props}/>
                    </View>
                </View>
            );
        }
        if (global.state.drawerLocked) {
            return (
                <View style={styles.side_container}>
                    <ScrollView>
                        <Text style={styles.sectionHeadingStyle}>
                        </Text>
                        <View style={styles.footerContainer}>
                            <View style={styles.navSectionStyle}>
                                <View style={{
                                    flex: 0,
                                    flexDirection: 'row',
                                    paddingBottom: 20,
                                    borderTopColor: '#3d3d3d',
                                    borderTopWidth: 1,
                                    borderBottomColor: '#3d3d3d',
                                    borderBottomWidth: 1
                                }}>
                                    <FontAwesomeIcon active={true} style={styles.fa_style} icon={faInfoCircle} size={20} color={styles.side_icon.color}
                                                     onPress={() => this.navigateByPopup("About")}
                                    />
                                    <Label style={[styles.side_label, {flex: 0, marginTop: 10}]}
                                           onPress={() => this.navigateByPopup("About")}
                                    >About WaveGuide</Label>
                                </View>
                            </View>
                            <View style={styles.navSectionStyle}>
                                <View style={{flex: 0, flexDirection: 'row', paddingBottom: 20}}>
                                    <FontAwesomeIcon active={true} style={styles.fa_style} icon={faTrashAlt} size={20} color={styles.side_icon.color}
                                                     onPress={() => this.clearAllWorkOrders()}
                                    />
                                    <Label style={[styles.side_label, {flex: 0, marginTop: 10}]}
                                           onPress={() => this.clearAllWorkOrders()}
                                    >Clear Configuration</Label>
                                </View>
                            </View>
                        </View>
                    </ScrollView>
                </View>
            )
        }
    }
}

// Load default styles
let styles = new Style().get();

/*
<View style={{flex: 0, flexDirection: 'row', paddingBottom: 20}}>
                            <FontAwesomeIcon active={true} style={styles.fa_style} icon={faPalette} size={20} color={styles.side_icon.color}
                                             onPress={() => this.changeTheme("red")}
                            />
                            <Label style={[styles.side_label, {flex: 0, marginTop: 10}]}
                                   onPress={() => this.changeTheme("red")}
                            >Red Theme</Label>
                        </View>
                        <View style={{flex: 0, flexDirection: 'row', paddingBottom: 20}}>
                            <FontAwesomeIcon active={true} style={styles.fa_style} icon={faPalette} size={20} color={styles.side_icon.color}
                                             onPress={() => this.changeTheme("green")}
                            />
                            <Label style={[styles.side_label, {flex: 0, marginTop: 10}]}
                                   onPress={() => this.changeTheme("green")}
                            >Blue Theme</Label>
                        </View>
                        <View style={{flex: 0, flexDirection: 'row', paddingBottom: 20}}>
                            <FontAwesomeIcon active={true} style={styles.fa_style} icon={faPalette} size={20} color={styles.side_icon.color}
                                             onPress={() => this.changeTheme("blue")}
                            />
                            <Label style={[styles.side_label, {flex: 0, marginTop: 10}]}
                                   onPress={() => this.changeTheme("blue")}
                            >WaveGuide Theme</Label>
                        </View>
 */
