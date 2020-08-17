/**
 * Certification Summary View
 */

// Import Components
import React from "react";
import {
    StatusBar, Text, TouchableOpacity,
    View
} from 'react-native';
import {
    Button,
    CheckBox,
    Form,
    Label, Picker, Textarea
} from "native-base";
import Icon from 'react-native-vector-icons/FontAwesome';

import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faBallotCheck } from '@fortawesome/pro-regular-svg-icons';
import { faEdit } from '@fortawesome/pro-light-svg-icons';

// Default style sheet
import Style from '../styles/views/certificationsummary'

// Global state for navigation options
import Global_State from '../constants/global';

// Import the main parts of each view
import AnimatedStackView from '../styles/components/stack_view';
import NavigationButtons from "../styles/components/navigation_buttons";
import Header from "../styles/components/view_header";

export default class SummaryView extends React.Component {
    static navigationOptions = ({ navigation }) => Global_State.getInstance().viewStyleOptions(navigation);

    // Global state
    Global = global.state;

    // Global configuration
    Configuration = global.configuration;

    // Get the work order information
    work_order = global.state.get('work_order');
    notesInput;

    // Local state
    state = {
        summary_details:[],
        reason:null,
        reason_codes:[],
        reviewed: false,
        notes: "",
        edit_mode: false,
        reviewMandatory: global.configuration.get("customerReviewMandatory")
    };

    // Constructor
    constructor(props) {
        super(props);
    }

