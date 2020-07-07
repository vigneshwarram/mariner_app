import React from "react";

export default class ChannelDetails extends React.Component{

    constructor() {
        super();

        this._channel = null;
        this._channelWidth = null;
        this._channelWidthInt = null;
        this._centerChannel = null;
        this._band = null;
    }

    set channel(value) {
        this._channel = value;
    }

    get channel() {
        return this._channel;
    }

    set channelWidth(value) {
        this._channelWidth = value;
    }

    get channelWidth() {
        return this._channelWidth;
    }

    set channelWidthInt(value) {
        this._channelWidthInt = value;
    }

    get channelWidthInt() {
        return this._channelWidthInt;
    }

    set centerChannel(value) {
        this._centerChannel = value;
    }

    get centerChannel() {
        return this._centerChannel;
    }

    set band(value) {
        this._band = value;
    }

    get band() {
        return this._band;
    }

    buildChannelDetails(wifiDetails) {
        this._channel = wifiDetails.getChannel().ch;
        this._channelWidth = wifiDetails.getChannel().width + "MHz";
        this._channelWidthInt = wifiDetails.getChannel().width;
        this._centerChannel = wifiDetails.getChannel().ch;

        let channels = global.configuration.get("channels");
        if(this._channel >= 36) {
            for(let i in channels['5GHz']) {
                if(this._channelWidthInt === channels['5GHz'][i].width && channels['5GHz'][i].madeUpOf.includes(this._channel)) {
                    this._centerChannel = channels['5GHz'][i].ch;
                }
            }
        }
        else {
            this._centerChannel = this._channel;
        }

        this._band = wifiDetails.getBand();
    }
}
