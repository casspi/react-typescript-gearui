import {Validator} from './index';
export default class IdNumberValidator extends Validator {
    
    name:string = this.name||"url";
    type:string = this.type || "url";
    message:string = this.message||"请输入一个正确的url地址";
}