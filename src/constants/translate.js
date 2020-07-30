/**
 * Translation class
 * @type {{}}
 */

import en from '../res/lang-en_ca';
import fr from '../res/lang-fr_ca';

// Language
let _lang= {
};

// Embedded languages
let languages = {
    "en":en,
    "fr":fr
};

// Supported languages
let _supportedLanguages = [
    {"label": "ENG", "value": "en"}
];

export default class Translate {
    static instance = null;

    /**
     * Create a singleton instance of the class
     * @returns {null}
     */
    static getInstance() {
        if (Translate.instance == null) {
            Translate.instance = new Translate();
        }

        // Load the supported languages
        _supportedLanguages = global.configuration.get("languages");

        return this.instance;
    }

    /**
     * Load the local file
     */
    $load(language) {
        if (language == null) return;

        let languageFile = en;
        if (language.indexOf('http:') === -1) {
            languageFile = languages[language];
            _lang = languageFile;
        }
        else {
            this.$merge(language);
        }
    }

    /**
     * Return the translation object
     */
    get $() {
        return _lang;
    }

    /**
     * Return the supported languages from configuration
     * @returns {*[]}
     */
    get supportedLanguages() {
        return _supportedLanguages;
    }

    /**
     * Get translation by lookup
     * Please no longer use this directly (use get$ or get$$)
     * @param key1
     * @param key2
     * @returns {*}
     */
    get(key1, key2=null) {
        let translatedValue = "";
        try {
            translatedValue = key2 ? _lang[key1.toUpperCase()][key2.toUpperCase()] : _lang[key1.toUpperCase()];
        }
        catch(error) {
            translatedValue = key2 ? key2 : key1;
        }
        return translatedValue ? translatedValue : key1;
    }

    /**
     * Get translation by object string
     * @param item
     * @returns {*}
     */
    get$(item) {
        let values = item.split('.');
        return this.get(values[0], values.length > 1 ? values[1] : null);
    }

    /**
     * Translate an array of items by lookup
     * @param items @param items * [PARENT.CHILD]
     * @returns {Array}
     */
    get$$(items) {
        let translatedArray = [];
        for (let i=0;i<items.length;i++) {
            let values = String(items[i]).split('.');
            translatedArray.push(this.get(values[0], values.length > 1 ? values[1] : null));
        }
        return translatedArray;
    }

    /**
     * Translate a sentence
     * @param string
     * @param tokens
     */
    translate(string, tokens) {
        return global.functions.replace(string, tokens);
    }

    /**
     * Translate a token replace string
     * @param tokens // comma separated list
     * @param item
     */
    replace(tokens, item) {
        return global.functions.replace(this.get$(item), tokens);
    }

    /**
     * Set language
     * @param object
     */
    set t(object) {
        _lang = object;
    }

    /**
     * Merge language information together
     * @param url to language file
     */
    $merge(url) {
        fetch(url)
            .then((response) => response.json())
            .then((responseJson) => {
                let lang = _lang;
                _lang = Object.assign({}, lang, responseJson);
            })
            .catch(function(error) {
                console.log(error.message);
            });
    }

}
