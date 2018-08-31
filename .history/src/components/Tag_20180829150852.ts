import * as ReactDOM from 'react-dom';
import JqueryTag, { props as JqueryTagProps, state as JqueryTagState } from "./JqueryTag";
import { ObjectUtil, UUID } from '../utils';
export var props = {
    id: GearType.String,
    name: GearType.String,
    title: GearType.String,
    titleAlign: GearType.String,
    style: GearType.CssProperties,
    width: GearType.Number,
    height: GearType.Number,
    disabled: GearType.Boolean,
    visible: GearType.Boolean,
    class: GearType.String,
    needUpdateToState: GearType.Array<string>(),
    ...JqueryTagProps
}

export interface state extends JqueryTagState {
    id?: string,
    name?: string,
    title?: string,
    titleAlign?: string,
    disabled?: boolean,
    visible?: boolean,
    className?: string,
    style?: React.CSSProperties
}
export default abstract class Tag<P extends typeof props, S extends state> extends JqueryTag<P, S> {

    //发生改变时不能被更新的属性
    protected cannotUpdate:GearArray<keyof S> = new GearArray<keyof state>(["name","id"]);
    constructor(props: P, context?: any) {
        super(props, context);
        this.state = <Readonly<S>>this.getInitState();
    }

    protected getInitState(): state {
        let commonState = this.getCommonsState();
        let initState = this.getConcatInitialState();
        initState = G.G$.extend(commonState, initState);
        this.deleteFromInitState(initState);
        this.addGetterAndSetterInState(initState);
        return initState;
    }

    //子类按具体功能提供自己的state
    abstract getInitialState(): state;

    protected getConcatInitialState() {
        let state = this.getInitialState();
        let __super = this.getSuper();
        while(__super && __super.getSuper) {
            let fn = __super.getInitialState;
            if(fn) {
                let superState = fn.bind(this)();
                state = G.G$.extend(superState, state);
            }
            __super = __super.getSuper();
        }
        return state;
    }

    protected getSuper() {
        let __proto__ = Object.getPrototypeOf(this.constructor);
        if(__proto__ && __proto__.prototype) {
            return __proto__.prototype;
        }
        return null;
    }

    //提供一個入口，可以在state生效之前刪除其中的内容
    protected deleteFromInitState(state: state):void {
    }

    protected findRealDom() {
        return ReactDOM.findDOMNode(this.ref);
    }

    componentWillMount() {
    }

    //渲染完成之后触发
    componentDidMount() {
        this.realDom = <Element>this.findRealDom();
        if(this.realDom) {
            G.G$(this.realDom).data("vmdom", this);
        }
        this.afterRender();
        this.doEvent("afterRender");
    }

    componentDidUpdate() {
        this.afterUpdate();
        this.doEvent("afterUpdate");
    }

    shouldComponentUpdate(nextProps: P, nextState: S) {
        let shouldUpdate = this.shouldUpdate(nextProps, nextState);
        return shouldUpdate;
    }

    protected afterUpdate() {}

    //父节点改变本节点的props的时候触发
    componentWillReceiveProps(nextProps: P) {
        let state: any = {};
        // if(nextProps.needUpdateToState) {
        //     for(let i in nextProps.needUpdateToState) {
        //         let key = nextProps.needUpdateToState[i];
        //         let vInNextProps: any = nextProps[key];
        //         let vInState: any = this.state[<any>key];
        //         if(key in this.state && vInNextProps != vInState) {
        //             state[<any>key] = vInNextProps;
        //         }
        //     }
        // }
        for(let key in nextProps) {
            let vInNextProps: any = nextProps[key];
            let vInState: any = this.state[<any>key];
            if(key in this.state && vInNextProps != vInState) {
                state[<any>key] = vInNextProps;
            }
        }
        let newState = this.afterReceiveProps(nextProps);
        if(newState && !G.G$.isEmptyObject(newState)) {
            newState.id = "";
            state = G.G$.extend({}, state, newState);
        }
        //排除不能被更新的属性
        for(let key in this.cannotUpdate) {
            delete state[key];
        }
        this.setState(state);
    }

    protected afterReceiveProps(nextProps: P): Partial<typeof props> {return {}};

    protected afterRender(): void{};
    
    //获取公共state
    private getCommonsState(): state {
        let style = this.props.style || {};
        if(this.props.width != undefined) {
            style.width = this.props.width;
        }
        if(this.props.height != undefined) {
            style.height = this.props.height;
        }
        if(this.props.visible == false) {
            style.display = "none";
        }
        let commonState:state = {
            id: this.props.id,
            name: this.props.name,
            title: this.props.title,
            disabled: this.props.disabled,
            className: this.props.class,
            ref: (ele: any)=>{
                this.ref = ele;
            },
            onClick:(e)=>{
                this.doEvent("click",e);
            },  
            onDoubleClick:(e)=>{
                this.doEvent("dblClick",e);
            }, 
            onKeyUp:(e)=>{
                this.doEvent("keyUp",e);
            },  
            onKeyDown:(e)=>{
                this.doEvent("keyDown",e);
            }, 
            onKeyPress:(e)=>{
                this.doEvent("keyPress",e);
            },                                          
            onMouseMove:(e)=>{
                this.doEvent("mouseMove",e);
            },
            onMouseOver:(e)=>{
                this.doEvent("mouseOver",e);
            },
            onMouseDown:(e)=>{
                this.doEvent("mouseDown",e);
            },
            onMouseUp:(e)=>{
                this.doEvent("mouseUp",e);
            },
            onMouseOut:(e)=>{
                this.doEvent("mouseOut",e);
            },
            style: style
        };
        return commonState;
    }

    /**
     * 获取通用的属性
     */
    protected commonState(extend?: state): state {
        let state: state = {};
        let commonState = this.getCommonsState();
        for(let key in commonState) {
            if(extend && extend[key]) {
                state[key] = extend[key];
            }else {
                state[key] = this.state[key];
            }
        }
        return state;
    }

    //重写父类的setState
    setState<K extends keyof S>(
        state: ((prevState: Readonly<S>, props: Readonly<P>) => (Pick<S, K> | S | null)) | (Pick<S, K> | S | null),
        callback?: () => void
    ) {
        super.setState(state, callback);
    }

    /**
     * 判断控件是否是某种类型的控件
     * @param clazz 
     */
    is(clazz: any) {
        let clazzName = clazz;
       
        if(clazz instanceof Function) {
            clazzName = clazz.name;
        }
        return ObjectUtil.isExtends(this.constructor, clazzName);
    }

    /**
     * 重置控件大小
     * @param size 
     */
    resize(size: {width: number, height: number}) {
        let style = this.state.style;
        if(style) {
            style.width = size.width;
            style.height = size.height;
            this.setState({
                style
            });
        }
    }

    //禁止选择
    disable() {
        this.setState({ disabled: true });
    }

    //开放选择
    enable() {
        this.setState({ disabled: false });
    }

    isEnable() {
        if(this.state["disabled"]==true)
            return false;
        else
            return true;
    }

    isDisabled() {
        if(this.state["disabled"]==true)
            return true;
        else
            return false;
    }

    show(){
        let style = this.state.style;
        if(style) {
            style.display = "block";
        }
    }

    hide(){
        let style = this.state.style;
        if(style) {
            style.display = "none";
        }
    }

    protected getKey() {
        return (this.state.name || this.state.id || UUID.get()) + "_key";
    }

}