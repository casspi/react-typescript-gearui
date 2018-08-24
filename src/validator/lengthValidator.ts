import { Validator } from './index';
export default class LengthValidator extends Validator {

    name:string = this.name || "len";

    constructor(props: any, clazz?: any) {
        super(props);
        if (props.min) {
            this.min = props.min;
        } else {
            this.min = parseInt(this.props.min);
        }
        if (props.max) {
            this.max = props.max;
        } else {
            this.max = parseInt(this.props.max);
        }
        if (props.message) {
            this.message = props.message;
        } else {
            if(this.min && this.min > 0 && this.max && this.max > 0){
                this.message = this.props.invalidMessage || "长度必须大于：" + this.min + "且小于：" + this.max;
            }else if(this.min && !this.max){
                this.message = this.props.invalidMessage || "长度必须大于：" + this.min;               
            }else if(!this.min && this.max){
                this.message = this.props.invalidMessage || "长度必须小于：" + this.max;
            }
        }
        this.parseMessage(props);
    }
}