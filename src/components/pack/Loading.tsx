import * as React from 'react';
import { Spin } from 'antd';
import * as Tag from '../Tag';
export var props = {
    ...Tag.props,
    loading: GearType.Boolean,
    size: GearType.String,
    tip: GearType.String,
    delay: GearType.Number,
    icon: GearType.String,
    spin: GearType.Boolean
};

export interface state extends Tag.state {
    loading?: boolean;
    size?: string;
    tip?: string;
    delay?: number;
    icon?: string;
    spin?: boolean;
}
export default class Loading<P extends typeof props, S extends state> extends Tag.default<P, S>{

    getInitialState(): state{
        return {
            delay: this.props.delay,
            loading: this.props.loading != false,
            tip: this.props.tip,
            icon: this.props.icon,
            size: this.props.size || "default",
            spin:this.props.spin != false,
        };
    }

    getProps() {
        let state = this.state
        return G.G$.extend({},state,{
            delay: this.state.delay,
            spinning: this.state.loading,
            tip: this.state.tip,
            size: this.state.size,
        });
    }

    render() {
        let props: any = this.getProps();
        return <Spin {...props}><span style={{display:"none"}}></span></Spin>
    }


    setLoading(loading:boolean){
        this.setState({
            loading: loading
        });
    }
}