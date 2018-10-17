import * as React from 'react';
import * as Tag from '../Tag';

export var props = {
    ...Tag.props,
    url: GearType.String,
    target: GearType.String,
    value: GearType.String
};

export interface state extends Tag.state {
    url?: string;
    target?: string;
    value?: string;
}

export default class Link<P extends typeof props, S extends state> extends Tag.default<P, S> {


    // 点击事件
    protected clickEvent(e: any){
        return this.doJudgementEvent("click", e);
    }     

    //获取当前属性
    getProps() {
        return {
            href: this.state.url,
            target:this.state.target,
            onClick: this.clickEvent.bind(this)
        };
    }

    //插件初始化，状态发生变化重新进行渲染
    getInitialState() : state {
        return {
            url:this.props.url,
            target:this.props.target,
            value: this.props.value
        };       
    }

    //渲染
    render() {
        let props = this.getProps();
        if(props.href && !(this.state.disabled))
            return <a {...props}>{this.state.value}</a>;
        else
            return <span {...props}>{this.state.value}</span>;
    }

    // 触发点击效果
    click(fun: Function) {
        if (fun && G.G$.isFunction(fun)) {
            this.bind("click", fun);       
        }else {
            this.clickEvent.call(this);
        }
    }

}