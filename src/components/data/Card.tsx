import * as Tag from "../Tag";
import * as React from 'react';
import { Card as AntdCard } from 'antd';
export var props = {
    ...Tag.props,
    actions: GearType.Array<String>(),

}

export interface state extends Tag.state {

}

export default class Card<P extends typeof props, S extends state> extends Tag.default<P, S> {

    getInitialState(): state {
        return {

        };
    }

    render() {
        return <AntdCard>{}</AntdCard>;
    }
}