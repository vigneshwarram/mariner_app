import React from "react";
import {View, TouchableOpacity} from 'react-native';
import {
    Label
} from "native-base";

import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faPoll } from '@fortawesome/pro-regular-svg-icons';

import Style from '../../styles/views/sidemenu';

export default class SurveySideMenuComponent extends React.Component {

    // Check to see if option is enabled
    isEnabled() {
        let options = configuration.get('workflowFeaturesEnabled');
        return options.siteSurvey != null &&
            options.siteSurvey.enabled &&
            !options.siteSurvey.hidden;
    }

    render() {
        console.disableYellowBox = true;

        if (this.isEnabled()) {
            return (
                <TouchableOpacity onPress={() => this.props.controller.navigateToView("Home")}>
                    <View style={styles.navSectionStyle}>
                        <View style={styles.side_menu_item_style}>
                            <FontAwesomeIcon active={true} style={styles.fa_style} icon={faPoll} size={20} color={'#4dbdea'}
                                  onPress={() => this.props.controller.navigateToView("Home")}
                            />
                            <Label style={[{flex: 0, color: '#0aa5ff', fontSize: 16, marginTop: 10}]}
                                   onPress={() => this.props.controller.navigateToView("Home")}
                            >{global.t.get$("TITLE.SITE_SURVEY")}</Label>
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
