/**
 * Global State Class
 * @type {{}}
 * @private
 */
import React from "react";
import { Image, View, TouchableOpacity, Platform, Animated } from "react-native";
import { StackActions, NavigationActions } from 'react-navigation';
import { EventRegister } from "react-native-event-listeners";
import Styles from '../styles/base/index';

// Font Awesome 5
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faBars } from '@fortawesome/pro-regular-svg-icons';


import Diagnostics from '../app_code/diagnostics/diagnostics';
import WorkorderService from '../app_code/workorders/workorders';

// Global properties
let _global = {
    registered: false,
    registration_code: null,
    registration_url: "https://{0}/wifiservicebroker/webresources/waveguide/registration/{1}",

    tech_id: null,
    customer_id: null,

    work_order: null,

    language: 'en',

    AR_ONLY: false,
    loadedOptimization: false,
    AR_NAVIGATOR: null
};

// Work order management
let _workorders = new WorkorderService();

// Side navigation locking
let _drawer_lock = false;

// Diagnostics service
let _diagnostics = new Diagnostics();

// Guided flows
let _lastFlowId = null;
let _flow = null;
let _overlayActive = false;
let _bumpers = null;
let _AR_MODE = null;
let _pointsDistance=[];
let _direction=['0deg','0deg','0deg'];

// Application processing events
let _processing = false;

//button disable
let _arPinDropButtonDisable=false;

/**
 * Check to see if the key exists
 * @param key
 * @returns {boolean}
 */
let key_exists = function (key) {
    let keyvalue = null;
    try {
        if (_global[key] !== null) {
            return true;
        }
    }
    catch (err) {
        return false;
    }
    return false;
}

export default class Global_State extends React.Component {
    static instance = null;

    // Setup the global class
    constructor(props) {
        super(props);
        this._viewTracker = ['Register'];
    }

    /**
     * Perform an update to views subscribed
     */
    performUpdate() {
        global.Events.emit({ name: global.const.PEFORM_UPDATE });
    }

    /**
     * Application processing
     * @param value
     */
    set processing(value) {
        _processing = value;
        this.performUpdate();
    }

    get processing() {
        return _processing;
    }
 /**
     * Get loaded
     * @returns {boolean}
     */
    get arPinDropButtonDisable() {
        return _arPinDropButtonDisable;
    }

       /**
     * Set loaded
     * @param value
     */
    set arPinDropButtonDisable(value) {
        _arPinDropButtonDisable = value;
    }
    /**
     * Get the flow
     * @returns {*}
     */
    get flow() {
        return _flow;
    }

    /**
     * Set the flow
     * @param value
     */
    set flow(value) {
        _flow = value;
    }

    /**
     * Set the last flow id
     * @param value
     */
    set flowId(value) {
        _lastFlowId = value;
        this.performUpdate();
    }

    /**
     * Get the last known flow id
     * @returns {*}
     */
    get flowId() {
        return _lastFlowId;
    }

    /**
     * Get overlay active flag
     * @returns {boolean}
     */
    get overlayActive() {
        return _overlayActive;
    }

    /**
     * Set the overlay active flag
     * @param value
     */
    set overlayActive(value) {
        _overlayActive = value;
        this.performUpdate();
    }
    get pointsDistance() {
        return _pointsDistance;
    }

  /**
     * Set the AR Node Items (for mapping)
     * @param value
     */
    set pointsDistance(value) {
        _pointsDistance = value;
    }
    get direction() {
        return _direction;
    }

    /**
     * Set the AR Node Items (for mapping)
     * @param value
     */
    set direction(value) {
        _direction = value;
    }
    /**
     * Get the bumpers
     * @returns {*}
     */
    get bumpers() {
        return _bumpers;
    }

    /**
     * Set the bumpers
     * @param value
     */
    set bumpers(value) {
        _bumpers = value;
        this.performUpdate();
    }

    /**
     * Next bumper option
     * @param value
     */
    setBumperNext(value) {
        if (_bumpers && _bumpers.next) {
            _bumpers.next.enabled = value;
            EventRegister.emit("APPLICATION_INTERNAL_BUMP_RIGHT", "in");
            this.performUpdate();
        }
    }

    /**
     * Previous bumper option
     * @param value
     */
    setBumperPrevious(value) {
        if (_bumpers && _bumpers.previous) {
            _bumpers.previous.enabled = value;
            EventRegister.emit("APPLICATION_INTERNAL_BUMP_LEFT", "in");
            this.performUpdate();
        }
    }

