import * as Tag from "../Tag";
import * as React from 'react';
export var props = {
    ...Tag.props
}
export interface state extends Tag.state {

}
export default class Group<P extends typeof props, S extends state> extends Tag.default<P, S> {
    
    getInitialState(): state {
        return {};
    }

    render() {
        return <span id={this.props.id} name={this.state.name} className={"ajaxload-group" + (this.state.className ? " " + this.state.className : "")}></span>;
    }
}