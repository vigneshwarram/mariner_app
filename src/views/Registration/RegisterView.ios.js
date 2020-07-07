/**
 * Register Application View (IOS)
 */

import React from "react";
import {View, Text, StatusBar, TouchableOpacity} from 'react-native';
import {
    Label,
    Button,
    Item,
    Input,
    Form,
    Spinner,
    Picker
} from "native-base";
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faCloud } from '@fortawesome/pro-regular-svg-icons';
import { faSmile } from '@fortawesome/pro-light-svg-icons';
import { faCaretDown } from '@fortawesome/pro-solid-svg-icons';

import Style from '../../styles/views/register';
import Header from "../../styles/components/view_header";
import AnimatedStackView from "../../styles/components/stack_view";
import Splash from "../../styles/components/splash";

export default class RegisterViewComponent extends React.Component {

    render() {
        console.disableYellowBox = true;
        const {navigate} = this.props.navigation;

        if(!this.props.controller.state.registered) {
            return (
                <AnimatedStackView>
                    <Splash/>
                    <View style={[styles.container]}>
                        <StatusBar hidden />
                        <TouchableOpacity style={{position: 'absolute',  height: '10%', width: '10%', zIndex: 1, top: 0, left: 0}} onPress={() => this.props.controller.updateEasterEggTracker('header')}>
                        </TouchableOpacity>
                        <TouchableOpacity style={{position: 'absolute',  height: '10%', width: '100%', zIndex: 1, top: 0, right: 0}} onPress={() => this.props.controller.updateEasterEggTracker('text')}>
                        </TouchableOpacity>
                        <Header style={styles.header} label={global.t.get$("TITLE.WELCOME")} icon={faSmile}/>
                        <View style={{flex: 1, flexDirection: 'column'}}>
                            <View style={{flex: 2, marginTop: 50, marginLeft: -4, flexDirection: "row"}}>
                                <View style={{flexDirection: 'column', width: '25%'}}>
                                    <View style={{borderBottomWidth: 1,  borderBottomColor: '#464d54', }}>
                                        <Picker
                                            mode="dropdown"
                                            selectedValue={this.props.controller.state.language_selection}
                                            style={[styles.picker, {marginTop: 0, backgroundColor: 'transparent', height: 45, borderLeftWidth: 0, borderTopWidth: 0, borderRightWidth: 0, borderBottomWidth:0}]}
                                            onValueChange={(itemValue) => this.props.controller.setLanguageSelection(itemValue)}>
                                            {this.props.controller.state.language_options}
                                        </Picker>
                                    </View>
                                </View>
                                <View style={{marginLeft: -20, marginTop: 10}}>
                                    <FontAwesomeIcon active size={20} color={'#464d54'} icon={faCaretDown} />
                                </View>
                            </View>
                            {!this.props.controller.state.qa_mode &&
                                <View style={{flex: 5, marginTop: 0, alignItems: 'center', justifyContent: 'center', marginLeft: -50}}>
                                    <Text style={{fontSize: 18, color: '#464d54'}}>{global.t.get$("TEXT.WELCOME_MESSAGE")}</Text>
                                </View>
                            }
                            {!this.props.controller.state.qa_mode &&
                                <View style={{flex: 2, marginTop: 0, marginLeft: -50, justifyContent: 'center', alignItems: 'center', flexDirection: 'row'}}>
                                    <View style={{width: '75%', borderBottomWidth: 1,  borderBottomColor: '#464d54'}}>
                                        <Picker
                                            mode="dropdown"
                                            selectedValue={this.props.controller.state.registration_display}
                                            style={[styles.picker, {marginTop: 0, backgroundColor: 'transparent', height: 45, borderLeftWidth: 0, borderTopWidth: 0, borderRightWidth: 0, borderBottomWidth:0}]}
                                            onValueChange={(itemValue) => this.props.controller.setIspSelection(itemValue)}>
                                            {this.props.controller.state.registration_options}
                                        </Picker>
                                    </View>
                                    <View style={{marginLeft: -20}}>
                                        <FontAwesomeIcon active size={20} color={'#464d54'} icon={faCaretDown} />
                                    </View>
                                </View>
                            }
                            {this.props.controller.state.qa_mode &&
                                <Form style={{position: 'absolute', top: '30%', left: '-10%', width: '70%'}}>
                                    <View style={{flexDirection:'row'}}>
                                        <Item style={[styles.item]} stackedLabel error={this.props.controller.state.code_error}>
                                            <Label style={styles.text}>{global.t.$.HEADER.REGISTRATION_CODE}</Label>
                                            <Input style={styles.input} ref={c => this.props.controller.regCodeInput = c} placeholder=""
                                                   onChangeText={(text) => this.props.controller.setRegistrationCode(text)}
                                            />
                                        </Item>
                                        <Button
                                            disabled={global.functions.isNullOrEmpty(this.props.controller.state.registration_code) || global.functions.isNullOrEmpty(this.props.controller.state.tech_id)}
                                            rounded style={[styles.circle_button, {
                                            marginTop: 20,
                                            marginLeft: 35,
                                            marginRight: 0
                                        }, global.functions.isNullOrEmpty(this.props.controller.state.registration_code) || global.functions.isNullOrEmpty(this.props.controller.state.tech_id) ? styles.disabled : null]}
                                                onPress={() => this.props.controller.registerApplication()}>
                                            <Text style={[styles.button_text_round, {marginTop:0}]}>{global.t.$.ACTION.GO}</Text>
                                        </Button>
                                    </View>
                                    <Item style={[styles.item, {marginTop:-60}]} stackedLabel error={this.props.controller.state.tech_error}>
                                        <Label style={styles.text}>{global.t.$.HEADER.TECHNICIAN_ID}</Label>
                                        <Input style={styles.input} placeholder=""
                                               onChangeText={(text) => this.props.controller.setTechId(text)}
                                        />
                                    </Item>
                                </Form>
                            }
                            {!this.props.controller.state.qa_mode &&
                                <View style={{flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginLeft: -50}}>
                                    <Label style={{marginTop: 2, fontSize: 13, color: '#464d54'}}>{global.t.get$("ACTION.SELECT_SERVICE_PROVIDER")}</Label>
                                </View>
                            }
                            {!this.props.controller.state.qa_mode &&
                                <View style={{flex: 6, marginTop: 80, justifyContent: 'center', alignItems:'center'}}>
                                    <Button
                                        disabled={this.props.controller.state.registration_code === ""}
                                        rounded style={[styles.circle_button, {
                                        marginTop: 20, marginLeft: -50, height: 80, width: 80, textAlign: 'center', justifyContent: 'center', alignItems: 'center'
                                    }, this.props.controller.state.registration_code === "" ? styles.disabled : null]}
                                        onPress={() => this.props.controller.registerApplication()}>
                                        <Text style={[styles.button_text_round, this.props.controller.state.registration_code !== "" ? {color: 'white'} : null, {marginTop:0, alignSelf: 'center', fontSize: 18, fontWeight: 'bold'}]}>{global.t.get$("ACTION.START")}</Text>
                                    </Button>
                                </View>
                            }
                        </View>
                    </View>
                </AnimatedStackView>
            );
        }
        else {
            navigate('Home', {})
        }
    }
}
// Load styles for Register
const styles = new Style().get();


