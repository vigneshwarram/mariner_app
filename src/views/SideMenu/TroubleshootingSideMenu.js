import React from "react";
import {
    View,
    TouchableOpacity
} from 'react-native';
import {
    Label
} from "native-base";

import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faTools } from '@fortawesome/pro-light-svg-icons';

// Default style sheet
import Style from '../../styles/views/sidemenu';

export default class TroubleshootingSideMenuComponent extends React.Component {

    // Check to see if option is enabled
    isEnabled() {
        let options = configuration.get('workflowFeaturesEnabled');
        return options.troubleShooting != null &&
            options.troubleShooting.enabled &&
            !options.troubleShooting.hidden;
    }

    render() {
        console.disableYellowBox = true;

        if (this.isEnabled()) {
            return (
                <TouchableOpacity onPress={() => this.props.controller.navigateToView("Home")}>
                    <View style={styles.navSectionStyle}>
                        <View style={styles.side_menu_item_style}>
                            <FontAwesomeIcon active={true} style={styles.fa_style} icon={faTools} size={20}
                                             color={'#4dbdea'}
                                             onPress={() => this.props.controller.navigateToView("Home")}
                            />
                            <Label style={[{flex: 0, color: '#0aa5ff', fontSize: 16, marginTop: 10}]}
                                   onPress={() => this.props.controller.navigateToView("Home")}
                            >{global.t.get$("TITLE.TROUBLESHOOTING")}</Label>
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
