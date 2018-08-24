import * as FormTag from "./FormTag";
import * as React from 'react';
import { Input } from "antd";
import { InputProps } from "antd/lib/input";
export var props = {
    ...FormTag.props
};
export interface state extends FormTag.state {
    
};
export default class Text<P extends typeof props & InputProps, S extends (state & InputProps)> extends FormTag.default<P, S> {

    constructor(props: P, context: {}) {
        super(props, context);
    }

    getInitialState():state & InputProps {
        return {
            value: this.props.value,
            onChange: (event)=>{
                this.setValue(event.target.value);
            }
        };
    }

    render() {
        return <Input {...this.state}></Input>;
    }
}