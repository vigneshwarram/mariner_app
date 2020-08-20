/**
 * Flow header needs to be added to Views that support overlays
 */
import React from "react";
import {View, Animated, Dimensions, TouchableWithoutFeedback, Text,Alert} from "react-native";

import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faTimes, faQuestionCircle } from '@fortawesome/pro-light-svg-icons';

import {EventRegister} from "react-native-event-listeners";
import FlowView from "./flow_view";
import {Button, Badge} from "native-base";

// Default style sheet
import Style from '../../styles/base/index';

export default class OverlayView extends React.Component {

    // Listeners
    flowListener;
    bubbleListener;
    flowBumpListener;

    // Bubble timer
    bubbleTimer;

    // Local state
    state = {
        height: 0,
        pop: null,
        flow: null,
        bubbles: [],
        bubble: null,
        index: 0,
        id: null,
        bubbleIndex: 0
    };

    // Set up the listeners
    constructor(props) {
        super(props);

        // Clear the state if reloaded
        this.clearStateOnLoad();

        // Set up the animations
        this.springValue = new Animated.Value(0.6);
        this.animatedMargin = new Animated.Value(-100);

        global.SystemEvents.subscribe([

            // Application internal popups
            {id:this, name:'APPLICATION_INTERNAL_POPUP', callback:(data)=> {
                    if (this.state.flow !== null) return;
                    global.overlayActive = data != null;
                    this.setState({pop: data});}}
        ]);

        // Flow listener
        this.flowListener = EventRegister.addEventListener('APPLICATION_INTERNAL_FLOW', (data) => {
            if (this.state.pop !== null) return;
            this.setState({bubbles:[], bubble:null, bubbleIndex: 0});

            global.overlayActive = data.f != null;
            if (data.f != null) {
                if (global.state.flow === null) {
                    global.state.flow = data.f;
                }
            }
            this.slideFlowButton();
            EventRegister.emit("APPLICATION_INTERNAL_BUMP_RIGHT", "in");
            EventRegister.emit("APPLICATION_INTERNAL_BUMP_LEFT", "in");

            if (data.i != null) {
                if (data.i.switch != null) {
                    this.setState({id: data.i.switch});
                }
                else {
                    this.setState({index: data.i, id: null});
                }
            }

            this.setState({flow: data.f});
        });

        // Bubble listener
        this.bubbleListener = EventRegister.addEventListener('APPLICATION_INTERNAL_BUBBLE', (data) => {
            if (data === "previous" || data === "next") {
                if (this.state.bubble && this.state.bubbles.length > 0) this.jumpIntoFlow(data);
            }
            else {
                let bubbles = [];
                if (data) {
                    for (let i = 0; i < data.length; i++) {
                        let point_location = this.stylePointer(data[i]);
                        let bubble_location = data[i].position.center ? this.stylePosition(data[i].position) : data[i].position;
                        if (i === 0) {
                            this.setState({bubble: {idx: i, callout: data[i], timer: data[i].timerMS, location: bubble_location, style: point_location}});
                        }
                        bubbles.push({idx: i, callout: data[i], timer: data[i].timerMS, location: bubble_location, style: point_location});
                    }
                    this.setState({bubbles: bubbles});
                }
                this.springValue.setValue(0.6);
                Animated.spring(this.springValue, {toValue: 1}).start();
            }
        });

        // Flow View Bump
        this.flowBumpListener = EventRegister.addEventListener('APPLICATION_INTERNAL_FLOW_BUMP', (bump) => {
            if (bump && bump.switch) {
                this.jumpIntoFlow(bump.switch);
            }
            else if (global.state.bumpers) {
                if (bump === "previous" && global.state.bumpers.previous) {
                    if(global.state.bumpers.previous.switch==="hideArrow"){
                        global.AREvents.emit({name:global.const.HIDE_ARROW});
                        //Alert.alert('pumber back');
                        return;
                    }
                    this.jumpIntoFlow(global.state.bumpers.previous.switch);
                    global.state.setBumperNext(false);
                }
                else if (bump === "next" && global.state.bumpers.next) {
                    this.jumpIntoFlow(global.state.bumpers.next.switch);
                }
            }
        });
    }

