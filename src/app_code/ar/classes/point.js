export default class Point {

    /**
     * Create a new Isometric point
     * @param id
     * @param type
     * @param size
     * @param center
     * @param coord
     * @param rotate
     */
    constructor(id, type, coord, center=[], size=[], rotate=0) {
        this._id = id;
        this._type = type;
        this._size = size;
        this._center = center;
        this._coord = coord;
        this._rotate = rotate;
    }

    get id() {
        return this._id;
    }

    get type() {
        return this._type;
    }

    get size() {
        return this._size;
    }

    get center() {
        return this._center;
    }

    get x() {
        return this._coord[0];
    }

    set x(value) {
        this._coord[0] = value;
    }

    get y() {
        return this._coord[1];
    }

    set y(value) {
        this._coord[1] = value;
    }

    get z() {
        return this._coord[2];
    }

    set z(value) {
        this._coord[2] = value;
    }

    get coord() {
        return this._coord;
    }

    set coord(value) {
        this._coord = value;
    }

    get rotate() {
        return this._rotate;
    }

    set rotate(value) {
        this._rotate = value;
    }
}
