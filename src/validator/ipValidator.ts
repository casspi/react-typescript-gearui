import { Validator } from './index';
import { StringUtil } from '../utils';
export default class IpValidator extends Validator {

    name:string = this.name || "ip";
    message:string = this.message || "请输入一个正确的ip地址";
    pattern:any = this.pattern || /^(?:(?:1[0-9][0-9]\.)|(?:2[0-4][0-9]\.)|(?:25[0-5]\.)|(?:[1-9][0-9]\.)|(?:[0-9]\.)){3}(?:(?:1[0-9][0-9])|(?:2[0-4][0-9])|(?:25[0-5])|(?:[1-9][0-9])|(?:[0-9]))$/;

    validator = (rule: any,value:string,callback: any) => {
        if(value != null && value.trim() != "") {
            if(this.pattern.test(value)) {
                let minInt = -1;
                if(StringUtil.isIp(this.min)) {
                    minInt = StringUtil.ip2int(this.min);
                }else {
                    minInt = 0;
                }
                let maxInt = -1;
                if(StringUtil.isIp(this.max)) {
                    maxInt = StringUtil.ip2int(this.max);
                }else {
                    maxInt = StringUtil.ip2int("255.255.255.255");
                }
                let valueint = StringUtil.ip2int(value);
                if(valueint <= maxInt && valueint >= minInt) {
                    callback();
                    return;
                }else {
                    callback("IP地址必须在"+this.min+"和" + this.max + "之间")
                }
            }else {
                callback(this.message);
            }
        }else {
            callback();
            return;
        }
    }
}