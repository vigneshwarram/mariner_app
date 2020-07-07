/**
 * Network Setup View
 */

import React from "react";
import NetworkSetupComponent from './NetworkSetup/NetworkSetup';
import Global_State from "../constants/global";

export default class NetworkSetupView extends React.Component {
    static navigationOptions = ({ navigation }) => Global_State.getInstance().viewStyleOptions(navigation);

    constructor(props) {
        super(props)
    }

    render() {
        console.disableYellowBox = true;
        return (
            <NetworkSetupComponent controller={this} link {...this.props}/>
        )
    }
}