import React from "react";
import {View, TouchableOpacity} from 'react-native';
import {
    Label
} from "native-base";

import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faInfoCircle } from '@fortawesome/pro-light-svg-icons';

import Style from '../../styles/base/index';
var Virtual_tech=''
export default class AboutSideMenuComponent extends React.Component {

    // Theme system updates
    componentDidMount(){
        Virtual_tech=global.t.get$("TITLE.ABOUT_VIRTUAL_TECH");
    }
    componentDidUpdate(prevProps, prevState, snapshot) {
        styles = new Style().get();
    }

    render() {
        console.disableYellowBox = true;

        return (
            <TouchableOpacity onPress={() => this.props.controller.navigateByPopup("About")}>
                <View style={styles.navSectionStyle}>
                        <View style={{
                            flex: 0,
                            flexDirection: 'row',
                            paddingBottom: 20,
                            borderTopColor: '#3d3d3d',
                            borderTopWidth: 1,
                            borderBottomColor: '#3d3d3d',
                            borderBottomWidth: 1
                        }}>
                            <FontAwesomeIcon active={true} style={styles.fa_style} icon={faInfoCircle} size={20} color={styles.side_icon.color}
                                  onPress={() => this.props.controller.navigateByPopup("About")}
                            />
                            <Label style={[styles.side_label, {flex: 0, marginTop: 10}]}
                                   onPress={() => this.props.controller.navigateByPopup("About")}
                            >{Virtual_tech}</Label>
                        </View>
                </View>
            </TouchableOpacity>
        );
    }
}

// Load default styles
let styles = new Style().get();
