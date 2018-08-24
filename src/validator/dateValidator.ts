// import {Validator} from './validators';
// import * as tags from '../tags/tags';
// export default class DateValidator extends Validator {

//     param: {min?:string;max?:string;}
//     constructor(param) {
//         super();
//         this.param = param;
//     }

//     message() {
//         let min = this.param.min;
//         let max = this.param.max;
//         let message = "日期必须";
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
//         let valueDate = new Date(value);
//         let min = this.param.min;
//         let minDate = null;
//         if(min) {
//             minDate = new Date(min);
//         }
//         let max = this.param.max;
//         let maxDate = null;
//         if(max) {
//             maxDate = new Date(max);
//         }
//         if(minDate != null && maxDate != null) {
//             if(valueDate >= minDate && valueDate < maxDate) {
//                 return true;
//             }else {
//                 return this.message();
//             }
//         }else if(minDate != null && maxDate == null) {
//             if(valueDate >= minDate) {
//                 return true;
//             }else {
//                 return this.message();
//             }
//         }else if(minDate == null && maxDate != null) {
//             if(valueDate <= maxDate) {
//                 return true;
//             }else {
//                 return this.message();
//             }
//         }
//     }
// }