import { Button as AntdButton, Tag as AntdTag, Spin as AntdSpin } from 'antd';
import * as React from 'react';
import * as FormTag from './FormTag';
import * as AutoComplete from './AutoComplete';
import * as Text from './Text';
import { methods } from '../../utils/http';
import * as SelectedTag from './SelectedTag';
import DicUtil from '../../utils/DicUtil';
import { UUID, ObjectUtil } from '../../utils';

export var props = {
    ...FormTag.props,
    inputWidth: GearType.Number,
    repeatAble: GearType.Boolean,
    color: GearType.String,
    inputVisible: GearType.Boolean,
    mustMatch: GearType.Boolean,
    dictype: GearType.Or(GearType.Object, GearType.Function, GearType.String),
    url: GearType.Or(GearType.String, GearType.Function),
    method: GearType.Enum<methods>(),
    controlType: GearType.String,
    dropdownWidth: GearType.Number,
    async: GearType.Boolean,
    limit: GearType.Number,
    rows: GearType.Number,
    value: GearType.Or(GearType.Array, GearType.Function, GearType.String),
    prompt: GearType.String
};

export interface state extends FormTag.state {
    // 可以重复的，默认为false
    repeatAble?: boolean;
    // Tag颜色
    color?: string;
    // 输入框宽度
    inputWidth?: number;
    inputVisible?: boolean;
    loading?: boolean;
    mustMatch?: boolean;
    dictype?: object | string | Function;
    url?: string | Function;
    method?: methods;
    controlType?: string;
    dropdownWidth?: number;
    async?: boolean;
    limit?: number;
    rows?: number;
    value?: any;
    prompt?: string;
}

// 穿梭框
export default class InputTag<P extends typeof props, S extends state> extends FormTag.default<P, S>{

    // 是否严格匹配，主要用于数字代码集的选择，默认为true
    private _inputControl: any;   
    private _triggerButton: any;

    getProps() {
        let state = this.state;
        let className = state.className ? "inputtag-control-wrapper " + state.className : "inputtag-control-wrapper";
        if((this.state.disabled)){
            if(className)
                className = className + " tag-disabled"
            else
                className = "tag-disabled";
        }

        return G.G$.extend(state, {
            className: className
        });        
    }

    getSelectedTagProps(key:string,value:string,text:string){
        return {
            key: key,
            value: value,
            text: text,
            color: this.state.color,
            closable:((this.state.readOnly) || this.state.disabled)?false:true,
            onClose:(e: any) => {
                // 移除当前tag
                this._removeValue(key);
            }
        };
    }   

    getInputProps() {
        return {
            className: "inputtag-text-control",
            style: { width: this.state.inputWidth || 150, display: this.state.inputVisible ? "" : "none" },
            onBlur:() => {
                let value = this._inputControl.getValue();
                let text = this._inputControl.getText();
                if(value && value.length>0) {
                    // 如果设置为不允许重复，先检查是否和现有值重复
                    if(this.state.repeatAble == false) {
                        // 如果不允许重复，先检查值是否已经存在了
                        if(this.existValue(value)==false){
                            this._addValue(value, text);
                        }else{
                            G.messager.simple.info("输入值已存在于选中项中！");
                        }
                    }else {
                        this._addValue(value, text);
                    }
                }
                this._hideInput();
                if(this._triggerButton)
                    this._triggerButton.focus();
            },
            onKeydown: (e: any) => {
                if(e.keyCode==13){
                    if(this.state.mustMatch==false || (this.state.dictype ==null && this.state.url == null)){
                        this.blur();
                    }
                }
            },
            ref:(ele: any)=>{
                this._inputControl = ele;
            },            
        };
    }     

