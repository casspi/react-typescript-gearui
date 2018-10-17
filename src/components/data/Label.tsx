import * as React from 'react';
import { Input } from 'antd';
import * as Icon from '../basic/Icon';
import * as Tag from '../Tag'
export var props = {
    ...Tag.props,
    icon: GearType.String,
    prompt: GearType.String,
    format: GearType.String,
    value: GearType.String
};

export interface state extends Tag.state {
    icon?: string;
    prompt?: string;
    format?: string;
    value?: string;
}
export default class Label<P extends typeof props, S extends state> extends Tag.default<P, S> {

    getInitialState(): state {
        return {
            value: this.props.value,
            format: this.props.format,
            prompt: this.props.prompt,
            icon: this.props.icon
        };
    }


    render() {
       
        let value: any = this.state.value;
        if("richtext" == this.state.format){
            if(value){
                // react不支持br，为防止其它地方有问题，这里替换成p
                var array = (value+"").split("\n");
                for(var i=0;i<array.length;i++){
                    value = (value || "") +"<p>"+array[i]+"</p>";
                }
                value = value.replace(/\s/g,"&nbsp;");
            }
        }
        if(this.state.icon){
            var iconProps: any = {
                key:"icon",
                icon: this.state.icon
            };
            return <span {...this.state}><Icon.default {...iconProps}/><span key="text" dangerouslySetInnerHTML={{__html:value}}></span></span>;
        }else
            return <span {...this.state} dangerouslySetInnerHTML={{__html:value}}></span>;
    }

    getValue() {
        return this.state.value;
    }
    
    setValue(value: string) {
        this.setState({
            value
        });
    }
}