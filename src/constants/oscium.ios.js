//This class handles low level communication with the Oscium Wipry module

import React from 'react';
import {NativeEventEmitter, NativeModules} from 'react-native';
import Message from '../app_code/message/service';

const WipryManager = NativeModules.WipryManager;
const WipryEventManager = WipryManager ? new NativeEventEmitter(WipryManager) : null;
const connectionListener = WipryEventManager ? WipryEventManager.addListener(
    'WipryConnected',
    () => {
        console.log("Oscium device was detected");
        _connected = true;
        message.showToastMessage(global.t.get$('STATUS.OSCIUM_DEVICE_CONNECTED'), 'OK');
    }
) : null;

const disconnectListener = WipryEventManager ? WipryEventManager.addListener(
    'WipryDisconnected',
    () => {
        console.log("Oscium device was disconnected");
        _connected = false;
        message.showToastMessage(global.t.get$('STATUS.OSCIUM_DEVICE_DISCONNECTED'), 'OK')
    }
) : null;

let _connected = false;
let _latest_results = [];
let _selected_networks = {band24: null, band5: null};

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
        if (WipryManager) {
            WipryManager.initializeDevice(() => {
                console.log("Looking for Oscium device, registered listeners within native module.");
            });
        }
        return this.instance;
    }

    isConnected() {
        return _connected;
    }

    setLastScan(results) {
        _latest_results = results;
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
