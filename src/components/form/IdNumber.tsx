import { InputProps } from "antd/lib/input";
import * as Text from './Text';

export var props = {
    ...Text.props
};

export interface state extends Text.state {
}

export default class IdNumber<P extends typeof props & InputProps, S extends state> extends Text.default<P, S>{
    //所有实现都是在父类中，这边只是提供一个jsx类型，校验器是在form中通过Validator增加的
}