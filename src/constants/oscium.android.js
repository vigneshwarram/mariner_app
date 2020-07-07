//This class handles low level communication with the Oscium Wipry module

import React from 'react';
import Message from '../app_code/message/service';

/*const WipryManager = NativeModules.WipryManager;
const WipryEventManager = new NativeEventEmitter(WipryManager);
const connectionListener = WipryEventManager.addListener(
    'WipryConnected',
    () => {
        console.log("Oscium device was detected");
        _connected = true;
        message.showToastMessage(global.t.get$('STATUS.OSCIUM_DEVICE_CONNECTED'), 'OK');
    }
);

const disconnectListener = WipryEventManager.addListener(
    'WipryDisconnected',
    () => {
        console.log("Oscium device was disconnected");
        _connected = false;
        message.showToastMessage(global.t.get$('STATUS.OSCIUM_DEVICE_DISCONNECTED'), 'OK')
    }
);

let _connected = false;
let _latest_results = [];
let _selected_networks = {band24: null, band5: null};*/
let _connected = false;

export default class Oscium {
    static instance = null;

    /**
     * Create a singleton instance of the class
     * @returns {null}
     */
    static getInstance() {
        if(Oscium.instance === null) {
            Oscium.instance = new Oscium();
        }
        /*WipryManager.initializeDevice(() => {
            console.log("Looking for Oscium device, registered listeners within native module.");
        });*/
        return this.instance;
    }

    isConnected() {
        return _connected;
    }

    setLastScan(results) {
        console.log(">>>RESULTS");
        console.log(results);
        this._latest_results = results;
    }

    getLastScan() {
        return _latest_results;
    }

    setSelectedNetworks(band, selectedNetwork) {
        _selected_networks[band] = selectedNetwork;
    }

    getSelectedNetworks() {
        return _selected_networks;
    }
}

const message = new Message();
