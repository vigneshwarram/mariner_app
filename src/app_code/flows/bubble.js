export default class Bubble {


    constructor(text, position) {
        this._text = text;
        this._position = position;
    }

    get text() {
        return this._text;
    }

    get position() {
        return this._position;
    }
}