    getAutoCompleteProps() {
        let inputProps = this.getInputProps();
        return G.G$.extend({}, inputProps, {
            dictype: this.state.dictype,
            url: this.state.url,
            mustMatch: this.state.mustMatch,
            controlType: this.state.controlType,
            dropdownWidth: this.state.dropdownWidth || 150,
            async: this.state.async,
            limit: this.state.limit,
            rows: this.state.rows,
            onMatchFormat: (option: any) => {
                this.doEvent("matchFormat", option);
            },
            onBlur: (e: any) => {
                if(this.state.mustMatch){
                    this._hideInput();
                }else{
                    inputProps.onBlur.call(this,e);
                }
            },
            onChange: () => {
                if(this.state.mustMatch){
                    let value = this._inputControl.getValue();
                    let text = this._inputControl.getValue();
                    if(value && value.length>0){
                        // 如果设置为不允许重复，先检查是否和现有值重复
                        if(this.state.repeatAble){
                            // 如果不允许重复，先检查值是否已经存在了
                            if(this.existValue(value)==false){
                                this._addValue(value, text);
                                this._hideInput();
                            }else{
                                G.messager.simple.info("输入值已存在于选中项中！");
                            }
                        }else{
                            this._addValue(value, text);
                            this._hideInput();
                        }
                    }
                }
            }
        });
    }    

    getButtonProps(){
        return {
            style:{
                display:(this.state.inputVisible ? "none" : "")
            },
            onClick:this._showInput.bind(this),
            ref:(ele: any)=>{
                this._triggerButton = ele;
            }            
        };
    }

    //插件初始化，状态发生变化重新进行渲染
    getInitialState(): state {
        return {
            value: this.props.value || [],
            inputVisible: this.props.inputVisible,
            disabled: this.props.disabled,
            loading: false,
            repeatAble: this.props.repeatAble,
            mustMatch: this.props.mustMatch,
            method: this.props.method,
            dictype: this.props.dictype,
            url: this.props.url,
            controlType: this.props.controlType,
            dropdownWidth: this.props.dropdownWidth,
            prompt: this.props.prompt
        };
    }
    
    render() {        
        // 输入框是否可见
        let inputControl;
        let props: any;
        if(this.state.dictype || this.state.url){
            props = this.getAutoCompleteProps();
            inputControl = <AutoComplete.default key={"input"} {...props}></AutoComplete.default>;
        }else{
            props = this.getInputProps();
            inputControl = <Text.default key={"input"} {...props}></Text.default>;
        }
        return <div {...this.getProps()}>
                <AntdSpin size={"default"} spinning={this.state.loading} delay={100}>
                    <div key={"taglist"} className={"tag-list"}>
                        {this.getTags()}
                    </div>
                    {(this.state.readOnly || this.state.disabled) ? null : (
                    <div key={"taginput"} className={"tag-input"}>
                        {inputControl}
                        {<AntdButton key={"button"} size="small" type="dashed" {...this.getButtonProps()}>{this.state.prompt || " + 添加新值"}</AntdButton>}
                    </div>)}
                </AntdSpin>
            </div>;
    }

    //获取所有的标签
    private getTags() {
        let values: any = this.state.value;
        let tags: any[] = [];
        if(values instanceof Array) {
            values.map((value: any)=>{
                let props: any = this.getSelectedTagProps(value.key,value.value,value.text);
                tags.push(<SelectedTag.default key={"tag_"+(value.key)} {...props}/>);
            });
        }
        return tags;
    }

    //渲染完成之后处理默认值
    afterRender() {
        this._loadDefault();
    }

    private _loadDefault(){
        if(this.state.value){
            this.setState({
                loading: true
            },()=>{
                // 如果有设置默认值，支持以逗号分隔的字符串，支持json格式字符串
                if(typeof this.state.value == "string"){
                    // 以逗号分隔的字符串
                    let values: any = this.state.value;
                    if(this.state.dictype && this.state.mustMatch) {
                        let url = this.state.url;
                        let method = this.state.method;
                        let dictype = this.state.dictype;
                        let fn = async () => {
                            let result = await DicUtil.getDic({url, method, dictype});
                            if(result.success) {
                                let message = result.data;
                                this.setValue(message.data);
                            }else {
                                this.setState({
                                    loading: false
                                });
                            }
                        }
                    }else{
                        // 否则直接赋值
                        this.setValue(values);
                    }
                }else{
                    // Json对象或数组
                    let values: any = this.state.value;
                    this.setValue(values);
                }
            });
        }
    }

    // 显示输入控件
    private _showInput(){       
        this.setState({
            inputVisible: true,
        },()=>{
            if(this._inputControl){
                this._inputControl.focus();
            }
        });
    }

    // 隐藏输入框
    private _hideInput(){         
        this.setState({
            inputVisible: false,
        },()=>{
            if(this._inputControl){
                this._inputControl.clear();
            }
        });
    }    

