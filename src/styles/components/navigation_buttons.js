import React from "react";
import {View} from "react-native";
import {Button, Text} from "native-base";
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faWindowClose } from '@fortawesome/pro-regular-svg-icons';

import Style from '../base/index';

import Global_State from '../../constants/global';

export default class NavigationButtons extends React.Component {
    Global = Global_State.getInstance();

    componentDidMount() {
        new Style().get("NAVIGATION_BUTTONS", (style) => {
            styles = style;
            this.forceUpdate();
        });
    }

    /**
     * Change the navigation stack to prevent the back button from showing
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

    render() {
        //const {navigate} = this.props.navigation;

        if (this.props.exit == null && this.props.submit == null && this.props.cancel == null && this.props.back == null) {
            return (
                <View style={{
                    flex: 2,
                    width: '100%',
                    position: 'absolute',
                    bottom: 0,
                    flexDirection: 'row',
                    alignItems: 'stretch',
                    justifyContent: 'center',
                    marginLeft: 7,
                    marginBottom: 10
                }}>
                    {this.props.cancel == null && this.props.back == null &&
                    <View style={{flex: 2, flexDirection: 'row', alignItems: 'stretch', justifyContent: 'center'}}>
                        <Button disabled={this.props.previous.route == null} bordered
                                style={[this.props.previous.route == null ? styles.button_disabled : styles.button, {marginRight: 5}]}
                                onPress={() => this.changeNavigationStack(this.props.previous.route, this.props.previous.params)}>
                            <Text style={styles.button_text}>{this.props.previous.label}</Text>
                        </Button>
                        <Button disabled={this.props.next.route == null} bordered
                                style={[this.props.next.route == null ? styles.button_disabled : styles.button, {marginLeft: 5}]}
                                onPress={() => this.changeNavigationStack(this.props.next.route, this.props.next.params)}>
                            <Text style={styles.button_text}>{this.props.next.label}</Text>
                        </Button>
                    </View>
                    }
                </View>
            );
        }
        if (this.props.back != null) {
            return (
                <View style={{
                    flex: 0,
                    width: '100%',
                    position: 'absolute',
                    bottom: 0,
                    flexDirection: 'row',
                    alignItems: 'stretch',
                    justifyContent: 'center',
                    marginLeft: 0,
                    marginBottom: 10
                }}>
                    <View style={{flex: 1, flexDirection: 'row', alignItems: 'stretch', justifyContent: 'center'}}>
                        <Button disabled={this.props.back.route == null} bordered
                                style={this.props.back.route == null ? styles.button_disabled : styles.button}
                                onPress={() => this.changeNavigationStack(this.props.back.route, this.props.back.params)}>
                            <Text style={styles.button_text}>{this.props.back.label}</Text>
                        </Button>
                    </View>
                </View>
            )
        }
        if (this.props.cancel != null) {
            return (
                <View style={{
                    flex: 0,
                    width: '100%',
                    position: 'absolute',
                    bottom: 0,
                    flexDirection: 'row',
                    alignItems: 'stretch',
                    justifyContent: 'center',
                    marginLeft: 0,
                    marginBottom: 40
                }}>
                    <View style={{flex: 1, flexDirection: 'row', alignItems: 'stretch', justifyContent: 'center'}}>
                        <Button disabled={this.props.cancel.route == null} bordered
                                style={this.props.cancel.route == null ? styles.button_disabled : styles.button_cancel}
                                onPress={() => this.changeNavigationStack(this.props.cancel.route, this.props.cancel.params)}>
                            <Text style={styles.button_text}>{this.props.cancel.label}</Text>
                        </Button>
                    </View>
                </View>
            )
        }
        if (this.props.submit != null) {

            return (
                <View style={{
                    flex: 0,
                    position: 'absolute',
                    bottom: 0,
                    width:'100%',
                    flexDirection: 'column',
                    alignItems: 'stretch',
                    alignContent:'center',
                    justifyContent: 'center',
                    marginLeft: 0,
                    marginBottom: 10
                }}>
                    <View style={{flex: 0, flexDirection: 'row', alignItems: 'stretch', justifyContent: 'center'}}>
                        <Button disabled={this.props.submit.route == null} bordered
                                style={this.props.submit.route == null ? styles.submit_button_disabled : styles.submit_button}
                                onPress={() => this.changeNavigationStack(this.props.submit.route, this.props.submit.params)}>
                            <Text style={styles.button_text}>{this.props.submit.label}</Text>
                        </Button>
                    </View>
                </View>
            )
        }

        if (this.props.exit != null) {

            return (
                <View style={{
                    flex: 0,
                    position: 'absolute',
                    bottom: 0,
                    width:'100%',
                    flexDirection: 'row',
                    justifyContent: 'flex-end',
                    marginRight: 0,
                    marginBottom: 10
                }}>
                    <View style={{flex: 0, width: 65, flexDirection: 'row'}}>
                        <Button disabled={this.props.exit.route == null} bordered
                                style={[this.props.exit.route == null ? styles.submit_button_disabled : styles.exit_button]}
                                onPress={() => this.changeNavigationStack(this.props.exit.route, this.props.exit.params)}>
                            <FontAwesomeIcon icon={faWindowClose} size={40} color={'white'}/>
                        </Button>
                    </View>
                </View>
            )
        }
    }
}
// Load styles for Navigation Buttons
let styles = new Style().get();
