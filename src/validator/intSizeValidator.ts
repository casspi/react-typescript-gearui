// import {Validator} from './validators';
// import * as tags from '../tags/tags';
// export default class IntSizeValidator extends Validator {

//     param: {min?:number;max?:number;}
//     constructor(param) {
//         super();
//         this.param = param;
//     }

//     message() {
//         let min = this.param.min;
//         let max = this.param.max;
//         let message = "值必须";
//         if(min != null) {
//             message += "大于等于" + min;
//         }
//         if(max != null) {
//             if(min != null) {
//                 message += "且";
//             }
//             message += "小于等于" + max;
//         }
//         return message;
//     }

//     validate(ele:tags.Tag<tags.TagProps>) {
//         let value = (ele instanceof tags.Tag) ? (ele.state["value"]||"") : ele;
//         let min = this.param.min;
//         let max = this.param.max;
//         if(min != null && max != null) {
//             if(value >= min && value <= max) {
//                 return true;
//             }else {
//                 return this.message();
//             }
//         }else if(min != null && max == null) {
//             if(value >= min) {
//                 return true;
//             }else {
//                 return this.message();
//             }
//         }else if(min == null && max != null) {
//             if(value <= max) {
//                 return true;
//             }else {
//                 return this.message();
//             }
//         }
//     }
// }