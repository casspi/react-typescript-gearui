import {Validator} from './index';
export default class NumberValidator extends Validator {

    name:string = this.name || "number";
    message:string = this.message || "请输入一个正确的数字";
    pattern: any = this.pattern ||/^[0-9]+([.]{1}[0-9]+){0,1}$/;
}