    /**
     * Exit any current flow that is active
     */
    exitFlows(callback = null) {
        _lastFlowId = null;
        _overlayActive = false;
        _flow = null;
        _bumpers = null;
        global.Flow(null, 0);
        if (callback) callback();
        this.performUpdate();
    }

    /**
     * Get the AR Mode
     * @returns {string}
     * @constructor
     */
    get ARMode() {
        return _AR_MODE;
    }

    /**
     * Set the AR Mode
     * @param value
     * @constructor
     */
    set ARMode(value) {
        _AR_MODE = value;
    }

    /**
     * Get the previous view that was stacked before the current view
     * @returns {string}
     */
    get lastView() {
        return this._viewTracker.length > 1 ? this._viewTracker[1] : this._viewTracker[0];
    }

    /**
     * Get the diagnostic log
     * @returns {Diagnostics}
     */
    get diagnostic() {
        return _diagnostics;
    }

    /**
     * Get back if the drawer side menu is locked
     * @returns {boolean}
     */
    get drawerLocked() {
        return _drawer_lock;
    }

    /**
     * Create a singleton instance of the global state class
     * @returns {null}
     */
    static getInstance() {
        if (Global_State.instance == null) {
            Global_State.instance = new Global_State();
        }

        return this.instance;
    }

    /**
     * Returns the work order service
     */
    get work_orders() {
        return _workorders;
    }

    /**
     * Clear the work order service and create new
     */
    clearWorkOrders() {
        _workorders.clear();
        this.set('work_order', null);
    }

    /**
     * Reset the main navigation screen to a new screen
     * @param screen
     * @param params
     * @returns {NavigationResetAction}
     */
    resetNavigation(screen, params = {}) {
        global.Pop(null);

        // Track the navigation views
        if (this._viewTracker[0] !== screen) {
            this._viewTracker.unshift(screen);
        }

        // Change the navigation stack
        return StackActions.reset({
            index: 0,
            actions: [NavigationActions.navigate({ routeName: screen, params: params })],
        });
    }

    get currentNavigationView() {
        return this._viewTracker.length > 0 ? this._viewTracker[0] : null;
    }

    /**
     * Common view style for the view stack
     * @param navigation
     * @returns {{headerTitleStyle: {fontSize: number}, headerBackground: *, headerTintColor: string, title: string, headerLeft: (boolean|*), headerStyle: {borderBottomColor: string, backgroundColor: string, borderBottomWidth: number}}}
     */
    viewStyleOptions(navigation) {
        let styles = new Styles().get();

        _drawer_lock = navigation == null;
        return {
            title: '',
            headerTitleStyle: {
                fontSize: 18
            },
            headerLeft: (
                (navigation != null &&
                    <TouchableOpacity onPress={() => navigation.toggleDrawer()}>
                        <View
                        >
                            <FontAwesomeIcon style={{ marginLeft: 20, marginBottom: Platform.OS === 'ios' ? 10 : 0 }} size={25} color={styles.globalHeaderMenu.color} icon={faBars} />
                        </View>
                    </TouchableOpacity>
                )
            ),
            headerBackground: (
                <View style={
                    {
                        flex: 1,
                        alignSelf: 'stretch'
                    }}>
                    <Image
                        style={{
                            flex: 1,
                            alignSelf: 'flex-end',
                            width: 200,
                            height: 200,
                            marginRight: 20,
                            marginTop: 10

                        }}
                        resizeMode="contain"
                        source={styles.globalHeaderLogo}
                    />
                </View>
            ),
            headerStyle: styles.globalHeader,
            headerTintColor: '#ffffff',
            cardStyle: styles.card
        };
    }

    /**
    * Check to see if iOS version 13 is available
    * @returns {boolean}
    */
    iOS13_available() {
        const majorVersionIOS = parseInt(Platform.Version, 10);
        return !(majorVersionIOS < 13)
    }

    ///// GLOBAL KEYS //////


    /**
     * Get a global configuration key
     * @param key
     * @returns {null}
     */
    get(key) {
        return _global[key];
    }

    /**
     * Get a global configuration key returned as a boolean
     * @param key
     * @returns {boolean}
     */
    getBoolean(key) {
        return key_exists(key) ? _global[key] : false;
    }

    /**
     * Get a global configuration key returned as an number
     * @param key
     * @returns {number}
     */
    getNumber(key) {
        return key_exists(key) ? _global[key] : 0;
    }

    /**
     * Set a global configuration key to a new value
     * @param key
     * @param value
     */
    set(key, value) {
        _global[key] = value;
    }


}
