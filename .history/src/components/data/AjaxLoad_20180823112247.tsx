import * as React from 'react';
import * as Tag from '../Tag';
import { Http } from '../../utils';
import { methods } from '../../utils/http';
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
        return <div className={this.state.className} style={this.state.style} id={this.state.id}></div>;
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
            let jdom = container.find("[name='"+key+"-propDom']");
            if(jdom.length>0){
                jdom.each((index,dom)=>{
                    let parent = G.G$(dom).parents(".ajaxload-group:first");
                    if(parent.length==0 || G.$(parent) instanceof group == false){
                        let gele:Tag<TagProps> = G.$(dom);
                        if(gele instanceof Tag == false) {
                            gele.doRender((ele)=>{
                                gele = G.$(ele);
                                if(gele instanceof Tag)
                                    gele.setValue(value);
                            });
                        }else {
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
        this.find("[ctype]").each((index,dom)=>{
            let parent = G.G$(dom).parents(".ajaxload-group:first");
            if(parent.length==0 || G.$(parent) instanceof group == false){
                let gele:Tag<TagProps> = G.$(dom);
                if(gele instanceof Tag == false) {
                    gele.doRender((ele)=>{
                        gele = G.$(ele);
                        if(gele instanceof Tag && gele.props.name)
                            value[gele.props.name] = gele.getValue();
                    });
                }else {
                    if(gele.props.name)
                        value[gele.props.name] = gele.getValue();
                }   
            }         
        });        
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