import * as Tag from "../Tag";
import * as React from 'react';
import { Button as AntdButton, Icon as AntdIcon } from 'antd';
import { Http } from "../../utils";
export declare type ButtonStype = 'primary' | 'ghost' | 'dashed' | 'danger';
export declare type ButtonShape = 'circle' | 'circle-outline';
export declare type ButtonSize = 'small' | 'large';
export var props = {
    url: GearType.Or<Function, string>(GearType.Function, GearType.String),
    target: GearType.String,
    buttonStyle: GearType.Enum<ButtonStype>(),
    shape: GearType.Enum<ButtonShape>(),
    size: GearType.Enum<ButtonSize>(),
    icon: GearType.String,
    loading: GearType.Or(GearType.Boolean, {delay: 0}),
    delay: GearType.Number,
    ghost: GearType.Boolean,
    iconAlign: GearType.String,
    selected: GearType.Boolean,
    selectedType: GearType.Enum<ButtonStype>(),
    plain: GearType.Boolean,
    group: GearType.String,
    text: GearType.String,
    value: GearType.String,
    ...Tag.props
}
export interface state extends Tag.state {
    iconAlign?: string;
    icon?: string;
    text?: string;
    ghost?: boolean;
    type?: ButtonStype;
    shape?: ButtonShape,
    size?: ButtonSize,
    loading?: boolean | {delay: number},
    url?: string | Function,
}
export default class Button<P extends typeof props, S extends state> extends Tag.default<P, S> {

    getInitialState(): state {
        return {
            onClick: this.clickEvent.bind(this),
            ghost: this.props.ghost,
            type: this.props.buttonStyle,
            shape: this.props.shape,
            size: this.props.size,
            loading: this.props.loading,
            icon: this.props.icon,
            text: this.props.value || this.props.text,
            url: this.props.url,
        };
    }

    render() {
        let state: state = G.G$.extend({}, this.state);
        if(state.iconAlign == "right" && this.state.icon && this.state.text) {
            delete state.icon;
            let icon:any = this.state.icon;
            return <AntdButton {...state}>{this.props.children || this.state.text || ''}<AntdIcon type={icon}></AntdIcon></AntdButton>;
        }else {
            return <AntdButton {...state}>{this.props.children || this.state.text || ''}</AntdButton>;
        }
    }

    click(fun: Function) {
        if (fun && G.G$.isFunction(fun)) {
            this.bind("click", fun);        
        }else {
            this.clickEvent.call(this);
        }
    }

    // 点击事件
    protected clickEvent(e?: any) {
        e = e || window.event;
        let triggerLink = true;
        // 如果click函数有返回值，且返回值为false，则不触发url转向
        let ret = this.doEvent("click", e);
        if(ret!=null && ret instanceof Array){
            for(let i=0;i<ret.length;i++){
                if(ret[0]!=null && ret[0]==false){
                    triggerLink = false;
                    break;
                }
            }
        }
        if(triggerLink==true){
            let url = this.state.url;
            if(url && url.length>0){
                let target = this.props.target;
                Http.triggerHyperlink(url,target);    
            }      
        }
    }

    setText(text: string){
        this.setState({
            text
        });        
    }

    getText() {
        return this.state["text"];
    }

    getValue() {
        return this.getText();
    }

    setValue(text: string) {
        this.setText(text);
    }

    // 选中
    select(){
        this.addClass("active");
    }

    // 取消选中
    unselect(){
        this.removeClass("active");
    }

    // 是否被选中
    isSelection(){
        return this.hasClass("active");
    }

    // 设置loading状态
    setLoading(loading: boolean | number){
        if(loading){
            if(typeof loading == "number"){
                this.setState({
                    loading:{
                        delay: loading
                    }
                });
            }else{
                this.setState({
                    loading
                });
            }
        }else{
            this.setState({
                loading: false
            });
        }
    }

}