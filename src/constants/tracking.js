/**
 * Global tracking class
 */
//import { Pedometer } from "expo-sensors";
//import * as Location from "expo-location";
//import {accelerometer, magnetometer, SensorTypes, setUpdateIntervalForType} from "react-native-sensors";

import {Canvas} from 'react-three-fiber';

// Distance
const distance = require('euclidean-distance');

// Compass angles
const COMPASS = {
    N: 360,
    NE: 45,
    E: 90,
    SE: 135,
    S: 180,
    SW: 225,
    W: 270,
    NW: 315
};

/**
 * Get the rotation angle
 * @param previousPosition
 * @param currentPosition
 * @returns {number}
 */
const getRotationAngle = (previousPosition, currentPosition) => {
    const x1 = previousPosition.latitude;
    const y1 = previousPosition.longitude;
    const x2 = currentPosition.latitude;
    const y2 = currentPosition.longitude;

    const xDiff = x2 - x1;
    const yDiff = y2 - y1;

    return (Math.atan2(yDiff, xDiff) * 180.0) / Math.PI;
};

export default class Tracking {
    static instance = null;

    pedometer;
    locationHeading;

    ACCELEROMETER_TRACKING_DIRECTION = ["NONE", "NONE", "NONE"];
    //GYROSCOPE_TRACKING_DIRECTION = ["NONE", "NONE", "NONE"];
    MAGNETOMETER_TRACKING_DIRECTION = ["NONE", "NONE", "NONE"];
    MAGNETOMETER_STARTING_DIRECTION = [null, [0, 180, 90, -90], 0];
    MAGNETOMETER_PREVIOUS_DIRECTION = [null, [0, 180, 90, -90], 0];

    /**
     * Create a singleton instance of the class
     * @returns {null}
     */
    static getInstance() {
        if (Tracking.instance == null) {
            Tracking.instance = new Tracking();
        }
        return this.instance;
    }

    /**
     * Set up the tracking variables
     */
    constructor() {

        //setUpdateIntervalForType(SensorTypes.accelerometer, 15);
        //setUpdateIntervalForType(SensorTypes.gyroscope, 15);
        //setUpdateIntervalForType(SensorTypes.magnetometer, 15);

        this._mapZoom = 100;
        this._mapTilt = 70;
        this._mapRotation = 0;
        this._mapRotationOnLoad = 45;
        this._moving = false;
        this._rotation = 0;
        this._previousRotation = null;
        this._loaded = true;
        this._mapItems = [];
       
        this._allNodeData = [];
        this._geoLocation = null;
        this._path = [];
        this._angle = 0;
        this._pitch = 75;
        this._heatmapNode = [0,0,0];
        this._current = [0,0,0];
        this._previous = [0,0,0];
        this._currentCamera = null;
        this._heatmapCount = 0;
        this._accelerometerHistory = {previous: null, current: null};
        //this._gyroscopeHistory = {previous: null, current: null};
        this._magnetometerHistory = {previous: null, current: null};
        this._pedometerHistory = {previous: 0, current: 0};

        // Accelerometer handler
        /*try {
            accelerometer.subscribe(({x, y, z}) => {
                if (this._accelerometerHistory.current == null) {
                    this._accelerometerHistory.current = {x: x, y: y, z: z};
                } else {
                    this._accelerometerHistory.previous = this._accelerometerHistory.current;
                    this._accelerometerHistory.current = {x: x, y: y, z: z};
                }
            });
        }
        catch(err) {}*/

        // Gyroscope handler
        /*gyroscope.subscribe(({ x, y, z }) => {
            if (this._gyroscopeHistory.current == null) {
                this._gyroscopeHistory.current = {x:x, y:y, z:z};
            }
            else {
                this._gyroscopeHistory.previous = this._gyroscopeHistory.current;
                this._gyroscopeHistory.current = {x:x, y:y, z:z};
            }
        });*/

        // Magnetometer handler
        /*try {
            magnetometer.subscribe(({x, y, z}) => {
                if (this._magnetometerHistory.current == null) {
                    this._magnetometerHistory.current = {x: x, y: y, z: z};
                } else {
                    this._magnetometerHistory.previous = this._magnetometerHistory.current;
                    this._magnetometerHistory.current = {x: x, y: y, z: z};
                }
            });
        }
        catch(err) {}*/

        // Pedometer handler
        /*Pedometer.isAvailableAsync().then(
            result => {
                this.pedometer = Pedometer.watchStepCount(result => {
                    if (Number(this._pedometerHistory.previous) < Number(result.steps)) {
                        //this._moving = Number(result.steps) - Number(this._pedometerHistory.previous);
                        this._pedometerHistory.previous = Number(result.steps);
                    }
                });
            },
            error => {
            }
        );*/

        // Geolocation handler
        /*try {
            this.locationHeading = Location.watchHeadingAsync(result => {
                if (this._heading) {
                    this._heading = result.magHeading;
                } else {
                    this._currentHeading = result.magHeading;
                    this._heading = result.magHeading;
                }
            });
        }
        catch(err) {}

        // Update rotation direction
        setInterval(() => {
            let direction = this.magnetometerDirection;
        }, 500);*/
    }

