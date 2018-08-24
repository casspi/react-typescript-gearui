import * as React from 'react';
import * as FormTag from './FormTag';
import { Checkbox as AntdCheckbox } from 'antd';
const AntdCheckboxGroup = AntdCheckbox.Group;
export var props = {
    //checkbox属性
    checked: GearType.Boolean,
    indeterminate: GearType.Boolean,
    //checkBoxGroup属性
    options: GearType.Object,
    url: GearType.String,
    dictype: GearType.Object,
    //公共属性
    //目标对象ID（用于连动全选的全选项）
    target: GearType.String,
    //关联对象ID（用于连动全选的子选项）
    related: GearType.String,
    cascadeTarget: GearType.String,
    ...FormTag.props
}
export interface state extends FormTag.state {

}
export default class Check<P extends typeof props, S extends state> extends FormTag.default<P, S> {

    getInitialState(): state {
        return {};
    }

    render() {
        return <AntdCheckboxGroup></AntdCheckboxGroup>;
    }
}