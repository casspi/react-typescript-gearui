import * as Tag from 'src/components/Tag';
import * as React from 'react';
import { Affix as AntdAffix } from 'antd';
export var props = {
    offsetBottom: GearType.Number,
    offsetTop: GearType.Number,
    target: GearType.Or(GearType.Function, GearType.String),
    onChange: GearType.Function,
    ...Tag.props
}
export interface state extends Tag.state {
    offsetBottom?: number;
    offsetTop?: number;
    /** 设置 Affix 需要监听其滚动事件的元素，值为一个返回对应 DOM 元素的函数 */
    target?: () => Window | HTMLElement | null;
}
export default class Affix<P extends typeof props, S extends state> extends Tag.default<P, S> {

    constructor(props: P, context?: any) {
        super(props, context);
    }

    //獲取初始的state
    getInitialState(): state {
        let target:any = this.props.target;
        if(target instanceof String) {
            target = () => G.G$(target)[0] || window;
        }
        return {
            offsetBottom: this.props.offsetBottom,
            offsetTop: this.props.offsetTop,
            target
        };
    }

    render() {
        return <AntdAffix {...this.state}>
            {this.props.children}
        </AntdAffix>;
    }

    onChange(fun: Function) {
        if(fun && G.G$.isFunction(fun)) {
            this.bind("change", fun);
        }
    }
}