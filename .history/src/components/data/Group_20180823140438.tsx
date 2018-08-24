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
}