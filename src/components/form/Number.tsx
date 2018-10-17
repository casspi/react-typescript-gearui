import * as React from 'react';
import { InputNumber as AntdInputNumber } from 'antd';
import * as FormTag from './FormTag';

export var props = {
    ...FormTag.props,
    precision: GearType.Number,
    value: GearType.Number,
    min: GearType.Number,
    max: GearType.Number,
    step: GearType.Number,
    prompt: GearType.String,
    size: GearType.Enum<'large' | 'small' | 'default'>(),
    prefix: GearType.String,
    suffix: GearType.String
};

export interface state extends FormTag.state {
    step?: number;//每次改变步数，可以为小数
    size?: 'large' | 'small' | 'default';//控件大小
    // onformatter?: (value: number | string | undefined) => string;//指定输入框展示值的格式
    // onparser?: (displayValue: string | undefined) => number;//指定从 formatter 里转换回数字的方式，和 formatter 搭配使用
    prompt?: string;//输入提示
    precision?: number;//数值精度
    min?: number;
    max?: any;
    prefix?: string;
    suffix?: string;
    value: number;
}

export default class Number<P extends typeof props, S extends state> extends FormTag.default<P, S> {

    getInitialState(): state {
        return {
            value: this.props.value || 0,
            precision: this.props.precision,
            min: this.props.min || 0,
            max: this.props.max || 999999999,
            step: this.props.step || 1,
            prompt: this.props.prompt,
            size: this.props.size,
            prefix: this.props.prefix || "",
            suffix: this.props.suffix || ""
        };
    }

    getProps() {
        let state = this.state
        return G.G$.extend({}, state, {
            defaultValue: this.state.value,
            onChange: (value: any) => {
                this._change(value);
            },
            formatter: (value: number | string | undefined) => {
                let valuer = this._formatter(value);
                return (this.state.prefix) + valuer + (this.state.suffix);
            },
            placeholder: this.state.prompt,
        });
    }

    enable() {
        this.setState({
            disabled: false
        });
    }

    disable() {
        this.setState({
            disabled: true
        });
    }

    render() {
        let props: any = this.getProps();
        return <AntdInputNumber {...props} />;
    }

    protected _parser(value: any) {
        let re = this.doEvent("parser", value);
        if (re) {
            return re;
        }
        return value;
    };

    parser(fun: Function) {
        if (fun && G.G$.isFunction(fun)) {
            this.doEvent("parser", fun);
        }
    }

    protected _formatter(value: any) {
        let re = this.doEvent("formatter", value);
        if (re && re.length > 0) {
            return re[0];
        }
        let formatter = this.props.onFormatter;
        if (typeof formatter == "string") {
            let formatterStr: string = formatter;
            return formatterStr.replace(/\$\(value\)/g, value);
        }
        return value;
    };

    formatter(fun: Function) {
        if (fun && G.G$.isFunction(fun)) {
            this.bind("formatter", fun);
            this._change(this.getValue());
        }
    }

    getValue() {
        return this.state.value;
    }

    protected _change(value: any) {
        let oldValue = this.getValue();
        this.setValue(value);
        this.doEvent("change", value, oldValue);
    }
}