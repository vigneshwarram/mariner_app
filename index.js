/**
 * @format
 */

import {AppRegistry} from 'react-native';
import React, { setGlobal } from 'reactn';

import App from './src/boot/main';
import {name as appName} from './app.json';

// Global classes
import { EventRegister } from 'react-native-event-listeners';
import WifiService from "./src/app_code/wifi/wifiservices";
import Global_State from "./src/constants/global";
import Configuration from "./src/constants/configuration";
import Functions from "./src/constants/functions";
import Translate from "./src/constants/translate";
import Storage from "./src/constants/storage";
import Oscium from "./src/constants/oscium";
import Tracking from "./src/constants/tracking";
import UploadTracker from "./src/constants/upload_tracker";
import ImageResources from "./src/app_code/managers/image_resources";
import * as CONSTVALUES from './src/constants/const';
import * as CLASSES from './src/constants/classes';

import Events from "./src/app_code/events/manager";

// Global hooks
setGlobal({
    WifiManager:new WifiService()
});

// Global style and theme systems

if (global.state == null) global.state = Global_State.getInstance();
if (global.configuration == null) global.configuration = Configuration.getInstance();
if (global.functions == null) global.functions = Functions.getInstance();
if (global.theme == null) global.theme = global.configuration.get("theme");
if (global.t == null) global.t = Translate.getInstance();
if (global.storage == null) global.storage = Storage.getInstance();
if (global.const == null) global.const = CONSTVALUES;
if (global.system == null) global.system = CLASSES;
if (global.oscium == null) global.oscium = Oscium.getInstance();
if (global.tracking == null) global.tracking = Tracking.getInstance();
if (global.upload_tracker == null) global.upload_tracker = UploadTracker.getInstance();
if (global.imageResources == null) global.imageResources = new ImageResources();
if (global.ARimageResources == null) global.ARimageResources = new ImageResources();
global.Buffer = require('buffer/').Buffer;
global.t.$load('en');

// Event systems
global.Events = new Events("WG_EVENT_SYSTEM");
global.AREvents = new Events("WG_EVENT_SYSTEM_AR");
global.NodeEvents = new Events("WG_EVENT_SYSTEM_NODES");
global.TouchEvents = new Events("WG_EVENT_SYSTEM_TOUCH");
global.SystemEvents = new Events("WG_EVENT_SYSTEM_SYSTEM");
global.ButtonEvents = new Events("WG_EVENT_SYSTEM_BUTTONS");

import FlowLoader from './src/app_code/flows/flowLoader';

// Guided Flow Components
global.Pop = (popup) => {global.SystemEvents.emit({name:'APPLICATION_INTERNAL_POPUP', data:popup})};
global.Flow = (flow, idx=null) => {new FlowLoader().getFlow(flow, idx)};
global.Bubble = (bubble) => {EventRegister.emit('APPLICATION_INTERNAL_BUBBLE', bubble)};


AppRegistry.registerComponent(appName, () => App);
