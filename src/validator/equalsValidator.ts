import {Validator} from './index';
export default class EqualsValidator extends Validator {

    name: string = this.name || "equals";

    constructor(props: any) {
        super(props);
        let equalsSrc = this.props.equals;
        if(props.message) {
            this.message = props.message;
        }else {
            this.message = this.props.invalidMessage || "值必须和：" + equalsSrc + "相同";
        }
        this.parseMessage(props);
    }

    validator = (rule: any,value: any,callback: any) => {
        let equalsSrc = this.props.equals;
        let srcEle = G.$(equalsSrc);
        if(srcEle && srcEle.getValue) {
            //为对应的src元素增加校验规则
            let srcValue = srcEle.getValue();
            if(srcValue == value) {
                callback();
                return;
            }
            callback(this.message);
        }
    }
}