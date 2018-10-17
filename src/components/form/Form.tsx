import * as Tag from "../Tag";
import { Form as AntdForm } from 'antd';
import { FormComponentProps } from 'antd/es/form/Form';
import { FormTag } from '.';
import * as React from 'react';
import { ObjectUtil, UUID } from "../../utils";
import { Validator } from "../../validator";
import Tooltip from "../pack/Tooltip";
import Http, { methods } from '../../utils/http';
export var props = {
    //是否验证隐藏控件，在validator中使用
    validateHidden: GearType.Boolean,
    invalidType: GearType.String,
    ...Tag.props,
    showProgress: GearType.Boolean,
    action: GearType.Or(GearType.String, GearType.Function),//表单提交的地址，如果不设置则默认会使用请求当前页面的servletPath
    method: GearType.Enum<methods>(),//表单提交方式，取值范围包括post、get、put、delete默认为post
    target: GearType.String,//表单提交时的目标窗口
    iframe: GearType.Boolean,//是否以iframe的方式提交
    ajax: GearType.Boolean,//提交表单时是否使用ajax提交，默认为true
    redirect: GearType.String,//提交完成之后转向的路径，仅ajax或iframe方式可用
};
export interface state extends Tag.state {
    //控件是否开启验证，每一个控件都存储
    formTagStates: {[idx: string]: FormTag.state},
    invalidType?: string;
    otherParams?: any;
    showProgress?: boolean;
    action?: string|Function;
    iframe?: boolean;
    validateHidden?: boolean;
    target?: string;
    ajax?: boolean;
    method?: methods;
    redirect?: string;
    validate?: boolean;
};

export class Form<P extends (typeof props & FormComponentProps), S extends state> extends Tag.default<P, S> {

    private values = {};

    constructor(props: P, context: {}) {
        super(props, context);
    }

    afterReceiveProps(nextProps: P) {
        return {};
    }

    getInitialState(): state {
        this.values = {};
        let initFormTagState = this.getInitFormTagStates();
        return {
            formTagStates: initFormTagState,
            invalidType: this.props.invalidType,
            validateHidden: this.props.validateHidden,
            showProgress: this.props.showProgress,
            otherParams: {},
            action: this.props.action,
            iframe: this.props.iframe,
            target: this.props.target,
            ajax: this.props.ajax,
            method: this.props.method,
            validate: true,
            redirect: this.props.redirect
        };
    }

    private getProps() {
        if(this.state.ajax == false){
            return {
                encType: "multipart/form-data"
            };
        }
        return {};
    }

    render() {
        let items = this.getFormItems();
        return (<AntdForm {...this.getProps()}>
            {items}
        </AntdForm>);
    }

