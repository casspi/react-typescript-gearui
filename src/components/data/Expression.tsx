import * as React from 'react';
import * as Tag from '../Tag';
import { ObjectUtil } from '../../utils';

export var props = {
    ...Tag.props,
    value: GearType.Any
};

export interface state extends Tag.state {
    value?: any
}

export default class Expression<P extends typeof props, S extends state> extends Tag.default<P, S>{

    //插件初始化，状态发生变化重新进行渲染
    getInitialState(): state {
        return {
            value: this.props.value,
        };
    }

    private getProps() {
        let state = this.state;
        let props: any = G.G$.extend({}, state);
        delete props.value;
        let propsNew: any = ObjectUtil.parseDynamicProps(props, this.state.value);
        return propsNew;
    }
    
    render() {
        let props = this.getProps();
        let children = this.getChildren();
        return <div {...props}>{children}</div>;
    }

    private getChildren(children?: any, key?: string) {
        children = children || this.props.children;
        if(!(children instanceof Array)) {
            children = [children];
        }
        key = key || "";
        let jsxEles: any = [];
        if(children instanceof Array) {
            children.map((child: any, index) => {
                if(child && child.props) {
                    let props = child.props;
                    let newProps = ObjectUtil.parseDynamicProps(props, this.state.value);
                    let newChildren = this.getChildren(child.children, "child_" + index);
                    let newChild = React.cloneElement(child, {...newProps, key: "child_" + index}, newChildren);
                    jsxEles.push(newChild);
                }
            });
        }
        return jsxEles;
    }

    afterUpdate() {
        this.doEvent("afterRender",false);
    }   

    setValue(value: any){
        this.setState({
            value: value
        });
    }

    getValue(){
        return this.state.value;
    }

}