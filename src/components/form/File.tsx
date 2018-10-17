import * as React from 'react';
import { Input as AntdInput, Button as AntdButton } from 'antd';
import * as FormTag from './FormTag';
export var props = {
    ...FormTag.props,
    prompt: GearType.String
};

export interface state extends FormTag.state {
    disabled?: boolean;
    prompt?: string;
}

export default class File<P extends typeof props, S extends state> extends FormTag.default<P, S>{

    getInputProps() {
        return {
            key: "input",
            value: this.state.value,
            readOnly: true,
            disabled: this.state.disabled == true || this.state.readOnly == true,
            placeholder: this.state.prompt,
            onClick: (e: any) => {
                this.find("input[type='file']:hidden").click();
                this.doEvent("click",e);
            },
            suffix: <AntdButton key="button" icon={"folder-open"} disabled={this.state["disabled"]} onClick={()=>{
                this.find("input[type='file']:hidden").click();
            }}>{"选择文件"}</AntdButton>,
        };
    }

    getFileInputProps() {
        return {
            key: "file",
            type: "file", 
            name: this.props.name,
            style: { display: "none" },
            "value": this.state.value,
            onChange: (e: any) => {
                let oldValue = this.getValue();
                let newValue = e.target.value;
                this.setValue(newValue);
                this.doEvent("change", newValue, oldValue);
            },
        };
    }    

    //插件初始化，状态发生变化重新进行渲染
    getInitialState() {
        return {
            value: this.props.value,
            disabled: this.props.disabled,
            placeholder: this.props.prompt,
        };
    }
    
    render() {
        return <div {...this.state}>
                <AntdInput {...this.getInputProps()}/>
                <AntdInput {...this.getFileInputProps()}/>
            </div>;
    }

    afterRender() {
        this.find("button").attr("tabindex","-1");
        this.find("input:hidden").attr("tabindex","-1");
    }

    getValue(){
        return this.state.value;
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
    
    // 清除选中值
    clear(){
        this.setState({
            value: undefined
        },()=>{
        });        
    }    
    
    focus(...args: any[]) { 
        this.find("input").focus(...args);      
    }

    blur(...args: any[]){
        this.find("input").blur(...args);
    }  
}