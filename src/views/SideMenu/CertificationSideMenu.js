import React from "react";
import {View, TouchableOpacity} from 'react-native';
import {
    Label
} from "native-base";

import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faShieldCheck } from '@fortawesome/pro-regular-svg-icons';

import Style from '../../styles/views/sidemenu';

export default class CertificationSideMenuComponent extends React.Component {

    // Check to see if option is enabled
    isEnabled() {
        let options = configuration.get('workflowFeaturesEnabled');
        return options.siteCertification != null &&
            options.siteCertification.enabled &&
            !options.siteCertification.hidden;
    }

    render() {
        console.disableYellowBox = true;

        if (this.isEnabled()) {
            return (
                <TouchableOpacity onPress={() => this.props.controller.navigateToView("Certification")}>
                    <View style={styles.navSectionStyle}>
                        <View style={styles.side_menu_item_style}>
                            <FontAwesomeIcon active={true} style={styles.fa_style} icon={faShieldCheck} size={20} color={'#4dbdea'}
                                  onPress={() => this.props.controller.navigateToView("Certification")}
                            />
                            <Label style={[{flex: 0, color: '#0aa5ff', fontSize: 16, marginTop: 10}]}
                                   onPress={() => this.props.controller.navigateToView("Certification")}
                            >{global.t.get$("TITLE.CERTIFICATION")}</Label>
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
