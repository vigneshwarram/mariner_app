/**
 * Barcode scanner view
 */

// Import Components
import React from "react";
import {
    StatusBar, Text,
    View
} from 'react-native';

// Default style sheet
import Style from '../styles/views/barcodescanner'

// Global state for navigation options
import Global_State from '../constants/global';

// Import the main parts of each view
import NavigationButtons from "../styles/components/navigation_buttons";
import {RNCamera} from "react-native-camera";

export default class BarCodeScanner extends React.Component {
    static navigationOptions = ({ navigation }) => Global_State.getInstance().viewStyleOptions(navigation);

    // Global state
    Global = global.state;

    // Global configuration
    Configuration = global.configuration;

    // Local state
    state = {
        barcodeScanMode:false,
        camera: {
            type:RNCamera.Constants.Type.back,
            flashMode:RNCamera.Constants.FlashMode.auto,
            barcodeFinderVisible:true
        }
    };

    // Constructor
    constructor(props) {
        super(props);
        this.camera = null;
        this.barcodeCodes = [];
    }

    // View mounted and ready
    componentDidMount(){
    }

    // View about to mount
    componentWillMount(){
    }

    // View about to unmount
    componentWillUnmount() {
    }

    // View has been updated
    componentDidUpdate(){
    }

    /**
     * Bar code results
     * @param scanResult
     */
    onBarCodeRead(scanResult) {
        console.warn(scanResult.type);
        console.warn(scanResult.data);
        if (scanResult.data != null) {
            this.props.navigation.dispatch(this.Global.resetNavigation('NetworkSetup', {codeValue: scanResult.data}));
            /*if (!this.barcodeCodes.includes(scanResult.data)) {
                this.barcodeCodes.push(scanResult.data);

                console.warn('onBarCodeRead call');
            }*/
        }
        return;
    }


    // Render view components
    render() {
        console.disableYellowBox = true;
        //const {navigate} = this.props.navigation;

        return (
            <View style={styles.container}>
                <StatusBar hidden/>
                <RNCamera
                    ref={ref => {
                        this.camera = ref;
                    }}
                    barcodeFinderVisible={this.state.camera.barcodeFinderVisible}
                    barcodeFinderWidth={280}
                    barcodeFinderHeight={220}
                    barcodeFinderBorderColor="white"
                    barcodeFinderBorderWidth={2}
                    defaultTouchToFocus
                    flashMode={this.state.camera.flashMode}
                    mirrorImage={false}
                    onBarCodeRead={this.onBarCodeRead.bind(this)}
                    onFocusChanged={() => {
                    }}
                    onZoomChanged={() => {
                    }}
                    permissionDialogTitle={'WaveGuide camera permissions'}
                    permissionDialogMessage={'WaveGuide requires permissions to use the camera for the barcode scanner'}
                    style={[styles.preview, {flex: 1}]}
                    type={this.state.camera.type}
                    captureAudio={false}
                />
                <View style={[styles.overlay, styles.topOverlay]}>
                    <Text style={styles.scanScreenMessage}>Please scan the barcode.</Text>
                </View>
                <NavigationButtons navigation={this.props.navigation}
                                   cancel={{
                                       label: 'Cancel',
                                       route: 'NetworkSetup'
                                   }}/>
            </View>
        );
    }
}
// Load default styles
const styles = new Style().get();