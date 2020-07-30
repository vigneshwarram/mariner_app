import React from "react";

/**
 * Site visit model for submitting information to the backend API
 */

import KPIS from './kpis';
import DeviceInformation from "../diagnostics/deviceinfo";
export default class SiteVisit {

    /**
     * Set up the site visit
     */
    constructor() {
        this._site_visit = {};
    }

    /**
     * Generate a default site visit object
     * @param workorder
     * @returns {{}}
     */
    generate(workorder) {

        // Get registered information
        let serviceProvider = global.configuration.get('serviceProvider');
        let techID = global.state.get('tech_id');

        // Make sure there is a work order
        if (workorder != null) {
            let certification = workorder.currentCertification;
            let all_certifications = workorder.certifications;
            let siteTypeInfo = {type:null, value:0};
            let siteTypes = global.configuration.get('siteTypes');
            if (siteTypes != null) {
                for (let key in siteTypes) {
                    if (siteTypes.hasOwnProperty(key)) {
                        if (siteTypes[key] === workorder.siteType) {
                            siteTypeInfo = {type:key, value:siteTypes[key]};
                        }
                    }
                }
            }

            // If the certification is completed
            if (certification.finished) {

                // Create a blank site visit
                this._site_visit = {};

                // Get the device information
                let deviceInfo = new DeviceInformation();

                // Add the site visit information
                this.add({
                    VisitInfo: {
                        workOrderId: workorder.id,
                        workOrderType: "NEW",
                        customerId: workorder.customer,
                        technicianId: techID,
                        startDateTime: workorder.startDateTime,
                        endDateTime: global.functions.getCurrentTimeStamp(),
                        technicianDeviceInfo: global.functions.replace(
                            "make:{0}|model:{1}|s/w version:{2}|platform:{3}|serial:{4}|waveguide:{5}",
                            [deviceInfo.make, deviceInfo.model, deviceInfo.version, deviceInfo.platform, deviceInfo.uuid, deviceInfo.buildVersion])
                    }
                });

                // Add the certification summary information
                let certificationSummary = workorder.calculateSummary();

                // Create the group objects for each certification
                let testGroups = [];
                for (let i=0;i<all_certifications.length;i++) {
                    testGroups.push({
                        testGroupId: all_certifications[i].groupId,
                        testType: "speedTest",
                        selected: all_certifications[i].selected
                    })
                }

                // Add current selected certification information
                this.add({
                    VisitSummary: {
                        customerType: siteTypeInfo.type,
                        SiteSurveySummary: {
                            locationsTested: certificationSummary.tested,
                            apInterferenceResult: "NA",
                            signalStrengthResult: "NA",
                            overallResult: "NA"
                        },
                        SiteCertificationSummary: {
                            locationsTested: certificationSummary.tested,
                            failedLocations: certificationSummary.failed,
                            warningLocations: certificationSummary.warning,
                            passedLocations: certificationSummary.passed,
                            overallResult: certificationSummary.overall,
                            sufficientCoverage: certification.coverage,
                            closeOutReason: certification.reasonCode,
                            notes: certification.notes
                        },
                        TestGroups: testGroups
                    }
                });


                // Add the site information
                this.add({
                    SiteInfo: {
                        apInstalledLocation: certification.installedLocation,
                        serviceProvider: serviceProvider,
                        hsiProfile: certification.hsiProfile,
                        areaOfSite: null,
                        nbrFloors: null,
                        nbrBedrooms: null,
                        nbrWiFiDevices: null,
                        customerType: siteTypeInfo.type
                    }
                });


                // Create the site location tests for each certification in the work order
                let siteTestLocations = [];
                for (let i=0;i<all_certifications.length;i++) {
                    let certificationDetails = all_certifications[i];

                    let testLocations = certificationDetails.locationTests;
                    for (let i=0;i<testLocations.length;i++) {
                        let test = testLocations[i];

                        // Create the KPIS Object
                        let kpis = this.generateKPIs(test);

                        let locationTestResult = {
                            endDateTime: test.startDateTime,
                            startDateTime: test.endDateTime,
                            result: test.locationResult.label,
                            testResults: {
                                kpis: kpis,
                                networkType: certificationDetails.type,
                                locationType: test.pointType,
                                serialNumber: certificationDetails.gateway,
                                speedTestResults: [{
                                    score: null,
                                    recommended: null,
                                    extenderRecommended: null,
                                    interferenceLevel: null,
                                    streamingCapability: null,
                                    gamingScore: null,
                                    VoIPScore: null,
                                    browserScore: null

                                }, {
                                    ssid: test.wifiDetails.getSSID(),
                                    band: test.wifiDetails.getBand(),
                                    channel: test.wifiDetails.getChannel(),
                                    securityMode: "N/A",
                                    macAddr: test.wifiDetails.getBSSID(),
                                    signalStrength: test.signal != null && !isNaN(test.signal) && test.signal !== "" ? test.signal : null,
                                    score: null,
                                    recommended: null,
                                    upload: test.upload,
                                    download: test.download,
                                    hls: null,
                                    pingTime: test.ping,
                                    extenderRecommended: null,
                                    interferenceLevel: null,
                                    streamingCapability: null,
                                    gamingScore: null,
                                    VoIPScore: null,
                                    browserScore: null

                                }],
                                testGroupId: certificationDetails.groupId,
                                wifiScanResults: [
                                    {
                                        customerSSID: true,
                                        band: test.wifiDetails.getBand() === '5GHz' ? 'ac' : 'n',
                                        ssid: test.wifiDetails.getSSID(),
                                        bssid: test.wifiDetails.getBSSID(),
                                        channel: test.wifiDetails.getChannel(),
                                        securityMode: "N/A"
                                    }
                                ],
                                selected: certificationDetails.selected
                            },
                            testStage: "siteCertification",
                            testType: test.testType,
                            chosenLocation: (test.location === certification.installedLocation ? true : false)
                        };


                        // Generate the location test information and group by location
                        let found = false;
                        if(test.testType !== "heatMap") { //if heatmap type test don't check this, we want separate locations for each point
                            for (let x=0;x<siteTestLocations.length;x++) {
                                if (siteTestLocations[x].location === test.location) {
                                    found = true;
                                    siteTestLocations[x].testHistory.push(locationTestResult)
                                }
                            }
                        }

                        // Location found, add test result
                        if (!found) {
                            siteTestLocations.push({
                                location: test.location,
                                testHistory: [locationTestResult]
                            });
                        }
                    }
                }

                // Add the site test locations to the visit
                this.add({
                    SiteTestLocations: siteTestLocations
                });

                // Add the certification info details
                this.add({
                    CertificationInfo: {
                        customerEmail: null,
                        reviewedByCustomer: certification.reviewed,
                        sentDateTime: global.functions.getCurrentTimeStamp(),
                        retryAttempts: 0
                    }
                })
            }
        }
        console.log(this._site_visit);

        // Return the generated site visit
        return this._site_visit != null ? {SiteVisit:this._site_visit} : {SiteVisit:{}};
    }

