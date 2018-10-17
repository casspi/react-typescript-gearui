import * as Tag from "../Tag";
import * as React from 'react';
import { Card as AntdCard } from 'antd';
import { ObjectUtil, UUID } from "../../utils";
export var props = {
    ...Tag.props,
    //操作按钮
    actions: GearType.Array<string>(),
    //当前激活的面板的key
    activeTabKey: GearType.String,
    //标题区域的样式
    headStyle: GearType.CssProperties,
    //内容区域的样式
    bodyStyle: GearType.CssProperties,
    //是否有边框
    bordered: GearType.Boolean,
    //封面
    cover: GearType.String,
    //卡片右上角操作区域
    extra: GearType.String,
    //鼠标移过时可浮起
    hoverable: GearType.Boolean,
    //当卡片内容还在加载中时，可以用 loading 展示一个占位
    loading: GearType.Boolean,
    //页签标题列表
    tabList: GearType.Array<{key: string,tab: string}>(),
    //卡片类型，可设置为 inner 或 不设置
    type: GearType.String,
    //页签切换的回调
    onTabChange: GearType.Function,
}

export interface state extends Tag.state {
    //当前激活的tab的key
    activeTabKey?: string;
    defaultActiveTabKey?: string;
    actions?: Array<string>;
    headStyle?: object;
    bodyStyle?: object;
    bordered?: boolean;
    cover?: string;
    extra?: string;
    hoverable?: boolean;
    loading?: boolean;
    tabList?: Array<{key: string,tab: string}>;
    type?: string;
}

export default class Card<P extends typeof props, S extends state> extends Tag.default<P, S> {

    getInitialState(): state {
        return {
            activeTabKey: this.props.activeTabKey,
            defaultActiveTabKey: this.props.activeTabKey,
            actions: this.props.actions,
            headStyle: this.props.headStyle,
            bodyStyle: this.props.bodyStyle,
            bordered: this.props.bordered,
            cover: this.props.cover,
            extra: this.props.extra,
            hoverable: this.props.hoverable,
            loading: this.props.loading,
            tabList: this.props.tabList,
            title: this.props.title,
            type: this.props.type
        };
    }

    private getProps() {
        return G.G$.extend({},this.state,{
            actions: this.getActions(),
            cover: G.$(this.state.cover),
            extra: G.$(this.props.extra),
            tabList: this.getTabList(),
            title: G.$(this.props.title),
            onTabChange: (key: string) => {
                this.doEvent("tabChange", key);
            }
        });
    }

    render() {
        let props = this.getProps();
        let children = this.getChildren();
        return <AntdCard {...props}>{children}</AntdCard>;
    }

    private getActions() {
        let actions = this.state.actions;
        let actionJsxs: any[] = [];
        if(actions) {
            for(let i = 0; i < actions.length; i++) {
                actionJsxs.push(G.$(actions[i]));
            }
        }
        return actionJsxs;
    }

    private getTabList() {
        let list = this.state.tabList;
        let listJsxs: any[] = [];
        if(list) {
            for(let i = 0; i < list.length; i++) {
                let o = list[i];
                o.tab = G.$(o.tab);
                listJsxs.push(o);
            }
        }
        return listJsxs;
    }

    private getChildren() {
        let childrenJsxs: any[] = [];
        let children = this.props.children;
        if(!(children instanceof Array)) {
            children = [children];
        }
        if(children instanceof Array) {
            children.map((child: any, index)=>{
                let childJsx = child;
                if(child && child.type) {
                    let props = {
                        key: this.props.id ? this.props.id + "_grid_meta_" + index : UUID.get(),
                        className: child.props.class,
                        style: child.props.style,
                    }
                    if(ObjectUtil.isExtends(child.type, "CardGrid")) {
                        childJsx = <AntdCard.Grid {...props}>{child.props.children}</AntdCard.Grid>;
                    }else if(ObjectUtil.isExtends(child.type, "CardMeta")) {
                        let metaProps = {
                            ...props,
                            avatar: child.props.avatar ? G.$(child.props.avatar) : undefined,
                            description: child.props.description,
                            title: child.props.title
                        };
                        childJsx = <AntdCard.Meta {...metaProps}>{child.props.children}</AntdCard.Meta>;
                    }
                }
                childrenJsxs.push(childJsx);
            });
        }
        return childrenJsxs;
    }
}