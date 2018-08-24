import * as React from 'react';
import * as FormTag from './FormTag';
import { Select as AntdSelect } from 'antd';
import { SelectProps } from 'antd/lib/select';
export var props = {
    ...FormTag.props
};
export interface state extends FormTag.state {

}
export default class Select<P extends typeof props & SelectProps, S extends state & SelectProps> extends FormTag.default<P, S> {

    constructor(props: P, context: {}) {
        super(props, context);
    }

    render() {
        return <AntdSelect {...this.state}>
            <AntdSelect.Option value="1">aaa</AntdSelect.Option>
            <AntdSelect.Option value="2">bbb</AntdSelect.Option>
        </AntdSelect>;
    }

    getInitialState(): state & SelectProps {
        return {
            value: this.props.value,
            labelInValue: true,
            onChange: (event)=>{
                console.log(event);
                if(typeof event == "string") {
                    this.setValue(event);
                }else if(typeof event == "number") {

                }else if(event instanceof Array) {

                }else {
                    this.setValue("2");
                }
                
            }
        };
    }

}