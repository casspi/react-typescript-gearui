import * as Tag from "../Tag";
import * as React from 'react';
import { Breadcrumb as AntdBreadcrumb } from 'antd';
export var props = {
    ...Tag.props,
    separator: GearType.String,
    itemRender: GearType.Function,
    params: GearType.Any,
    routes: GearType.Array<any>()
}

export interface state extends Tag.state {
    separator?: string,
    params?: object,
    routes?: Array<any>
}

export default class Breadcrumb<P extends typeof props, S extends state> extends Tag.default<P, S> {

    getInitialState(): state {
        return {
            separator: this.props.separator,
            params: this.props.params,
            routes: this.props.routes
        }
    }

    render() {
        return <AntdBreadcrumb {...this.state} itemRender={this.props.itemRender}>{childrens}</AntdBreadcrumb>;
    }

    getItems() {
        
    }
}