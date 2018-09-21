import * as Tag from "./Tag";
import * as React from 'react';
import { GearUtil } from "../utils";

export var props = {
    value: GearType.Object,
    ...Tag.props
};

export interface state extends Tag.state {
    options: object;
    components: any[];
}

export default class Component<P extends typeof props, S extends state> extends Tag.default<P, S> {

    private controls = {};

    getInitialState(): state {
        return {
            options: this.props.value,
            components:this.toComponents(this.props.value),
        };
    }

    getProps() {  
        let state: any = G.G$.extend({},this.state);
        delete state.options;
        delete state.components;
        return state;
    }

    render() {
        let props = this.getProps();
        let components = this.state.components;
        return <div {...props}>{components}</div>;
    }

    private toComponents(opts: any){
        let options;
        if(opts)
            options = opts;
        else{
            if(this.state)
                options = this.state.options;
        }
        let components = [];
        if(options){
            if(options instanceof Array){
                for(var i=0;i<options.length;i++){
                    components.push(this.toComponent(options,options[i],"c"+i));
                }
            }else{
                components.push(this.toComponent(options,options,"c0"));
            }
        }
        return components;
    }

    private toComponent(options: any,option: any,key: any){
        let controlType = option.ctype;
        let props: any = GearUtil.toProps(option);

        props = G.G$.extend({},props,{
            key:key,
            onChange:(value: any) => {
                let oldValue = G.G$.extend({},options);
                option.value = value;
                this.doEvent("change",options,oldValue);
            },
            ref:(ele: any)=>{
                this.controls[key] = ele;
            }
        });
        delete props.ctype;
        return GearUtil.newInstanceByType(controlType,props);
    }

    afterRender() {
        this.doEvent("afterRender",true);
    }

    afterUpdate() {
        this.doEvent("afterRender",false);
    }

    setValue(options: any){
        if(options){
            this.setState({
                options: options,
                components:this.toComponents(options),
            });
        }
    }

    getValue(){
        return this.state["options"];
    }

    getText(){
        let components = this.getComponents();
        if(components){
            if(components instanceof Array){
                let texts = [];
                for(var i=0;i<components.length;i++){
                    var component = components[i];
                    var t = null;
                    if(component){
                        t = component.getText();
                    }
                    texts.push(t);
                }
                return texts;
            }else{
                return components.getText();
            }
        }
        return null;
    }

    validate():boolean {
        debugger;
        let components = this.getComponents();
        if(components){
            if(components instanceof Array){
                for(var i=0;i<components.length;i++){
                    var component = components[i];
                    if(component.validate()==false){
                        return false;
                    }
                }
                return true;
            }else{
                return components.validate();
            }
        }
        return true;
    }

    //得到产生的控件
    getComponents(){
        let options = this.state["options"];
        if(options){
            if(options instanceof Array){
                let components = [];
                for(var i=0;i<options.length;i++){
                    components.push(this.controls["c"+i]);
                }
                return components;
            }else{
                return this.controls["c0"];
            }
        }
        return null;
    }

    //禁用
    disable() {
        this.setState({
            disabled: true
        },()=>{
            let components = this.getComponents();
            if(components){
                if(components instanceof Array){
                    for(var i=0;i<components.length;i++){
                        components[i].disable();
                    }
                }else{
                    components.disable();
                }
            }
        });
    }

    //启用
    enable() {
        this.setState({
            disabled: false
        },()=>{
            let components = this.getComponents();
            if(components){
                if(components instanceof Array){
                    for(var i=0;i<components.length;i++){
                        components[i].enable();
                    }
                }else{
                    components.enable();
                }
            }
        });
    }   
    
    focus(...args: any[]) { 
        let components = this.getComponents();
        if(components){
            if(components instanceof Array){
                if(components.length>0)
                    components[0].focus(...args);
            }else{
                components.focus(...args);
            }
        }
    }

    blur(...args: any[]){
        let components = this.getComponents();
        if(components){
            if(components instanceof Array){
                if(components.length>0)
                    components[0].blur(...args);
            }else{
                components.blur(...args);
            }
        }
    }
}