/**
 * Message service
 */

import {Alert} from 'react-native';
import {Toast} from "native-base";
export default class Message {


    /**
     * Send a message to the user
     * @param title
     * @param message
     * @param buttonText
     */
    sendAlert(title, message, buttonText) {
        console.log(global.functions.replace("{0} : {1}", [title, message]));
        Alert.alert(
            title,
            message,
            [
                {text: buttonText, onPress: () => function(){}},
            ],
            {cancelable: false},
        );
    }

    /**
     * Send a message with option
     * @param title
     * @param message
     * @param buttonText
     * @param buttonCallback
     * @param cancelButtonText
     */
    sendAlertWithOption(title, message, buttonText, buttonCallback, cancelButtonText) {
        console.log(global.functions.replace("{0} : {1}", [title, message]));
        Alert.alert(
            title,
            message,
            [
                {text: cancelButtonText, style: 'cancel', onPress: () => function(){}},
                {text: buttonText, onPress: () => buttonCallback()},
            ],
            {cancelable: false},
        );
    }

    /**
     * Show a toast message
     * @param message
     * @param type - 'success', 'warning', 'danger'
     */
    showToastMessage(message, type) {
        Toast.show({
            text: message,
            duration: 3000,
            type: type
        })
    }
}