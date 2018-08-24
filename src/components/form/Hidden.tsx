import * as Text from "./Text";
import { InputProps } from "antd/lib/input";
export var props = {
    ...Text.props
};
export interface state extends Text.state {
    
};
export default class Hidden<P extends typeof props & InputProps, S extends (state & InputProps)> extends Text.default<P, S> {

    constructor(props: P, context: {}) {
        super(props, context);
    }

    getInitialState():state & InputProps {
        return {
            value: this.props.value,
            type: "hidden",
            onChange: (event)=>{
                this.setValue(event.target.value);
            }
        };
    }
}