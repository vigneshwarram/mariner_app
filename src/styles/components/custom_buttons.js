import React from "react";
import {View} from "react-native";
import {Button, Text} from "native-base";
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faWindowClose } from '@fortawesome/pro-regular-svg-icons';

import Style from '../base/index';

import Global_State from '../../constants/global';
import Bubble from "../../app_code/flows/bubble";
import {EventRegister} from "react-native-event-listeners";

export default class CustomButtons extends React.Component {
    Global = Global_State.getInstance();

    state = {
        buttons: false,
        button1: null,
        button2: null,
        button3: null,
        button4: null,
        button5: null,
        button6: null
    };

    constructor(props) {
        super(props);

    }

    /**
     * Build the buttons
     */
    componentDidMount() {
        styles = new Style().get("CUSTOM_BUTTONS");

        if (this.props.create && global.functions.isTypeOf("array")) {
            this.setState({buttons: true});
            this.props.create.forEach((button) => {
                this.assignButtons(button);
            });
        }

        if (this.props.inject && global.functions.isTypeOf("array")) {
            this.props.inject.forEach((button) => {
                this.assignButtons(button);
            });
        }
    }

    /**
     * Assign the buttons to a position on the screen
     * @param position
     */
    assignButtons(button) {
        switch(button.position) {
            case 1: {
                this.setState({button1: this.createButton(button)});
                break;
            }
            case 2: {
                this.setState({button2: this.createButton(button)});
                break;
            }
            case 3: {
                this.setState({button3: this.createButton(button)});
                break;
            }
            case 4: {
                this.setState({button4: this.createButton(button)});
                break;
            }
            case 5: {
                this.setState({button5: this.createButton(button)});
                break;
            }
            case 6: {
                this.setState({button6: this.createButton(button)});
                break;
            }
        }
    }

    /**
     * Create button
     * @param button
     * @returns {{route: *, label: *, switch: void}}
     */
    createButton(button) {
        return {label: button.label, route: button.route, switch: button.switch, width: button.width, direction: button.direction}
    }

    /**
     * Change the navigation stack
     * @param view
     * @param params // Optional parameters
     */
    changeNavigationStack(view, params) {
        if (typeof view === 'function') {
            view();
        }
        else {
            this.props.navigation.dispatch(
                this.Global.resetNavigation(
                    view,
                    params
                ));
        }
    }

    /**
     * Change the view using an id
     */
    changeViewById(id, direction=null) {
        if (id.indexOf("trigger:") > -1) {
            let trigger = id.split(":");
            if (trigger.length > 1) {
                this.props.trigger.fire(trigger[1]);
            }
        }
        else if (global.functions.isTypeOf(id) === "array") {
            global.Flow(null);
            global.Bubble(id);
        }
        else if (id === "exit") { this.exitFlow() }
        else if (id === "hide") global.Flow(null);
        else {
            this.props.parent.changeViewById(id, direction);
        }
    }

    /**
     * Clear flow
     */
    exitFlow() {
        global.state.exitFlows();
    }

