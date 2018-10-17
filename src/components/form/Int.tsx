import * as Number from './Number';
export var props = {
    ...Number.props
};
export interface state extends Number.state {

}

export default class Int<P extends typeof props, S extends state> extends Number.default<P, S> {
    //所有实现都在父类中
}