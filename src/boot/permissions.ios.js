/**
 * IOS Permissions
 */

import Geolocation from "@react-native-community/geolocation";
import React from "react";

// Event Listener
import { EventRegister } from 'react-native-event-listeners';

export default class AppPermissions extends React.Component {

    componentDidMount() {
        global.Events.emit({name:global.const.CAMERA_PERMISSION_GRANTED});
        Geolocation.requestAuthorization();
    }

    render() {
        return null;
    }

}
