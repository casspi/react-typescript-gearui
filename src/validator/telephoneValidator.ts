import { Validator } from './index';
export default class TelephoneValidator extends Validator {

    name:string = this.name || "telephone";
    // message = this.message || "请输入一个正确的电话号码";

    validator = (rule: any, value: string, callback: any) => {
        if (value != null && value.trim() != "") {
            let regMoblie = /^1[3|4|5|7|8]\d{9}$/;
            let regLandline = /^(0[0-9]{2,3}\-)?([2-9][0-9]{6,7})(\-[0-9]{1,4})?$/;
            let message;
            let valueArray = value.split(",");
            if ((!this.props.multiple || this.props.multiple == false || this.props.multiple=="false") && valueArray.length > 1) {
                message = "请输入一个有效的电话号码";
                callback(message);
            } else {
                let validatePass = true;
                for (let i of valueArray) {
                    let value = i;
                    if (this.props.format == "mobile") {
                        if (regMoblie.test(value)) {

                        } else {
                            validatePass = false;
                            message = this.message || "请输入一个有效的手机号码";
                        }
                    } else if (this.props.format == "landline") {
                        if (regLandline.test(value)) {

                        } else {
                            validatePass = false;
                            message = this.message || "请输入一个有效的座机电话号码";
                        }
                    } else {
                        if (regMoblie.test(value) || regLandline.test(value)) {

                        } else {
                            validatePass = false;
                            message = this.message || "请输入一个有效的电话号码";
                        }
                    }
                }
                if (validatePass) {
                    callback();
                    return;
                } else {
                    callback(message);
                }
            }
        } else {
            callback();
            return;
        }
    }
}