import * as React from 'react';
import { Radio as AntdRadio } from 'antd';
import * as FormTag from './FormTag';
import { RadioProps } from 'antd/lib/radio';
import  DicUtil  from '../../utils/DicUtil';
import { ObjectUtil, Http } from '../../utils';
const AntdRadioGroup = AntdRadio.Group;
export var props = {
    ...FormTag.props,
    value: GearType.Any,          //选中的值
    disabled: GearType.Boolean,   //禁用
    readonly: GearType.Boolean,
    size: GearType.String,        //尺寸
    label: GearType.String,       //单个radio时的label
    checked: GearType.Boolean,    //单选确认选择
    //checkBoxGroup属性
    options: GearType.Boolean,
    url: GearType.String,
    dictype: GearType.Any
};
export interface state extends FormTag.state {
    value:any,
    dictype?: object | string | Function,
    url?: string | Function,
    options:Array<{ label: string,value: string,disabled?: boolean }>,
    refid:string,
    defaultValue:any
}

export default class Radio<P extends typeof props &  RadioProps,S extends state & RadioProps> extends FormTag.default<P,S> {

    constructor(props: P, context: {}) {
        super(props, context);
    }

    //获取当前属性
    getProps() {
        // let superProps = super.getProps();
        // 绑定的change事件
        let changeEvent = function(e:any){
            let oldValue = this.getValue();
            let value = e.target.value;
            this.setState({ value: value },() => {
                let args = [value,oldValue];
                //执行自定义注册的事件
                this.doEvent("change", ...args);
            });
        }.bind(this);
        let state = this.state;
        // if (this.props.url || this.props.dictype) {
            return G.G$.extend({},state, {
                options: this.state.options,
                defaultValue: this.state.defaultValue,
                value: this.state.value,
                checked:this.props.checked || true,
                disabled: this.state.disabled,
                refid:this.state.refid,
                onChange: changeEvent
            });
        // } else {
        //     return G.G$.extend(superProps, {
        //         checked: this.state["checked"],
        //         defaultChecked: this.state["defaultChecked"],
        //         indeterminate: this.state["indeterminate"],
        //         disabled: this.state["disabled"],
        //         value: this.state["value"],
        //         label: this.state["label"],
        //         refid:this.state["refid"],
        //         onChange: changeEvent
        //     });
        // }
    }

    //插件初始化，状态发生变化重新进行渲染
    getInitialState() {
        let state = this.state;
        if (this.props.url || this.props.dictype) {
            return G.G$.extend({}, state, {
                options: this.props.options,
                defaultValue: this.props.value,
                disabled: this.props.disabled || this.props.readonly,
                value: this.props.value
            });
        } else {
            return G.G$.extend({}, state, {
                options: this.props.options,
                //defaultChecked: this.props.checked,
                disabled: this.props.disabled || this.props.readonly,
                value: ""
                //value: this.props.value,
                //label: this.props.label
            });
        }        
    }

    //渲染
    render() {
        let props = this.getProps();
        // if (this.props.url || this.props.dictype) {
            return <AntdRadioGroup {...props}></AntdRadioGroup>;
        // }else{
        //     return <Radio {...props}>{this.props.label}</Radio>;
        // }
        
    }

    afterRender() {
        //this.find(".ant-radio").attr("tabindex","0");
        this.blur(()=>{
            this.removeAttr("tabindex");
        })
        if (this.props.url || this.props.dictype) {
            let url = this.props.url;
            let dictype = this.props.dictype;
            let fn = async () => {
                let result = await DicUtil.getDic({url, dictype});
                if(result.success) {
                    let dic = result.data;
                    if(dic) {
                        this.setState({
                            options: dic
                        });
                    }
                }
            }
            fn();
        }else{
            // 如果是未指定集合的复先框，则使用它本身的label和value来创建集合
            this.setState({
                options: [{
                    label:this.props.label||"",
                    value:this.props.value||"on"
                }]
            });
            // 检查checked属性是否默认为true，如果是则设置它为选中
            if(ObjectUtil.isTrue(this.props.checked)){
                this.setValue(this.props.value||"on");
            }            
        }   
        this.disabledOrReadonly();
    }   

    afterUpdate() {
        this.disabledOrReadonly();
    }
    
    disabledOrReadonly() {
        if(this.props.disabled != true && this.props.readonly == true) {
            let inputs = this.find("input");
            this.find("input").removeAttr("disabled");
        }
    }

    onChange(fun:Function) {
        if (fun && G.G$.isFunction(fun)) {
            this.bind("change", fun);
        }
    }

    // 得到当前数据
    getData(){
        return this.state.options;
    }

    // 设置数据
    setData(options:any){
        return this.setState({options:options});
    }      

    //禁止选择
    disable() {
        let disabled = true;
        this.setState({ disabled: true });
        // let options: Array<any> = this.state["options"];
        // if(options){
        //     options.map(function (ele) {
        //         ele.disabled = true;
        //     });            
        // }
    }

    //开放选择
    enable() {
        let disabled = false;
        this.setState({ disabled: false });
        // let options: Array<any> = this.state["options"];
        // if(options){
        //     options.map(function (ele) {
        //         ele.disabled = false;
        //     });            
        // }
    }

    // 取消选中
    unChecked(){
        this.setValue("");
    }

    //获取值
    getValue(){
        return this.state.value;
    }
    getText() {
        let texts = [];
        let values = this.getValue();
        let options = this.state.options;
        if(options) {
            for(var i=0;i< options.length;i++){
                let arr = new GearArray(values);
                if(arr.contains(options[i].value)) {
                    texts.push(options[i].label);
                }
            }
        }
        return texts;
    }
    // getText() {
    //     let value = this.getValue();
    //     console.log(value);
    //     let options = this.state.options || [];
    //     for(var i=0;i<options.length;i++){
    //         if(ObjectUtil.arrayIndexOf(value,options[i].value)!=-1)
    //             return options[i].label;
    //     }
    //     return null;
    // }    

    //赋值
    setValue(val:any) {
        this.triggerChange(val);
        this.setState({ value: val });
    } 

    focus(...args:any[]) { 
        this.attr("tabindex","0");
        super.focus(...args);      
    }

}