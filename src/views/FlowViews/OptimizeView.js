/**
 * Guide View
 */

// Import Components
import React from "react";
import {
    StatusBar,
    View,
    Image
} from 'react-native';
import {
    Label
} from "native-base";

// Default style sheet
import Style from '../../styles/base/index';
import UploadResults from "../../app_code/workorders/upload_results";

// Import the main parts of each view
import AnimatedStackView from '../../styles/components/stack_view';
import Global_State from '../../constants/global';
import CustomButtons from "../../styles/components/custom_buttons";


export default class WifiRouterView extends React.Component {
    static navigationOptions = ({ navigation }) => Global_State.getInstance().viewStyleOptions(navigation);
    isiOS13 = global.state.iOS13_available();

    // Global state
    Global = global.state;

    // Global configuration
    Configuration = global.configuration;

    // Image resources
    ImageResources = global.imageResources;
    // Constructor
    constructor(props) {
        super(props);

    }
    // View mounted and ready
    componentDidMount(){
        new Style().get("FLOWS", (style) => {
            styles = style;
            this.forceUpdate();
        });

        if(this.props.info.getOptimization) {
            this.getRecommendations(this.props.info.optimizationType);
        }

        if(this.props.info.turnOffPlacementMode) {

            //turn it off, navigate back to initial scene
            global.AREvents.emit({name: "AR_CHANGE_SCENE"});
        }
    }

    // View about to unmount
    componentWillUnmount() {
    }

    // View has been updated
    componentDidUpdate(){
    }
    // Render view components
    GetLocationPoints(){

    }

    /*
     * Get recommendations from optimize service
     */
    getRecommendations(algorithmType) {
        new UploadResults().getRecommendation(algorithmType, this.recommendationReturned);
    }

    recommendationReturned(result) {
        global.AREvents.emit({name: "AR_CHANGE_SCENE", data: {scene: "placement", result: result}});
    }

    render() {
        console.disableYellowBox = true;

        return (
            <AnimatedStackView>
                <View style={styles.container}>
                <StatusBar hidden={this.isiOS13}/>
                      <View style={{flexDirection: "row", flex:0, alignItems:'center', justifyItems: 'start', marginTop: 10}}>
                        <View style={{flex: 1, marginLeft: 5, width:55, height:55}}>
                            <Image resizeMode={"contain"} style={{width:55, height:55}} source={styles.brandIcon}/>
                        </View>
                        <Label style={[styles.h1, {fontWeight:'bold', fontSize: 24, flex: 8, marginLeft: -30, width:'90%', textAlign:'center', alignItems:'center'}]}>{this.props.info.title}</Label>
                    </View>
                    <View style={{flexDirection: "row", flex:0, alignItems:'center', justifyItems: 'start', marginTop: 10}}>
                        <Label style={[styles.h6, {flex: 8, paddingLeft: 15, paddingRight: 15, width:'100%', textAlign:'left', alignItems:'center'}]}>{this.props.info.description}</Label>
                    </View>
                    <CustomButtons navigation={this.props.navigation} parent={this.props.controller} create={this.props.info.actionButtons}/>
                </View>
            </AnimatedStackView>
        );
    }
}
// Load default styles
let styles = new Style().get();
