import {Validator} from './index';
export default class RegexValidator extends Validator {

    name:string =this.name || "regex";
    message:string = this.name || "输入的值不符合要求";

    constructor(props: any) {
        super(props);
        if (props.pattern) {
            this.pattern = props.pattern;
        }else {
            this.pattern = new RegExp(this.props.regexp);
        }
    }
}