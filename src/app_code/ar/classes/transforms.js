/**
 * AR Transform management
 */

const _distance = require('euclidean-distance');
export default class Transforms {

    /**
     * Create transform
     * @param transform
     * @param location
     */
    constructor(transform, location = null) {
        this._transform = transform.cameraTransform;
        this._x = transform.cameraTransform.position[0].toFixed(1);
        this._y = transform.cameraTransform.position[1].toFixed(1);
        this._z = transform.cameraTransform.position[2].toFixed(1);

        this._geoLocation = location;
        this._style = null;

        this._heatmapCoords = [0,0,0];

        this._timestamp = global.functions.getCurrentTimeStamp();
        this._locationName = null;
        this._ID = null;
    }

    /**
     * Set the ID reference for the node
     * @param value
     * @constructor
     */
    set ID(value) {
        this._ID = value;
    }

    /**
     * Get the ID reference for the node
     * @returns {null}
     * @constructor
     */
    get ID() {
        return this._ID;
    }

    /**
     * Set the custom location name of a node transform
     * @param name
     */
    set location(name) {
        this._locationName = name;
    }

    /**
     * Get the custom location name of a node transform
     * @returns {string}
     */
    get location() {
        return this._locationName;
    }

    /**
     * Get the timestamp when a transform was created
     * @returns {string}
     */
    get timestamp() {
        return this._timestamp;
    }

    /**
     * Set the heat map coords
     * @param value
     */
    set heatmapCoords(value) {
        this._heatmapCoords = value;
    }

    /**
     * Get the heat map coords
     * @returns {number[]}
     */
    get heatmapCoords() {
        return this._heatmapCoords;
    }

    /**
     * Get the geolocation coords
     * @returns {*}
     */
    get coords() {
        return this._geoLocation;
    }

    /**
     * Set the style
     * @param value
     */
    set style(value) {
        this._style = value;
    }

    /**
     * Get the style
     * @returns {null}
     */
    get style() {
        return this._style;
    }

    /**
     * Get the transform information
     * @returns {*|cameraTransform.cameraTransform|{forward, rotation, position, up}|cameraTransform.cameraTransform}
     */
    get transform() {
        return this._transform;
    }

    /**
     * Get the position vector
     * @returns {*}
     */
    get position() {
        return [this._transform.position[0], this._transform.position[1], this._transform.position[2]];
    }

    /**
     * Get the map position
     * @returns {*[]}
     */
    get positionMap() {
        return [this._transform.position[0], this._transform.position[1], this._transform.position[2]];
    }

    /**
     * Get the rotation vector
     * @returns {*}
     */
    get rotation() {
        return this._transform.rotation;
    }

    /**
     * Get the X coordinate
     * @returns {number}
     */
    get x() {
        return Number(this._x);
    }

    /**
     * Get the Y coordinate
     * @returns {number}
     */
    get y() {
        return Number(this._y);
    }

    /**
     * Get the Z coordinate
     * @returns {number}
     */
    get z() {
        return Number(this._z);
    }

    /**
     * Get the distance from the current position
     * @param currentPosition
     * @returns {number}
     */
    distance(currentPosition) {
        this._distanceValue = Number(Number(_distance(currentPosition, this.position)).toFixed(0));
    }

    /**
     * Get the distance as a value
     * @returns {number}
     */
    get distanceFromCurrent() {
        return this._distanceValue ? this._distanceValue : -1;
    }

    /**
     * Set up the threshold vectors
     * @param configuredPosition
     * @returns {number[][]}
     */
    set thresholds(configuredPosition) {
        this._thresholds = [
            [
                Number(this.position[0])+Number(configuredPosition[0]),
                Number(this.position[1])+Number(configuredPosition[1]),
                Number(this.position[2])+Number(configuredPosition[2])
            ],
            [
                Number(this.position[0])-Number(configuredPosition[0]),
                Number(this.position[1])-Number(configuredPosition[1]),
                Number(this.position[2])-Number(configuredPosition[2])
            ]
        ];
        this._threshold1 = Number(Number(_distance(this.position, this._thresholds[0])).toFixed(1));
        this._threshold2 = Number(Number(_distance(this.position, this._thresholds[0])).toFixed(1));
    }

    /**
     * Get the configured threshold values as an array of distance
     * @returns {*}
     */
    get thresholds() {
        return this._thresholds ?
            [this._threshold1, this._threshold2] : [[0,0,0],[0,0,0]];
    }
}