    /**
     * Get map zoom value
     * @returns {number}
     */
    get mapZoom() {
        return this._mapZoom;
    }

    /**
     * Get the map tilt
     * @returns {number}
     */
    get mapTilt() {
        return this._mapTilt;
    }

    /**
     * Map Pinch
     * @param value
     */
    mapZoomPinch(value) {
        if (value > 1) {
            this._mapZoom+=8;
            this._mapTilt+=8;
        }
        else if (value < 1) {
            this._mapZoom-=8;
            this._mapTilt-=8;
        }
    }

    /**
     * Get the initial map rotation when the map loads
     * @returns {number}
     */
    get mapRotationOnLoad() {
        let rotation = this._mapRotationOnLoad;
        this._mapRotationOnLoad = 0;
        return rotation;
    }

    /**
     * Reset map rotation when the AR view is loaded
     */
    resetmapRotationOnLoad() {
        this._mapRotationOnLoad = 45;
    };

    /**
     * Get map rotation value
     * @returns {number}
     */
    get mapRotation() {
        return this._mapRotation;
    }

    /**
     * Map Rotation Pinch
     * @param value
     */
    mapRotationPinch(direction) {
        this._mapRotation = direction === 0 ? 0.01 : -0.01;
    }

    /**
     * Clear the map rotation
     */
    clearMapRotation() {
        this._mapRotation = 0;
    }

    /**
     * Reset the step counter
     */
    resetSteps() {
        this._pedometerHistory = {previous: 0, current: 0};
    }

    /**
     * Get step counter results
     * @returns {number}
     */
    get steps() {
        return this._pedometerHistory.current;
    }

    /**
     * Determine if the user is currently moving
     * @returns {boolean}
     */
    get moving() {
        return this._moving;
    }

    /**
     * Moving flag
     * @param value
     */
    set moving(value) {
        this._moving = value;
    }

    /**
     * Get rotation
     * @returns {{previous: number, rotation: number}|number}
     */
    get rotation() {
        if (this._previousRotation != null && this._rotation !== this._previousRotation) {
            return {previous: (this._previousRotation - this._rotation), rotation: this._rotation};
        }
        else {
            return {previous: 0, rotation: 0};
        }
    }

    /**
     * Clear the rotation
     */
    clearRotation() {
        this._previousRotation = this._rotation;
    }

    /**
     * Set the previous rotation
     * @param value
     */
    set previousRotation(value) {
        this._previousRotation = value;
    }

    /**
     * Set the rotation
     * @param value
     */
    set rotation(value) {
        this._rotation = value;
    }

    /**
     * Get the current heading
     * @returns {Promise<HeadingData>}
     */
    get heading() {
        return this._heading ? this._heading : "null";
    }

    /**
     * Set the heatmap camera position
     * @param value
     */
    set heatMapNode(value) {
        this._heatmapNode = value;
    }

