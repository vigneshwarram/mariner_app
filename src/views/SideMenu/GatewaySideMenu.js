import React from "react";
import {View, TouchableOpacity, Platform} from 'react-native';
import {
    Label
} from "native-base";

import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faCogs } from '@fortawesome/pro-light-svg-icons';

import Style from '../../styles/views/sidemenu';

export default class GatewaySideMenuComponent extends React.Component {

    // Check to see if the gateway configuration option is enabled
    isEnabled() {
        return global.configuration.get("gatewaySetupEnable");
    }

    render() {
        console.disableYellowBox = true;

        if (Platform.OS === 'ios' && this.isEnabled()) {
            return (
                <TouchableOpacity onPress={() => this.props.controller.navigateToView("GatewaySetup")}>
                    <TouchableOpacity onPress={() => this.props.controller.navigateToView("GatewaySetup")}>
                        <View style={styles.navSectionStyle}>
                            <View style={styles.side_menu_item_style}>
                                <FontAwesomeIcon active={true} style={styles.fa_style} icon={faCogs} size={20}
                                                 color={'#4dbdea'}
                                                 onPress={() => this.props.controller.navigateToView("GatewaySetup")}
                                />
                                <Label style={[{flex: 0, color: '#0aa5ff', fontSize: 16, marginTop: 10}]}
                                       onPress={() => this.props.controller.navigateToView("GatewaySetup")}
                                >{global.t.get$("TITLE.GATEWAY_SETUP")}</Label>
                            </View>
                        </View>
                    </TouchableOpacity>
                </TouchableOpacity>)
        }
        else return null;
    }
}

// Load default styles
const styles = new Style().get();
