/**
 * Manage the Isometric map
 */
import Point from './point';


const Isomer = require('isomer');
export default class HeatMap {

    /**
     * Create a new heat map
     * @param canvas
     */
    constructor(canvas) {
        this._canvas = canvas;
        this._iso = new Isomer(canvas);
        this._map = [new Point(
            "map",
            "Prism",
            [25,25,0],
            [25,25,0],
            [50,50,0],
            5
        )];
        this._points = [];
        this.renderMap();
    }


    /**
     * Render Map View
     * @returns {Isomer}
     */
    renderMap() {
        this._iso.canvas.clear();

        this._iso.add(
            Isomer.Shape.Prism(
                new Isomer.Point(
                    this._map[0].coord[0],
                    this._map[0].coord[1],
                    this._map[0].coord[2]), this._map[0].size[0], this._map[0].size[1], this._map[0].size[2])
        );

        /*
        .rotateZ(new Isomer.Point(
                    this._map[0].center[0], this._map[0].center[1], this._map[0].center[2]),
                    Math.PI / this._map[0].rotate)
         */

        for (let i=0;i<this._points.length;i++) {
            this._iso.add(
                Isomer.Shape.Pyramid(new Isomer.Point(
                    this._points[0].coord[0], this._points[0].coord[1], this._points[0].coord[2]), 0.5,0.5,0.5)
            );
        }

        /*for (let i=0;i<this._points.length;i++) {
            this._iso.add(
                Isomer.Shape.Cylinder(
                    new Isomer.Point(
                        this._points[0].point[0],
                        this._points[0].point[1],
                        this._points[0].point[2]), 2, 2,2)
            );
        }*/
        return this._iso;
    };

    /**
     * Add point to map
     * @param point
     */
    add(point) {
        this._points.push(point);
        this.renderMap();
    }

    /**
     * Get a point using ID
     * @param id
     * @returns {*}
     */
    getPointById(id) {
        for (let i=0;i<this._points.length;i++) {
            if (this._points[i].id === id) {
                return this._points[i];
            }
        }
    }

    /**
     * Update a point by ID
     * @param id
     * @param point
     */
    updatePointById(id, point) {
        this.iso.canvas.clear();


        for (let i=0;i<this._points.length;i++) {
            if (this._points[i].id === id) {
                this._points[i] = point;
                break;
            }
        }
        this.renderMap();

    }

    /**
     * Move forward
     */
    forward() {
        for (let i=0;i<this._points.length;i++) {
            this._points[i].z -=0.5;
        }
        this.renderMap();
    }

    /**
     * Move back
     */
    back() {
        for (let i=0;i<this._points.length;i++) {
            this._points[i].z +=0.5;
        }
        this.renderMap();
    }

    loadPositions() {
        //this._map[0].coord = global.tracking.current;
        this._points = [];
        for (let i=0;i<global.tracking.mapItems.length;i++) {
            this._points.push(new Point("","",
                this.modifyPointValue(global.tracking.current, global.tracking.mapItems[i].position)));
        }
        this.renderMap();
    }

    modifyPointValue(current, point) {
        return [Math.abs(current.x - point.x), Math.abs(current.y - point.y), Math.abs(current.z - point.z)];
    }

    /**
     * Update map point
     * @param point
     * @returns {*}
     */
    updateMap(point) {
        this._map[0] = point;
        this.renderMap();
    }

    /**
     * Get map point
     * @returns {Point}
     */
    getMap() {
        return this._map[0];
    }

    rotateMap() {
        //console.info(this._canvas.webview);//["transform"] = "rotate(" + 30 + "rad)";
        //this._canvas.webview.props.style[1]["transform"] = "rotate(" + 30 + "rad)";
        //this._canvas.webview.transform([{ rotateX: '45deg' }, { rotateZ: '0.785398rad' }]);
    }

}