/*if (!this.props.controller.state.registered) {
            return (
                <AnimatedStackView>
                    <Splash/>
                    <View style={[styles.container]}>
                        <StatusBar hidden />
                        <Header style={styles.header} label={global.t.$.TITLE.REGISTER} icon={faCloud}/>
                        <Form style={[styles.form_top, {paddingBottom:50, marginLeft:-40, justifyContent:'flex-start', alignContent:'flex-start'}]}>
                            <View style={{flexDirection:'row'}}>
                                <Item style={[styles.item, {alignContent:'flex-start'}]} stackedLabel error={this.props.controller.state.code_error}>
                                    <Label style={styles.text}>{global.t.$.HEADER.REGISTRATION_CODE}</Label>
                                    <Input style={styles.input} ref={c => this.props.controller.regCodeInput = c} placeholder=""
                                           onChangeText={(text) => this.props.controller.setRegistrationCode(text)}
                                    />
                                </Item>
                                <Button
                                    disabled={global.functions.isNullOrEmpty(this.props.controller.state.registration_code) || global.functions.isNullOrEmpty(this.props.controller.state.tech_id)}
                                    rounded style={[styles.circle_button, {
                                    marginTop: 20,
                                    marginLeft: 35,
                                    marginRight: 0
                                }, global.functions.isNullOrEmpty(this.props.controller.state.registration_code) || global.functions.isNullOrEmpty(this.props.controller.state.tech_id) ? styles.disabled : null]}
                                        onPress={() => this.props.controller.registerApplication()}>
                                    <Text style={[styles.button_text_round, {marginTop:0}]}>{global.t.$.ACTION.GO}</Text>
                                </Button>
                            </View>
                            <Item style={[styles.item, {marginTop:-60}]} stackedLabel error={this.props.controller.state.tech_error}>
                                <Label style={styles.text}>{global.t.$.HEADER.TECHNICIAN_ID}</Label>
                                <Input style={styles.input} placeholder=""
                                       onChangeText={(text) => this.props.controller.setTechId(text)}
                                />
                            </Item>
                        </Form>
                        <View>
                        <Picker
                            mode="dropdown"
                            selectedValue={this.props.controller.state.language}
                            style={[styles.picker, {marginTop: -20, marginLeft: -25,  backgroundColor: '#e9e9e9', height: 45, width:'75%'}]}
                            onValueChange={(itemValue) => this.props.controller.setLanguageSelection(itemValue)}>
                            <Picker.Item label="English" value="en" />
                            <Picker.Item label="French" value="fr" />
                        </Picker>
                        </View>
                        {this.props.controller.state.form_submitted &&
                            <Spinner style={{marginLeft: -25}} color="blue"/>
                        }
                    </View>
                </AnimatedStackView>
            );
        }
        else {
            navigate('Home', {})
        }*/