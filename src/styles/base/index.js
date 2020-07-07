/**
 * Base style / theme class
 * for managing the styles and themes
 */
import {StyleSheet} from "react-native";
import * as THEMES from '../../boot/themes';

const styles = THEMES.styles;
export default class _Styles {

    /**
     * Set up the theme system
     */
    constructor() {
        let configuredStyle = styles[global.theme];
        this._style = configuredStyle != null ? configuredStyle.theme.style: styles.default.theme.style;
        this._files = configuredStyle != null ? configuredStyle.files: styles.default.files;
    }

    extended() {

    }

    /**
     * Add styles based on view
     * @param style
     */
    add(style) {
        let currentStyle = this._style;
        this._style = Object.assign({}, currentStyle, style);
    }

    /**
     * Get stylesheet
     * @param style
     */
    get(style=null) {
        if (style) {
            let currentStyle = this._style;
            this._style = Object.assign({}, currentStyle, this._files[style].style);
            return StyleSheet.create(this._style);
        }
        else {
            return StyleSheet.create(this._style);
        }
    }
}
