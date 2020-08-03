/**
 * Main flow class
 * Add new flow types here that can be used in configuration
 * Also add any images that are needed
 */
import React from "react";


// Import view types
import SplashView from '../views/FlowViews/SplashView';
import DefaultView from '../views/FlowViews/DefaultView';
import ScrollableView from '../views/FlowViews/ScrollView';
import SummaryView from '../views/FlowViews/SummaryView';
import ADHOCSummaryView from '../views/FlowViews/ADHOCSummaryView';
import ARView from '../views/FlowViews/ARView';
import GuideView from '../views/FlowViews/GuideView';
import CodeView from '../views/FlowViews/CodeView';
import Help from '../views/FlowViews/WifiRouterView'
import Optimize from '../views/FlowViews/OptimizeView'
import RouterOptimize from '../views/FlowViews/RouterOptimization'
export default class OverlayViews {

    /**
     * Load the overlay class and manage the images
     */
    constructor() {

        // Load the images
        global.imageResources.load(images);
    }

    /**
     * Return the configured view ( add new view types here )
     * @param type
     * @param info
     * @returns {*}
     */
    get(type, info) {
        switch(type) {
            case 'splash': {
                return <SplashView key={info.idx} id={info.idx} info={info.view} controller={info.controller} link {...info.props}/>;
            }
            case 'ar': {
                return <ARView key={info.idx} id={info.idx} info={info.view} controller={info.controller} link {...info.props}/>;
            }
            case 'guide': {
                return <GuideView key={info.idx} id={info.idx} info={info.view} controller={info.controller} link {...info.props}/>;
            }
            case 'scroll': {
                return <ScrollableView key={info.idx} id={info.idx} info={info.view} controller={info.controller} link {...info.props}/>;
            }
            case 'summary': {
                return <SummaryView key={info.idx} id={info.idx} info={info.view} controller={info.controller} link {...info.props}/>;
            }
            case 'toolbox_summary': {
                return <ADHOCSummaryView key={info.idx} id={info.idx} info={info.view} controller={info.controller} link {...info.props}/>;
            }
            case 'code': {
                return <CodeView key={info.idx} id={info.idx} info={info.view} controller={info.controller} link {...info.props}/>;
            }
            case 'Help' :{
                return <Help key={info.idx} id={info.idx} info={info.view} controller={info.controller} link {...info.props}/>;
            }
            case 'optimize' :{
                return <Optimize key={info.idx} id={info.idx} info={info.view} controller={info.controller} link {...info.props}/>;
            }
            case 'routeroptimize' :{
                return <RouterOptimize key={info.idx} id={info.idx} info={info.view} controller={info.controller} link {...info.props}/>;
            }
            default: {
                return <DefaultView key={info.idx} id={info.idx} info={info.view} controller={info.controller} link {...info.props}/>;
            }

        }
    }
}
// Any local images used by the overlays (work flows)
const images  = [
    {name: "blank", image:require('../assets/blank.png')},
    {name: "vt_brand", image:require('../assets/icon.png')},
    {name: "logo.png", image:require('../assets/logo.png')},
    {name: "image1", image:require('../res/workflows/images/image1.png')},
    {name: "image2", image:require('../res/workflows/images/image2.png')},
    {name: "image3", image:require('../res/workflows/images/image3.jpg')},
    {name: "image4", image:require('../res/workflows/images/image4.png')},
    {name: "image5", image:require('../res/workflows/images/image5.png')},
    {name: "image6", image:require('../res/workflows/images/image6.png')},
    {name: "image7", image:require('../res/workflows/images/image7.png')},
    {name: "excellent_point", image:require('../res/AR/simple/excellent_point.png')},
    {name: "good_point", image:require('../res/AR/simple/green_point.png')},
    {name: "fair_point", image:require('../res/AR/simple/yellow_point.png')},
    {name: "critical_point", image:require('../res/AR/simple/red_point.png')},
];
