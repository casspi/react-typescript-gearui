import * as Tag from "../Tag";
import * as Validate from './Validate';
import { Form } from "./index";
import { Validator } from "../../validator";
export var props = {
    
    form: GearType.VoidT<Form.Form<any, Form.state>>(),
    //配合 label 属性使用，表示是否显示 label 后面的冒号
    colon: GearType.Boolean,
    //额外的提示信息，和 help 类似，当需要错误信息和提示文案同时出现时，可以使用这个
    extra: GearType.String,
    //配合 validateStatus 属性使用，展示校验状态图标，建议只配合 Input 组件使用
    hasFeedback: GearType.Boolean,
    //提示信息，如不设置，则会根据校验规则自动生成
    help: GearType.String,
    //label 标签的文本
    labelText: GearType.String,
    //label 标签布局，同 <Col> 组件，设置 span offset 值，如 {span: 3, offset: 12} 或 sm: {span: 3, offset: 12}
    lableCol: GearType.Object,
    //是否必填，如不设置，则会根据校验规则自动生成
    required: GearType.Boolean,
    //校验状态，如不设置，则会根据校验规则自动生成，可选：'success' 'warning' 'error' 'validating'
    validateStatus: GearType.String,
    //需要为输入控件设置布局样式时，使用该属性，用法同 labelCol
    wrapperCol: GearType.Object,
    //onChange
    onChange: GearType.Function,
    //验证
    validation: GearType.Boolean,
    //错误的校验信息
    invalidMessage: GearType.String,
    
    validationType: GearType.String,

    invalidType: GearType.String,

    readOnly: GearType.Boolean,
    
    rules: GearType.Array<any>(),
    value: GearType.Any,
    ...Validate.props,
    ...Tag.props
};
export interface state extends Tag.state {
    value?: string | string[] | number;
    invalidType?: string;
    //验证
    validation?: boolean;
    //验证器
    rules?: Array<Validator>;
    readOnly?: boolean;
};
export default abstract class FormTag<P extends typeof props, S extends state> extends Tag.default<P, S> {

    protected cannotUpdate:GearArray<keyof S> = new GearArray<keyof state>(["name","id"]);

    protected afterReceiveProps(nextProps: P): Partial<typeof props> {
        return {
            value: nextProps.value,
            onChange: nextProps.onChange
        };
    }

    triggerChange(changedValue: any, callback?: Function) {
        if(this.props.form) {
            this.props.form.setFieldValue(this.props.name, changedValue, callback);
        }
    }

    getInitialState(): state {
        return {
            rules: this.props.rules,
            validation: this.props.validation,
            invalidType: this.props.invalidType,
            readOnly: this.props.readOnly,
            value: this.props.value
        };
    }

    onChange(fun: Function): void{}

    setValue(value: any, callback?: Function) {
        if(this.props.form) {
            this.triggerChange(value, callback);
        }else {
            this.setState({
                value
            }, () => {
                if(callback) {
                    callback();
                }
            });
        }
    }

    getValue() {
        return this.state.value;
    }
    
    validate(fun?: Function): boolean {
        if(this.props.form) {
            return this.props.form.validateField(this.props.name, fun);
        }
        return true;
    }

    enableValidation(params: any) {
        if(this.props.form) {
            let state = this.state;
            let newState = G.G$.extend({},state, {
                validation: true
            }); 
            if(params){
                let _validateProps = G.G$.extend(this.props,params);
                newState = G.G$.extend({},newState, {
                    rules: Validator.getValidators(_validateProps, this.constructor)
                });
            }
            this.props.form.setFormTagState(this.props.name, newState);
        }
    }

    disableValidation() {
        if(this.props.form) {
            let state = this.state;
            let newState = G.G$.extend({},state, {
                validation: false
            }); 
            this.props.form.setFormTagState(this.props.name, newState);
        }
    }

    /**
     * 添加一个验证器
     * @param rule 
     */
    addValidatorRule(rule: Validator) {
        if(this.props.form) {
            if(rule instanceof Validator) {
                this.props.form.addValidatorRule(this.props.name, rule);
            }else {
                console.error("不是一个正确的验证器类型，请使用G.validator.createValidator({name:'',})");
            }
        }
    }

    /**
     * 清空控件数据
     */
    clear() {
        if(this.props.form) {
            if(this.state.value instanceof Array) {
                this.setValue([]);
            }else if(this.state.value instanceof Object) {
                this.setValue({});
            }else if(this.state.value instanceof Number){
                this.setValue(0);
            }else {
                this.setValue("");
            }
        }
    }

    reset(){
        if(this.props.form) {
            this.props.form.reset(this.props.name);
        }
    }

    /**
     * 获取控件验证信息
     */
    getValidateMessage() {
        if(this.props.form) {
            return this.props.form.getError(this.props.name);
        }
        return null;
    }

    isFormTag() {
        return true;
    }

    //只读
    readonly(readOnly?:boolean) {
        this.setState({
            readOnly: readOnly == null ? true : readOnly
        });
    }

    isReadonly(){
        if(this.state.readOnly == true)
            return true;
        else
            return false;
    }
    
}