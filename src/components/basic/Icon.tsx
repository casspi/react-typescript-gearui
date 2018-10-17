import { Icon as AntdIcon } from 'antd';
import * as React from 'react';
import * as Tag from '../Tag';

export var props = {
    ...Tag.props,
    icon: GearType.String,
    spin: GearType.Boolean,
    type: GearType.String,
}

export interface state extends Tag.state {
    icon: string;
    spin?: boolean;
    type: string;
}

export default class Icon<P extends typeof props, S extends state> extends Tag.default<P, S> {

    // 点击事件
    protected clickEvent(e: any){
        let ret = this.doEvent("click", e);
        if(ret!=null && ret instanceof Array){
            for(let i=0;i<ret.length;i++){
                if(ret[0]!=null && ret[0]==false){
                    return false;
                }
            }
        }
        return true;
    }     

    //初始化控件的状态，当修改这个状态的时候会自动触发渲染
    getInitialState(): state {
        return {
            icon: this.props.icon,
            spin: this.props.spin,
            onClick: this.clickEvent.bind(this),
            type: this.props.type
        };
    }    


    render() {
        return <AntdIcon {...this.state}/>;
    }

    hide() {
        let style: any = this.state.style||{};
        style.display = "none";
        this.setState({
            style
        });
    }

    show() {
        let style: any = this.state.style||{};
        style.display = "none";
        this.setState({
            style
        });
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