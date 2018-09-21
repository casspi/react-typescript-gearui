import * as Tag from '../Tag';
export interface ColSize {
    span?: number;
    order?: number;
    offset?: number;
    push?: number;
    pull?: number;
}
export var props = {
    ...Tag.props,
    span: GearType.Number,
    order: GearType.Number,
    offset: GearType.Number,
    push: GearType.Number,
    pull: GearType.Number,
    xs: GearType.Or<number, ColSize>(GearType.Number, {}),
    sm: GearType.Or<number, ColSize>(GearType.Number, {}),
    md: GearType.Or<number, ColSize>(GearType.Number, {}),
    lg: GearType.Or<number, ColSize>(GearType.Number, {}),
    xl: GearType.Or<number, ColSize>(GearType.Number, {}),
    xxl: GearType.Or<number, ColSize>(GearType.Number, {})
}
export interface state extends Tag.state {
    span?: number;
    order?: number;
    offset?: number;
    push?: number;
    pull?: number;
    xs?: number | ColSize;
    sm?: number | ColSize;
    md?: number | ColSize;
    lg?: number | ColSize;
    xl?: number | ColSize;
    xxl?: number | ColSize;
}
export default class Col<P extends typeof props, S extends state> extends Tag.default<P, S> {
    
    getInitialState(): state {
        return {};
    }

    render() {
        return this.props.children;
    }
}