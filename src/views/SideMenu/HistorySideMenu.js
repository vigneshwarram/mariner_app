import React from "react";
import {View, TouchableOpacity} from 'react-native';
import {
    Label
} from "native-base";

import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faHistory } from '@fortawesome/pro-regular-svg-icons';

import Style from '../../styles/base/index';

export default class HistorySideMenuComponent extends React.Component {
    // Check to see if the test history is enabled
    isEnabled() {
        return global.configuration.get("testHistoryEnable");
    }

    // Theme system updates
    componentDidUpdate(prevProps, prevState, snapshot) {
        styles = new Style().get();
    }

    render() {
        console.disableYellowBox = true;

        if (this.isEnabled()) {
            return (
                <TouchableOpacity onPress={() => this.props.controller.navigateByPopup("History")}>
                    <View style={styles.navSectionStyle}>
                        <View style={styles.side_menu_item_style}>
                            <FontAwesomeIcon active={true} style={styles.fa_style} icon={faHistory} size={20}
                                             color={styles.side_icon.color}
                                             onPress={() => this.props.controller.navigateByPopup("History")}
                            />
                            <Label style={[styles.side_label, {flex: 0, marginTop: 10}]}
                                   onPress={() => this.props.controller.navigateByPopup("History")}
                            >{global.t.get$("TITLE.PRIVACY_POLICY")}</Label>
                        </View>
                    </View>
                </TouchableOpacity>
            );
        }
        else return null;
    }
}

// Load default styles
let styles = new Style().get();
