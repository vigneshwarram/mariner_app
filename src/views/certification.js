import React, { Component } from "react";
import {Platform, StyleSheet, Text, View, Alert, Button, TextInput, StatusBar} from 'react-native';
import Style from '../styles/views/default'

import { WebView } from 'react-native-webview';

import Global_State from '../constants/global';
import Configuration from '../constants/configuration';

export default class CertificationScreen extends React.Component {
    static navigationOptions = Global_State.getInstance().viewStyleOptions('Certification');

    // Speedtest states
    state = {
        ooklaUrl: 'http://waveguide-qa.mpicorp.ca:8080/test.html',
        testInProgress: false,
        messageResponse: null
    };

    /**
     * Receive post message from the ookla speedtest
     * @param m
     */
    onMessage(m) {
        this.setState({testInProgress: false, messageResponse: JSON.parse(m.nativeEvent.data)});
    }

    /**
     * Start a new test
     */
    startTest() {
        this.setState({testInProgress: true, messageResponse: null});
    }


    render() {
        if (this.state.testInProgress) {
            return (
                <WebView
                    originWhitelist={['*']}
                    source={{uri: this.state.ooklaUrl}}
                    javaScriptEnabled={true}
                    onMessage={m => this.onMessage(m)}
                />
            );
        }
        else if (!this.state.testInProgress && this.state.messageResponse != null) {
            return (
                <View style={styles.container}>
                    <StatusBar hidden />
                    <Text style={styles.text}>Results:</Text>
                    <Text>--------</Text>
                    <Text style={styles.text}>Download: {this.state.messageResponse.download}</Text>
                    <Text style={styles.text}>Upload: {this.state.messageResponse.upload}</Text>
                    <Text style={styles.text}>Jitter: {this.state.messageResponse.latency.jitter}</Text>
                    <Text style={styles.text}>Ping: {this.state.messageResponse.latency.minimum}</Text>
                    <Text>--------</Text>
                    <Button
                        onPress={() => this.startTest()}
                        title="Test Again">
                    </Button>
                </View>
            );
        }
        else {
            return (
                <View style={styles.container}>
                    <StatusBar hidden />
                    <TextInput style={styles.input} value={this.state.ooklaUrl} onChangeText={(text) => this.setState({ooklaUrl:text})}/>
                    <Button
                        onPress={() => this.startTest()}
                        title="Start Test">
                    </Button>
                </View>
            );
        }
    }
}
// Load default styles
const styles = new Style().get();
