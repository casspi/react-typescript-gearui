import * as React from 'react';
import { Menu as AntdMenu } from 'antd';
const AntdSubMenu = AntdMenu.SubMenu;
const AntdMenuItem = AntdMenu.Item;
const AntdItemGroup = AntdMenu.ItemGroup;
const AntdDivider = AntdMenu.Divider;
import * as Tag from '../Tag';
import { ObjectUtil } from '../../utils';
export var props = {
    ...Tag.props,
    defaultOpenKeys: GearType.Array<string>(),//初始展开的 SubMenu 菜单项 key 数组
    defaultSelectedKeys: GearType.Array<string>(),//初始选中的菜单项 key 数组
    forceSubMenuRender: GearType.Boolean,//在子菜单展示之前就渲染进 DOM
    inlineCollapsed: GearType.Boolean,//inline 时菜单是否收起状态
    inlineIndent: GearType.Number,//inline 模式的菜单缩进宽度
    mode: GearType.Enum<"vertical"|"vertical-right"|"horizontal"|"inline">(),//菜单类型，现在支持垂直、水平、和内嵌模式三种
    multiple: GearType.Boolean,//是否允许多选	
    openKeys: GearType.Array<string>(),//当前展开的 SubMenu 菜单项 key 数组
    selectable: GearType.Boolean,//是否允许选中
    selectedKeys: GearType.Array<string>(),//当前选中的菜单项 key 数组
    style: GearType.CssProperties,//根节点样式
    subMenuCloseDelay: GearType.Number,//用户鼠标离开子菜单后关闭延时，单位：秒
    subMenuOpenDelay: GearType.Number,//用户鼠标进入子菜单后开启延时，单位：秒
    theme: GearType.Enum<"light"|"dark">(),//主题颜色
    openAnimation: GearType.Any,
    openTransitionName: GearType.String,
    focusable: GearType.Boolean
};

export interface state extends Tag.state {
    defaultOpenKeys?: Array<string>;
    defaultSelectedKeys?: Array<string>;
    forceSubMenuRender?: boolean;
    inlineCollapsed?: boolean;
    inlineIndent?: number;
    mode?: "vertical"|"vertical-right"|"horizontal"|"inline";
    multiple?: boolean;
    openKeys?: Array<string>;
    selectable?: boolean;
    selectedKeys?: Array<string>;
    style?: React.CSSProperties;
    subMenuCloseDelay?: number;
    subMenuOpenDelay?: number;
    theme?: 'light' | 'dark';
    openAnimation?: string | Object;
    openTransitionName?: string | Object;
    focusable?: boolean;
}
export default class Menu<P extends typeof props, S extends state> extends Tag.default<P, S> {

    getInitialState(): state {
        return {
            defaultOpenKeys: this.props.defaultOpenKeys,
            defaultSelectedKeys: this.props.defaultSelectedKeys,
            forceSubMenuRender: this.props.forceSubMenuRender,
            inlineCollapsed: this.props.inlineCollapsed,
            inlineIndent: this.props.inlineIndent,
            mode: this.props.mode,
            multiple: this.props.multiple,
            openKeys: this.props.openKeys,
            selectable: this.props.selectable,
            selectedKeys: this.props.selectedKeys,
            style: this.props.style,
            subMenuCloseDelay: this.props.subMenuCloseDelay,
            subMenuOpenDelay: this.props.subMenuOpenDelay,
            theme: this.props.theme,
            openAnimation: this.props.openAnimation,
            openTransitionName: this.props.openTransitionName,
            focusable: this.props.focusable,
        };
    }
    
    render() {
        let childrens = this.getChildren();
        return <AntdMenu {...this.state}>{childrens}</AntdMenu>;
    }

    private getChildren(children?: any, key?: string) {
        key = key || "";
        children = children || this.props.children || [];
        if(!(children instanceof Array)) {
            children = [children];
        }
        let childrenNew: any[] = [];
        if(children instanceof Array) {
            children.map((child: any, index) => {
                if(child && child.props) {
                    if(ObjectUtil.isExtends(child, "SubMenu")) {
                        childrenNew.push(<AntdSubMenu key={key + "SubMenu_"+index} {...child.props}>{this.getChildren(child.props.children, "SubMenu_"+index)}</AntdSubMenu>);
                    }
                    if(ObjectUtil.isExtends(child, "MenuItem")) {
                        childrenNew.push(<AntdMenuItem key={key + "MenuItem_"+index} {...child.props}>{this.getChildren(child.props.children, "MenuItem_"+index)}</AntdMenuItem>);
                    }
                    if(ObjectUtil.isExtends(child, "MenuItemGroup")) {
                        childrenNew.push(<AntdItemGroup key={key + "ItemGroup_"+index} {...child.props}>{this.getChildren(child.props.children, "ItemGroup_"+index)}</AntdItemGroup>);
                    }
                    if(ObjectUtil.isExtends(child, "MenuDivider")) {
                        childrenNew.push(<AntdDivider key={key + "Divider_"+index} {...child.props}>{this.getChildren(child.props.children, "Divider_"+index)}</AntdDivider>);
                    }
                }else {
                    childrenNew.push(child);
                }
            });
        }
        return childrenNew;
    }
}