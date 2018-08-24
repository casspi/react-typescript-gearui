import * as FormTag from "./FormTag";
import * as React from 'react';
import { Input as AntdInput, Icon as AntdIcon, Button as AntdButton } from "antd";
import { InputProps } from "antd/lib/input";
import { UUID } from "../../utils";
export var props = {
    ...FormTag.props,
    icon: GearType.String,
    buttonText: GearType.String,
    buttonIcon: GearType.String,
};
export interface state extends FormTag.state {
    
};
export default class Text<P extends typeof props & InputProps, S extends (state & InputProps)> extends FormTag.default<P, S> {

    constructor(props: P, context: {}) {
        super(props, context);
    }

    //获取前置标签
    getAddonBefore() {
        if (typeof this.props.addonBefore == "string") {
            return this.props.addonBefore;
        } else {
            let addonBefore: any = this.props.addonBefore;
            addonBefore = G.$(addonBefore);
            //需要从document文档中把节点删掉
            if (addonBefore.remove) {
                addonBefore.remove();
            }
            return addonBefore;
        }
    }

    //获取后置标签
    getAddonAfter() {
        if (typeof this.props.addonAfter == "string") {
            return this.props.addonAfter;
        } else {
            let addonAfter:any = this.props.addonAfter;
            addonAfter = G.$(addonAfter);
            //需要从document文档中把节点删掉
            if (addonAfter.remove) {
                addonAfter.remove();
            }
            return addonAfter;
        }
    }

    //获取前置图标
    getPrefix() {
        if (typeof this.props.prefix == "string") {
            return this.props.prefix;
        } else {
            let prefix: any = this.props.prefix;
            prefix = G.$(prefix);
            if (prefix.remove) {
                prefix.remove();
            }
            return prefix;
        }
    }

    //根据传入的参数动态创建控件
    protected createControl(options?:Array<any>){
        let controls = [];
        if(options && options instanceof Array){
            
            for(let i=0;i<options.length;i++){
                let ele = options[i];
                let ctype = ele["ctype"];
                delete ele["ctype"];
                let text = ele["text"];
                delete ele["text"];
                ele["key"] = UUID.get();
                let children = ele["children"];
                if(children){
                    children = this.createControl(children);
                }
                if(ctype=="icon"){
                    controls.push(<AntdIcon {...ele}></AntdIcon>);
                }else if(ctype=="button"){
                    controls.push(<AntdButton {...ele}>{text}</AntdButton>);
                }
            }
        }
        return controls;
    }  

    //获取后置图标
    getSuffix(options?:Array<any>) {
        let controls = [];
        // 如果定义了按钮文本或图标，则添加一个按钮
        if(options){
            if(options instanceof Array == false)
                options = [options];
            let ctls = this.createControl(options);
            if(ctls){
                for(var i=0;i<ctls.length;i++){
                    controls.push(ctls[i]);
                }
            }
        }
        
        if(this.props.icon){
            // 包装一个span用于响应鼠标效果和事件
            let spanProps = {
                key: UUID.get(),
                type: this.props.icon,
                style: {cursor:"pointer"},
                onClick: (e: any) => {
                    //控件基础改变事件
                    this.focus(e);
                    //执行自定义注册的事件
                    this.doEvent("clickIcon", e);
                }
            };
            controls.push(<AntdIcon {...spanProps}/>);
        }       
        // 如果定义了按钮文本或图标，则添加一个按钮
        if(this.props.buttonText || this.props.buttonIcon){
            let button;
            let clickButtonEvent = (e: any) => {
                //控件基础改变事件
                this.focus(e);
                //执行自定义注册的事件
                this.doEvent("clickButton", e);
            };
            if(this.props.buttonText && this.props.buttonIcon){
                button = <AntdButton key={UUID.get()} icon={this.props.buttonIcon} onClick={clickButtonEvent}>{this.props.buttonText}</AntdButton>
            }else if(this.props.buttonText){
                button = <AntdButton key={UUID.get()} onClick={clickButtonEvent}>{this.props.buttonText}</AntdButton>
            }else if(this.props.buttonIcon){
                button = <AntdButton key={UUID.get()} icon={this.props.buttonIcon} onClick={clickButtonEvent}/>
            }
            controls.push(button);
        }  
        return controls;
    }

    getInitialState():state & InputProps {
        return {
            placeholder: this.props.placeholder,
            size: this.props.size,
            disabled: this.props.disabled,
            readOnly: this.props.readOnly,
            addonBefore: this.getAddonBefore(),
            addonAfter: this.getAddonAfter(),
            prefix: this.getPrefix(),
            suffix: this.getSuffix(),  
            value: this.props.value,
            onChange: (event)=>{
                this.setValue(event.target.value);
            }
        };
    }

    render() {
        return <AntdInput {...this.state}></AntdInput>;
    }
}