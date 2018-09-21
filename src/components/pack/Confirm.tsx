import { Popconfirm } from 'antd';
import * as React from 'react';
import * as Button from '../basic/Button';
export var props = {
    ...Button.props,
    type: GearType.Enum<"link"|"button">(),
    title: GearType.String,
    onConfirm: GearType.Function,
    onCancel: GearType.Function,
    okText: GearType.String,
    cancelText: GearType.String,
    value: GearType.String,
    
};

export interface state extends Button.state {
    okText?: string;
    cancelText?: string;
    value?: string;
}

export default class Confirm<P extends typeof props, S extends state> extends Button.default<P, S> {

    render() {
        if(this.props.type == "link") {
            return <Popconfirm {...this.getProps()}>
                <a style={this.props.style}>{this.state.value}</a>
            </Popconfirm>;
        }else {
            return <Popconfirm {...this.getProps()}>
                {super.render()}
            </Popconfirm>;
        }
        
    }

    confirm(fun: Function) {
        if(fun && (typeof fun) == "function") {
            this.bind("confirm", fun);
        }else {
            this.doEvent("confirm");
        }
    }

    cancel(fun: Function) {
        if(fun && (typeof fun) == "function") {
            this.bind("cancel", fun);
        }else {
            this.doEvent("cancel");
        }
    }

    getProps() {
        return G.G$.extend({},this.state,{
            title: this.state.title,
            okText: this.state.okText,
            cancelText: this.state.cancelText,
            onConfirm: (e: any) => {
                this.doEvent("confirm", e);
            },
            onCancel: (e: any) => {
                this.doEvent("cancel", e);
            }
        });
    }

    getInitialState(): state {
        return {
            title: this.props.title,
            okText: this.props.okText,
            cancelText: this.props.cancelText,
            value: this.props.value
        };
    }
}