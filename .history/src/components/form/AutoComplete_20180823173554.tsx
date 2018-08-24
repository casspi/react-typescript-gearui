import * as Text from './Text';
import { InputProps } from "antd/lib/input";
export var props = {
    ...Text.props,
    controlType: GearType.String,
    mustMatch: GearType.Boolean,
}
export interface state extends Text.state {
    controlType?: string;
    mustMatch?: boolean;
}
export default class AutoComplete<P extends typeof props & InputProps, S extends state & InputProps> extends Text.default<P, S> {

    getInitialState() {
        
    }

    getTextareaProps() {
        let state = super.getInitialState();
    }

    render() {
        if(this.state.controlType == "textarea") {

        }
    }

}