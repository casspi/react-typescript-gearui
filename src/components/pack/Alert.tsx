import * as Tag from '../Tag';
import * as React from 'react';
import { Alert as AntdAlert } from 'antd';
type type = "success" | "info" | "warning" | "error";
export var props = {
    ...Tag.props,
    type: GearType.Enum<type>(),
    closable: GearType.Boolean,
    closeText: GearType.String,
    title: GearType.String,
    message: GearType.String,
    onClose: GearType.Function,
    showIcon: GearType.Boolean,
    banner: GearType.Boolean,

}
export interface state extends Tag.state {
    type?: type;
    closable?: boolean;
    closeText?: string;
    message: string;
    onClose?: React.MouseEventHandler<HTMLAnchorElement>;
    showIcon?: boolean;
    banner?: boolean;
    description?: string;
}
export default class Alert<P extends typeof props, S extends state> extends Tag.default<P, S> {

    getInitialState(): state {
        return {
            message: this.props.title,
            showIcon: this.props.showIcon,
            banner: this.props.banner,
            onClose: ()=> {
                this.doEvent("close");
            },
            type: this.state.type,
            closable: this.props.closable,
            closeText: this.props.closeText,
            description: this.state.message
        };
    }

    render() {
        return <AntdAlert {...this.state}></AntdAlert>;
    }

    setTitle(title: string) {
        this.setState({
            title: title
        });
    }

    setType(type: type) {
        this.setState({
            type: type
        });
    }

    setMessage(message: string) {
        this.setState({
            message: message
        });
    }
}