import * as Tag from "../Tag";
import { Calendar as AntdCalendar } from 'antd';
import * as React from 'react';
export var props = {
    ...Tag.props,
    fullScreen: GearType.Boolean,
};
export interface state extends Tag.state {
    fullScreen?: boolean;
}
export default class Calendar<P extends typeof props, S extends state> extends Tag.default<P, S> {

    getInitialState():state {
        return {
            fullScreen: this.props.fullScreen
        };
    }

    render() {
        if (this.state.fullScreen == false) {
            return <div style={{ width: 300, border: '1px solid #d9d9d9', borderRadius: 4 }}><Calendar {...props}></Calendar></div>;
        } else {
            return <Calendar {...props}></Calendar>;
        }
    }
}