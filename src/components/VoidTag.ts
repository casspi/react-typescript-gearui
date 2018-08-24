import * as Tag from "./Tag";
export var props = {
    voidElement: Element,
    ...Tag.props
};
export interface state extends Tag.state {
    
};
export default abstract class VoidTag<P extends typeof props, S extends (state)> extends Tag.default<P, S> {

    afterRender() {
        if(this.props.voidElement) {
            let ele: any = this.props.voidElement;
            G.G$(G.voidParent).find(ele).data("vmdom", this);
        }
    }

}