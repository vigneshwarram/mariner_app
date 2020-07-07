import React from "react";
import {View, TouchableOpacity} from 'react-native';
import {
    Label
} from "native-base";

import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faBug } from '@fortawesome/pro-regular-svg-icons';

import Style from '../../styles/views/sidemenu';

export default class DiagnosticSideMenuComponent extends React.Component {

    // Check to see if the diagnostics is enabled
    isEnabled() {
        return global.configuration.get("diagnosticsEnabled");
    }

    render() {
        console.disableYellowBox = true;

        if(this.isEnabled()) {
            return (
                <TouchableOpacity onPress={() => this.props.controller.navigateByPopup("Diagnostics")}>
                    <View style={styles.navSectionStyle}>
                        <View style={styles.side_menu_item_style}>
                            <FontAwesomeIcon active={true} style={styles.fa_style} icon={faBug} size={20} color={'#4dbdea'}
                                             onPress={() => this.props.controller.navigateByPopup("Diagnostics")}
                            />
                            <Label style={[{flex: 0, color: '#0aa5ff', fontSize: 16, marginTop: 10}]}
                                   onPress={() => this.props.controller.navigateByPopup("Diagnostics")}
                            >{global.t.get$("TITLE.DIAGNOSTICS")}</Label>
                        </View>
                    </View>
                </TouchableOpacity>
            );
        }
        else {
            return null;
        }
    }
}

// Load default styles
const styles = new Style().get();
