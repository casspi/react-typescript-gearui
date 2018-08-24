import {Validator} from './index';
import * as moment from 'moment';
import { ObjectUtil, StringUtil } from '../utils';
export default class CompareValidator extends Validator {

    name:string = this.name || "compare";

    compare: any[] = [];

    expr: string;

    compareType:'y' | 'M' | 'd' | 'h' | 'm' | 's';

    clazz?: any;

    constructor(props: any, clazz?: any) {
        super(props);
        let compare = this.props.compare;
        this.clazz = clazz;
        var compareMsg = compare.split(",");
        this.expr = compareMsg[0];
        if(compareMsg[2] && compareMsg[2] != "") {
            this.compare = [compareMsg[1],compareMsg[2]];
        }else {
            this.compare = [compareMsg[1]];
        }
        if(props.message) {
            this.message = props.message;
        }else {
            this.message = this.props.invalidMessage || this.getDefaultMessage();
        }
        this.parseMessage(props);
    }

    getDefaultMessage() {
        let message = "";
        if(this.expr == "gt") {
            message = "值必须大于" + this.compare[0];
        }
        if(this.expr == "lt") {
            message = "值必须小于" + this.compare[0];
        }
        if(this.expr == "ge") {
            message = "值必须大于等于" + this.compare[0];
        }
        if(this.expr == "le") {
            message = "值必须小于等于" + this.compare[0];
        }
        if(this.expr == "between") {
            message = "值必须在"+this.compare[0]+"的值和"+this.compare[1]+"的值之间";
        }
        return message;
    }

    getDateCompareType() {
        if(this.compareType != null) {
            return;
        }
        let ele = G.$("#" + this.props.id);
        if(ele && ele.getFormat) {
            let format:string = ele.getFormat();
            if(format.indexOf('S') != -1 || format.indexOf('s') != -1) {
                this.compareType = 's';
            }else if(format.indexOf('m') != -1) {
                this.compareType = 'm';
            }else if(format.indexOf('H') != -1 || format.indexOf('h') != -1) {
                this.compareType = 'h';
            }else if(format.indexOf('D') != -1 || format.indexOf('d') != -1) {
                this.compareType = 'd';
            }else if(format.indexOf('M') != -1) {
                this.compareType = 'M';
            }else if(format.indexOf('Y') != -1 || format.indexOf('Y') != -1) {
                this.compareType = 'y';
            }
        }
        return this.compareType || 'd';
    }

    validator = (rule: any,value: any,callback: any) => {
        let values = [];
        let canCompare = true;

        for(let i=0; i < this.compare.length; i++) {
            let ele = G.$(this.compare[i]);
            
            if(ele.getValue) {
                values[i] = ele.getValue();
            }else {
                canCompare = false;
            }
        }
        if(canCompare) {
            //为对应的src元素增加校验规则
            let validResult = this.valid(value,...values);
            if(validResult) {
                callback();
                return;
            }
            callback(this.message);
        }else {
            callback();
            return;
        }
    }

    valid = (value: any,...values: any[]) => {
        this.getDateCompareType();
        let value1 = values[0];
        let value2 = values[1];
        if(ObjectUtil.isExtends(this.clazz, "Mac")) {
            value = StringUtil.zeroize_mac(value);
            value1 = StringUtil.zeroize_mac(value1);
            if(value2) {
                value2 = StringUtil.zeroize_mac(value2);
            }
        }else if(ObjectUtil.isExtends(this.clazz, "Ip")) {
            value = StringUtil.ip2int(value);
            value1 = StringUtil.ip2int(value1);
            if(value2) {
                value2 = StringUtil.ip2int(value2);
            }
        }
        if(ObjectUtil.isExtends(this.clazz, "Text") || ObjectUtil.isExtends(this.clazz, "Number") || ObjectUtil.isExtends(this.clazz, "Int") || ObjectUtil.isExtends(this.clazz, "Mac") || ObjectUtil.isExtends(this.clazz, "Ip")) {
            if(this.expr == "gt") {
                return value > value1;
            }
            if(this.expr == "lt") {
                return value < value1;
            }
            if(this.expr == "ge") {
                return value >= value1;
            }
            if(this.expr == "le") {
                return value <= value1;
            }
            if(this.expr == "between") {
                return value >= value1 && value <= value2;
            }
        }else if(ObjectUtil.isExtends(this.clazz, "Date") || ObjectUtil.isExtends(this.clazz, "Datetime") || ObjectUtil.isExtends(this.clazz, "Time")) {
            if(moment.isMoment(value) && moment.isMoment(value1) && (value2 == null || moment.isMoment(value2))) {
                
                // let v = null;
                // let v1 = null;
                // let v2 = null;
                // v = value.get(this.compareType);
                // v1 = value1.get(this.compareType);
                // if(value2) {
                //     v2 = value2.get(this.compareType);
                // }
                if(this.expr == "gt") {
                    return value.diff(value1, this.compareType) > 0;
                }
                if(this.expr == "lt") {
                    return value.diff(value1, this.compareType) < 0;
                }
                if(this.expr == "ge") {
                    return (value.diff(value1, this.compareType) > 0) || (value.diff(value1, this.compareType) >= 0);
                }
                if(this.expr == "le") {
                    return (value.diff(value1, this.compareType) < 0) || (value.diff(value1, this.compareType) <= 0);
                }
                if(this.expr == "between") {
                    return ((value.diff(value1, this.compareType) > 0) || (value.diff(value1, this.compareType) >= 0)) && ((value.diff(value2, this.compareType) < 0) || (value.diff(value2, this.compareType) <= 0));
                }
            }
        }
        return true;
    }
}