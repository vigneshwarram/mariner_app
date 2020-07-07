import React from "react";

/**
 * Workflow class to determine which features are enabled.
 */

export default class Workflows {

    // Check for the enabled workflows
    constructor() {
        this.update();
    }

    /**
     * Check for the configured workflows
     */
    update() {
        this._workflows = configuration.get('workflowFeaturesEnabled');
        global.configuration.update(global.const.AR_ONLY,
            ((this._workflows.siteSurvey && !this._workflows.siteSurvey.enabled) &&
                (this._workflows.siteCertification && !this._workflows.siteCertification.enabled) &&
                (this._workflows.AR && this._workflows.AR.enabled))
        );
        global.state.set(global.const.AR_ONLY, global.configuration.get(global.const.AR_ONLY));
    }

    /**
     * Get the configured options
     * @returns {*}
     */
    get config() {
        return this._workflows;
    }
 }