    /**
     * Clear current state if constructor is called again
     */
    clearStateOnLoad() {
        this.setState({
            height: 0,
            pop: null,
            flow: null,
            bubbles: [],
            bubble: null,
            index: 0,
            bubbleIndex: 0
        });
    }

    /**
     * Style bubble position
     * @param detail
     * @returns {*}
     */
    stylePosition(detail) {
        let center = detail.center;
        detail.top = (Math.round(Dimensions.get('window').height)/2)+center;
        return detail;
    }

    /**
     * Style the pointer callout
     * @param detail
     * @returns {{location: {right: number, borderTopColor: *}, direction: (styles.triangleBottom|{backgroundColor, bottom, right, borderTopColor, borderBottomColor, borderLeftWidth, borderTopWidth, borderRightWidth, width, borderRightColor, position, borderStyle, borderBottomWidth, height, borderLeftColor})}}
     */
    stylePointer(detail) {
        let point_location = {direction: styles.triangleBottom, location: {right: 4, borderTopColor: styles.callout.backgroundColor}};
        if (detail.point && detail.point.top) {
            point_location.direction = styles.triangleTop;
            switch(detail.point.top) {
                case "right": {
                    point_location.location = {right: 12, borderBottomColor: styles.callout.backgroundColor};
                    break;
                }
                case "middle": {
                    point_location.location = {right: (detail.size.width/2)-10, borderBottomColor: styles.callout.backgroundColor};
                    break;
                }
                default: {
                    point_location.location = {left: 12, borderBottomColor: styles.callout.backgroundColor};
                }
            }
        }
        else if (detail.point && detail.point.bottom) {
            point_location.direction = styles.triangleBottom;
            switch(detail.point.bottom) {
                case "right": {
                    point_location.location = {right: 12, borderTopColor: styles.callout.backgroundColor};
                    break;
                }
                case "middle": {
                    point_location.location = {right: (detail.size.width/2)-10, borderTopColor: styles.callout.backgroundColor};
                    break;
                }
                default: {
                    point_location.location = {left: 12, borderTopColor: styles.callout.backgroundColor};
                }
            }
        }
        else if (detail.point && detail.point.side) {
            switch(detail.point.side) {
                case "right": {
                    point_location.direction = styles.triangleRight;
                    point_location.location = {top: 20, borderTopColor: styles.callout.backgroundColor};
                    break;
                }
                default: {
                    point_location.direction = styles.triangleLeft;
                    point_location.location = {top: 20, borderTopColor: styles.callout.backgroundColor};
                }
            }
        }
        return detail.point ? point_location : null;
    }

    // Get the device height
    componentDidMount() {
        styles = new Style().get("FLOW_HEADER");
        this.setState({height: Math.round(Dimensions.get('window').height)});
        this.animatedLeftMargin = new Animated.Value(-60);
    }

    // Remove the listeners
    componentWillUnmount() {
        global.SystemEvents.remove(this, 'APPLICATION_INTERNAL_POPUP');
        EventRegister.removeEventListener(this.flowListener);
        EventRegister.removeEventListener(this.bubbleListener);
        EventRegister.removeEventListener(this.flowBumpListener);
    }

    /**
     * Slide button over
     */
    slideFlowButton() {
        this.animatedLeftMargin = new Animated.Value(-100);
        Animated.timing(this.animatedLeftMargin, {
            toValue: -5,
            duration: 300
        }).start();
    }

    /**
     * Slide button over
     */
    slideBubbleButton() {
        this.animatedMargin = new Animated.Value(-100);
        Animated.timing(this.animatedMargin, {
            toValue: -15,
            duration: 300
        }).start();
    }

    /**
     * Show button
     */
    showBubbleButton() {
        this.animatedMargin = new Animated.Value(-15);
    }

    /**
     * Jump into flow and change view by ID
     * @param id
     */
    jumpIntoFlow(id) {
        clearTimeout(this.bubbleTimer);
        let bubbleIndex = this.state.bubbleIndex;
        if (id === "continue") {
            this.gotoNextBubble(bubbleIndex);
        }
        else if (id === "next") {
            this.gotoNextBubble(bubbleIndex+1);
        }
        else if (id === "previous") {
            this.gotoNextBubble(bubbleIndex-1);
        }
        else if (id === "close") {
            this.setState({bubble:null});
            this.slideBubbleButton();
        }
    
        else {
            this.setState({bubble: null});
            global.Flow(global.state.flow, {switch:id});
        }
    }

