import DeviceInfo from 'react-native-device-info';
export default class DeviceInformation {
    constructor() {
        this._deviceInformation = DeviceInfo;
    }

    /**
     * Get the device ID
     * @returns {string}
     */
    get model() {
        return this._deviceInformation.getDeviceId();
    }

    get make() {
        return this._deviceInformation.getBrand();
    }

    get version() {
        return this._deviceInformation.getSystemVersion();
    }

    get platform() {
        return this._deviceInformation.getSystemName();
    }

    get uuid() {
        return this._deviceInformation.getUniqueId();
    }

    async serial() {
        return this._deviceInformation.getSerialNumber().then(serial => {
            return serial;
        });
    }

    get buildVersion() {
        return this._deviceInformation.getReadableVersion();
    }

    async appInstalledDate() {
        return this._deviceInformation.getLastUpdateTime().then(time => {
            let d = new Date(time);
            let td = d.toLocaleString();
            return td;
        });
    }

    async ipAddress() {
        return this._deviceInformation.getIpAddress().then(ip => {
            return ip;
        });
    }
}