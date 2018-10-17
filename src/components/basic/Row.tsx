import * as Tag from '../Tag';
import * as React from 'react';
import { Row as AntdRow, Col as AntdCol } from 'antd';
import { ObjectUtil, UUID } from '../../utils';
export var props = {
    ...Tag.props,
    gutter: GearType.Any,
    type: GearType.Enum<"flex">(),
    align: GearType.Enum<'top' | 'middle' | 'bottom'>(),
    justify: GearType.Enum<'start' | 'end' | 'center' | 'space-around' | 'space-between'>()
}
export interface state extends Tag.state {
    gutter?: any;
    type?: 'flex';
    align?: 'top' | 'middle' | 'bottom';
    justify?: 'start' | 'end' | 'center' | 'space-around' | 'space-between';
}
export default class Row<P extends typeof props, S extends state> extends Tag.default<P, S> {

    protected concatInitial = false;

    getInitialState(): state {
        return {
            gutter: this.props.gutter ? this.props.gutter : undefined,
            type: this.props.type,
            align: this.props.align,
            justify: this.props.justify,
            id: this.props.id,
        };
    }


    render() {
        let cols = this.getCols();
        return <AntdRow {...this.state}>{cols}</AntdRow>;
    }

    private getCols() {
        let colJsxs: any[] = [];
        let children = this.props.children;
        if(!(children instanceof Array)) {
            children = [children];
        }
        if(children instanceof Array) {
            children.map((child: any, index)=>{
                let col = child;
                if(col && col.type && ObjectUtil.isExtends(col.type, "Col")) {
                    let props = this.getColProps(col, index);
                    let colJsx = <AntdCol {...props}>{col.props.children}</AntdCol>;
                    colJsxs.push(colJsx);
                }
            });
        }
        return colJsxs;
    }

    private getColProps(col: any, index: number) {
        let props = col.props;
        return {
            key: this.props.id ? this.props.id + "_col_" + index : UUID.get(),
            span: props.span,
            order: props.order,
            offset: props.offset,
            push: props.push,
            pull: props.pull,
            xs: props.xs,
            sm: props.sm,
            md: props.md,
            lg: props.lg,
            xl: props.xl,
            xxl: props.xxl,
            className: props.class,
            id: props.id
        };
    }
}