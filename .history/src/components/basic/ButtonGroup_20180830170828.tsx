import * as React from 'react';
import * as Tag from '../Tag';
import { Button as AntdButton } from 'antd';
import { ObjectUtil } from '../../utils';
const AntdButtonGroup = AntdButton.Group;
export declare type ButtonType = 'primary' | 'ghost' | 'dashed' | 'danger';
export declare type ButtonShape = 'circle' | 'circle-outline';
export declare type ButtonSize = 'small' | 'large';
export var props = {
    ...Tag.props,
    size: GearType.Enum<ButtonSize>()
}
export interface state extends Tag.state {
    size?: ButtonSize
}
export default class GButtonGroup<P extends typeof props, S extends state> extends Tag.default<P, S> {


    getInitialState(): state {
        return {
            size: this.props.size
        };
    }

    deleteFromInitState(initState: state) {
        for(let key in initState) {
            if(key != "size" && key != "style" && key != "className") {
                delete initState[key];
            }
        }
    }

    render() {
        let buttons = this.getButtons();
        return <AntdButtonGroup {...this.state}>{buttons}</AntdButtonGroup>;
    }

    private getButtons() {
        let buttonJsxs: any[] = [];
        let children = this.props.children;
        if(children instanceof Array) {
            children.map((child: any, index)=>{
                let button = child;
                if(button && button.type && ObjectUtil.isExtends(button.type, "Button")) {
                    console.log(button);
                }
            });
        }
        return buttonJsxs;
    }
}