    /**
     * Get the last heatmap camera position
     * @returns {number[]}
     */
    get heatMapNode() {
        return this._heatmapNode;
    }


    /**
     * Clear all tracking information
     */
    clearAll() {
        this.clearMapItems();
        this.clearLocation();
        this.clearPath();
        this._allNodeData = [];
    }

    /**
     * Undo last node
     */
    undo() {
        this._mapItems.pop();
        this._allNodeData.pop();
        this._path.pop();
    }

    /**
     * Get loaded
     * @returns {boolean}
     */
    get loaded() {
        return this._loaded;
    }
 
    /**
     * Set loaded
     * @param value
     */
    set loaded(value) {
        this._loaded = value;
    }

    /**
     * Get pitch
     * @returns {number}
     */
    get pitch() {
        return this._pitch;
    }

    /**
     * Get the rotation angle
     * @returns {null}
     */
    get rotationAngle() {
        return this._angle;
    }

    /**
     * Set the current rotation angle
     * @param previousPosition
     * @param currentPosition
     */
    setRotationAngle(previousPosition, currentPosition) {
        this._angle = getRotationAngle(previousPosition, currentPosition);
    }

    /**
     * Set current location
     */
    set current(value) {
        this._current = value;

        let difference = distance(this.current, this._previous);
        if (difference > 1)  {
            this._previous = this._current;
            this._moving = difference;
        }
    }

    /**
     * Get current location
     * @returns {number[]}
     */
    get current() {
        return this._current;
    }

    get heatmapCurrent() {
        return [Number(this._current[0]*5), Number(this._current[1]), Number(this._current[2]*5)];
    }

    /**
     * Set current transform
     */
    set currentCamera(value) {
        this._currentCamera = value;
    }

    /**
     * Get current transform
     * @returns {number[]}
     */
    get currentCamera() {
        return this._currentCamera;
    }

    /**
     * Get the current accelerometer tracking direction
     * @returns {string[]}
     */
    get accelerationDirection() {
        if (this._accelerometerHistory.previous && this._accelerometerHistory.current) {
            this.ACCELEROMETER_TRACKING_DIRECTION = ["NONE", "NONE", "NONE"];

            let x = this._accelerometerHistory.previous.x - this._accelerometerHistory.current.x;
            let y = this._accelerometerHistory.previous.y - this._accelerometerHistory.current.y;
            let z = this._accelerometerHistory.previous.z - this._accelerometerHistory.current.z;

            if (x > 1) {
                this.ACCELEROMETER_TRACKING_DIRECTION[0] = "LEFT";
            }
            else if (x < -1) {
                this.ACCELEROMETER_TRACKING_DIRECTION[0] = "RIGHT";
            }

            if (y > 1) {
                this.ACCELEROMETER_TRACKING_DIRECTION[1] = "DOWN";
            }
            else if (y < -1) {
                this.ACCELEROMETER_TRACKING_DIRECTION[1] = "UP";
            }

            if (z > 1) {
                this.ACCELEROMETER_TRACKING_DIRECTION[2] = "FORWARD";
            }
            else if (z < -1) {
                this.ACCELEROMETER_TRACKING_DIRECTION[2] = "BACKWARD";
            }
        }

        return this.ACCELEROMETER_TRACKING_DIRECTION;
    }

