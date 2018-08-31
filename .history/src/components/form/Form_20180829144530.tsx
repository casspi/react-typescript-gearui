import * as Tag from "../Tag";
import { Form as AntdForm } from 'antd';
import { FormComponentProps } from 'antd/es/form/Form';
import { FormTag } from '.';
import * as React from 'react';
import { ObjectUtil } from "../../utils";
import { Validator } from "../../validator";
import Tooltip from "../pack/Tooltip";
export var props = {
    //是否验证隐藏控件，在validator中使用
    validateHidden: GearType.Boolean,
    invalidType: GearType.String,
    ...Tag.props
};
export interface state extends Tag.state {
    //控件是否开启验证，每一个控件都存储
    formTagStates: {[idx: string]: FormTag.state},
    invalidType?: string
};

export class Form<P extends (typeof props & FormComponentProps), S extends state> extends Tag.default<P, S> {

    private values = {};

    constructor(props: P, context: {}) {
        super(props, context);
    }

    afterReceiveProps(nextProps: P) {
        console.log(nextProps);
        return {};
    }

    getInitialState(): state {
        this.values = {};
        let initFormTagState = this.getInitFormTagStates();
        return {
            formTagStates: initFormTagState,
            invalidType: this.props.invalidType
        };
    }

    render() {
        let items = this.getFormItems();
        return (<AntdForm>
            {items}
        </AntdForm>);
    }

    private getInitFormTagStates(): {[idx: string]:FormTag.state} {
        let children = this.props.children;
        let formTagStates:{[idx: string]:FormTag.state} = {};
        if(children instanceof Array) {
            children.map((child:any, index)=>{
                if(child && child.type && (ObjectUtil.isExtends(child.type, "FormTag")) || ObjectUtil.isExtends(child.type, "Validate")) {
                    //如果是validate标签
                    let childReactNode: any = child;
                    let validateReactNode: any = child;
                    if(ObjectUtil.isExtends(child.type, "Validate")) {
                        childReactNode = child.props.children[0];
                    }
                    let tagName = childReactNode.props.name;
                    let rules = this.getRules(tagName, validateReactNode);
                    let validation = this.getValidation(tagName, validateReactNode);
                    
                    let invalidType = this.getInvalidType(tagName, validateReactNode);
                    formTagStates[tagName] = {
                        validation,
                        invalidType,
                        rules
                    };
                }
            });
        }
        return formTagStates;
    }

    /**
     * 获取所有的FormItem标签
     */
    private getFormItems() {
        let childrenItems: any = [];
        let children = this.props.children;
        if(children instanceof Array) {
            children.map((child:any, index)=>{
                let formItem = child;
                if(child && child.type && (ObjectUtil.isExtends(child.type, "FormTag")) || ObjectUtil.isExtends(child.type, "Validate")) {
                    //如果是validate标签
                    let childReactNode: any = child;
                    let validateTag = null;
                    //如果是validate控件，需要特殊处理
                    if(ObjectUtil.isExtends(child.type, "Validate")) {
                        childReactNode = child.props.children[0];
                        let validateProps = G.G$.extend({},child.props,{
                            children: [],
                            form: this,
                            key: this.props.id + "_validateTag_" + index
                        });
                        delete validateProps.value;
                        validateTag = React.createElement(child.type, validateProps, validateProps.children);
                    }
                    let tagName = childReactNode.props.name;
                    let rules: any = this.getRules(tagName);
                    let props: any = this.getFormTagProps(index, tagName);
                    let validation = this.getValidation(tagName);
                    //合并新的信息，将当前存储的tagname对应state信息合并到props，并传递给formTag
                    props = G.G$.extend({}, childReactNode.props, props, this.state.formTagStates[tagName], {
                        needUpdateToState: ["validation", "invalidType", "rules","data-__field", "data-__meta"]
                    });
                    console.log(props);
                    delete props.value;
                    let formTag: any = React.createElement(childReactNode.type, props, props.children);
                    let initialValue = this.values[tagName] || childReactNode.props.value;
                    formTag = this.props.form.getFieldDecorator(tagName,{
                        initialValue: initialValue,
                        rules: validation ? rules: []
                    })(formTag);
                    let formItemChildren = formTag;
                    //如果验证节点存在，将验证节点和formtag节点放一起
                    if(validateTag != null) {
                        formItemChildren = [formTag, validateTag];
                    }
                    formItem = this.getFormItem(formItemChildren, index);
                }
                childrenItems.push(formItem);
            });
        }
        return childrenItems;
    }

    /**
     * 获取扩展的formTag的Props
     * @param index 
     */
    private getFormTagProps(index: number, name: string) {
        return {
            form: this,
            key: this.props.id + "_tag_" + index,
            invalidType: this.getInvalidType(name)
        };
    }

