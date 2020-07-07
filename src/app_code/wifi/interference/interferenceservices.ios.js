import React from "react";

export default class InterferenceService extends React.Component {
    static instance = null;

    constructor(props) {
        super(props);
    }

    /**
     * Retrieves the 20MHz channels making up the channel passed in
     * Only meant for 5GHz channels
     * @param channelDetails
     * @param channelWidth
     * @returns <array>
     */
    get20MHzChannels(channelDetails) {
        const channels = global.configuration.get('channels');
        for(var i in channels['5GHz']) {
            if(channelDetails['channelWidthInt'] === channels['5GHz'][i].width && channels['5GHz'][i].madeUpOf.includes(channelDetails.channel)) {
                return channels['5GHz'][i].madeUpOf;
            }
        }
        return [];
    }

    /**
     * Retrieves the co-channel interference score based on the signal level of a scan result
     * @param signalLevel
     * @param thresholdKey
     * @returns <int>
     */
    getInterferenceScore(signalLevel, thresholdKey, band) {
        const thresh = global.configuration.get(thresholdKey, band);
        if(signalLevel <= thresh.critical.max) {
            return 5;
        }
        else if(signalLevel <= thresh.major.max) {
            return 10;
        }
        else if(signalLevel <= thresh.minor.max) {
            return 15;
        }
        else {
            return 20;
        }
    }

    /**
     * Calculates the interference level for a single channel
     * @param channelDetails
     * @param scanResults
     * @param band
     * @returns <float> interference level
     */
    calculateInterferenceSingleChannel(channelDetails, scanResults) {
        if(channelDetails.channel >= 36) { //band was 5GHz
            let smallChannels = this.get20MHzChannels(channelDetails);
            let total = 0;
            for(var i in scanResults['5GHz']) {
                if(smallChannels.includes(scanResults['5GHz'][i].channel)) {
                    total += this.getInterferenceScore(scanResults['5GHz'][i].signalLevel, 'coInterferenceThresholds', '5');
                }
            }
            return {"coScore": (total/smallChannels.length), "adjScore": null, "combinedScore": null};
        }
        else {//band was 2.4GHz
            let adjScore = 0;
            let coScore = 0;
            let combinedScore = 0;
            for(i in scanResults['2.4GHz']) {
                if((scanResults['2.4GHz'][i].channel !== channelDetails.channel) && (scanResults['2.4GHz'][i].channel >= (channelDetails.channel - channelDetails.channelWidthInt/10 - 2)) && (scanResults['2.4GHz'][i].channel <= (channelDetails.channel + channelDetails.channelWidthInt/10 + 2))) {
                    adjScore += this.getInterferenceScore(scanResults['2.4GHz'][i].signalLevel, 'adjInterferenceThresholds', '24');
                }
                else if(scanResults['2.4GHz'][i].channel === channelDetails.channel) {
                    coScore += this.getInterferenceScore(scanResults['2.4GHz'][i].signalLevel, 'coInterferenceThresholds', '24');
                }
            }
            combinedScore = 0.2*coScore + 0.8*adjScore;
            return {"coScore": coScore, "adjScore": adjScore, "combinedScore": combinedScore};

        }
    }
}