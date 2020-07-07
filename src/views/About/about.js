import React from "react";
import {Image, View} from "react-native";
import {
    Card,
    CardItem,
    Body,
    Left,
    Text,
    Thumbnail
} from "native-base";

import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
//import { faAndroid, faApple } from '@fortawesome/free-brands-svg-icons';
import { faRobot, faAppleAlt } from '@fortawesome/pro-solid-svg-icons';

import DeviceInformation from '../../app_code/diagnostics/deviceinfo';

import image_files from '../../styles/images';

import Style from '../../styles/views/default';

export default class About extends React.Component {
    Device = new DeviceInformation();
    state = {
        appInstalledDate: ""
    }

    componentDidMount() {
        this.Device.appInstalledDate().then(date => {
            this.setState({appInstalledDate: date});
        });
    }

    render() {
        return (
            <View>
                <Card>
                    <CardItem header bordered>
                        <Left>
                            <Thumbnail source={image_files.waveguide_thumb} />
                            <Text>{global.t.get$('HEADER.APP_INFO')}</Text>
                        </Left>
                    </CardItem>
                    <CardItem cardBody>
                        <Left>
                            <Body>
                                <Text>{global.t.get$('HEADER.APP_VERSION')}</Text>
                                <Text note>{this.Device.buildVersion}</Text>
                            </Body>
                        </Left>
                    </CardItem>
                    {Platform.OS == 'android' &&
                        <CardItem cardBody>
                            <Left>
                                <Body>
                                    <Text>{global.t.get$('HEADER.INSTALLED_DATE')}</Text>
                                    <Text note>{this.state.appInstalledDate}</Text>
                                </Body>
                            </Left>
                        </CardItem>
                    }
                    <CardItem cardBody>
                        <Left>
                            <Body>
                                <Text>{global.t.get$('HEADER.CONFIG_VERSION')}</Text>
                                <Text note>{this.props.controller.state.config_version}</Text>
                            </Body>
                        </Left>
                    </CardItem>
                    <CardItem cardBody>
                        <Left>
                            <Body>
                                <Text>{global.t.get$('HEADER.SERVICE_PROVIDER')}</Text>
                                <Text note>{this.props.controller.state.sp_name}</Text>
                            </Body>
                        </Left>
                    </CardItem>
                    <CardItem/>
                </Card>
                <Card>
                    <CardItem header bordered>
                        <Left>
                            {Platform.OS !== "android" ?
                                <FontAwesomeIcon active={true} size={50} icon={faAppleAlt} /> : <FontAwesomeIcon active={true} size={50} icon={faRobot} />
                            }
                            <Text>{global.t.get$('HEADER.DEVICE_INFO')}</Text>
                        </Left>
                    </CardItem>
                    <CardItem cardBody>
                        <Left>
                            <Body>
                                <Text>{global.t.get$('HEADER.MANUFACTURER')}</Text>
                                <Text note>{this.Device.make}</Text>
                            </Body>
                        </Left>
                    </CardItem>
                    <CardItem cardBody>
                        <Left>
                            <Body>
                                <Text>{global.t.get$('HEADER.MODEL')}</Text>
                                <Text note>{this.Device.model}</Text>
                            </Body>
                        </Left>
                    </CardItem>
                    <CardItem cardBody>
                        <Left>
                            <Body>
                                <Text>{global.t.get$('HEADER.OS_VERSION')}</Text>
                                <Text note>{this.Device.platform} {this.Device.version}</Text>
                            </Body>
                        </Left>
                    </CardItem>
                    <CardItem cardBody>
                        <Left>
                            <Body>
                                <Text>{global.t.get$('HEADER.UUID')}</Text>
                                <Text note>{this.Device.uuid}</Text>
                            </Body>
                        </Left>
                    </CardItem>
                    <CardItem/>
                </Card>
            </View>
        )
    }
}
// Load styles for View Header
const styles = new Style().get();
