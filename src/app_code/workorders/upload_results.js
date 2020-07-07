/**
 * Uploading AR site visits
 */
import SiteVisit from "./sitevisit";
import base64 from "react-native-base64";
import HttpService from "../http/service";

export default class UploadResults {

    /**
     * Upload the site visit results
     * @param wo
     * @param callback
     */
    upload(wo, callback) {
        let submitUrl = global.configuration.get("wsbSiteVisitUrl");
        let username = global.configuration.get("wsbUsername");
        let password = global.configuration.get("wsbPassword");

        if (submitUrl != null) {

            let woPayload = new SiteVisit().generate(wo);
            let woHeaders = username && password ? {
                'Authorization': 'Basic ' + base64.encode(username + ":" + password),
                'Content-Type': 'application/json'
            } : {
                'Content-Type': 'application/json'
            };

            new HttpService().post(submitUrl, woHeaders, woPayload, (response) => {
                if (response != null && response.status === 200) {
                    if (response.url != null && response.url.indexOf("login") > -1) {
                        callback("failed");
                    }
                    else {
                        callback("success");
                    }
                }
                else {
                    callback("failed");
                }
            });
        }
        else {
            callback("failed");
        }
    }
}
