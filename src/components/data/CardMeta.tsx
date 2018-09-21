import * as Tag from "../Tag";
export var props = {
    ...Tag.props,
    avatar: GearType.String,
    description: GearType.String
};

export interface state extends Tag.state {

}

export default class CardMeta<P extends typeof props, S extends state> extends Tag.default<P, S> {

    getInitialState(): state {
        return {};
    }

    render() {
        return this.props.children;
    }

}