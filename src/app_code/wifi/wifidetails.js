import React from "react";

export default class WifiDetails extends React.Component {

    constructor() {
        super();

        this._connection = false;
        this._ssid = '';
        this._bssid = '';
        this._freq = '';
        this._channel = {ch: ''};
        this._band = '';
        this._signal = '';
    }

    setConnection(value) {
        this._connection = value;
    }

    getConnection() {
        return this._connection;
    }

    setSSID(value) {
        this._ssid = value === "error" ? "unknown" : value;
    }

    getSSID() {
        return this._ssid;
    }

    setBSSID(value) {
        this._bssid = value === "error" ? "unknown" : value;
    }

    getBSSID() {
        return this._bssid;
    }

    setFreq(value) {
        this._freq = value === "error" ? "unknown" : value;
    }

    getFreq() {
        return this._freq;
    }

    setChannel(value) {
        this._channel = value;
    }

    getChannel() {
        return this._channel;
    }

    setBand(value) {
        this._band = value === "error" ? "unknown" : value;
    }
    getBand() {
        return this._band;
    }

    setSignal(value) {
        this._signal = value === "error" ? "unknown" : value;
    }

    getSignal(){
        return this._signal; //(Math.random()*100)*-1;
    }
}