    /**
     * Create the KPIS Object and return the result
     */
    generateKPIs(test) {
        // Create the KPIS Object
        let kpis = new KPIS();
        kpis.add('apLocationQuality', "no signal", "Incomplete", 0);

        kpis.add('connectivity_2dot4', "ok", "Pass", "no");
        kpis.add('performanceDownLoadSpeed_2dot4', test.downloadSpeedResult.designation, test.downloadSpeedResult.result_code, test.download);
        kpis.add('performanceHlsSpeed_2dot4', "no signal", "Incomplete", null);
        kpis.add('performanceLatency_2dot4', test.pingResult.designation, test.pingResult.result_code, test.ping);
        kpis.add('performanceUploadSpeed_2dot4', test.uploadSpeedResult.designation, test.uploadSpeedResult.result_code, test.upload);
        kpis.add('security_2dot4', "na", "N/A", null);

        if ((test.testType === 'speedTest' || test.testType === 'heatMap') && test.signal != null && test.signal !== '') {
            //can we get the band here for android???
            if(test.wifiDetails.getBand() == '2.4GHz') {
                if (test.signal != null && test.signal !== '') {
                    kpis.add('signal_2dot4', test.signalResult.designation, test.signalResult.result_code, test.signal);
                    kpis.add('signal_5', "N/A", "N/A", null);
                }
                else {
                    kpis.add('signal_2dot4', "no signal", "Incomplete", null);
                    kpis.add('signal_5', "N/A", "N/A", null);
                }
            }
            else if(test.wifiDetails.getBand() == '5GHz') {
                if (test.signal != null && test.signal !== '') {
                    kpis.add('signal_5', test.signalResult.designation, test.signalResult.result_code, test.signal);
                    kpis.add('signal_2dot4', "N/A", "N/A", null);
                }
                else {
                    kpis.add('signal_5', "no signal", "Incomplete", null);
                    kpis.add('signal_2dot4', "N/A", "N/A", null);
                }
            }
            else {
                kpis.add('signal_2dot4', test.signalResult.designation, test.signalResult.result_code, test.signal);
            }
        }
        else if(test.testType === 'signalTest') {
            if(test.signalTest24.BSSID !== "" && test.signalTest24.signal !== "") {
                kpis.add('signal_2dot4', test.signalTestResults24.designation, test.signalTestResults24.result_code, test.signalTest24.signal);
            }
            else {
                kpis.add('signal_2dot4', "no signal", "Incomplete", null);
            }
            if(test.signalTest5.BSSID !== "" && test.signalTest5.signal !== "") {
                kpis.add('signal_5', test.signalTestResults5.designation, test.signalTestResults5.result_code, test.signalTest5.signal);
            }
            else {
                kpis.add('signal_5', "no signal", "Incomplete", null);
            }
        }
        else {
            kpis.add('signal_2dot4', "no signal", "Incomplete", null);
        }

        kpis.add('connectivity_5', "ok", "Pass", "no");
        kpis.add('performanceDownLoadSpeed_5', test.downloadSpeedResult.designation, test.downloadSpeedResult.result_code, test.download);
        kpis.add('performanceHlsSpeed_5', "no signal", "Incomplete", null);
        kpis.add('performanceLatency_5', test.pingResult.designation, test.pingResult.result_code, test.ping);
        kpis.add('performanceUploadSpeed_5', test.uploadSpeedResult.designation, test.uploadSpeedResult.result_code, test.upload);
        kpis.add('security_5', "na", "N/A", null);

        if(test.wifiDetails !== null) {
            if (test.wifiDetails.getBand() == '5GHz' && test.testType !== 'heatMap') {
                kpis.add('interferenceAjChannel_2dot4_ch', "N/A", "N/A", null);
                kpis.add('interferenceCoChannel_2dot4_ch', "N/A", "N/A", null);
                kpis.add('result_2dot4', test.locationResult.designation, "N/A", null);

                kpis.add('interferenceCoChannel_5_ch' + test.wifiDetails.getChannel().ch, test.coInterferenceResult.designation, test.coInterferenceResult.result_code, test.interference.coScore);
                kpis.add('result_5', test.locationResult.designation, test.locationResult.result_code, null);

            }
            else if(test.wifiDetails.getBand() == '2.4GHz' && test.testType !== 'heatMap'){
                kpis.add('interferenceAjChannel_2dot4_ch' + test.wifiDetails.getChannel().ch, test.adjInterferenceResult.designation, test.adjInterferenceResult.result_code, test.interference.adjScore);
                kpis.add('interferenceCoChannel_2dot4_ch' + test.wifiDetails.getChannel().ch, test.coInterferenceResult.designation, test.coInterferenceResult.result_code, test.interference.coScore);
                kpis.add('result_2dot4', test.locationResult.designation, test.locationResult.result_code, null);

                kpis.add('interferenceCoChannel_5_ch', "N/A", "N/A", null);
                kpis.add('result_5', test.locationResult.designation, "N/A", null);
            }
            else {
                if(test.wifiDetails.getBand() == '2.4GHz') {
                    kpis.add('result_2dot4', test.locationResult.designation, test.locationResult.label, null);
                    kpis.add('result_5', "N/A", 'N/A', null);
                }
                else if(test.wifiDetails.getBand() == '5GHz') {
                    kpis.add('result_2dot4', "N/A", "N/A", null);
                    kpis.add('result_5', test.locationResult.designation, test.locationResult.label, null);
                }
                else {
                    kpis.add('result_2dot4', "N/A", "N/A", null);
                    kpis.add('result_5', "N/A", 'N/A', null);
                }
            }
        }
        else {
            kpis.add('result_2dot4', test.locationResult.designation, 'N/A', null);
            kpis.add('result_5', test.locationResult.designation, 'N/A', null);
        }

        if(test.testType === 'heatMap') {
            let coords = test.coordinates;
            kpis.add('x_coord', "N/A", "N/A", -coords.x); //flip x to display properly in the cert UI
            kpis.add('y_coord', "N/A", "N/A", coords.y);
            kpis.add('z_coord', "N/A", "N/A", coords.z);
            if(test.interferingNetworks !== null && (typeof test.interferingNetworks.value) === 'number') {
                kpis.add('interfering_networks', "N/A", "N/A", test.interferingNetworks.value);
            }
            else {
                kpis.add('interfering_networks', "N/A", "N/A", null);
            }
            kpis.add('link_speed', "N/A", "N/A", test.linkSpeed);
        }

        kpis.add('result', test.locationResult.designation, test.locationResult.result_code, null);

        return kpis.get();
    }


    /**
     * Add more items to the site visit
     * @param object
     */
    add(object) {
        let site_visit = this._site_visit;
        this._site_visit = Object.assign({}, site_visit, object);
        return {SiteVisit:this._site_visit};
    }


    /**
     * Get the site visit object back. Should call generate (with a valid work order) or add before calling this.
     * @returns {{}|*}
     */
    get details() {
        if (this._site_visit == null) return {SiteVisit:{}};
        return {SiteVisit:this._site_visit};
    }
}
