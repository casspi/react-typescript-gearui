import * as Tag from "../Tag";
import * as React from 'react';
export var props = {
    ...Tag.props
}
export interface state extends Tag.state {

}
export default class Group<P extends typeof props, S extends state> extends Tag.default<P, S> {
    
    protected cannotUpdate:GearArray<keyof S> = new GearArray<keyof state>(["name","id"]);

    getInitialState(): state {
        return {};
    }

    render() {
        let name = {name: this.state.name};
        return <span id={this.props.id} {...name} className={"ajaxload-group" + (this.state.className ? " " + this.state.className : "")}></span>;
    }

    setValue(data: any){
        if(data){
            for(let key in data) {
                let value = data[key];
                try{
                    if(typeof value == "function") {
                        value = value();
                    }
                }catch(e){}
                let jdom = this.find("[name='"+key+"']");
                if(jdom.length>0){
                    jdom.each((index,dom)=>{
                        let parent = G.G$(dom).parents(".ajaxload-group:first");
                        if(parent.length > 0 && G.$(parent) == this){
                            let gele = G.$(dom);
                            if(gele && gele.setValue) {
                                gele.setValue(value);
                            }
                        }
                    });
                }
            }
        }
    }

    getValue(){
        var value = {};
        this.find("[ctype]").each((index,dom)=>{
            let parent = G.G$(dom).parents(".ajaxload-group:first");
            if(parent.length>0 && G.$(parent)==this){
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
}