    /**
     * Get the current gyroscope value
     * @returns {{x: *, y: *, z: *}|*}
     */
    get gyroscopeDirection() {

        /*if (this._gyroscopeHistory.previous && this._gyroscopeHistory.current) {
            let x = this._gyroscopeHistory.previous.x - this._gyroscopeHistory.current.x;
            let y = this._gyroscopeHistory.previous.y - this._gyroscopeHistory.current.y;
            let z = this._gyroscopeHistory.previous.z - this._gyroscopeHistory.current.z;

            if (x > 1) {
                this.GYROSCOPE_TRACKING_DIRECTION[0] = "LEFT";
            }
            else if (x < -1) {
                this.GYROSCOPE_TRACKING_DIRECTION[0] = "RIGHT";
            }

            if (y > 1) {
                this.GYROSCOPE_TRACKING_DIRECTION[1] = "DOWN";
            }
            else if (y < -1) {
                this.GYROSCOPE_TRACKING_DIRECTION[1] = "UP";
            }

            if (z > 1) {
                this.GYROSCOPE_TRACKING_DIRECTION[2] = "FORWARD";
            }
            else if (z < -1) {
                this.GYROSCOPE_TRACKING_DIRECTION[2] = "BACKWARD";
            }

            this.GYROSCOPE_TRACKING_DIRECTION[0] = this._gyroscopeHistory.current.x;
            this.GYROSCOPE_TRACKING_DIRECTION[1] = this._gyroscopeHistory.current.y;
            this.GYROSCOPE_TRACKING_DIRECTION[2] = this._gyroscopeHistory.current.z;
        }*/

        return {}; //this.GYROSCOPE_TRACKING_DIRECTION;
    }

    /**
     * Get the current magnetometer value
     * @returns {{x: *, y: *, z: *}|*}
     */
    get magnetometerDirection() {

        if (this._magnetometerHistory.current) {
            let magnetometerAngle = this.magnetometerAngle(this._magnetometerHistory.current);
            let magnetometerDegree = this.magnetometerDegree(magnetometerAngle);
            this.MAGNETOMETER_TRACKING_DIRECTION[0] = magnetometerAngle.toString();
            this.MAGNETOMETER_TRACKING_DIRECTION[1] = magnetometerDegree.toString();
            this.MAGNETOMETER_TRACKING_DIRECTION[2] = this.magnetometerCompass(this._heading ? this._heading : 0);

            if (this.MAGNETOMETER_STARTING_DIRECTION[0] == null &&
                this.MAGNETOMETER_TRACKING_DIRECTION[2] !== "NONE") {
                this.MAGNETOMETER_TRACKING_DIRECTION[2] = "N";
                this.MAGNETOMETER_STARTING_DIRECTION[0] = "N";

                this.MAGNETOMETER_STARTING_DIRECTION[1][0] = COMPASS.N;
                this.MAGNETOMETER_STARTING_DIRECTION[1][1] = COMPASS.NE;
                this.MAGNETOMETER_STARTING_DIRECTION[1][2] = COMPASS.E;
                this.MAGNETOMETER_STARTING_DIRECTION[1][3] = COMPASS.SE;
                this.MAGNETOMETER_STARTING_DIRECTION[1][4] = COMPASS.S;
                this.MAGNETOMETER_STARTING_DIRECTION[1][5] = COMPASS.SW;
                this.MAGNETOMETER_STARTING_DIRECTION[1][6] = COMPASS.W;
                this.MAGNETOMETER_STARTING_DIRECTION[1][7] = COMPASS.NW;
            }
            this._rotation = this.magnetometerChangeDirection();
        }
        return this.MAGNETOMETER_TRACKING_DIRECTION;
    }

    /**
     * Change the direction
     */
    magnetometerChangeDirection() {
        switch (this.MAGNETOMETER_TRACKING_DIRECTION[2]) {
            case 'N': {
                return this.MAGNETOMETER_STARTING_DIRECTION[1][0];
            }
            case 'NE': {
                return this.MAGNETOMETER_STARTING_DIRECTION[1][1];
            }
            case 'E': {
                return this.MAGNETOMETER_STARTING_DIRECTION[1][2];
            }
            case 'SE': {
                return this.MAGNETOMETER_STARTING_DIRECTION[1][3];
            }
            case 'S': {
                return this.MAGNETOMETER_STARTING_DIRECTION[1][4];
            }
            case 'SW': {
                return this.MAGNETOMETER_STARTING_DIRECTION[1][5];
            }
            case 'W': {
                return this.MAGNETOMETER_STARTING_DIRECTION[1][6];
            }
            case 'NW': {
                return this.MAGNETOMETER_STARTING_DIRECTION[1][7];
            }
        }
    }

