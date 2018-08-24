import * as React from 'react';
import { Events } from '../core';
import { ObjectUtil } from '../utils';
const lowerFirst = require('lodash/lowerFirst');
export var props = {
    ...Events
}
export interface state {
    ref?(ele: any): void,
    onClick?(e: any): void,  
    onDoubleClick?(e: any): void, 
    onKeyUp?(e: any): void,  
    onKeyDown?(e: any): void, 
    onKeyPress?(e: any): void,                                          
    onMouseMove?(e: any): void,
    onMouseOver?(e: any): void,
    onMouseDown?(e: any): void,
    onMouseUp?(e: any): void,
    onMouseOut?(e: any): void,  
}
export default abstract class JqueryTag<P extends typeof props, S extends state> extends React.Component<P, S> {
    realDom: Element;
    ref: any;
    text: string = "";
    //所有的事件
    events:{} = {};

    constructor(props?: P, context?: any) {
        super(props || <any>{}, context);
        //绑定所有的props里面注册的事件
        this.bindAllEvents();
    }
    //子类按具体功能提供自己的state
    abstract getInitialState(): state;

    protected addOnEventsMethod() {
        for(let key in Events) {
            if(!this[key]) {
                this[key] = (fun: Function)=>{
                    if(fun instanceof Function) {
                        let keyLower = key.substring(2, key.length);
                        keyLower = lowerFirst(keyLower);
                        this.bind(keyLower, fun);
                    }
                }
            }
        }
    }

    protected bindAllEvents() {
        let props = this.props;
        for(let key in props) {
            let event = props[key];
            if(event instanceof Function) {
                if(key.startsWith("on")) {
                    let keyLower = key.substring(2, key.length);
                    keyLower = lowerFirst(keyLower);
                    this.bind(keyLower, event);
                }else {
                    let keyLower = lowerFirst(key);
                    this.bind(keyLower, event);
                } 
            }else {
                if(event instanceof Array) {
                    event.forEach(element => {
                        if(key.startsWith("on")) {
                            let keyLower = key.substring(2, key.length);
                            keyLower = lowerFirst(keyLower);
                            this.bind(keyLower, element);
                        }else {
                            let keyLower = lowerFirst(key);
                            this.bind(keyLower, element);
                        } 
                    });
                }
            }
        }
    }

    //重写setState
    setState<K extends any>(
        state: any,
        callback?: () => void
    ) {
        let _this = this;
        super.setState(state, function(){
            if(callback) {
                callback.call(_this);
            }
        });
    }

    onAfterRender(fun: Function) {
        if(fun && G.G$.isFunction(fun)) {
            this.bind("afterrender",fun);
        }
    }

    onAfterUpdate(fun: Function){
        if(fun && G.G$.isFunction(fun)) {
            this.bind("afterupdate",fun);
        }
    }
    //是否更新
    shouldUpdate(nextProps: P, nextState: S): boolean {
        return true;
    }

