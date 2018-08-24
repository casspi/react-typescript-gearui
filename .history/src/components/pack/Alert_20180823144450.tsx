import * as Tag from '../Tag';
import * as React from 'react';
import { Alert as AntdAlert } from 'antd';
export var props = {
    ...Tag.props,
    type: GearType.Enum<"success" | "info" | "warning" | "error">(),
    closable: GearType.Boolean,
    closeText: GearType.String,
    title: GearType.String,
    message: GearType.String,
    onClose: GearType.Function,
    showIcon: GearType.Boolean,
    banner: GearType.Boolean,

}
export interface state extends Tag.state {
    
}
export default class Alert<P extends typeof props, S extends state> extends Tag.default<P, S> {

    getInitialState(): state {
        return {};
    }

    render() {
        return <AntdAlert></AntdAlert>;
    }
}