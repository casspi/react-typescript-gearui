import { Tag } from "..";
import * as React from 'react';
import { Spin as AntdSpin } from 'antd'; 
import './Spin.css';
export var props = {
    delay: GearType.Number,
    indicator: GearType.Object,
    spinning: GearType.Boolean,
    tip: GearType.String,
    size: GearType.Enum<'small'|'large'|'default'>(),
    wrapperClassName: GearType.String,
    ...Tag.props
}

export interface state extends Tag.state {
    delay?: number;
    spinning?: boolean;
    tip?: string;
    size?: 'small'|'large'|'default';
    indicator?: any,
}

export default class Spin<P extends typeof props, S extends state> extends Tag.default<P, S> {

    private overflow_bak: any;

    getInitialState(): state {
        return {
            delay: this.props.delay,
            spinning: this.props.spinning,
            tip: this.props.tip,
            size: this.props.size,
            indicator: this.props.indicator
        };
    }

    render() {
        let height = (document.body.clientHeight / 2) -40;
        let width = (document.body.clientWidth / 2) -30;
        return <div {...this.commonState({className: this.state.className? this.state.className + " ant-spin-modal" : "ant-spin-modal"})} style={{display: this.state.spinning?"block":"none",paddingTop: height,paddingLeft: width}}>
                <AntdSpin wrapperClassName={this.props.wrapperClassName} indicator={this.state.indicator} size={this.state.size} spinning={this.state.spinning} delay={this.state.delay} tip={this.state.tip}/>
            </div>;
    }

    open() {
        this.overflow_bak = document.body.style.overflow;
        document.body.style.overflow = "hidden";
        this.setState({
            spinning: true
        });
    }

    close() {
        document.body.style.overflow = this.overflow_bak;
        this.setState({
            spinning: false
        });
    }

    /**
     * 设置全局的旋转图标
     * @param indicator 
     */
    static setDefaultIndicator(indicator: any) {
        AntdSpin.setDefaultIndicator(indicator);
    }
}