    add(...args:any[]){
        let jdom = G.G$(this.realDom);
        return jdom.add.call(jdom,...args);
    }
    addBack(...args:any[]){
        let jdom = G.G$(this.realDom);
        return jdom.addBack.call(jdom,...args);
    }
    addClass(...args:any[]){
        let jdom = G.G$(this.realDom);
        return jdom.addClass.call(jdom,...args);
    }
    after(...args:any[]){
        let jdom = G.G$(this.realDom);
        return jdom.after.call(jdom,...args);
    }
    ajaxComplete(...args:any[]){
        let jdom = G.G$(this.realDom);
        return jdom.ajaxComplete.call(jdom,...args);
    }
    ajaxError(...args:any[]){
        let jdom = G.G$(this.realDom);
        return jdom.ajaxError.call(jdom,...args);
    }
    ajaxSend(...args:any[]){
        let jdom = G.G$(this.realDom);
        return jdom.ajaxSend.call(jdom,...args);
    }
    ajaxStart(...args:any[]){
        let jdom = G.G$(this.realDom);
        return jdom.ajaxStart.call(jdom,...args);
    }
    ajaxStop(...args:any[]){
        let jdom = G.G$(this.realDom);
        return jdom.ajaxStop.call(jdom,...args);
    }
    ajaxSuccess(...args:any[]){
        let jdom = G.G$(this.realDom);
        return jdom.ajaxSuccess.call(jdom,...args);
    }
    animate(...args:any[]){
        let jdom = G.G$(this.realDom);
        return jdom.animate.call(jdom,...args);
    }
    append(...args:any[]){
        let jdom = G.G$(this.realDom);
        return jdom.append.call(jdom,...args);
    }
    appendTo(...args:any[]){
        let jdom = G.G$(this.realDom);
        return jdom.appendTo.call(jdom,...args);
    }
    attr(...args:any[]){
        let jdom = G.G$(this.realDom);
        return jdom.attr.call(jdom,...args);
    }
    before(...args:any[]){
        let jdom = G.G$(this.realDom);
        return jdom.before.call(jdom,...args);
    }
    //绑定事件
    bind(eventName:string,...events: Array<any>) {
        if(eventName && events.length > 0) {
            let eventArr:Array<Function> = this.events[eventName]||[];
            eventArr = eventArr.concat(events);
            this.events[eventName] = eventArr;
        }
        return this;
    }
    blur(...args:any[]){
        let jdom = G.G$(this.realDom);
        return jdom.blur.call(jdom,...args);
    }
    change(...args:any[]){
        let jdom = G.G$(this.realDom);
        return jdom.change.call(jdom,...args);
    }
    children_g_(...args:any[]):JQuery<HTMLElement>{
        let jdom = G.G$(this.realDom);
        return jdom.children.call(jdom,...args);
    }
    clearQueue(...args:any[]){
        let jdom = G.G$(this.realDom);
        return jdom.clearQueue.call(jdom,...args);
    }
    click(...args:any[]){
        let jdom = G.G$(this.realDom);
        return jdom.click.call(jdom,...args);
    }
    clone(...args:any[]){
        let jdom = G.G$(this.realDom);
        return jdom.clone.call(jdom,...args);
    }
    closest(...args:any[]){
        let jdom = G.G$(this.realDom);
        return jdom.closest.call(jdom,...args);
    }
    contents(...args:any[]){
        let jdom = G.G$(this.realDom);
        return jdom.contents.call(jdom,...args);
    }
    contextmenu(...args:any[]){
        let jdom = G.G$(this.realDom);
        return jdom.contextmenu.call(jdom,...args);
    }
    css(...args:any[]){
        let jdom = G.G$(this.realDom);
        return jdom.css.call(jdom,...args);
    }
    data(...args:any[]){
        let jdom = G.G$(this.realDom);
        return jdom.data.call(jdom,...args);
    }
    dblclick(...args:any[]){
        let jdom = G.G$(this.realDom);
        return jdom.dblclick.call(jdom,...args);
    }
    delay_g_(...args:any[]){
        let jdom = G.G$(this.realDom);
        return jdom.delay.call(jdom,...args);
    }
    delegate(...args:any[]){
        let jdom = G.G$(this.realDom);
        return jdom.delegate.call(jdom,...args);
    }
    dequeue(...args:any[]){
        let jdom = G.G$(this.realDom);
        return jdom.dequeue.call(jdom,...args);
    }
    detach(...args:any[]){
        let jdom = G.G$(this.realDom);
        return jdom.detach.call(jdom,...args);
    }
    // each(...args:any[]){
    //     let jdom = G.G$(this.realDom);
    //     return jdom.each.call(jdom,...args);
    // }
    empty(...args:any[]){
        let jdom = G.G$(this.realDom);
        return jdom.empty.call(jdom,...args);
    }
    end(...args:any[]){
        let jdom = G.G$(this.realDom);
        return jdom.end.call(jdom,...args);
    }
    eq(...args:any[]){
        let jdom = G.G$(this.realDom);
        return jdom.eq.call(jdom,...args);
    }
    extend(...args:any[]){
        let jdom = G.G$(this.realDom);
        return jdom.extend.call(jdom,...args);
    }
    fadeIn(...args:any[]){
        let jdom = G.G$(this.realDom);
        return jdom.fadeIn.call(jdom,...args);
    }
    fadeOut(...args:any[]){
        let jdom = G.G$(this.realDom);
        return jdom.fadeOut.call(jdom,...args);
    }
    fadeTo(...args:any[]){
        let jdom = G.G$(this.realDom);
        return jdom.fadeTo.call(jdom,...args);
    }
    fadeToggle(...args:any[]){
        let jdom = G.G$(this.realDom);
        return jdom.fadeToggle.call(jdom,...args);
    }
    filter(...args:any[]){
        let jdom = G.G$(this.realDom);
        return jdom.filter.call(jdom,...args);
    }
    find(...args:any[]):JQuery<HTMLElement>{
        let jdom = G.G$(this.realDom);
        return jdom.find.call(jdom,...args);
    }
    finish(...args:any[]){
        let jdom = G.G$(this.realDom);
        return jdom.finish.call(jdom,...args);
    }
    first(...args:any[]){
        let jdom = G.G$(this.realDom);
        return jdom.first.call(jdom,...args);
    }
    focus(...args:any[]){
        let jdom = G.G$(this.realDom);
        return jdom.focus.call(jdom,...args);
    }
    focusin(...args:any[]){
        let jdom = G.G$(this.realDom);
        return jdom.focusin.call(jdom,...args);
    }
    focusout(...args:any[]){
        let jdom = G.G$(this.realDom);
        return jdom.focusout.call(jdom,...args);
    }
    get(...args:any[]){
        let jdom = G.G$(this.realDom);
        return jdom.get.call(jdom,...args);
    }
    has(...args:any[]){
        let jdom = G.G$(this.realDom);
        return jdom.has.call(jdom,...args);
    }
    hasClass(...args:any[]){
        let jdom = G.G$(this.realDom);
        return jdom.hasClass.call(jdom,...args);
    }
    height_g_(...args:any[]){
        let jdom = G.G$(this.realDom);
        return jdom.height.call(jdom,...args);
    }
    hide(...args:any[]){
        let jdom = G.G$(this.realDom);
        return jdom.hide.call(jdom,...args);
    }
    hover(...args:any[]){
        let jdom = G.G$(this.realDom);
        return jdom.hover.call(jdom,...args);
    }
    html(...args:any[]){
        let jdom = G.G$(this.realDom);
        return jdom.html.call(jdom,...args);
    }
    index(...args:any[]){
        let jdom = G.G$(this.realDom);
        return jdom.index.call(jdom,...args);
    }
    innerHeight(...args:any[]){
        let jdom = G.G$(this.realDom);
        return jdom.innerHeight.call(jdom,...args);
    }
    innerWidth(...args:any[]){
        let jdom = G.G$(this.realDom);
        return jdom.innerWidth.call(jdom,...args);
    }
    insertAfter(...args:any[]){
        let jdom = G.G$(this.realDom);
        return jdom.insertAfter.call(jdom,...args);
    }
    insertBefore(...args:any[]){
        let jdom = G.G$(this.realDom);
        return jdom.insertBefore.call(jdom,...args);
    }
    is(...args:any[]){
        let jdom = G.G$(this.realDom);
        return jdom.is.call(jdom,...args);
    }
    keydown(...args:any[]){
        let jdom = G.G$(this.realDom);
        return jdom.keydown.call(jdom,...args);
    }
    keypress(...args:any[]){
        let jdom = G.G$(this.realDom);
        return jdom.keypress.call(jdom,...args);
    }
    keyup(...args:any[]){
        let jdom = G.G$(this.realDom);
        return jdom.keyup.call(jdom,...args);
    }
    last(...args:any[]){
        let jdom = G.G$(this.realDom);
        return jdom.last.call(jdom,...args);
    }
    load(...args:any[]){
        let jdom = G.G$(this.realDom);
        let hasFun = false;
        //增加渲染方法
        for(let i = 0; i < args.length; i++) {
            if(typeof args[i] === "function") {
                hasFun = true;
                let fun = args[i];
                ((fun)=>{
                    args[i] = ()=>{
                        fun();
                        this.doRender();
                    };
                })(fun);
            }
        }
        if(hasFun == false) {
            args.push(()=>{
                this.doRender();
            });
        }
        return jdom.load.call(jdom,...args);
    }
    map(...args:any[]){
        let jdom = G.G$(this.realDom);
        return jdom.map.call(jdom,...args);
    }
    mousedown(...args:any[]){
        let jdom = G.G$(this.realDom);
        return jdom.mousedown.call(jdom,...args);
    }
    mouseenter(...args:any[]){
        let jdom = G.G$(this.realDom);
        return jdom.mouseenter.call(jdom,...args);
    }
    mouseleave(...args:any[]){
        let jdom = G.G$(this.realDom);
        return jdom.mouseleave.call(jdom,...args);
    }
    mousemove(...args:any[]){
        let jdom = G.G$(this.realDom);
        return jdom.mousemove.call(jdom,...args);
    }
    mouseout(...args:any[]){
        let jdom = G.G$(this.realDom);
        return jdom.mouseout.call(jdom,...args);
    }
    mouseover(...args:any[]){
        let jdom = G.G$(this.realDom);
        return jdom.mouseover.call(jdom,...args);
    }
    mouseup(...args:any[]){
        let jdom = G.G$(this.realDom);
        return jdom.mouseup.call(jdom,...args);
    }
    next(...args:any[]){
        let jdom = G.G$(this.realDom);
        return jdom.next.call(jdom,...args);
    }
    nextAll(...args:any[]){
        let jdom = G.G$(this.realDom);
        return jdom.nextAll.call(jdom,...args);
    }
    nextUntil(...args:any[]){
        let jdom = G.G$(this.realDom);
        return jdom.nextUntil.call(jdom,...args);
    }
    not(...args:any[]){
        let jdom = G.G$(this.realDom);
        return jdom.not.call(jdom,...args);
    }
    off(...args:any[]){
        let jdom = G.G$(this.realDom);
        return jdom.off.call(jdom,...args);
    }
    offset(...args:any[]){
        let jdom = G.G$(this.realDom);
        return jdom.offset.call(jdom,...args);
    }
    offsetParent(...args:any[]){
        let jdom = G.G$(this.realDom);
        return jdom.offsetParent.call(jdom,...args);
    }
    on(...args:any[]){
        let jdom = G.G$(this.realDom);
        return jdom.on.call(jdom,...args);
    }
    one(...args:any[]){
        let jdom = G.G$(this.realDom);
        return jdom.one.call(jdom,...args);
    }
    outerHeight(...args:any[]){
        let jdom = G.G$(this.realDom);
        return jdom.outerHeight.call(jdom,...args);
    }
    outerWidth(...args:any[]){
        let jdom = G.G$(this.realDom);
        return jdom.outerWidth.call(jdom,...args);
    }
    parent(...args:any[]){
        let jdom = G.G$(this.realDom);
        return jdom.parent.call(jdom,...args);
    }
    parents(...args:any[]){
        let jdom = G.G$(this.realDom);
        return jdom.parents.call(jdom,...args);
    }
    parentsUntil(...args:any[]){
        let jdom = G.G$(this.realDom);
        return jdom.parentsUntil.call(jdom,...args);
    }
    position(...args:any[]){
        let jdom = G.G$(this.realDom);
        return jdom.position.call(jdom,...args);
    }
    prepend(...args:any[]){
        let jdom = G.G$(this.realDom);
        return jdom.prepend.call(jdom,...args);
    }
    prependTo(...args:any[]){
        let jdom = G.G$(this.realDom);
        return jdom.prependTo.call(jdom,...args);
    }
    prev(...args:any[]){
        let jdom = G.G$(this.realDom);
        return jdom.prev.call(jdom,...args);
    }
    prevAll(...args:any[]){
        let jdom = G.G$(this.realDom);
        return jdom.prevAll.call(jdom,...args);
    }
    prevUntil(...args:any[]){
        let jdom = G.G$(this.realDom);
        return jdom.prevUntil.call(jdom,...args);
    }
    promise(...args:any[]){
        let jdom = G.G$(this.realDom);
        return jdom.promise.call(jdom,...args);
    }
    _g_prop(...args:any[]){
        let jdom = G.G$(this.realDom);
        return jdom.prop.call(jdom,...args);
    }
    pushStack(...args:any[]){
        let jdom = G.G$(this.realDom);
        return jdom.pushStack.call(jdom,...args);
    }
    queue(...args:any[]){
        let jdom = G.G$(this.realDom);
        return jdom.queue.call(jdom,...args);
    }
    ready(...args:any[]){
        let jdom = G.G$(this.realDom);
        return jdom.ready.call(jdom,...args);
    }
    remove(...args:any[]){
        let jdom = G.G$(this.realDom);
        return jdom.remove.call(jdom,...args);
    }
    removeAttr(...args:any[]){
        let jdom = G.G$(this.realDom);
        return jdom.removeAttr.call(jdom,...args);
    }
    removeClass(...args:any[]){
        let jdom = G.G$(this.realDom);
        return jdom.removeClass.call(jdom,...args);
    }
    removeData(...args:any[]){
        let jdom = G.G$(this.realDom);
        return jdom.removeData.call(jdom,...args);
    }
    removeProp(...args:any[]){
        let jdom = G.G$(this.realDom);
        return jdom.removeProp.call(jdom,...args);
    }
    replaceAll(...args:any[]){
        let jdom = G.G$(this.realDom);
        return jdom.replaceAll.call(jdom,...args);
    }
    replaceWith(...args:any[]){
        let jdom = G.G$(this.realDom);
        return jdom.replaceWith.call(jdom,...args);
    }
    _g_resize(...args:any[]){
        let jdom = G.G$(this.realDom);
        return jdom.resize.call(jdom,...args);
    }
    scroll(...args:any[]){
        let jdom = G.G$(this.realDom);
        return jdom.scroll.call(jdom,...args);
    }
    scrollLeft(...args:any[]){
        let jdom = G.G$(this.realDom);
        return jdom.scrollLeft.call(jdom,...args);
    }
    scrollTop(...args:any[]){
        let jdom = G.G$(this.realDom);
        return jdom.scrollTop.call(jdom,...args);
    }
    select(...args:any[]){
        let jdom = G.G$(this.realDom);
        return jdom.select.call(jdom,...args);
    }
    serialize(...args:any[]){
        let jdom = G.G$(this.realDom);
        return jdom.serialize.call(jdom,...args);
    }
    serializeArray(...args:any[]){
        let jdom = G.G$(this.realDom);
        return jdom.serializeArray.call(jdom,...args);
    }
    show(...args:any[]){
        let jdom = G.G$(this.realDom);
        return jdom.show.call(jdom,...args);
    }
    siblings(...args:any[]){
        let jdom = G.G$(this.realDom);
        return jdom.siblings.call(jdom,...args);
    }
    slice(...args:any[]){
        let jdom = G.G$(this.realDom);
        return jdom.slice.call(jdom,...args);
    }
    slideDown(...args:any[]){
        let jdom = G.G$(this.realDom);
        return jdom.slideDown.call(jdom,...args);
    }
    slideToggle(...args:any[]){
        let jdom = G.G$(this.realDom);
        return jdom.slideToggle.call(jdom,...args);
    }
    slideUp(...args:any[]){
        let jdom = G.G$(this.realDom);
        return jdom.slideUp.call(jdom,...args);
    }
    stop(...args:any[]){
        let jdom = G.G$(this.realDom);
        return jdom.stop.call(jdom,...args);
    }
    submit(...args:any[]){
        let jdom = G.G$(this.realDom);
        return jdom.submit.call(jdom,...args);
    }
    text_g_(...args:any[]){
        let jdom = G.G$(this.realDom);
        return jdom.text.call(jdom,...args);
    }
    toArray(...args:any[]){
        let jdom = G.G$(this.realDom);
        return jdom.toArray.call(jdom,...args);
    }
    toggle(...args:any[]){
        let jdom = G.G$(this.realDom);
        return jdom.toggle.call(jdom,...args);
    }
    toggleClass(...args:any[]){
        let jdom = G.G$(this.realDom);
        return jdom.toggleClass.call(jdom,...args);
    }
    trigger(...args:any[]){
        let jdom = G.G$(this.realDom);
        return jdom.trigger.call(jdom,...args);
    }
    triggerHandler(...args:any[]){
        let jdom = G.G$(this.realDom);
        return jdom.triggerHandler.call(jdom,...args);
    }
    //取消事件的绑定
    unbind(eventName: string,fun?: Function) {
        if(eventName) {
            if(fun) {
                let events = this.events[eventName];
                let index = -1;
                events.map((ele: Function,i: number) => {
                    if(ele == fun) {
                        index = i;
                        return;
                    }
                });
                if(index >=0 ) {
                    let garr = new GearArray(events);
                    garr.remove(index);
                    this.events[eventName] = garr.toArray();
                }
            }else {
                delete this.events[eventName];
            }
        }
        return this;
    }
    undelegate(...args:any[]){
        let jdom = G.G$(this.realDom);
        return jdom.undelegate.call(jdom,...args);
    }
    unwrap(...args:any[]){
        let jdom = G.G$(this.realDom);
        return jdom.unwrap.call(jdom,...args);
    }
    val(...args:any[]){
        let jdom = G.G$(this.realDom);
        return jdom.val.call(jdom,...args);
    }
    width_g_(...args:any[]){
        let jdom = G.G$(this.realDom);
        return jdom.width.call(jdom,...args);
    }
    wrap(...args:any[]){
        let jdom = G.G$(this.realDom);
        return jdom.wrap.call(jdom,...args);
    }
    wrapAll(...args:any[]){
        let jdom = G.G$(this.realDom);
        return jdom.wrapAll.call(jdom,...args);
    }
    wrapInner(...args:any[]){
        let jdom = G.G$(this.realDom);
        return jdom.wrapInner.call(jdom,...args);
    }

