import * as Tag from '../Tag';
const SketchPicker = require('react-color');
import * as React from 'react';
import { ColorUtil } from '../../utils';
export var props = {
    ...Tag.props,
    disablealpha: GearType.Boolean,
    value: GearType.String,
}
export interface state extends Tag.state {
    disablealpha?: boolean;
    value?: string;
}
export default class ColorPicker<P extends typeof props, S extends state> extends Tag.default<P, S> {

    getInitialState(): state {
        return {
            disablealpha: this.props.disablealpha,
            value: this.props.value
        };
    }

    getProps() {
        return {
            color: ColorUtil.getValidColor(this.getValue()),
            disableAlpha: this.props.disablealpha != false,
            onChange: (color: any,event: any)=>{
                this.doEvent("change",color,event);
            }
        };
    }

    render() {
        let props = this.getProps();
        return <SketchPicker {...props}/>;
    }

    setValue(val: string) {
        this.setState({ value: val });
    }

    getValue() {
        return this.state.value;
    }
}