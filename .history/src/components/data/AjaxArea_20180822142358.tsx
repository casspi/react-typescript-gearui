import * as Tag from '../Tag';
import * as React from 'react';
import { Spin as AntdSpin } from 'antd';
import { Http } from '../../utils';
import { methods } from '../../utils/http';
export var props = {
    ...Tag.props,
    url: GearType.Or(GearType.String, GearType.Function),
    data: GearType.Or(GearType.Function, GearType.Any),
    method: GearType.Enum<methods>(),
    interval: GearType.Number,
    delay: GearType.Number,
    loading: GearType.Boolean,
    dataType: GearType.String,
};
export interface state extends Tag.state {
    url?: string | Function,
    method?: methods,
    interval?: number,
    delay?: number,
    loading?: boolean,
    data?: any;
    dataType?: string;
}
export default class AjaxArea<P extends typeof props, S extends state> extends Tag.default<P, S> {

    getInitialState(): state {
        return {
            url: this.props.url,
            interval: this.props.interval,
            delay: this.props.delay,
            loading: this.props.loading,
            method: this.props.method
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

    static error(obj: AjaxArea<typeof props, state>,err: any) {
        console.error(err);
        G.messager.alert("操作提示","数据请求失败","error"); 
        obj.setLoading(false);
    }

    static afterProcess(status?: any,data?: any) {
    }

    static beforeProcess() {
        return true;
    }

    // Ajaxarea请求的处理过程时触发
    static process(obj: AjaxArea<typeof props, state>) {
        var method = obj.state.method || "post";
        // URL支持动态获取
        let url = obj.state.url;    
        let data = obj.state.data;    
        if(!url) {
            return;
        }
        let dataType = obj.state.dataType || "json";
        let fn = async () => {
            let result = await Http.ajax(method, url, dataType, data);
            if(result.success) {
                let data = result.data || {};
                if(obj.haveEvent("complete")) {
                    obj.doEvent("complete", data);
                }else {
                    AjaxArea.complete.bind(obj)(obj, data);
                }
            }else {
                if(obj.haveEvent("error")) {
                    obj.doEvent("error");
                }else {
                    AjaxArea.error.bind(obj)(result.message);
                }
            }
            if(obj.haveEvent("afterprocess")) {
                obj.doEvent("afterprocess", "finish", data);
            }else {
                AjaxArea.afterProcess.bind(obj)("finish", data);
            }
        }
        fn();
    }

    // 当Ajax请求完成时触发
    static complete() {

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