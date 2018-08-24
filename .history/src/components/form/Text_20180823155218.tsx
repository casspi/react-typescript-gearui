import * as FormTag from "./FormTag";
import * as React from 'react';
import { Input as AntdInput } from "antd";
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

    //获取前置标签
    getAddonBefore() {
        if (typeof this.props.addonBefore == "string") {
            return this.props.addonBefore;
        } else {
            let addonBefore: any = this.props.addonBefore;
            addonBefore = G.$(addonBefore);
            //需要从document文档中把节点删掉
            if (addonBefore.remove) {
                addonBefore.remove();
            }
            return addonBefore;
        }
    }

    getInitialState():state & InputProps {
        return {
            placeholder: this.props.placeholder,
            size: this.props.size,
            disabled: this.props.disabled,
            readOnly: this.props.readOnly,
            addonBefore: this.getAddonBefore(),
            addonAfter: this.props.addonAfter,
            prefix: this.props.prefix,
            suffix: this.props.suffix,  
            value: this.props.value,
            onChange: (event)=>{
                this.setValue(event.target.value);
            }
        };
    }

    render() {
        return <AntdInput {...this.state}></AntdInput>;
    }
}