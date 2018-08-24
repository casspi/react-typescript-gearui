import * as validates from './index';
export default class RequiredValidator extends validates.Validator {

    name:string = this.name || "required";
    // required = this.required || true;
    message:string = this.message || "值不能为空";

    validator = (rule: any,value: any,callback: any) => {
        //console.log(rule);
        //console.log(value);
        //if(rule.props.ctype=="autocomplete")
        //    debugger;
        if(value != null) {
            if(value instanceof Array) {
                
                if(value.length > 0) {
                    callback();
                    return;
                }
            }else if(typeof value == "string") {
                if(value.trim() != "") {
                    callback();
                    return;
                }
            }else {
                callback();
                return;
            }
        }
        callback(this.message);
        return;
    }

    // param: {required?:boolean;}
    // constructor(param) {
    //     super();
    //     this.param = param;
    // }

    // message() {
    //     let message = "值不能为空";
    //     return message;
    // }

    // validate(ele:tags.Tag<tags.TagProps>) {
    //     let value = (ele instanceof tags.Tag) ? (ele.state["value"]||"") : ele;
    //     let required = this.param.required;
    //     if(required == true) {
    //         if(value != null && value != "") {
    //             return true;
    //         }else {
    //             return this.message();
    //         }
    //     }
    // }
}