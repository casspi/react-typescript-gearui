import * as React from 'react';
import * as Tag from '../Tag';
export var props = {
    ...Tag.props
};
export interface state extends Tag.state {

}
export default class AjaxLoad<P extends typeof props, S extends state> extends Tag.default<P, S> {

    getInitialState(): state {
        return {

        };
    }

    render() {
        return <div></div>;
    }


}