    /**
     * Go to the next bubble
     * @param current
     */
    gotoNextBubble(next) {
        this.setState({bubbleIndex: next});
        this.state.bubbles.forEach((bubble) => {
            if (bubble.idx === next) {
                this.setState({bubble:bubble});
                this.springValue.setValue(0.3);
                Animated.spring(this.springValue, { toValue: 1 }).start();

                if (bubble.timer) {
                    clearTimeout(this.bubbleTimer);
                    this.bubbleTimer = setTimeout(() => {
                        this.jumpIntoFlow("next");
                    }, bubble.timer);
                }
            }
        })
    }

    /**
     * Render the Flows
     * @returns {null|*}
     */
    render() {
        if (this.state.flow || this.state.pop) {
            return (
                <View style={{position:"absolute", width: '100%', backgroundColor: 'white', height: '100%'}}>
                    <FlowView style={{position:"absolute", width: '100%', height: this.state.height, backgroundColor: 'white'}} _parent={this} _index={this.state.index} _flowId={this.state.id} _flow={this.state.flow} _pop={this.state.pop} link {...this.props}/>
                </View>
            )
        }
        else if (this.state.bubble) {
            return (
                <TouchableWithoutFeedback onPress={() => this.jumpIntoFlow(this.state.bubble.callout.switch ? this.state.bubble.callout.switch : null)}>
                    <Animated.View style={[{position: 'absolute', zIndex: 2000, transform: [{scale: this.springValue}]}, this.state.bubble.callout.position]}>
                        <Badge style={[{opacity: 1, borderColor: 'white', borderWidth: 1, borderStyle: 'solid', backgroundColor: styles.callout.backgroundColor, paddingHorizontal: 5}, this.state.bubble.callout.size]}>
                           {this.props.Arvisible &&<Button rounded style={[styles.circle_icon, {position: 'absolute', bottom: -7, left: -7}]}>
                                <FontAwesomeIcon active size={20} color={'white'} icon={faQuestionCircle}/>
                            </Button>} 
                            <Text style={[{alignSelf: 'center', fontSize: 16, marginTop: 10, marginRight: 15, marginLeft: 5, color: styles.callout.color}]}>{this.state.bubble.callout.text + '\n'}</Text>
                            <Button onPress={() => this.jumpIntoFlow(this.state.bubble.callout.switch ? this.state.bubble.callout.switch : null)} rounded style={[styles.circle_icon, {position: 'absolute', top: 3, right: 3}]}>
                                <FontAwesomeIcon active size={20} color={'white'} icon={faTimes}/>
                            </Button>
                        </Badge>
                        {this.props.Arvisible && this.state.bubble.style &&<View style={[this.state.bubble.style.direction, this.state.bubble.style.location, {opacity: 1}]}/>}
                    </Animated.View>
                </TouchableWithoutFeedback>
            )
        }
        else if (this.props.Arvisible && this.state.bubbles && this.state.bubbles.length > 0) {
            return (
                <TouchableWithoutFeedback onPress={() => this.jumpIntoFlow("continue")}>
                    <Animated.View style={{position: 'absolute', bottom: 70, zIndex: 2000, transform: [{translateX: this.animatedMargin}]}}>
                        <Button
                            rounded style={[styles.circle_button]}
                            onPress={() => this.jumpIntoFlow("continue")}>
                            <FontAwesomeIcon active size={45} color={'white'} icon={faQuestionCircle}/>
                        </Button>
                    </Animated.View>
                </TouchableWithoutFeedback>
            )
        }
        else {
            return null;
        }
    }
}
// Load default styles
let styles = new Style().get("FLOW_HEADER");

/*
{this.state.bubble.callout.switch !== 'next' && this.state.bubble.callout.switch !== 'previous' &&
                                <FontAwesomeIcon active size={16} color={'black'} icon={faTimes} style={{position: 'absolute', top: 5, right: 5}}/>
                            }
 */
