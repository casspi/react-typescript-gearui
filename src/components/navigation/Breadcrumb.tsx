import * as Tag from "../Tag";
import * as React from 'react';
import { Breadcrumb as AntdBreadcrumb } from 'antd';
import { ObjectUtil, UUID } from "../../utils";
export var props = {
    ...Tag.props,
    separator: GearType.String,
    onItemRender: GearType.Function,
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

    itemRender(route: any, params: any, routes: Array<any>, paths: Array<string>):React.ReactNode {
        if(this.haveEvent("itemRender")) {
            let r = this.doEvent("itemRender", route, params, routes, paths);
            return r ? r[0] : null;
        }
        return null;
    }

    render() {
        let items = this.getItems();
        return <AntdBreadcrumb {...this.state} itemRender={this.itemRender.bind(this)}>{items}</AntdBreadcrumb>;
    }

    private getItems() {
        let itemJsxs: any[] = [];
        let children = this.props.children;
        if(children instanceof Array) {
            children.map((child: any, index)=>{
                let item = child;
                if(item && item.type && ObjectUtil.isExtends(item.type, "BreadcrumbItem")) {
                    let itemJsx = <AntdBreadcrumb.Item key={this.props.id ? this.props.id + "_item_" + index : UUID.get()}>{item.props.children}</AntdBreadcrumb.Item>;
                    itemJsxs.push(itemJsx);
                }
            });
        }
        return itemJsxs;
    }
}