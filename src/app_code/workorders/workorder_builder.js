/* work order builder for uploading work orders from the heat map */

import Thresholds from '../certifications/thresholds';
import Device from '../diagnostics/deviceinfo';
import WifiDetails from '../wifi/wifidetails';
let workId='';
let customer_Id='';
export default class WorkorderBuilder {
    Device = new Device();
    Thresholds = new Thresholds();
    WifiDetails = new WifiDetails();

    constructor() {
        global.storage.getData(global.const.STORAGE_KEY_W,(res)=>{
            workId=res.toString()
        })
        global.storage.getData(global.const.STORAGE_KEY_C,(res)=>{
            customer_Id=res.toString()
        })
    }
    

    build() {
        let  woid =workId;
        if(woid==='' || woid===null){
            woid = Math.random().toString(36).substr(2,6);
        }
       let customerId=customer_Id!=null || customer_Id!=''?customer_Id:this.Device.uuid
        global.state.work_orders.new(woid, 3, customerId);
        let woDetails = global.state.work_orders.get(woid);
        woDetails.displayWhenActive = false;
        //let work_order_id = this.work_order.id;
        let points = global.tracking.allNodeData;

        woDetails.addCertification("GATEWAY");
        woDetails.currentCertification.testType = "heatMap";
        woDetails.currentCertification.installedLocation = "Point1";
        for(let i = 0; i<=points.length-1;i++){
            let point_location = points[i].transform.location != null && points[i].transform.location.length > 0 ? (points[i].transform.location[0].label === "Other" ? points[i].transform.location[0].text  : points[i].transform.location[0].label) : ("Point" + (i + 1).toString());
            woDetails.currentCertification.addLocationTest(point_location, {
               signalThresholds: this.Thresholds.get('signalThresholds', '')
            }, null, null);
            woDetails.currentCertification.currentLocation.updateTimeStamps(points[i].transform.timestamp);
            woDetails.currentCertification.currentLocation.signal = points[i].data.level;
            woDetails.currentCertification.currentLocation.location = point_location;
            woDetails.currentCertification.currentLocation.pointType = points[i].data.pointType;
            //set wifi details for specific location
            let pointWifiDetails = new WifiDetails();
            pointWifiDetails.setSSID(points[i].data.ssid);
            pointWifiDetails.setBSSID(points[i].data.bssid);
            pointWifiDetails.setBand(points[i].data.freq === "5 GHz" ? "5GHz" : "2.4GHz");
            pointWifiDetails.setSignal(points[i].level);
            woDetails.currentCertification.currentLocation.wifiDetails = pointWifiDetails;
            let x = points[i].transform._x - points[0].transform._x;
            let y = points[i].transform._y - points[0].transform._y;
            let z = points[i].transform._z - points[0].transform._z;
            woDetails.currentCertification.currentLocation.setCoordinates(x , y, z);
            woDetails.currentCertification.currentLocation.interferingNetworks = {value: points[i].data.interference.value, type: points[i].data.interference.type};
            woDetails.currentCertification.currentLocation.linkSpeed = points[i].data.linkspeed;
        }

        woDetails.currentCertification.setVirtualTechResults();

        return woDetails;
    }
}
