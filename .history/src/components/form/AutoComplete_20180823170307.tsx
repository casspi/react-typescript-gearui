import * as Text from './Text';
import { InputProps } from "antd/lib/input";
export var props = {
    ...Text.props,
}
export interface state extends Text.state {

}
export default class AutoComplete<P extends typeof props & InputProps, S extends state & InputProps> extends Text.default<P, S> {

}