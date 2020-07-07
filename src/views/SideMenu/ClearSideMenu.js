import React from "react";
import {View, TouchableOpacity} from 'react-native';
import {
    Label
} from "native-base";

import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faTrashAlt } from '@fortawesome/pro-light-svg-icons';

import Style from '../../styles/base/index';

export default class AboutSideMenuComponent extends React.Component {

    // Theme system updates
    componentDidUpdate(prevProps, prevState, snapshot) {
        styles = new Style().get();
    }

    render() {
        console.disableYellowBox = true;

        return (
            <TouchableOpacity onPress={() => this.props.controller.clearAllWorkOrders()}>
                <View style={styles.navSectionStyle}>
                    <View style={{flex: 0, flexDirection: 'row', paddingBottom: 20}}>
                        <FontAwesomeIcon active={true} style={styles.fa_style} icon={faTrashAlt} size={20} color={styles.side_icon.color}
                              onPress={() => this.props.controller.clearAllWorkOrders()}
                        />
                        <Label style={[styles.side_label, {flex: 0, marginTop: 10}]}
                               onPress={() => this.props.controller.clearAllWorkOrders()}
                        >{global.t.get$("ACTION.CHANGE_SERVICE_PROVIDER")}</Label>
                    </View>
                </View>
            </TouchableOpacity>
        );
    }
}

// Load default styles
let styles = new Style().get();
