import * as Tag from '../Tag';
import * as React from 'react';
import { Spin as AntdSpin } from 'antd';
export var props = {
    ...Tag.props,
    url: GearType.String,
    interval: GearType.Number,
    delay: GearType.Number,
    loading: GearType.Boolean,
};
export interface state extends Tag.state {
    url?: string,
    interval?: number,
    delay?: number,
    loading?: boolean
}
export default class AjaxArea<P extends typeof props, S extends state> extends Tag.default<P, S> {

    getInitialState(): state {
        return {
            url: this.props.url,
            interval: this.props.interval,
            delay: this.props.delay,
            loading: this.props.loading
        };
    }

    afterRender() {
        if(this.props.delay==null || this.props.delay<=0) {
            this.execute();
        }else {
            window.setTimeout(this.execute.bind(this),this.props.delay);
        }
    }

    private execute() {
        if(this.state.interval==null || this.state.interval<=0){
            this.getContent();
        }else{
            window.setInterval(this.getContent.bind(this),this.props.interval);
        }
    }

    private getContent() {
        this.setLoading(true);
        let r = false;
        if(this.haveEvent("beforeprocess")) {
            let re = this.doEvent("beforeprocess");
            r = re ? re[0] : true;
        }else {
            r = AjaxArea.beforeProcess();
        }
        if(r == true){
            if(this.haveEvent("process")) {
                this.doEvent("process");
            }else {
                AjaxArea.process(this);
            }
        }
    }

    static afterProcess(status?: any,data?: any) {
    }

    onAfterProcess(fun?: Function){
        if(fun instanceof Function) {
            this.bind("afterprocess", fun);
        }  
    }  

    static process(obj: AjaxArea<typeof props, state>) {

    }

    onProcess(fun?: Function){
        if(fun instanceof Function) {
            this.bind("process", fun);
        }  
    }

    static beforeProcess() {
        return true;
    }

    onBeforeProcess(fun?: Function){
        if(fun instanceof Function) {
            this.bind("beforeprocess", fun);
        }
    }

    render() {
        return <AntdSpin spinning={this.state["loading"]}>{ele}</AntdSpin>;
    }

    setLoading(loading?: boolean) {
        this.setState({
            loading: loading
        });
    }
}