import {Validator} from './index';
import { StringUtil } from '../utils';
export default class MacValidator extends Validator {

    name:string = this.name || "mac";
    message:string = this.message || "请输入一个正确的MAC地址";
    pattern:any= this.pattern || /[A-F\d]{2}:[A-F\d]{2}:[A-F\d]{2}:[A-F\d]{2}:[A-F\d]{2}:[A-F\d]{2}/;

    validator = (rule: any,value:string,callback: any) => {
        if(value != null && value.trim() != "") {
            if(this.pattern.test(value)) {
                let min = this.props.min+"";
                if(StringUtil.isMac(min) == false) {
                    min = "00:00:00:00:00:00";
                }
                min = StringUtil.zeroize_mac(min);
                let max = this.props.max+"";
                if(StringUtil.isMac(max) == false) {
                    max = "FF:FF:FF:FF:FF:FF";
                }
                max = StringUtil.zeroize_mac(max);
                let valuez = StringUtil.zeroize_mac(value);
                if(valuez <= max && valuez >= min) {
                    callback();
                    return;
                }else {
                    callback("MAC地址必须在"+this.min+"和" + this.max + "之间")
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