    private getInitFormTagStates(): {[idx: string]:FormTag.state} {
        let children = this.props.children;
        if(!(children instanceof Array)) {
            children = [children];
        }
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
    private getFormItems(children?: any) {
        let childrenItems: any = [];
        children = children || this.props.children || [];
        if(!(children instanceof Array)) {
            children = [children];
        }
        children.map((child:any, index: number)=>{
            let formItem = child;
            if(child && child.type && ((ObjectUtil.isExtends(child.type, "FormTag")) || ObjectUtil.isExtends(child.type, "Validate"))) {
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
            }else {
                formItem = this.loopGetFormItems(child, index);
            }
            childrenItems.push(formItem);
        });
        this.addMethodParam(children.length);
        return childrenItems;
    }

    //递归获取子节点中的formTag
    private loopGetFormItems(child: any, index: number) {
        if(child && child.props && child.props.children) {
            let children = child.props.children;
            let props: any = {};
            if(child && child.type && ObjectUtil.isExtends(child.type, "EditTable")) {
                props = {form: this};
            }
            return React.cloneElement(child, props, this.getFormItems(children));
        }
        return child;
    }

    private addMethodParam(index: number) {
        let method = this.state.method;
        if(method && method.toLowerCase() == "put") {
            let formTag: any = this.props.form.getFieldDecorator("_method",{
                initialValue: "put",
                rules: []
            })(<input type="hidden" name="_method"/>);
            let formItem = this.getFormItem(formTag, index);
            return formItem;
        }
        return null;
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
                        label={props.labelText} 
                    >{ele}</AntdForm.Item>;
                }else {
                    let ele = Tooltip.addInvalidTooltip(formTag,tagName,help,this.getFormTagState(tagName).titleAlign||props.titleAlign);
                    return <AntdForm.Item required key={this.props.id + "_form_item_" + index} className={"ant-form-item-with-float-help"}
                        validateStatus={validateStatus}
                        label={props.labelText} 
                        help={""}
                    >{ele}</AntdForm.Item>;
                }
            }else {
                let ele = Tooltip.addTooltip(formTag,this.getFormTagState(tagName).title||props.title,this.getFormTagState(tagName).titleAlign||props.titleAlign);
                if(invalidType == "fixed") {
                    return <AntdForm.Item label={props.labelText} key={this.props.id + "_form_item_" + index}>{ele}</AntdForm.Item>;
                }else{
                    return <AntdForm.Item label={props.labelText} key={this.props.id + "_form_item_" + index} className={"ant-form-item-with-float-help"}>{ele}</AntdForm.Item>;
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
            return props.invalidType || this.state.invalidType;
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
        return this.state.validateHidden;
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
    reset(name?: string) {
        if(name) {
            this.props.form.resetFields([name]);
        }else {
            this.props.form.resetFields();
        }
    }

    //添加参数的隐藏域
    addParams() {
        //先删除所有的隐藏域
        this.removeAllHiddens(true);
        //获取当前修改过的字段的数据---暂时未实现
        let values = this.props.form.getFieldsValue();
        for(let key in values) {
            let gearObjs = G.$("[name='" + key + "']");
            if(gearObjs.length && gearObjs.length > 1 && gearObjs.eq) {
                for(let i=0; i < gearObjs.length; i++) {
                    let gearObj = gearObjs.eq(i);
                    this.addParamsValueFormat(gearObj, values, key);
                }
            }else {
                this.addParamsValueFormat(gearObjs, values, key);
            }
            
        }
    }

    private addParamsValueFormat(gearObj: any, values: any, key: any) {
        // text、number、file控件，直接使用自身传值
        if(ObjectUtil.isExtends(gearObj, "Tag") && !(ObjectUtil.isExtends(gearObj, "Text") || ObjectUtil.isExtends(gearObj, "Hidden") || ObjectUtil.isExtends(gearObj, "Number") || ObjectUtil.isExtends(gearObj, "File") || ObjectUtil.isExtends(gearObj, "Label"))){
            let name = gearObj.props.name;
            let value = values[key];
            if(ObjectUtil.isExtends(gearObj, "Date") || ObjectUtil.isExtends(gearObj, "Datetime") || ObjectUtil.isExtends(gearObj, "Time")) {
                value = gearObj.getFormatValue(value);
            }
            //if(name && gearObj.props.disabled != true) {
            if(name && gearObj.isEnable() == true) {
                this.addHiddenValue(name,value,true);
            }
        }
    }

    removeAllHiddens(inner?:boolean){
        this.getHiddenContainer(inner).remove();
    }

    //添加其他参数
    addOtherParams() {
        let otherParams: any = this.state.otherParams;
        if(otherParams) {
            if(otherParams instanceof Array) {
                otherParams.map((ele) => {
                    let eleKey = ele.split("=")[0];
                    let eleVal = ele.split("=")[1];
                    this.setHiddenValue(eleKey,eleVal,true);
                });
            }else {
                for(let key in otherParams){
                    let value = otherParams[key];
                    this.setHiddenValue(key,value,true);
                }
            }
        }
    }

    // 设置指定名称的隐藏字段的值
    setHiddenValue(name: any,value: any,inner?:boolean){
        let hiddenDiv = this.getHiddenContainer(inner);
        value = value || "";
        if(value instanceof Array) {
            // 先删除以前的
            this.removeHiddenValue(name,inner);
            value.forEach((valueInner,index) => {
                this.addHiddenValue(name,valueInner,inner);
            });
        }else {
            // 获取到表单内所有未禁用的指定名称的隐藏控件
            var jinput = hiddenDiv.find("input[type='hidden'][name='"+name+"']").not(":disabled");
            if(jinput.length==0){
                this.addHiddenValue(name,value,inner);
            }else if(jinput.length==1){
                jinput.val(value);
            }else if(jinput.length>1){
                this.removeHiddenValue(name,inner);
                this.addHiddenValue(name,value,inner);
            }
        }
    }

    private getHiddenContainer(inner?:boolean){
        let hiddenDiv;
        if(inner==true){
            hiddenDiv = this.find("div.inner-hidden");
            if(hiddenDiv.length==0){
                hiddenDiv = G.G$("<div class='inner-hidden' style='display:none'></div>")
                this.append(hiddenDiv);
            }
        }else{
            hiddenDiv = this.find("div.hidden");
            if(hiddenDiv.length==0){
                hiddenDiv = G.G$("<div class='hidden' style='display:none'></div>")
                this.append(hiddenDiv);
            }            
        }
        return hiddenDiv;
    }

    // 移除隐藏字段
    removeHiddenValue(name: any,inner?:boolean){
        let hiddenDiv = this.getHiddenContainer(inner);
        hiddenDiv.find("input[type='hidden'][name='"+name+"']").not(":disabled").remove();
    }

    // 向指定名称的隐藏字段中添加值，追加的值以逗号分隔
    appendHiddenValue(name: any,value: any,split?:string,inner?:boolean){
        let hiddenDiv = this.getHiddenContainer(inner);
        // 获取到表单内所有未禁用的指定名称的隐藏控件
        var jinput = hiddenDiv.find("input[name='"+name+"']").not(":disabled");
        value = value || "";
        split = split || ",";
        if(value instanceof Array) {
            let newValue: any = null;
            value.forEach((valueInner,index) => {
                if(newValue==null)
                    newValue = valueInner;
                else
                    newValue = newValue+split+valueInner;
            });
            value = newValue;             
        }
        if(jinput.length==0){
            hiddenDiv.append("<input type='hidden' name='"+name+"' value='"+value+"'/>");
        }else{
            var preValue = jinput.val();
            if(preValue == null || preValue == "")
                jinput.val(value);
            else
                jinput.val(preValue + split + value);
        }        
    }

    // 向表单中追回一个隐藏字段
    addHiddenValue(name: any,value: any,inner?:boolean){
        value = value || "";
        if(value instanceof Array) {
            value.forEach((valueInner,index) => {
                this.addHiddenValue(name,valueInner,inner);
            });            
        }else{
            let hiddenDiv = this.getHiddenContainer(inner);
            hiddenDiv.append("<input type='hidden' name='"+name+"' value='"+value+"'/>");
        }
    }

    // 设置参数
    setForm(param:{action?: any,ajax?: any,method?: any,otherParams?: any},callback?: Function) {
        this.setState(param,()=>{
            if(callback) {
                callback();
            }
        });    
    }

    validate():boolean {
        let result = false;
        if(this.state.validate == true) {
            this.props.form.validateFieldsAndScroll({force:true},(err, values) => {
                if (!err) {
                    result = true; 
                }
            });
            return result;
        }
        return true;
    }

    protected _onSubmit() {
        if(this.state.showProgress != false) {
            this.showProgress();
        }
    }

    // 关闭表单提交时的进度条
    private closeProgress(){
        G.messager.progress("close");
    }    

    // 显示表单提交时的进度条
    private showProgress(){
        G.messager.progress();
    }

    submit(param?: any) {
        let callback;
        if(param){
            if(typeof param == "function")
                // 如果param是函数，则直接作为回调函数
                callback = param;
            else if(typeof param == "object")
                // 如果param是对象，则从对象中获取callback属性
                callback = param.callback;
        }
        let validResult = this.validate();
        if(validResult == true) {
            let bsub:any = this.doEvent("beforeSubmit");
            let sub = true;
            if(bsub && bsub.length > 0) {
                sub = bsub[0];
            }
            if(sub == true && (this.realDom instanceof HTMLFormElement)) {
                this._onSubmit();
                this.doEvent("submit");
                //设置了target以后就直接走同步的form提交
                if(this.state.iframe && this.state.target == null) {
                    this.addParams();
                    this.addOtherParams();
                    this.submitIframe();
                }else {
                    if(this.state.ajax == false || this.state.target != null) {
                        //增加额外参数，只提交修改参数
                        this.addParams(); 
                        this.addOtherParams();
                        this.realDom.submit();
                    }else {
                        this.ajaxSubmit(callback);
                    }
                }
                
            }else{
                if(callback)
                    // 6:业务上处理失败，放弃提交
                    callback.call(this,{status:6,message:"在前置事件中取消了操作！"})                
            }
        }else{
            // 如果验证不成功，则直接触发回调，通知提交完成
            if(callback)
                // 4:数据检查失败
                callback.call(this,{status:4,message:"表单验证不通过！"})
        }
    }
    
    //提交form
    ajaxSubmit(callback?:Function){
        if (window["FormData"] !== undefined){
            this.submitXhr(callback);
        } else {
            this.addParams();
            this.addOtherParams();
            this.submitIframe();
        }
    }

    submitIframe(){
		var frameId = UUID.get();
		var frame = G.G$('<iframe id='+frameId+' name='+frameId+'></iframe>').appendTo('body');
		frame.attr('src', window["ActiveXObject"] ? 'javascript:false' : 'about:blank');
		frame.hide();
		
		let submit = () => {
			var form = G.$(this.realDom);
			if (this.state.action){
				form.attr('action', this.state.action);
			}
			var t = form.attr.target, a = form.attr.action;
			form.attr('target', frameId);
			try {
				checkState();
				form[0].submit();
			} finally {
				form.attr('action', a);
				t ? form.attr('target', t) : form.removeAttr('target');
			}
        }
		
		let checkState = () => {
			var f = G.$('#'+frameId);
			if (!f.length){return}
			try{
				var s = f.contents()[0].readyState;
				if (s && s.toLowerCase() == 'uninitialized'){
					setTimeout(checkState, 100);
				}
			} catch(e){
				cb();
			}
		}
		
		var checkCount = 10;
		let cb = () => {
			var f = G.$('#'+frameId);
			if (!f.length){return}
			f.unbind();
			var data = '';
			try{
				var body = f.contents().find('body');
				data = body.html();
				if (data == ''){
					if (--checkCount){
						setTimeout(cb, 100);
						return;
					}
				}
				var ta = body.find('>textarea');
				if (ta.length){
					data = ta.val();
				} else {
					var pre = body.find('>pre');
					if (pre.length){
						data = pre.html();
					}
				}
			} catch(e){
			}
			this.success(data);
			setTimeout(function(){
				f.unbind();
				f.remove();
			}, 100);
        }
        frame.bind('load', cb);
        submit();
    }
    
    submitXhr(callback?:Function){
        let action: any = this.state.action||""
		G.G$.ajax({
			url: action,
			type: "post",
			xhr: ()=>{
                var xhrMethod = G.G$.ajaxSettings.xhr;
                let xhr: any;
                if(xhrMethod) {
                    xhr = xhrMethod();
                    if (xhr.upload) {
                        xhr.upload.addEventListener('progress', (e: any)=>{
                            if (e.lengthComputable) {
                                var total = e.total;
                                var position = e.loaded || e.position;
                                var percent = Math.ceil(position * 100 / total);
                                this._onProgress(percent);
                                this.doEvent("process",percent);
                            }
                        }, false);
                    }
                }
				return xhr;
			},
			data: this.getParamsAsFormData(),
			dataType: 'html',
			cache: false,
			contentType: false,
			processData: false,
			success: (data, textStatus)=>{
                this.success(data);
                if(callback)
                    callback.call(this,data);
			},
            error: (xhr, textStatus, errorThrown)=>{
                console.error("Error:");
                console.error(xhr);
                let data = {
                    status:98,
                    message:"请求失败，请求的URL不存在或者网络异常"
                };
                this.error(data);
                if(callback)
                    callback.call(this,data);                
            }
		});
    }

    protected _onProgress(percent: any) {

    }
    
    //获取所有的条件
    getParamsAsFormData() {
        this.addParams();
        this.addOtherParams();
        if(window["FormData"] !== undefined) {
            let formData: FormData|undefined;
            if(this.realDom instanceof HTMLFormElement) {
                formData = new FormData(this.realDom);
            }
            return formData;
        }else {
            return this.serializeArray();
        }
    }

    setOtherParams(param: any,callback?: Function) {
        this.setState({
            otherParams: param
        },()=>{
            if(callback) {
                callback();
            }
        });
    }

    getInitValidators(ele?: any) {
        let formTagStates = this.state.formTagStates;
        let validators: any = {};
        for(let key in formTagStates) {
            let rules = formTagStates[key].rules;
            validators[key] = rules;
        }
        return validators;
    }

    success(data: any) {
        if(typeof data == "string") {
            try{
                data = eval("(" + data + ")");
            }catch(e) {
                console.error("Error for:" + data);
                console.error(e);
                //添加错误处理
                this.error({
                    status: 97,
                    message: "无法识别的响应消息"
                });
                return false;
            }
        }
        this.closeProgress();
        this.careMessage(data);
        return true;
    }

    private error(funOrData: any) {
        this.closeProgress();
        this.careMessage(funOrData || {
            status: 98,
            message: "未知错误"
        });
    }

    //处理返回信息
    private careMessage(data: any) {
        if(!data) {
            return false;
        }
        if(data.action && G.G$.isFunction(data.action)) {
            data.action();
        }else {
            if(data.redirect || this.state.redirect) {
                Http.redirect((data.redirect || this.state.redirect));
                return false;
            }else {
                if(data.status == 0){
                    this._onSubmitSuccess(data);
                    
                    if(this.haveEvent("submitSuccess")) {
                        this.doEvent("submitSuccess",data);
                    }else {
                        Form.submitSuccess(data);
                    }
                }else {
                    this._onSubmitFailed(data);
                    if(this.haveEvent("submitFailed")) {
                        this.doEvent("submitFailed",data);
                    }else {
                        Form.submitFailed(data);
                    }
                }
            }
        }
        return true;
    }

    cancel(){}

    load(data: any) {
        this.props.form.setFieldsValue(data);
    }
    enableValidation() {
        this.setState({
            validate: true
        });
    }
    disableValidation() {
        this.setState({
            validate: false
        });
    }
    resetValidation() {
        this.enableValidation();
    }
    resetDirty() {
        // this[this.tagName]("resetDirty");
    }

    focus() {
        this._onFocus();
        this.doEvent("focus");
        let firstPropDom = G.G$(this.realDom).find("input:not(':hidden')").eq(0);
        let firstTag = G.G$(firstPropDom[0]);
        if(firstTag[0]) {
            let inputs = G.G$(this.realDom).find("input:not(':hidden')");
            inputs.each((i,ele)=>{
                let inputTag = G.G$(ele);
                ((inputTag,inputs)=>{
                    inputTag.bind("keyup",(event)=>{
                        //enter键事件
                        if(event.keyCode === 13) {
                            var next_focus = false;
                            for(var i = 0; i < inputs.length; i ++) {
                                var ele = inputs.eq(i);
                                //G.$(ele) instanceof Tag
                                if(next_focus && ele[0] && ele.css("display") != "none") {
                                    ele.focus();
                                    break;
                                }
                                if((ele[0] == inputTag[0]) && i < inputs.length - 1) {
                                    next_focus = true;
                                }
                            }
                            if(!next_focus) {
                                //代表现在是最后一个控件，如果form上的enter提交时打开的，就自动提交form
                                var form = G.$(this.realDom);
                                if(form) {
                                    form.submit();
                                }
                            }
                        }
                    });
                })(inputTag,inputs);
            });
            
            
            firstTag.focus();
        }
    }
    protected _onFocus() {}

    protected _onSubmitFailed(data: any) {}

    protected _onSubmitSuccess(data: any) {}

    static submitSuccess(fun: any) {
    	if(fun && G.G$.isFunction(fun)) {
        	Form.submitSuccess = fun;
        }else {
        	G.messager.alert('消息','操作成功',"info");
        }
        return Form;
    }

    static focus(index: any) {
    	index = index || 0;
    	var form = G.G$(document).find("[ctype='form']").eq(index);
    	if(!form[0]) {
    		return;
        }
        let formTag: Form<typeof props & FormComponentProps, state> = G.$(form[0]);
    	if(form.attr("focus") != "false") {
    		formTag.focus();
    	}else {
    		index = index + 1;
    		Form.focus(index);
    	}
    }
    //全局提交失败的处理
    static submitFailed(funOrData: any) {
        if(funOrData && G.G$.isFunction(funOrData)) {
        	Form.submitFailed = funOrData;
        }else {
            var data = funOrData;
    		if(data.status==1){
    			G.messager.error('错误','请求了错误的路径');
    		}else if(data.status==2){
    			G.messager.error('错误','你没有登录，请先登录');
    		}else if(data.status==3){
    			G.messager.error('错误','你没有访问该功能的权限');
    		}else if(data.status==4){
    			// 提交的数据验证失败
    			if(data.data && data.data.errors){
    				if($("#form-error").length>0){
                        $("#form-error").empty();
    					var errors = data.data.errors;
    					for(var i=0;i<errors.length;i++){
    						$("#form-error").append("<li>"+errors[i].description+"</li>");
    					}
    					$("#form-error").show();
    				}else{
    					var errors = data.data.errors;
    					var errorString = null;
    					for(var i=0;i<errors.length;i++){
    						if(errorString==null)
    							errorString = errors[i].description;
    						else
    							errorString = errorString + "<br>" + errors[i].description;
    					}
    					G.messager.error('错误',errorString);
    				}
    			}
    		}else{
    			// 其它错误
    			if(data.message){
    				G.messager.error('错误',data.message);
    			}else{
    				G.messager.error('错误',"未知错误，请联系系统管理员");
    			}
    		}
        }
        return Form;
    }

}
export default AntdForm.create({})(Form);