    onClick(fun: Function){
        if (fun && G.G$.isFunction(fun)) {
            this.bind("click",fun);
        }
    }

    onDblClick(fun: Function){
        if (fun && G.G$.isFunction(fun)) {
            this.bind("dblclick",fun);
        }
    }

    onKeyUp(fun: Function){
        if (fun && G.G$.isFunction(fun)) {
            this.bind("keyup",fun);
        }
    }  

    onKeyDown(fun: Function){
        if (fun && G.G$.isFunction(fun)) {
            this.bind("keydown",fun);
        }
    }   
    
    onKeyPress(fun: Function){
        if (fun && G.G$.isFunction(fun)) {
            this.bind("keypress",fun);
        }
    }    
    
    onMouseUp(fun: Function){
        if (fun && G.G$.isFunction(fun)) {
            this.bind("mouseup",fun);
        }
    } 
    
    onMouseDown(fun: Function){
        if (fun && G.G$.isFunction(fun)) {
            this.bind("mousedown",fun);
        }
    }     
  
    onMouseMove(fun: Function){
        if (fun && G.G$.isFunction(fun)) {
            this.bind("mousemove",fun);
        }
    }   
    
    onMouseOver(fun: Function){
        if (fun && G.G$.isFunction(fun)) {
            this.bind("mouseover",fun);
        }
    }  
    
