import * as Tag from '../Tag';

export var props = {
    ...Tag.props,
    dataIndex: GearType.String,
    label: GearType.String,
    fixed: GearType.Enum<"left" | "right">(),
    ellipsis: GearType.Boolean,
    rowspan: GearType.Any,
    orderColumn: GearType.String,
    filter: GearType.Boolean,
    filterId: GearType.String,
    filterType: GearType.String,
    filterMutiple: GearType.Boolean,
    filters: GearType.String,
    filtersUrl: GearType.String,
    filtersMethod: GearType.String,
    editCType: GearType.String,
    lower: GearType.String,
    upper: GearType.String
}
export interface state extends Tag.state {

}

export default class Column<P extends typeof props, S extends state> extends Tag.default<P, S> {

    getInitialState(): state {
        return {};
    }

}