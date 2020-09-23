import React from "react";
import { Root } from "native-base";
import {BackHandler, Dimensions} from 'react-native';
import {createDrawerNavigator, createStackNavigator, createAppContainer} from 'react-navigation';

// Imported Views
import SplashScreen from '../views/SplashScreen';
import RegisterView from '../views/RegisterView';
import HomeView from '../views/HomeView';
import CertificationView from '../views/CertificationView';
import NetworkSetupView from '../views/NetworkSetupView';
import LocationTestView from '../views/LocationTestView';
import SpeedTestView from '../views/SpeedTestView';
import LocationTestDetailView from '../views/LocationTestDetail';
import BarcodeScanner from '../views/BarCodeScanner';
import DiagnosticView from '../views/DiagnosticView';
import WorkOrderView from '../views/WorkOrders';
import SummaryView from '../views/SummaryView';
import ARSceneView from '../views/ARSceneView';
import AboutView from '../views/AboutView';
import GatewaySetupView from '../views/GatewaySetup';
import AlternateSpeedtestView from '../views/AlternateSpeedtestView';
import HistoryView from '../views/HistoryView';
import GuidedView from '../views/GuidedView';

// Imported Side Menu
import SideMenu from '../views/SideMenu';
BackHandler.addEventListener('hardwareBackPress', () => {return true});


// Setup the Navigations
const SlideNavigator = createDrawerNavigator({
    Item1: {
        screen:
            createStackNavigator({
            SplashScreen: {screen: SplashScreen, navigationOptions: {header: null}},
            Register: {screen: RegisterView},
            GuidedView: {screen: GuidedView},
            Home: {screen: HomeView},
            NetworkSetup: {screen: NetworkSetupView},
            Certification: {screen: CertificationView},
            LocationTest: {screen: LocationTestView},
            LocationTestDetail: {screen: LocationTestDetailView},
            SpeedTest: {screen: SpeedTestView},
            BarcodeScan: {screen: BarcodeScanner},
            Diagnostics: {screen: DiagnosticView},
            WorkOrders: {screen: WorkOrderView},
            CertificationSummary: {screen: SummaryView},
            GatewaySetup: {screen: GatewaySetupView},
            About: {screen: AboutView},
            AlternateSpeedtest: {screen: AlternateSpeedtestView},
            History: {screen: HistoryView},
            AR: {screen: ARSceneView},
        })
    },
}, {
    contentComponent: SideMenu,
    drawerWidth: Dimensions.get('window').width - 60
});

const App = createAppContainer(SlideNavigator);

export default () =>
    <Root>
        <App/>
    </Root>;