    /**
     * 获取一个FormItem的标签
     * @param formTag formTag标签
     */
    private getFormItem(formTag: React.SFCElement<typeof FormTag.props & {form: Form<typeof props & FormComponentProps, state> ,key: string}>, index: number) {
        let props:any = formTag.props;
        if(formTag instanceof Array) {
            props = formTag[0].props;
        }
        let tagName = props.name;
        let validateStatus:'success' | 'warning' | 'error' | 'validating' = "success";
        let help = null;
        let invalidType = this.getInvalidType(tagName);
        if(props) {
            let errors = this.props.form.getFieldError(tagName);
            if(errors && errors.length > 0) {
                validateStatus = "error";
                help = errors[0];
                // 表单验证方式，优先取控件本身的，如果控件本身无配置再获取form上的
                if(invalidType == "fixed") {
                    let ele = Tooltip.addInvalidTooltip(formTag,tagName,null,this.getFormTagState(tagName).titleAlign||props.titleAlign);
                    return <AntdForm.Item
                        validateStatus={validateStatus}
                        help={help}
                        key={this.props.id + "_form_item_" + index}
                        label={props.label} 
                    >{ele}</AntdForm.Item>;
                }else {
                    let ele = Tooltip.addInvalidTooltip(formTag,tagName,help,this.getFormTagState(tagName).titleAlign||props.titleAlign);
                    return <AntdForm.Item required key={this.props.id + "_form_item_" + index} className={"ant-form-item-with-float-help"}
                        validateStatus={validateStatus}
                        label={props.label} 
                        help={""}
                    >{ele}</AntdForm.Item>;
                }
            }else {
                let ele = Tooltip.addTooltip(formTag,this.getFormTagState(tagName).title||props.title,this.getFormTagState(tagName).titleAlign||props.titleAlign);
                if(invalidType == "fixed") {
                    return <AntdForm.Item label={props.label} key={this.props.id + "_form_item_" + index}>{ele}</AntdForm.Item>;
                }else{
                    return <AntdForm.Item label={props.label} key={this.props.id + "_form_item_" + index} className={"ant-form-item-with-float-help"}>{ele}</AntdForm.Item>;
                }
            }
        }
        return <AntdForm.Item {...props} key={this.props.id + "_form_item_" + index}>
            {formTag}
        </AntdForm.Item>;
    }

    //根据tag名称获取对应的校验器
    public getRules(tagName: string, validateReactNode?: any) {
        if(validateReactNode == null) {
            if(this.state && this.state.formTagStates) {
                return this.state.formTagStates[tagName].rules;
            }
            return [];
        }else {
            let props = validateReactNode.props;
            let clazz = validateReactNode.type;
            return Validator.getValidators(props, clazz);
        }
    }

    //是否开启验证
    public getValidation(tagName: string, validateReactNode?: any): boolean | undefined {
        if(validateReactNode == null) {
            if(this.state && this.state.formTagStates) {
                return this.state.formTagStates[tagName].validation;
            }
            return true;
        }else {
            let props = validateReactNode.props;
            return props.validation != false;
        }
    } 

    //验证提示类型
    public getInvalidType(tagName: string, validateReactNode?: any): string | undefined {
        if(validateReactNode == null) {
            if(this.state && this.state.formTagStates) {
                return this.state.formTagStates[tagName].invalidType || this.state.invalidType;
            }
            return this.state.invalidType;
        }else {
            let props = validateReactNode.props;
            return props.invalidType || this.props.invalidType;
        }
    } 

    /**
     * 获取指定控件的state
     * @param tagName 
     */
    public getFormTagState(tagName: string): FormTag.state {
        if(this.state && this.state.formTagStates) {
            return this.state.formTagStates[tagName];
        }
        return {};
    }

    public validateHidden() {
        return this.props.validateHidden;
    }

    /**
     * 修改指定控件的state
     * @param tagName 控件名称
     * @param state 控件state对象
     */
    public setFormTagState(tagName: string, state: FormTag.state, callback?: ()=>void) {
        let stateClone = G.G$.extend({}, state);
        let formTagStates = this.state.formTagStates;
        formTagStates[tagName] = stateClone;
        this.setState({
            formTagStates
        }, callback);
    }

    //设置一个form控件的值
    public setFieldValue(name: string, value: any, callback?: Function) {
        this.values[name] = value;
        let params = {};
        params[name] = value;
        this.props.form.setFieldsValue(params);
        this.validateField(name, callback);
    }

    //验证一个form控件
    validateField(name: string, callback?: Function): boolean {
        let result: boolean = false;
        this.props.form.validateFieldsAndScroll([name],{force:true},(err, values) => {
            if(!err) {
                result = true;
            }
            if(callback) {
                callback.call(this);
            }
        });
        return result;
    }

    /**
     * 为指定的控件增减验证器
     * @param name 
     * @param rule 
     */
    addValidatorRule(name: string, rule: Validator) {
        let formTagStates = this.state.formTagStates;
        let formTagState = formTagStates[name];
        let rules = formTagState.rules || [];
        rules.push(rule);
        formTagState.rules = rules;
        formTagStates[name] = formTagState;
        this.setState({
            formTagStates
        });
    }

    /**
     * 获取指定控件的验证错误信息
     * @param name 
     */
    getError(name: string) {
        let errors = this.props.form.getFieldError(name);
        return errors;
    }

    /**
     * 重置控件的值
     */
    resetFieldValue(name: string) {
        this.props.form.resetFields([name]);
    }

}
export default AntdForm.create({})(Form);