import * as Tag from '../Tag';
import * as React from 'react';
export var props = {
    ...Tag.props
}
export interface state extends Tag.state {

}
export default class Alert<P extends typeof props, S extends state> extends Tag.default<P, S> {

    getInitialState(): state {
        return {};
    }
}