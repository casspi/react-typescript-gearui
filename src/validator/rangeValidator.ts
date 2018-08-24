import { Validator } from './index';
import { StringUtil } from '../utils';
export default class RangeValidator extends Validator {

    name:string = this.name || "range";

    validator = (rule: any, value: any, callback: any) => {
        if (this.props.type == "mac") {
            let min = this.props.min + "";
            if (StringUtil.isMac(min) == false) {
                min = "00:00:00:00:00:00";
                this.props.min = min;
            }
            min = StringUtil.zeroize_mac(min);
            let max = this.props.max + "";
            if (StringUtil.isMac(max) == false) {
                max = "FF:FF:FF:FF:FF:FF";
                this.props.max = max;
            }
            max = StringUtil.zeroize_mac(max);
            let valuez = StringUtil.zeroize_mac(value);
            if (valuez <= max && valuez >= min) {
                callback();
                return;
            } else {
                callback("MAC地址必须在" + this.props.min + "和" + this.props.max + "之间")
            }
        } else if (this.props.type == "number") {
            let min = parseFloat(this.props.min);
            if (StringUtil.isNumber(min) == false) {
                min = 0;
            }
            let max = parseFloat(this.props.max);
            if (StringUtil.isNumber(max) == false) {
                max = 999999999;
            }
            let valuez = parseFloat(value);
            if (valuez <= max && valuez >= min) {
                callback();
                return;
            } else {
                callback("数值必须在" + this.props.min + "和" + this.props.max + "之间")
            }
        } else if (this.props.type == "int") {
            let min = parseInt(this.props.min);
            if (StringUtil.isInteger(min) == false) {
                min = 0;
            }
            let max = parseInt(this.props.max);
            if (StringUtil.isInteger(max) == false) {
                max = 999999999;
            }
            let valuez = parseInt(value);
            if (valuez <= max && valuez >= min) {
                callback();
                return;
            } else {
                callback("数值必须在" + this.props.min + "和" + this.props.max + "之间")
            }
        } else if (this.props.type == "ip") {
            let min = this.props.min;
            if (StringUtil.isIp(min)) {
                min = StringUtil.ip2int(min);
            } else {
                min = 0;
            }
            let max = this.props.max;
            if (StringUtil.isIp(max)) {
                max = StringUtil.ip2int(max);
            } else {
                max = StringUtil.ip2int("255.255.255.255");
            }
            let valueint = StringUtil.ip2int(value);
            if (valueint > max) {
                value = StringUtil.int2iP(max);
                callback("数值必须小于" + this.props.max);
            } else if (valueint < min) {
                value = StringUtil.int2iP(min);
                callback("数值必须大于" + this.props.min);
            } else if (valueint > min && valueint < max) {
                callback();
                return;
            }
        } else if (this.props.type == "date") {
            if(!value){
                callback();
                return;
            } 
            let min = this.props.min;
            let max = this.props.max;
            let valueFormat = value.format(this.props.format || "YYYY-MM-DD");
            if ((min == undefined || min == null) && (max != undefined && max != null)) {
                if (valueFormat <= max) {
                    callback();
                    return;
                } else {
                    callback("日期必须小于" + this.props.max);
                }
            } else if ((min != undefined && min != null) && (max == undefined || max == null)) {
                if (valueFormat >= min) {
                    callback();
                    return;
                } else {
                    callback("日期必须大于" + this.props.min);
                }
            } else if ((min != undefined && min != null) && (max != undefined && max != null)) {
                if (valueFormat <= max && valueFormat >= min) {
                    callback();
                    return;
                } else {
                    callback("日期必须在" + this.props.min + "和" + this.props.max + "之间");
                }
            } 
        } else if (this.props.type == "datetime") {
            if(!value){
                callback();
                return;
            }            
            let min = this.props.min;
            let max = this.props.max;
            let valueFormat = value.format(this.props.format || "YYYY-MM-DD HH:mm:ss");
            if ((min == undefined || min == null) && (max != undefined && max != null)) {
                if (valueFormat <= max) {
                    callback();
                    return;
                } else {
                    callback("日期时间必须小于" + this.props.max);
                }
            } else if ((min != undefined && min != null) && (max == undefined || max == null)) {
                if (valueFormat >= min) {
                    callback();
                    return;
                } else {
                    callback("日期时间必须大于" + this.props.min);
                }
            } else if ((min != undefined && min != null) && (max != undefined && max != null)) {
                if (valueFormat <= max && valueFormat >= min) {
                    callback();
                    return;
                } else {
                    callback("日期时间必须在" + this.props.min + "和" + this.props.max + "之间");
                }
            } 
        } else if (this.props.type == "time") {
            if(!value){
                callback();
                return;
            }            
            let min = this.props.min;
            let max = this.props.max;
            let valueFormat = value.format(this.props.format || "HH:mm:ss");
            if ((min == undefined || min == null) && (max != undefined && max != null)) {
                if (valueFormat <= max) {
                    callback();
                    return;
                } else {
                    callback("时间必须小于" + this.props.max);
                }
            } else if ((min != undefined && min != null) && (max == undefined || max == null)) {
                if (valueFormat >= min) {
                    callback();
                    return;
                } else {
                    callback("时间必须大于" + this.props.min);
                }
            } else if ((min != undefined && min != null) && (max != undefined && max != null)) {
                if (valueFormat <= max && valueFormat >= min) {
                    callback();
                    return;
                } else {
                    callback("时间必须在" + this.props.min + "和" + this.props.max + "之间");
                }
            } 
        }
    }
}
