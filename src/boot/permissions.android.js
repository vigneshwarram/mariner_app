/**
 * Android Permissions
 */

import React from "react";
import { PermissionsAndroid } from "react-native";

// Event Listener
import { EventRegister } from 'react-native-event-listeners';

export default class AppPermissions extends React.Component {

    componentDidMount() {
        this.requestCameraPermission();
    }

    /**
     * Ask user for access to the camera
     * @returns {Promise<void>}
     */
    async requestCameraPermission() {
        try {
            const granted = await PermissionsAndroid.request(
                PermissionsAndroid.PERMISSIONS.CAMERA,
                {
                    title: global.t.get$("HEADER.VIRTUAL_TECH"),
                    message: global.t.get$("STATUS.ENABLE_CAMERA_PERMISSION"),
                    buttonNeutral: global.t.get$("ACTION.ASK_LATER"),
                    buttonNegative: global.t.get$("ACTION.CANCEL"),
                    buttonPositive: global.t.get$("ACTION.OK")
                }
            );
            if (granted === PermissionsAndroid.RESULTS.GRANTED) {
                global.Events.emit({name:global.const.CAMERA_PERMISSION_GRANTED})
            }
            else {
                this.requestCameraPermission();
            }
        }
        catch (err) {}
    }

    render() {
        return null;
    }

}
