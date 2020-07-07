import React from "react";
import {View, TouchableOpacity} from 'react-native';
import {
    Label
} from "native-base";

import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faClipboardList } from '@fortawesome/pro-regular-svg-icons';

import Style from '../../styles/views/sidemenu';

export default class WorkorderSideMenuComponent extends React.Component {
    render() {
        console.disableYellowBox = true;

        return (
            <TouchableOpacity onPress={() => this.props.controller.navigateToView("WorkOrders")}>
                <View style={styles.navSectionStyle}>
                    <View style={{flex: 0, flexDirection: 'row', paddingBottom: 20}}>
                        <FontAwesomeIcon active={true} style={styles.fa_style} icon={faClipboardList} size={20} color={'#4dbdea'}
                              onPress={() => this.props.controller.navigateToView("WorkOrders")}
                        />
                        <Label style={[{flex: 0, color: '#0aa5ff', fontSize: 16, marginTop: 10}]}
                               onPress={() => this.props.controller.navigateToView("WorkOrders")}
                        >{global.t.get$("TITLE.ACTIVE_WORK_ORDERS")}</Label>
                    </View>
                </View>
            </TouchableOpacity>
        );
    }
}

// Load default styles
const styles = new Style().get();
