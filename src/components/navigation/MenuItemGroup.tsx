import * as Tag from '../Tag';

export var props = {
    ...Tag.props,
    title: GearType.String,
};

export interface state extends Tag.state {
}
export default class MenuItemGroup<P extends typeof props, S extends state> extends Tag.default<P, S> {

    getInitialState(): state {
        return {
            
        };
    }
}