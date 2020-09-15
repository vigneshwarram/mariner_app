/**
 * Flow Manager View
 */
import React from "react";
import {Animated, View, Dimensions} from "react-native";
// Import the supported views
import OverlayViews from '../../boot/flows';
import GestureRecognizer from "react-native-swipe-gestures";
import {EventRegister} from "react-native-event-listeners";
// Default style sheet
import Style from '../../styles/base/index';

export default class FlowView extends React.Component {

    // Get the overlays
    OverlayViews = new OverlayViews();

    // Total views that support pagination
    totalViews = 0;

    // Flow View Update
    flowUpdateListener;

    // Local state
    state = {
        height: 0,
        view: [],
        viewStack: [],
        totalViews: 0,
        currentView: 0,
        history: null
    };

    /**
     * On init set up the animation
     * @param props
     */
    constructor(props) {
        super(props);
        this.springValue = new Animated.Value(1.1);

        this.onSwipeLeft.bind(this);
        this.onSwipeRight.bind(this);

        this.animatedMargin = new Animated.Value(0);

        // Flow View Change listener
        this.flowUpdateListener = EventRegister.addEventListener('APPLICATION_INTERNAL_FLOW_UPDATE', (data) => {
            this.changeViewById(data);
        });
    }

    /**
     * On mount construct the views
     */
    componentDidMount() {
        style = new Style().get("FLOW_HEADER");
        this.setState({height: Platform.OS === 'ios' ? Math.round(Dimensions.get('window').height)-100 : Math.round(Dimensions.get('window').height)-56});

        //this.springValue.setValue(0.6);
        Animated.spring(this.springValue, { toValue: 1, duration: 500 }).start();

        if (this.props._flow && this.state.view && this.state.view.length === 0) { this.constructViews(this.props._flow); }
    }

    // Remove listeners
    componentWillUnmount() {
        EventRegister.removeEventListener(this.flowUpdateListener);
    }

    /**
     * Construct the flow views
     * @param flows
     */
    constructViews(flows) {
        if (flows && flows.views) {
                flows.views.forEach((view, idx) => {
                if (view.pagination) this.totalViews++;
                let view_layout = this.OverlayViews.get(view.type, {
                    key: idx,
                    idx: idx,
                    view: view,
                    controller: this,
                    props: this.props
                });

                if (this.props._flowId) {
                    if (view.id === this.props._flowId) {
                        global.state.flowId = view.id;
                        global.state.bumpers = view.bumpers;
                        this.setState({currentView: view.pagination-1});
                        this.setState({view: [...this.state.view, {index: idx, id: view.id, enabled: true, bumpers: view.bumpers, details: view, layout: view_layout}]});
                    }
                }
                else if (idx === this.props._index) {
                    global.state.bumpers = view.bumpers;
                    this.setState({currentView: view.pagination-1});
                    this.setState({view: [...this.state.view, {index: idx, id: view.id, enabled: true, bumpers: view.bumpers, details: view, layout: view_layout}]});
                }
                this.state.viewStack.push({index: idx, id: view.id, enabled: false, bumpers: view.bumpers, details: view, layout: view_layout});
            });
        }
    }

    /**
     * Change the flow view by index
     * @param idx
     */
    changeViewByIndex(idx) {
        this.state.viewStack.forEach((view) => {
            if (view.index === idx) {
                this.setState({view: [view]});
                this.props._parent.setState({index: view.index});
            }
        });
    }

    /**
     * Change the flow view by id
     * @param id
     * @param direction
     */
    changeViewById(id, direction=null) {
        if (direction) {
            if (direction === 'left') {
                this.slideLeft();
            }
            else {
                this.slideRight();
            }
        }

        if (id.indexOf("load:") > -1) {
            let view = id.split(":");
            if (view.length === 2) {
                global.Flow(view[1])
            }
        }
        else {
            this.state.viewStack.forEach((view) => {
                if (view.id === id) {
                    global.state.flowId = id;
                    this.setState({view: [view]});
                    this.props._parent.setState({index: view.index});
                    if (view.details.pagination) {
                        this.setState({currentView: view.details.pagination - 1});
                    }
                    global.state.bumpers = view.bumpers;
                }
            });
        }
    }

    /**
     * Clear flow
     */
    exitFlow() {
        global.state.exitFlows();
    }

    /**
     * Swipe left
     * @param gestureState
     */
    onSwipeLeft(gestureState) {
        if (this.state.view && this.state.view[0] && this.state.view[0].details.swipe && this.state.view[0].details.swipe.left) {
            this.slideRight();
            this.changeViewById(this.state.view[0].details.swipe.left);
        }
    }

    /**
     * Swipe right
     * @param gestureState
     */
    onSwipeRight(gestureState) {
        if (this.state.view && this.state.view[0] && this.state.view[0].details.swipe && this.state.view[0].details.swipe.right) {
            this.slideLeft();
            this.changeViewById(this.state.view[0].details.swipe.right);
        }
    }

    /**
     * Slide onto overlay stack
     */
    slideLeft() {
        this.animatedMargin = new Animated.Value(-200);
        Animated.timing(this.animatedMargin, {
            toValue: 0,
            duration: 250
        }).start();
    }

    /**
     * Slide onto overlay stack
     */
    slideRight() {
        this.animatedMargin = new Animated.Value(200);
        Animated.timing(this.animatedMargin, {
            toValue: 0,
            duration: 250
        }).start();
    }

    /**
     * Render the pagination
     * @returns {null|*}
     */
    renderPagination() {
        if (this.totalViews <= 1) {
            return null;
        }

        const ActiveDot = <View style={[style.dot, style.activeDot]} />,
            Dot = <View style={style.dot} />;

        let dots = [];

        for (let key = 0; key < this.totalViews; key++) {
            dots.push(key === this.state.currentView ?
                React.cloneElement(ActiveDot, { key }) :
                React.cloneElement(Dot, { key })
            );
        }

        return (
            <View
                style={[style.pagination]}>
                {dots}
            </View>
        );
    }

    /**
     * Render the view as a flow or popup
     * @returns {null|*}
     */
    render() {
        if (this.props._flow) {
            return (
                <GestureRecognizer
                    onSwipeLeft={() => this.onSwipeLeft(state)}
                    onSwipeRight={() => this.onSwipeRight(state)}
                >
                    <Animated.View style={{width: '100%', height: this.state.height, position: 'absolute', zIndex: 2000}}>
                        {this.state.view.map((viewRender) => {
                            return(<View style={{backgroundColor: 'white', width: '100%', height: '100%'}}><Animated.View style={{position: 'absolute', width: '100%', height: this.state.height, transform: [{translateX: this.animatedMargin}]}}>
                                    {viewRender.layout}
                            </Animated.View></View>)
                        })}
                        {this.renderPagination()}
                    </Animated.View>
                </GestureRecognizer>
            )
        }
        else if (this.props._pop) {
            return (
                <Animated.View style={{width: '100%', height: this.state.height, position: 'absolute', zIndex: 2000, transform: [{scale: this.springValue}]}}>
                    <View style={{backgroundColor: 'white', width: '100%', height: '100%'}}>
                    {this.props._pop}
                    </View>
                </Animated.View>
            )
        }
        else {
            return null;
        }
    }
}

// Pagination styles
let style = new Style().get("FLOW_HEADER");
