import React from "react";
import {
    View,
    TouchableOpacity
} from 'react-native';
import {
    Label
} from "native-base";

import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faHomeLg } from '@fortawesome/pro-solid-svg-icons';

import Style from '../../styles/views/sidemenu';

export default class HomeSideMenuComponent extends React.Component {


    // Check to see if the home option is enabled
    isEnabled() {
        return !global.state.get(global.const.AR_ONLY);
    }

    render() {
        console.disableYellowBox = true;

        if (this.isEnabled()) {
            return (
                <TouchableOpacity onPress={() => this.props.controller.navigateToView("Home")}>
                    <View style={styles.navSectionStyle}>
                        <View style={styles.side_menu_item_style}>
                            <FontAwesomeIcon active={true} style={styles.fa_style} icon={faHomeLg} size={20}
                                             color={'#4dbdea'}
                                             onPress={() => this.props.controller.navigateToView("Home")}
                            />
                            <Label style={[{flex: 0, color: '#0aa5ff', fontSize: 16, marginTop: 10}]}
                                   onPress={() => this.props.controller.navigateToView("Home")}
                            >{global.t.get$("TITLE.HOME")}</Label>
                        </View>
                    </View>
                </TouchableOpacity>
            );
        }
        else return null;
    }
}

// Load default styles
const styles = new Style().get();
