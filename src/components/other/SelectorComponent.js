/**
 * Selector View
 * Used for naming the location pins
 */

// Import Components
import React from "react";
import {
    View,
    Animated,
    ScrollView, ActivityIndicator
} from 'react-native';
import {
    Button,
    Label, Text, Input
} from "native-base";

import { TagSelect } from '../../components/other/Tag';

// Default style sheet
import Style from '../../styles/views/default'


export default class SelectorComponent extends React.Component {

    BreakException = {};

    eventID = global.Events.generateId();

    // Global state
    Global = global.state;

    // Global configuration
    Configuration = global.configuration;

    // Image resources
    ImageResources = global.imageResources;

    // Local state
    state = {
        isLoading: false,
        isVisible: false,
        allowTags: false,
        selectionMade: false
    };

    selectorData = [];
    selected;
    input;

    tags = [];
    textvalue = "";
    selectedId = null;

    // Constructor
    constructor(props) {
        super(props);

        this.animatedMargin = new Animated.Value(500);

        global.Events.subscribe([
            {id:this.eventID, name: global.const.SELECTOR, callback:(state) => {
                if (state.id) {
                    this.selectedId = state.id;
                    if(this.props.controller.state.liveMode){
                        this.slideOut();
                    }
                    else{
                        this.slideIn();
                    }             
                }
                else if (state === "show") {
                    if(this.props.controller.state.liveMode){
                        this.slideOut();
                    }
                    else{
                        this.slideIn();
                    }
                }
                else {
                    this.slideOut();
                }
            }}
        ])

    }

    // View mounted and ready
    componentDidMount(){
        this.loadData();
    }

    // View about to unmount
    componentWillUnmount() {
        global.Events.remove(this.eventID);
    }

    // View has been updated
    componentDidUpdate(){
    }

    // Load data for the selector
    loadData() {
        let data = this.props.data;
        if (data != null) {
            this.selectorData.push({id: 1000, label: "Other"});
            data.forEach((location, index) => {
                this.selectorData.unshift({id: index+1, label: location});
            });
        }
    }

    /**
     * Slide In
     */
    slideIn() {
        this.setState({isLoading: true}, () => {
            setTimeout(() => {
            this.setState({allowTags: true, selectionMade: false, isVisible: true}, () => {
                this.textvalue = "";
                this.selected.clearSelected();

                if (this.selectedId != null) {
                    let mapItems = global.tracking.mapItems.reverse();
                    try {
                        mapItems.forEach((item) => {
                            if (item.ID === this.selectedId && item.location != null && item.location.length > 0) {
                                if (item.location[0].id === 1000) {
                                    this.textvalue = item.location[0].text;
                                }
                                this.selected.itemsSelected = item.location;
                                throw this.BreakException;
                            }
                        });
                    } catch (e) {
                        if (e !== this.BreakException) throw e;
                    }
                }

                this.setState({isLoading: false});

                this.animatedMargin = new Animated.Value(400);
                Animated.timing(this.animatedMargin, {
                    toValue: 0,
                    duration: 500,
                    useNativeDriver: true
                }).start();
            });
            }, 200);
        });
    }

    /**
     * Check when the keyboard is dismissed
     */
    keyboardDismiss() {
        if(this.textvalue === "") {
            this.selected.clearSelected();
            this.setState({allowTags: true});
        }
        else {
            this.setState({allowTags: true});
        }
    }