    /**
     * Get the magnetometer angle
     * @param magnetometer
     * @returns {number}
     */
    magnetometerAngle(magnetometer) {
        let angle = 0;
        if (magnetometer) {
            let x = magnetometer.x;
            let y = magnetometer.y;

            if (Math.atan2(y, x) >= 0) {
                angle = Math.atan2(y, x) * (180 / Math.PI);
            }
            else {
                angle = (Math.atan2(y, x) + 2 * Math.PI) * (180 / Math.PI);
            }
        }

        return Math.round(angle);
    };

    /**
     * Get the magnetometer degree
     * @param magnetometer
     * @returns {number}
     */
    magnetometerDegree(magnetometer){
        return magnetometer - 90 >= 0 ? magnetometer - 90 : magnetometer + 271;
    }

    /**
     * Get the magnetometer compass direction
     * @param degree
     * @returns {string}
     */
    magnetometerCompass(degree) {
        if (degree >= 22.5 && degree < 67.5) {
            return 'NE';
        }
        else if (degree >= 67.5 && degree < 112.5) {
            return 'E';
        }
        else if (degree >= 112.5 && degree < 157.5) {
            return 'SE';
        }
        else if (degree >= 157.5 && degree < 202.5) {
            return 'S';
        }
        else if (degree >= 202.5 && degree < 247.5) {
            return 'SW';
        }
        else if (degree >= 247.5 && degree < 292.5) {
            return 'W';
        }
        else if (degree >= 292.5 && degree < 337.5) {
            return 'NW';
        }
        else {
            return 'N';
        }
    };

    /**
     * Get Stored AR Node Items (for mapping)
     * @returns {Array}
     */
    get mapItems() {
        return this._mapItems;
    }

    /**
     * Set the AR Node Items (for mapping)
     * @param value
     */
    set mapItems(value) {
        this._mapItems = value;
    }

    /**
     * Get the nodes with signal and other information (for site uploads)
     * @returns {Array}
     */
    get allNodeData() {
        return this._allNodeData;
    }

    /**
     * Set the node data (for site uploads)
     * @param value
     */
    set allNodeData(value) {
        this._allNodeData = value;
    }

    /**
     * Clear stored AR Node Items
     */
    clearMapItems() {
        this._mapItems = [];
    }

    get mapPoints() {
        let points = [];
        for (let i=0;i<this._mapItems.length;i++) {
            if (this._mapItems.length > i+1) {
                points.push([
                    [this._mapItems[i].heatmapCoords[0], 3, this._mapItems[i].heatmapCoords[2]],
                    [this._mapItems[i+1].heatmapCoords[0], 3, this._mapItems[i+1].heatmapCoords[2]],
                    [this._mapItems[i+1].pathStyle]
                    ]);
            }
        }
        return points;
    }

    /**
     * Get the previous map item count
     * @returns {number}
     */
    get previousMapItemCount() {
        return this._heatmapCount;
    }

    /**
     * Set the previous map item count
     * @param value
     */
    set previousMapItemCount(value) {
        this._heatmapCount = value;
    }

    /**
     * Get the latest known location (geolocation coords)
     * @returns {null}
     */
    get location() {
        return this._geoLocation;
    }

    /**
     * Set the location of the user (geolocation)
     * @param value
     */
    set location(value) {
        this._geoLocation = value;
    }

    /**
     * Clear location information
     */
    clearLocation() {
        this._geoLocation = null;
    }

    /**
     * Get the path
     * @returns {Array}
     */
    get path() {
        return this._path;
    }

    // Add a new path coord
    set path(value) {
        this._path.concat([value]);
    }

    /**
     * Clear path information
     */
    clearPath() {
        this._path = [];
    }

}

/**
 *
 //let dist = Math.abs(this._rotation % 360 - this._previousRotation % 360);

 //this._previousRotation = this._rotation;
 //return Math.min(dist, 360 - dist);
 */
