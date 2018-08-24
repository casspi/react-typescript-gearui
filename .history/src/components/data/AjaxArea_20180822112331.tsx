import * as Tag from '../Tag';
import * as React from 'react';
import { Spin as AntdSpin } from 'antd';
export var props = {
    ...Tag.props,
    url: GearType.String,
    interval: GearType.Number,
    delay: GearType.Number,
};
export interface state extends Tag.state {
    url?: string,
    interval?: number,
    delay?: number
}
export default class AjaxArea<P extends typeof props, S extends state> extends Tag.default<P, S> {

    getInitialState(): state {
        return {
            url: this.props.url,
            interval: this.props.interval,
            delay: this.props.delay,
        };
    }

    afterRender() {
        
    }

    render() {
        return <AntdSpin spinning={this.state["loading"]}>{ele}</AntdSpin>;
    }
}