    onMouseOut(fun: Function){
        if (fun && G.G$.isFunction(fun)) {
            this.bind("mouseout",fun);
        }
    }
    // 执行带判定逻辑的事件，如果其中有一个过程返回false就返回false
    doJudgementEvent(eventName:string,...param: any[]){
        let ret:any = this.doEvent(eventName,...param);
        if(ret==false)
            return false;
        if(ret!=null && ret instanceof Array){
            for(let i=0;i<ret.length;i++){
                if(ret[0]==false){
                    return false;
                }
            }
        }
        return true;
    }
    //执行事件
    doEvent(eventName: string,...param: any[]) {
        if(eventName) {
            let resultRe:any[] = [];
            let eventArr:Array<Function> = this.events[eventName]||[];
            eventArr.map((ele) => {
                if(ele != null && (typeof ele === "function")) {
                    let result = ele.call(this,...param);
                    if(result != null) {
                        resultRe.push(result);
                    }
                }
            });
            if(resultRe.length > 0) {
                return resultRe;
            }
        }
        return null;
    }

    haveEvent(eventName: string) {
        return this.events[eventName] && this.events[eventName].length > 0;
    }

    doRender(callback?:Function) {
        if(this.realDom) {
            G.render({
                el: this.realDom,
                mounted: (...tags: any[])=>{
                    if(callback) {
                        callback(tags);
                    }
                }
            });
        }
    }

