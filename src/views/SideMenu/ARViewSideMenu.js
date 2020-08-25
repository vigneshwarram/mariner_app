import React from "react";
import {View, TouchableOpacity} from 'react-native';
import {
    Label
} from "native-base";


import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faHeadVr } from '@fortawesome/pro-regular-svg-icons';

import Style from '../../styles/base/index';
import {EventRegister} from "react-native-event-listeners";
var Tool_box=''
export default class ARViewSideMenuComponent extends React.Component {

    // Check to see if option is enabled
    isEnabled() {
        let options = configuration.get('workflowFeaturesEnabled');
        return options.AR != null &&
            (options.AR.enabled &&
            !options.AR.hidden);
    }

    /**
     * Navigate
     */
    navigateToMenu() {
        global.state.ARMode = "PLAYGROUND_MODE";
        global.state.exitFlows(() => {
            this.props.controller.navigateToView("AR");
            global.ButtonEvents.emit({name:global.const.AR_DELETE_ALL_POINTS});
        });
    }
   componentDidMount(){
       Tool_box=global.t.get$("TITLE.AR_TOOLBOX");
   }
    // Theme system updates
    componentDidUpdate(prevProps, prevState, snapshot) {
        styles = new Style().get();
    }

    render() {
        console.disableYellowBox = true;

        if (this.isEnabled()) {
            return (
                <TouchableOpacity onPress={() => this.navigateToMenu()}>
                    <View style={styles.navSectionStyle}>
                        <View style={styles.side_menu_item_style}>
                            <FontAwesomeIcon active={true} style={styles.fa_style} icon={faHeadVr} size={20} color={styles.side_icon.color}
                                  onPress={() => this.navigateToMenu()}
                            />
                            <Label style={[styles.side_label, {flex: 0, marginTop: 10}]}
                                   onPress={() => this.navigateToMenu()}
                            >{Tool_box}</Label>
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
