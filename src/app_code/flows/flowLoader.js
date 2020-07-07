/**
 * Loads guided flows
 */
import {EventRegister} from "react-native-event-listeners";

import welcome from '../../res/workflows/welcome-workflow';
import AR from '../../res/workflows/ar-simple-workflow';

const RUN_ONCE = false;
const RUN_ALWAYS = true;

export default class FlowLoader {
    constructor() {
    }

    /**
     * Run on startup
     * @returns {null|*}
     */
    autoRun(callback) {
        let flows = global.configuration.get("flows");
        if (flows) {
            for (let i = 0; i < flows.length; i++) {
                if (flows[i].autoRun != null) {
                    switch(flows[i].autoRun) {
                        case RUN_ALWAYS: {
                            this.getFlow(flows[i].id);
                            callback(false);
                            break;
                        }
                        case RUN_ONCE: {
                            global.storage.getData(global.const.STORAGE_KEY_FLOW, value => {
                                if (value) {
                                    callback(true);
                                }
                                else {
                                    global.storage.storeData(global.const.STORAGE_KEY_FLOW,"run");
                                    this.getFlow(flows[i].id);
                                    callback(false);
                                }
                            });
                            break;
                        }
                    }
                }
            }
        }
        else {
            callback(true);
        }
    }
    /**
     * Get flow path from configuration
     * @param id
     * @returns {null|*}
     */
    getFlowById(id) {
        let flows = global.configuration.get("flows");
        if (flows) {
            for (let i = 0; i < flows.length; i++) {
                if (flows[i].id === id) {
                    return flows[i].path;
                }
            }
        }
        return null;
    }

    /**
     * Get the flow from the server
     * @param name
     * @param idx
     */
    getFlow(name, idx) {
        let url = name ? this.getFlowById(name) : null;
        let internalFlow = name != null ? global.configuration.get(name) : null;
        if (internalFlow != null) {
            setTimeout(() => {
                EventRegister.emit('APPLICATION_INTERNAL_FLOW', {f: internalFlow, i: idx});
            });
        }
        else if (url && url !== "") {
            fetch(url)
                .then((response) => response.json())
                .then((responseJson) => {
                    EventRegister.emit('APPLICATION_INTERNAL_FLOW', {f: responseJson, i: idx});
                })
                .catch(function (error) {
                    EventRegister.emit('APPLICATION_INTERNAL_FLOW', {f: null, i: null});
                });
        }
        else {
            if (global.state.flow || name == null) {
                EventRegister.emit('APPLICATION_INTERNAL_FLOW', {f: name, i: idx});
            }
        }
    }
}
