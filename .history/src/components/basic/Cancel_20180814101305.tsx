import * as Button from './Button';
export var props = {
    ...Button.props
};
export interface state extends Button.state {

}
export default class Cancel<P extends typeof props, S extends state> extends Button.default<P, S> {

}