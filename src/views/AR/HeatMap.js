/**
 * Heat map for AR
 */

import React, {useRef} from "react";
import {
    Animated, TouchableOpacity
} from 'react-native';

import {
    PanGestureHandler,
    PinchGestureHandler,
    RotationGestureHandler,
    State,
} from 'react-native-gesture-handler';

import GestureRecognizer, {swipeDirections} from 'react-native-swipe-gestures';

// Import the heat map canvas
import {Canvas} from 'react-three-fiber';
import * as THREE from 'three';

// Import heat map components
import Camera from './heatmap/Camera';
import FPC from './heatmap/FPC';

// Event Listener
import { EventRegister } from 'react-native-event-listeners';

// Import Font Awesome
import {FontAwesomeIcon} from '@fortawesome/react-native-fontawesome';
import {faExpandArrows, faCompressAlt} from '@fortawesome/pro-solid-svg-icons';

export default class HeatMap extends React.Component {

    // Heat map gesture control
    panRef = React.createRef();
    rotationRef = React.createRef();
    pinchRef = React.createRef();

    // Event listener
    heatMapListener;

    // Local state
    state = {
        update: false
    };

    /**
     * Create event listener
     * @param props
     */
    constructor(props) {
        super(props);

        // Event listener
        this.heatMapListener = EventRegister.addEventListener(global.const.AR_UPDATE_HEAT_MAP_ITEMS, (data) => {
            this.setState({update: true});
        });

        /* Pinching */
        this._baseScale = new Animated.Value(1);
        this._pinchScale = new Animated.Value(1);
        this._scale = Animated.multiply(this._baseScale, this._pinchScale);
        this._lastScale = 1;
        this._onPinchGestureEvent = Animated.event(
            [{ nativeEvent: { scale: this._pinchScale } }],
            { useNativeDriver: true }
        );

        /* Rotation */
        this._rotate = new Animated.Value(0);
        this._rotateStr = this._rotate.interpolate({
            inputRange: [-100, 100],
            outputRange: [-100, 100],
        });
        this._lastRotate = 0;
        this._onRotateGestureEvent = Animated.event(
            [{ nativeEvent: { rotation: this._rotate } }],
            { useNativeDriver: true }
        );

        /* Tilt */
        this._tilt = new Animated.Value(0);
        this._tiltStr = this._tilt.interpolate({
            inputRange: [-501, -500, 0, 1],
            outputRange: ['1rad', '1rad', '0rad', '0rad'],
        });
        this._lastTilt = 0;
        this._onTiltGestureEvent = Animated.event(
            [{ nativeEvent: { translationY: this._tilt } }],
            { useNativeDriver: true }
        );
    }

    /**
     * Remove event listener
     */
    componentWillUnmount() {
        EventRegister.removeEventListener(this.heatMapListener);
    }

    /**
     * Only update the map if the items have changed
     * @param nextProps
     * @param nextState
     * @param nextContext
     * @returns {boolean}
     */
    componentDidUpdate(nextProps, nextState, nextContext) {

        // Only update the map if a new item was added
        if (this.state.update) {
            this.setState({update: false});
            return true;
        }

        //global.tracking.rotation;
        return false;
    }

    /**
     * Draw the line
     * @returns {Array}
     */
    getPoints() {
        let points = [];

        let mapPoints = global.tracking.mapPoints;
        for (let i=0;i<mapPoints.length;i++) {
            let point = mapPoints[i];
            let start = new THREE.Vector3(point[0][0],point[0][1],point[0][2]);
            let end = new THREE.Vector3(point[1][0],point[1][1],point[1][2]);

            points.push(<line>
                <geometry attach="geometry" vertices={[start, end]}/>
                <lineBasicMaterial attach="material" linewidth={5} color={point[2][0]} />
            </line>);
        }
        return points;
    }

    /**
     * On Rotate Gesture
     * @param event
     * @private
     */
    _onRotateHandlerStateChange = event => {
        //alert("Rotate");
        //if (event.nativeEvent.oldState === State.ACTIVE) {
            this._lastRotate += event.nativeEvent.rotation;
            this._rotate.setOffset(this._lastRotate);
            this._rotate.setValue(0);

            //global.tracking.mapRotationPinch(this._lastRotate);

            //alert(JSON.stringify(this._rotateStr));
        //}

        //alert (event.nativeEvent.numberOfPointers)
        if (event.nativeEvent.numberOfPointers === 1) {
            global.tracking.clearMapRotation();
        }
    };
    _onPinchHandlerStateChange = event => {
        if (event.nativeEvent.oldState === State.ACTIVE) {
            this._lastScale *= event.nativeEvent.scale;
            this._baseScale.setValue(this._lastScale);
            this._pinchScale.setValue(1);

            //alert("Pinch");
        }
    };
    _onTiltGestureStateChange = event => {
        if (event.nativeEvent.oldState === State.ACTIVE) {
            this._lastTilt += event.nativeEvent.translationY;
            this._tilt.setOffset(this._lastTilt);
            this._tilt.setValue(0);

            //alert("Tilt");
        }
    };