    protected addGetterAndSetterInState(state: any) {
        let className = this.constructor.name;
        let propsTemplete = G.tag[className].props;
        if(propsTemplete) {
            for(let key in state) {
                let vInState = state[key];
                if(vInState instanceof Function && propsTemplete[key] && propsTemplete[key] != Constants.TYPE.Function) {
                    let v = vInState();
                    delete state[key];
                    Object.defineProperty(state, key, {
                        get: function() {
                            if(this["_" + key]) {
                                return this["_" + key];
                            }
                            if(propsTemplete[key].indexOf(Constants.TYPE.Number) != -1) {
                                if(ObjectUtil.isNumber(v)) {
                                    if(ObjectUtil.isInteger(v)) {
                                        this["_" + key] = parseInt(v + "");
                                    }else {
                                        this["_" + key] = parseFloat(v + "");
                                    }
                                }
                            }else if(propsTemplete[key].indexOf(Constants.TYPE.String) != -1) {
                                this["_" + key] = v + "";
                            }else if(propsTemplete[key].indexOf(Constants.TYPE.Array) != -1) {
                                if(v instanceof Array){
                                    this["_" + key] = v;
                                }else {
                                    v = v + "";
                                    if(v.length>0)
                                        this["_" + key] = v.split(",");
                                    else
                                        this["_" + key] = [];
                                } 
                            }else {
                                this["_" + key] = v;
                            }
                            return this["_" + key];
                        },
                        set: function(v) {
                            this["_" + key] = v;
                        }
                    });
                    
                }
            }
        }
    }  
}