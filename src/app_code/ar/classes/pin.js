/**
 * AR Pins
 */
export default class Pin {

    constructor() {

        // Create the severities
        this.severities = {
            critical: "#ff2a21",
            fair: "#fff33e",
            ok: "#68ff5b",
            excellent: "#68FF5B"
        };
    }

    /**
     * Load Pins
     * @param pins
     */
    load(pins) {
        this._pins = pins;
    }

    /**
     * Get the current selected pin
     * @returns {*}
     */
    get get() {
        return this._pins.filter(function(type){ return type.selected  })[0];
    }

    /**
     * Get the pin image
     * @returns {*}
     */
    get image() {
        return this._pins.filter(function(type){ return type.selected  })[0].image;
    }

    /**
     * Get the pin colour
     * @returns {*}
     */
    get color() {
        return this._pins.filter(function(type){ return type.selected  })[0].color;
    }

    /**
     * Get pin colour
     * @param severity
     * @param showThreshold
     * @returns {string|*}
     */
    getColor(severity=null, showThreshold=false) {

        let colour = this._pins.filter(function(type){ return type.selected  })[0].color;
        if ((colour === "" && severity != null) || (showThreshold)) {
            switch(severity) {
                case  global.const.THRESHOLD_CRITICAL: {
                    return this.severities.critical;
                }
                case global.const.THRESHOLD_MAJOR: {
                    return this.severities.fair;
                }
                case global.const.THRESHOLD_MINOR: {
                    return this.severities.ok;
                }
                default: {
                    return this.severities.excellent;
                }
            }
        }
        else {
            return colour;
        }
    }

    /**
     * Change the pin type
     * @param name
     */
    change(name) {

        this._pins.forEach((type) => {
            type.selected = type.name === name;
        });
    }


}
