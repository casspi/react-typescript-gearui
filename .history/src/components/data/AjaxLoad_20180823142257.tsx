import * as React from 'react';
import * as Tag from '../Tag';
import { Http } from '../../utils';
import { methods } from '../../utils/http';
import Group from './Group';
export var props = {
    ...Tag.props,
    interval: GearType.Number,
    method: GearType.Enum<methods>(),
    url: GearType.String,
    containerId: GearType.String,
};
export interface state extends Tag.state {
    interval?: number;
    method: methods;
    url: string;
    containerId?: string;
}
export default class AjaxLoad<P extends typeof props, S extends state> extends Tag.default<P, S> {

    interval: any;

    getInitialState(): state {
        return {
            interval: this.props.interval,
            method: this.props.method || "get",
            url: this.props.url,
            containerId: this.props.containerId,
        };
    }

    render() {
        let name = {name: this.state.name};
        return <div className={this.state.className} {...name} style={this.state.style} id={this.state.id}></div>;
    }

    afterRender() {

    }

    request() {
        let interval = this.state.interval;
        if(interval != null && interval > 0) {
            if(this.interval) {
                window.clearInterval(this.interval);
            }
            this.loadData();
            this.interval = window.setInterval(()=>{
                this.loadData();
            },interval);
        }else {
            this.loadData();
        }
    }

    loadData() {
        let url = this.state.url;
        let method: methods = this.state.method;

        let fn = async () => {
            let result = await Http.ajax(method, url);

            if(result.success) {
                let data = result.data;
                if(data) {
                    this.parseData(data);
                    this.doEvent("loadsuccess",data);
                }
            }else {
                this.doEvent("loaderror",result.message || result.data || result);
            }
        }
    }

    parseData(data: any) {
        if(data && data.status!=null && data.status==0) {
            data = data.data;
        }
        if(data == null)
            return;
        if(data instanceof Array && data.length>0)
            data = data[0];
        let containerid = this.state.containerId;
        let container = null;
        if(containerid) {
            container = G.G$("#" + containerid);
        }else {
            container = G.G$(this.realDom);
        }
        for(let key in data) {
            let value = data[key];
            try{
                if(typeof value == "function") {
                    value = value();
                }
            }catch(e){}
            let jdom = container.find("[name='"+key+"']");
            if(jdom.length>0){
                jdom.each((index,dom)=>{
                    //排除group类型的子节点，group类型的子节点需要在group的setValue中设置值
                    let parent = G.G$(dom).parents(".ajaxload-group:first");
                    if(parent.length==0 || G.$(parent) instanceof Group == false){
                        let gele = G.$(dom);
                        if(gele && gele.setValue) {
                            gele.setValue(value);
                        }
                    }
                });
            }
        }
    }

    setValue(data: any){
        this.parseData(data);
    }

    getValue(){
        let value = {};
        let fn = (ele: any) => {
            ele.children_g_().each((index: any,dom: any)=>{
                let parent = G.G$(dom).parents(".ajaxload-group:first");
                if(parent.length==0 || G.$(parent) instanceof Group == false){
                    let gele = G.$(dom);
                    if(gele && gele.getValue && gele.props && gele.props.name) {
                        value[gele.props.name] = gele.getValue();
                    }
                    if(gele.children_g_) {
                        fn(gele);
                    }
                }       
            });
        }
        fn(this);
        return value;
    }

    setUrl(url: string) {
        this.setState({
            url
        },()=>{
            this.loadData();
        });
    }

    setInterval(interval: number) {
        this.setState({
            interval
        },()=>{
            this.request();
        });
    }

    setContainerId(containerId: string) {
        this.setState({
            containerId
        },()=>{
            this.request();
        });
    }

}