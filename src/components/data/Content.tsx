import * as Tag from '../Tag';
import * as React from 'react';

export var props = {
    value: GearType.Any,
    ...Tag.props
};

export interface state extends Tag.state {
    children: any;
    value: any;
}

export default class Content<P extends typeof props, S extends state> extends Tag.default<P, S> {

    getProps() {
        let state: any = G.G$.extend({}, this.state);
        delete state.value;
        return state;
    }

    getInitialState(): state {
        return {
            children: this.doRender(this.props.value),
            value: this.props.value
        };
    }

    render() {
        return <div {...this.getProps()}>{this.state.children}</div>;
    }

    afterRender() {
        this.doEvent("afterRender",true);
    }

    afterUpdate() {
        this.doEvent("afterRender",false);
    }    

    setValue(data: any,callback?:Function){
        this.setState({
            children: this.doRender(data),
            value: data
        },()=>{
            if(callback)
                callback.call(this);
        });
    }

    getValue(){
        return this.state.value;
    }

    doRender(data: any){
        let html;
        if(this.haveEvent("render")){
            html = this.doEvent("render", data);
            if(html) {
                html = html[0];
            }
        }else{
            html = data;
        }
        if(html){
            return G.$("<div>"+html+"</div>", true);
        }else
            return null;
    }

}