/**
 * Events Manager
 */

// Event listener
import { EventRegister } from 'react-native-event-listeners';

export default class Events {

    // Event Listener
    eventListener;

    // Global event system - one event to rule them all
    constructor(eventName) {
        this.eventName = eventName;
        this._subscriptions = [];
        if (this.eventListener == null) {
            this.eventListener = EventRegister.addEventListener(this.eventName, (payload) => {
                let events = this._subscriptions.filter(function(event){ return event.name === payload.name; });
                events.forEach((event) => {
                    event.callback(payload.data ? payload.data : null);
                });
            });
        }
    }

    /**
     * Subscribe for events
     * @param subscriptions // Array of events [{id:this, name:'name', callback:function}]
     */
    subscribe(subscriptions) {
        subscriptions.forEach((event) => {
            this._subscriptions.push(event);
        });
    }
    /**
     * Dispatch event
     * @param event // Object {name:'name', data:data}
     */
    emit(event={name:null, data:null}) {
        EventRegister.emit(this.eventName, event);
    }

    /**
     * Generate an ID that can be used to reference events
     * @returns {string}
     */
    generateId() {
        return global.functions.generateGuid();
    }

    /**
     * Unsubscribe from event
     * @param id
     * @param name
     * @returns {*[]}
     */
    remove(id, name=null) {
        this._subscriptions = this._subscriptions.filter(function(event){ return event.id !== id; });
    }
}
