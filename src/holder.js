import React, { Component } from "react";

import {Platform, StyleSheet, Text, View, Alert, Button} from 'react-native';
import { WebView } from 'react-native-webview';

type Props = {};
export default class App extends Component<Props> {

    // Speedtest states
    state = {
        testInProgress: false,
        messageResponse: null
    }

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
                    source={{uri: 'http://waveguide-qa.mpicorp.ca:8080/test.html'}}
                    javaScriptEnabled={true}
                    onMessage={m => this.onMessage(m)}
                />
            );
        }
        else if (!this.state.testInProgress && this.state.messageResponse != null) {
            return (
                <View style={styles.container}>
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
                    <Button
                        onPress={() => this.startTest()}
                        title="Start Test">
                    </Button>
                </View>
            );
        }
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#F5FCFF',
    },
    text: {
        fontSize: 20,
        textAlign: 'left',
        margin: 10,
    },
    instructions: {
        textAlign: 'center',
        color: '#333333',
        marginBottom: 5,
    },
});