    _onSwipeUp(gestureState) {
        global.tracking.mapZoomPinch(2);
    }

    _onSwipeDown(gestureState) {
        global.tracking.mapZoomPinch(-2);
    }

    _onSwipeLeft(gestureState) {
        global.tracking.mapRotationPinch(0);
    }

    _onSwipeRight(gestureState) {
        global.tracking.mapRotationPinch(1);
    }


    /**
     * Render the heat map
     * @returns {*}
     */
    render() {
        const config = {
            velocityThreshold: 0,
            directionalOffsetThreshold: 100
        };

        return (
            <GestureRecognizer
                onSwipeUp={this._onSwipeUp}
                onSwipeDown={this._onSwipeDown}
                onSwipeLeft={this._onSwipeLeft}
                onSwipeRight={this._onSwipeRight}
                config={config}
                style={{
                    flex: 1
                }}
            >
                <PanGestureHandler
                    ref={this.panRef}
                    onGestureEvent={this._onTiltGestureEvent}
                    onHandlerStateChange={this._onTiltGestureStateChange}
                    minDist={1}
                    minPointers={2}
                    maxPointers={2}
                    avgTouches>
                    <Animated.View style={{flex: 1, width:'100%', height: '100%'}}>
                        <RotationGestureHandler
                            ref={this.rotationRef}
                            simultaneousHandlers={this.pinchRef}
                            onGestureEvent={this._onRotateGestureEvent}
                            onHandlerStateChange={this._onRotateHandlerStateChange}>
                            <Animated.View style={{flex: 1, width:'100%', height: '100%'}}>
                                <PinchGestureHandler
                                    ref={this.pinchRef}
                                    simultaneousHandlers={this.rotationRef}
                                    onGestureEvent={this._onPinchGestureEvent}
                                    onHandlerStateChange={this._onPinchHandlerStateChange}>
                                    <Animated.View style={{flex: 1, width:'100%', height: '100%'}} collapsable={false}>
                                        <Canvas>
                                            <mesh
                                                scale={[1, 1, 1]}>
                                                <cubeGeometry attach="geometry" args={[10000, 10000, 10000]} />
                                                <meshStandardMaterial attach="material" color={'#79a8ff'} side={THREE.BackSide} />
                                            </mesh>

                                            <pointLight position={[0, 200, 0]} intensity={3}/>
                                            <Camera/>

                                            {this.getPoints()}
                                            {global.tracking.mapItems.map((node, i) => {
                                                return (<group><pointLight intensity={0.5} position={node.heatmapCoords} color={node.style}/><mesh key={i}
                                                                                                                                                   position={node.heatmapCoords}
                                                                                                                                                   scale={global.state.ARMode === "simple" && i===0? [1.5, 1.5, 1.5] : [1, 1, 1]}>
                                                    <sphereBufferGeometry attach="geometry" args={[3]}/>
                                                    <meshBasicMaterial attach="material" color={node.style}/>
                                                </mesh></group>)
                                            })}
                                            <FPC/>
                                        </Canvas>
                                    </Animated.View>
                                </PinchGestureHandler>
                            </Animated.View>
                        </RotationGestureHandler>
                    </Animated.View>
                </PanGestureHandler>
                {global.state.ARMode !== global.const.AR_WORKFLOW_MODE && <TouchableOpacity onPress={() => {
                    this.props.controller.toggleMapZoom();
                }} style={{
                    position: 'absolute',
                    bottom: -5,
                    left: -5,
                    width: 50,
                    height: 50,
                    textAlign: 'center',
                    justifyContent: 'center',
                    alignItems: 'center',
                    opacity: 0.5,
                }}>
                    <FontAwesomeIcon active size={this.props.controller.state.heatmap.style.top === 50 ? 20 : 25} color={'lightgray'} icon={this.props.controller.state.heatmap.style.top === 50 ? faExpandArrows : faCompressAlt}/>
                </TouchableOpacity>}
            </GestureRecognizer>
        )
    }
}