    render() {
        //const {navigate} = this.props.navigation;

        if (this.state.buttons) {
            return (
                <View style={{
                    flex: 2,
                    width: '100%',
                    position: 'absolute',
                    bottom: 10,
                    flexDirection: 'row',
                    alignItems: 'stretch',
                    justifyContent: 'center',
                    marginLeft: 7,
                    marginBottom: 10
                }}>
                    <View style={{flexDirection: 'row'}}>
                        <View style={{flex: 2, flexDirection: 'row', alignItems: 'stretch', justifyContent: 'center'}}>
                            <Button bordered disabled={!this.state.button5}
                                    style={[styles.button, {width: this.state.button6 && this.state.button6.width ? 0 : 150, marginRight: 5, opacity: this.state.button5 ? 1 : 0}]}
                                    onPress={() => this.state.button5.route !== undefined ?
                                        this.changeNavigationStack(this.state.button5.route) :
                                        this.changeViewById(this.state.button5.switch, this.state.button5.direction)}>
                                <Text numberOfLines={2} style={styles.button_text}>{this.state.button5 ? global.t.get$(this.state.button5.label) : ''}</Text>
                            </Button>
                            <Button bordered disabled={!this.state.button6}
                                    style={[styles.button, {width: this.state.button6 ? this.state.button6.width : 150, marginLeft: 5, opacity: this.state.button6 ? 1 : 0}]}
                                    onPress={() => this.state.button6.route !== undefined ?
                                        this.changeNavigationStack(this.state.button6.route) :
                                        this.changeViewById(this.state.button6.switch, this.state.button6.direction)}>
                                <Text numberOfLines={2} style={styles.button_text}>{this.state.button6 ? global.t.get$(this.state.button6.label) : ''}</Text>
                            </Button>
                        </View>
                    </View>
                    <View style={{flexDirection: 'row'}}>
                        <View style={{flex: 2, flexDirection: 'row', alignItems: 'stretch', justifyContent: 'center'}}>
                            <Button bordered disabled={!this.state.button3}
                                    style={[styles.button, {width: this.state.button4 && this.state.button4.width ? 0 : 150, marginTop: 60, marginRight: 5, opacity: this.state.button3 ? 1 : 0}]}
                                    onPress={() => this.state.button3.route !== undefined ?
                                        this.changeNavigationStack(this.state.button3.route) :
                                        this.changeViewById(this.state.button3.switch, this.state.button3.direction)}>
                                <Text numberOfLines={2} style={styles.button_text}>{this.state.button3 ? global.t.get$(this.state.button3.label) : ''}</Text>
                            </Button>
                            <Button bordered disabled={!this.state.button4}
                                    style={[styles.button, {width: this.state.button4 ? this.state.button4.width : 150, marginTop: 60, marginLeft: 5, opacity: this.state.button4 ? 1 : 0}]}
                                    onPress={() => this.state.button4.route !== undefined ?
                                        this.changeNavigationStack(this.state.button4.route) :
                                        this.changeViewById(this.state.button4.switch, this.state.button4.direction)}>
                                <Text numberOfLines={2} style={styles.button_text}>{this.state.button4 ? global.t.get$(this.state.button4.label) : ''}</Text>
                            </Button>
                        </View>
                    </View>
                    <View style={{flexDirection: 'row'}}>
                        <View style={{flex: 2, flexDirection: 'row', alignItems: 'stretch', justifyContent: 'center'}}>
                            <Button bordered disabled={!this.state.button1}
                                    style={[styles.button, {width: this.state.button2 && this.state.button2.width ? 0 : 150, marginTop: 120, marginRight: 5, opacity: this.state.button1 ? 1 : 0}]}
                                    onPress={() => this.state.button1.route !== undefined ?
                                        this.changeNavigationStack(this.state.button1.route) :
                                        this.changeViewById(this.state.button1.switch, this.state.button1.direction)}>
                                <Text style={styles.button_text}>{this.state.button1 ? global.t.get$(this.state.button1.label) : ''}</Text>
                            </Button>
                            <Button bordered disabled={!this.state.button2}
                                    style={[styles.button, {width: this.state.button2 ? this.state.button2.width : 150, marginTop: 120, marginLeft: 5, opacity: this.state.button2 ? 1 : 0}]}
                                    onPress={() => this.state.button2.route !== undefined ?
                                        this.changeNavigationStack(this.state.button2.route) :
                                        this.changeViewById(this.state.button2.switch, this.state.button2.direction)}>
                                <Text numberOfLines={2} style={styles.button_text}>{this.state.button2 ? global.t.get$(this.state.button2.label) : ''}</Text>
                            </Button>
                        </View>
                    </View>
                </View>
            );
        }
        else {
            return null;
        }

    }
}
// Load styles for Navigation Buttons
let styles = new Style().get("CUSTOM_BUTTONS");
