import React from "react";
import {Text, View} from "react-native";

// Font Awesome 5
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import Icon from 'react-native-vector-icons/FontAwesome';

import Style from './style/view_header';

export default class Header extends React.Component {

    render() {
        return (
            <View style={this.props.style}>
                <View style={{width: 60, justifyContent:'center', alignItems: 'center', backgroundColor: '#71787f'}}>
                    <FontAwesomeIcon active style={styles.header_icon} size={40} color={'white'} icon={this.props.icon} />
                </View>
                <Text style={{color: '#464d54', width: 300, fontSize:27, marginTop:10, marginLeft:8}}>{this.props.label}</Text>
                {this.props.children}
            </View>
        )
    }
}
// Load styles for View Header
const styles = new Style().get();