    /**
     * Slide Out
     */
    slideOut() {
        Animated.timing(this.animatedMargin, {
            toValue: 400,
            duration: 500,
            useNativeDriver: true
        }).start(({ finished }) => {
            this.setState({allowTags: false, isVisible: false});
            //this.forceUpdate();
        });

        // Manually add the text for the location pin
        if (this.textvalue !== "" || this.selected != null) {
            let mapItems = global.tracking.mapItems;
            let locationMetaData = [];
            if (this.textvalue !== "") {
                locationMetaData.push({id:1000, label: 'Other', text: this.textvalue});
            }
            else if(this.selected != null) {
                locationMetaData = this.selected.itemsSelected;
            }
            if (this.selectedId != null) {
                mapItems.forEach((item) => {
                    if (item.ID === this.selectedId) {
                        item.location = locationMetaData;
                    }
                });
            }
            else {
                mapItems[mapItems.length - 1].location = locationMetaData;
            }
            global.tracking.mapItems = mapItems;
        }
        global.NodeEvents.emit({name: global.const.AR_NODE_UPDATE, data: this.selectedId});
        this.selectedId = null;
    }

    /**
     * Add other text
     * @param text
     */
    addOther(text) {
        this.textvalue = text;
    }


    // Render view components
    render() {
        console.disableYellowBox = true;

        if (this.state.isVisible) {
            return (
                <Animated.View style={{
                    backgroundColor: 'white',
                    width: '100%',
                    height: 400,
                    position: 'absolute',
                    bottom: 0,
                    zIndex: 2000,
                    transform: [{translateY: this.animatedMargin}]
                }}>
                    <Label style={{fontWeight: 'bold', paddingLeft: 20, paddingTop: 10}}>{this.props.title}</Label>
                    <ScrollView style={{marginRight: 20, marginTop: 20, marginLeft: 20, maxHeight: 220}}>
                        {this.state.allowTags === false &&
                        <Input ref={c => this.input = c}
                               selectTextOnFocus={true}
                               defaultValue={this.textvalue}
                               autoCapitalize={'words'}
                               returnKeyType={'done'}
                               onSubmitEditing={() => this.keyboardDismiss()}
                               onChangeText={(text) => this.addOther(text)}
                        />
                        }
                        <TagSelect
                            data={this.state.allowTags === true ? this.selectorData : []}
                            max={1}
                            ref={(selected) => {
                                this.selected = selected;
                            }}
                            onItemPress={(item) => {
                                this.setState({selectionMade: true});
                                if (item.label.toLowerCase() === "other") {
                                    this.setState({allowTags: false});
                                    if (this.textvalue === "") this.textvalue = "Point";
                                    setTimeout(() => {
                                        this.input._root.focus();
                                    }, 10);
                                } else {
                                    this.textvalue = "";
                                }
                            }}
                            onMaxError={() => {
                            }}
                        />
                    </ScrollView>
                    <View style={{
                        flexDirection: 'column',
                        flex: 1,
                        width: '100%',
                        position: 'absolute',
                        bottom: 20,
                        alignItems: 'center',
                        justifyItems: 'center'
                    }}>
                        <Button bordered disabled={!this.state.selectionMade}
                                style={[!this.state.selectionMade ? styles.button_disabled : styles.button, {
                                    width: 250,
                                    marginBottom: 10
                                }]}
                                onPress={() => {
                                    this.slideOut()
                                }}>
                            <Text
                                style={[!this.state.selectionMade ? styles.button_disabled_text : styles.button_text]}>{global.t.get$('ACTION.DONE')}</Text>
                        </Button>
                        <Button bordered
                                style={[styles.button, {width: 250}]}
                                onPress={() => {
                                    this.slideOut()
                                }}>
                            <Text style={styles.button_text}>Skip</Text>
                        </Button>
                    </View>
                </Animated.View>
            );
        }
        else if (this.state.isLoading) {
            return(<View style={{
                position: 'absolute',
                top: 300,
                left: 0,
                right: 0,
                bottom: 100,
                width: '100%',
                height: '100%',
                flexDirection: 'column',
                justifyContent: 'space-between',
                alignItems: 'center',
                backgroundColor: 'transparent'
            }}>
                <View style={{width: 200, height: 200}}>
                    <ActivityIndicator size="large" color="white" />
                </View>
            </View>);
        }
        return null;
    }
}
// Load default styles
const styles = new Style().get();