    // 添加一个选中的值
    private _addValue(value: string,text?: string){
        let oldValues = this.getValue();
        let values = this.state.value || [];
        values.push({
            key: UUID.get(),
            value: value,
            text: text
        });
        this.setState({
            value: values
        },()=>{
            this._change(this.getValue(),oldValues);
        });
    }

    private _removeValue(key: string){
        let oldValues = this.getValue();
        let values = this.state.value;
        if(values){
            let newValues = [];
            for(var i=0;i<values.length;i++){
                if(values[i].key!=key){
                    newValues.push(values[i]);
                }
            }
            this.setState({
                value: newValues
            },()=>{
                this._change(this.getValue(),oldValues);
            });
            
        }
    }

    // 判断当前选中值中是否有指定的值
    private existValue(value: string): boolean{
        let values: any = this.state.value || [];
        for(var i=0; i<values.length; i++){
            if(values[i].value == value) {
                return true;
            }
        }
        return false;
    }

    private _change(newValues: any, oldValues: any){
        this.setValue(newValues);
        this.doEvent("change",newValues,oldValues);
    }

    getValue(): Array<string> {
        let v = [];
        let values = this.state.value || [];
        for(var i=0;i<values.length;i++){
            v.push(values[i].value);
        }        
        return v;
    }

    getText(): Array<string>{
        let v = [];
        let values = this.state.value || [];
        for(var i=0;i<values.length;i++){
            v.push(values[i].text);
        }        
        return v;
    }

    setValue(values: Array<any>, callback?: ()=>void){       
        let v: any[] = [];
        if(values){
            if((values instanceof Array) == false){
                values = [values];
            }             
            for(var i=0;i<values.length;i++){
                if(typeof values[i] == "string"){
                    v.push({
                        key:UUID.get(),
                        value:values[i],
                        text:values[i]
                    });
                }else{
                    v.push({
                        key:UUID.get(),
                        value:values[i].value,
                        text:values[i].text || values[i].label || values[i].value
                    });
                }
            }
        }
        
        this.setState({
            loading:true,
        },()=>{
            super.setValue(v);
            this.setState({
                loading: false
            }, callback);
        });
    }

    addValue(value:any, callback?: ()=>void){
        let values = this.state.value || [];
        if(typeof value == "string"){
            values.push({
                key:UUID.get(),
                value:values,
                text:values
            });
        }else{
            values.push({
                key:UUID.get(),
                value:values.value,
                text:values.text || values.label || values.value
            });
        }  
        this.setState({
            loading:true,
        },()=>{
            super.setValue(values);
            this.setState({
                loading: false
            }, callback);
        });    
    }

    removeValue(value: any, callback?: ()=>void){
        if(value){
            let values = this.state.value || [];
            let newValues: any[] = [];
            for(var i=0;i<values.length;i++){
                if(typeof value == "string"){
                    if(value!=values[i].value){
                        newValues.push(values[i]);
                    }
                }else if(value instanceof Array){
                    let match = false;
                    for(var j=0;j<value.length;j++){
                        if(typeof value[j]== "string"){
                            if(value[j]==values[i].value){
                                match = true;
                            }     
                        }else{
                            if(value[j].value==values[i].value){
                                match = true;
                            }                              
                        }                  
                    }
                    if(match==false){
                        newValues.push(values[i]);
                    }
                }else{
                    if(value.value!=values[i].value){
                        newValues.push(values[i]);
                    }
                }
            }
            this.setState({
                loading:true,
            },()=>{
                super.setValue(newValues);
                this.setState({
                    loading: false
                }, callback);
            }); 
        }     
    }

    //只读
    readonly(readonly?:boolean) {
        this.setState({
            readOnly: readonly==null?true:readonly
        });
    }

    //禁用
    disable() {
        this.setState({
            disabled: true
        });
    }

    //启用
    enable() {
        this.setState({
            disabled: false
        });
    }  

    reset(){
        if(this.props.form) {
            super.reset();
        }else {
            this.setValue([], ()=>{
                this._loadDefault();
            });
        }
        
    }

    // 清除选中值
    clear(){
        if(this.props.form) {
            super.clear();
        }else {
            this.setValue([]);
        }
    }    

    focus(...args: any[]) { 
        this.find(".ant-btn").focus(...args);      
    }

    blur(...args: any[]){
        this.find(".ant-btn").blur(...args);
    }     
}