    // View mounted and ready
    componentDidMount(){
       if (this.work_order != null) {
            let summaryDetails = this.work_order.calculateSummary();
            this.setState({summary_details: summaryDetails});

            let currentReason = null;

            if (this.work_order.currentCertification != null) {
                this.work_order.currentCertification.summaryViewed = true;
                this.setState({reviewed: this.work_order.currentCertification.reviewed});
                this.setState({notes: this.work_order.currentCertification.notes});
                currentReason = this.work_order.currentCertification.reasonCode;
            }

            let reasonCodes = global.configuration.get('closeOutReasons');
            let reasons = [];

            if (reasonCodes != null) {
                for (let i = 0; i < reasonCodes.length; i++) {
                    if (currentReason == null) currentReason = reasonCodes[i];
                    let reasonLabel = global.t.get("CLOSE_OUT_REASON", reasonCodes[i]);
                    reasons.push(
                        <Picker.Item key={i} label={reasonLabel} value={reasonCodes[i]}/>
                    );
                }
            }
            this.setState({reason:currentReason});
            this.setState({reason_codes: reasons});
        }
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

    /**
     * Set the reason code
     * @param reason
     */
    setReasonCode(reason) {
        this.work_order.currentCertification.reasonCode = reason;
        this.setState({reason: reason});
    }

    /**
     * Set the reviewed state
     */
    setReviewed() {
        this.work_order.currentCertification.reviewed = !this.state.reviewed;
        this.setState({reviewed: !this.state.reviewed});
    }

    setNotes(text) {
        if (text.length <= 200) {
            this.work_order.currentCertification.notes = text;
            this.setState({notes: text});
        }
    }

    /**
     * Focus on the notes input
     */
    focusInput() {
        /*setTimeout(function(_this) {
            _this.notesInput._root.focus();
        },100, this)*/
    }

    // Render view components
    render() {
        console.disableYellowBox = true;
        //const {navigate} = this.props.navigation;

        if(this.state.summary_details != null && !this.state.edit_mode) {
            return (
                <AnimatedStackView>
                    <View style={styles.container}>
                        <StatusBar hidden/>
                        <Header style={styles.header} label={'Summary'} icon={faBallotCheck}>
                            <TouchableOpacity onPress={() => this.setState({edit_mode:true})}>
                                <View style={{backgroundColor:'rgba(197,17,98,1)', marginLeft: -45, top:0, padding: 5, flexDirection:'row', justifyContent:'flex-end'}}
                                      onPress={() => this.setState({edit_mode:true})}
                                >
                                    <FontAwesomeIcon icon={faEdit} color={'white'} size={40}
                                                     onPress={() => this.setState({edit_mode:true})}
                                    />
                                </View>
                            </TouchableOpacity>
                        </Header>
                        <View style={{flexDirection: 'column', flex: 0, marginTop: 30}}>
                            <View style={{flexDirection: 'row', flex: 0, paddingBottom: 20}}>
                                <Label style={{flex: 1, fontSize: 20}}>
                                    Tested Locations
                                </Label>
                                <Label style={{flex: 1, textAlign: 'center'}}>
                                    {this.state.summary_details.tested}
                                </Label>
                            </View>

                            <View style={{flexDirection: 'row', flex: 0, paddingBottom: 20}}>
                                <Label style={{flex: 1, fontSize: 20}}>
                                    Passed Locations
                                </Label>
                                <Label style={{flex: 1, textAlign: 'center'}}>
                                    {this.state.summary_details.passed}
                                </Label>
                            </View>

                            <View style={{flexDirection: 'row', flex: 0, paddingBottom: 20}}>
                                <Label style={{flex: 1, fontSize: 20}}>
                                    Warning Locations
                                </Label>
                                <Label style={{flex: 1, textAlign: 'center'}}>
                                    {this.state.summary_details.warning}
                                </Label>
                            </View>

                            <View style={{flexDirection: 'row', flex: 0, paddingBottom: 20}}>
                                <Label style={{flex: 1, fontSize: 20}}>
                                    Failed Locations
                                </Label>
                                <Label style={{flex: 1, textAlign: 'center'}}>
                                    {this.state.summary_details.failed}
                                </Label>
                            </View>
                        </View>
                        <View
                            style={{
                                borderBottomColor: 'black',
                                borderBottomWidth: 1,
                            }}
                        />

                        <View style={{flexDirection:'column', flex:0, marginTop:10, marginLeft:-3}}>
                            <Text style={{fontSize: 18}}>
                                Select a reason for these results
                            </Text>
                            <Picker
                                mode="dropdown"
                                enabled={true}
                                selectedValue={this.state.reason}
                                style={[styles.picker, {marginTop:3, backgroundColor: '#e9e9e9', height: 45, width:'100%'}]}
                                onValueChange={(itemValue) => this.setReasonCode(itemValue)}>
                                {this.state.reason_codes}
                            </Picker>

                            <View style={{flex:0, flexDirection:'row', justifyContent:'center', marginTop: 25, marginLeft:-20}}>
                                <CheckBox checkboxBgColor={'rgba(197,17,98,1)'} style={{marginTop:0}} checked={this.state.reviewed} onPress={() => this.setReviewed()}/>
                                <Text style={{paddingLeft:15, fontSize:18}} onPress={() => this.setReviewed()}> Reviewed with customer</Text>
                            </View>

                        </View>

                        <NavigationButtons navigation={this.props.navigation} next={{label: 'Done', route: (this.state.reviewed || !this.state.reviewMandatory ? 'Home' : null)}}
                                           previous={{label: 'Previous', route: 'Home'}}/>
                    </View>
                </AnimatedStackView>
            );
        }
        if (this.state.summary_details != null && this.state.edit_mode) {
            return (
                <AnimatedStackView>
                    <View style={styles.container}>
                        <StatusBar hidden />
                        <Header style={styles.header} label={'Edit Notes'} icon={faBallotCheck}/>
                        <View style={{flex:0, flexDirection:'column', marginTop: 20, marginLeft:-3}}>
                            <View style={{flex:0, flexDirection:'row'}}>
                                <Text style={{flex: 3, paddingLeft:5, fontSize:18}}>Notes</Text>
                                <Text style={{flex: 1, textAlign:'right', paddingRight:5, fontSize:14}}>{this.state.notes.length}/200</Text>
                            </View>
                            <Textarea style={[styles.text_area, {marginTop: 0}]}
                                      ref={c => this.notesInput = c}
                                      onChangeText={(text) => this.setNotes(text)}
                                      onFocus={() => this.setState({edit_mode:true})}
                                      value={this.state.notes}
                                      rowSpan={5} bordered placeholder="Describe the visit" />
                        </View>
                        <Button block style={{
                            marginTop: 10,
                            marginLeft:-3,
                            justifyContent: 'center',
                            borderWidth: 1,
                            borderColor: 'black',
                            backgroundColor: '#4dbdea'}}
                                onPress={() => this.setState({edit_mode:false})}>
                            <Text style={{color:'#fff', fontSize:16}}>Done</Text>
                        </Button>
                    </View>
                </AnimatedStackView>
            );
        }
        if (this.state.summary_details == null) {
            return (
                <AnimatedStackView>
                    <StatusBar hidden/>
                    <Header style={styles.header} label={'Certification Summary'} icon={faBallotCheck}/>
                </AnimatedStackView>
            )
        }
    }
}
// Load default styles
const styles = new Style().get();