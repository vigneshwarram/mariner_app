import DeviceInformation from '../diagnostics/deviceinfo';

export default class Register {

    DeviceInfo = new DeviceInformation();

    constructor() {
        this._registration_url = global.state.get("registration_url");
        this._registration_code = null;
        this._generated_url = "";
    }

    generate(code) {
        let code_verfication = code.split(".");
        if (code_verfication.length > 1) {

            // Build registration url with the registration code
            let registerCode = new RegExp("^[^.]+");
            let registerServer = new RegExp("\\.(.*)");

            this._registration_code = registerCode.exec(code)[0];
            this._generated_url = global.functions.replace(this._registration_url, [registerServer.exec(code)[1], this._registration_code])
        }
        else {

            // Registration code contains no server information
            // Fall back to the configured registration URL
            let registrationUrl = global.configuration.get("wsbRegistrationUrl");

            this._registration_code = code;
            this._generated_url = !global.functions.isNullOrEmpty(registrationUrl) ? registrationUrl + "/" + code : null;
        }

        // Return the generated path
        return this._generated_url;
    }

    /**
     * Get the generated code. A code must be generated first
     * @returns {null}
     */
    get code() {
        return this._registration_code;
    }

    /**
     * Get the generated URL. A code must be generated first
     * @returns {string}
     */
    get url() {
        return this._generated_url;
    }

    /**
     * Determines whether or not the registration being used for registration is
     * licensed for this version of the app
     */
    isLicensed(code) {
        if(code.hasOwnProperty("licensedVersions")) {
            if(licenseMatches(code.licensedVersions, this.DeviceInfo.buildVersion)) {
                return true;
            }
            else {
                return false;
            }
        }
        else {
            if(licenseMatches(global.configuration.get("licensedVersions"), this.DeviceInfo.buildVersion)) {
                return true;
            }
            else {
                return false;
            }
        }
    }
}

/**
 * Checks the two strings to make sure they match up
 * until the last character of "license"
 */
let licenseMatches = (license, buildVersion) => {
    for(let i=0; i<license.length; i++) {
        if(license[i] === buildVersion[0]) {
            return true;
        }
    }
    return false;
}