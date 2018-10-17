import * as Text from './Text';
import { InputProps } from "antd/lib/input";
export var props = {
    ...Text.props
};

export interface state extends Text.state {

}

export default class Ip<P extends typeof props & InputProps, S extends state> extends Text.default<P, S>{

}