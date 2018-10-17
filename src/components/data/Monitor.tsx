import * as React from 'react';
import { InputNumber } from 'antd';

import * as Tag from '../Tag';
import Http, { methods } from '../../utils/http';
import Notification from '../pack/Notification';
import Dialog from '../pack/Dialog';
import * as Websocket from '../Websocket';

export var props = {
    ...Tag.props,
    url: GearType.Or(GearType.String, GearType.Function),
    method: GearType.Enum<methods>(),
    interval: GearType.Number,
    delay: GearType.Number,
    notification: GearType.Any,
    mode: GearType.Enum<'pull' | 'push' | 'mixed'>()
};

export interface state extends Tag.state {
    url: string | Function;
    method: methods;
    // 周期性加载时间间隔（毫秒）
    interval?: number;
    // 延迟加载时间（毫秒）
    delay?:number;
    // 通知的配置
    notification?:any;
    // 数据获取方式 pull：拉 push：推 mixed：混合
    mode?:'pull' | 'push' | 'mixed';
}

export default class Monitor<P extends typeof props, S extends state> extends Tag.default<P, S> {

    // 定时器句柄
    private _intervalHandler: any;

    // 最近的通知时间
    private _lastTime: any;

    // 是否可以运行
    _runable:boolean = true;

    // 是否播放提示音
    _playNotificationSound = true;

    // 当前显示的通知框
    _notifications = {};

    getInitialState(): state {
        return {
            url:this.props.url || "/system/monitor",
            method: this.props.method || "get",
            interval: this.props.interval == null ? 30000 : this.props.interval,
            delay: this.props.delay == null ? 30000 : this.props.delay,
            mode:this.props.mode || "mixed",
            notification: this.props.notification || {}
        };
    }

    getProps() {
        let state = this.state;
        return G.G$.extend({}, state, {
            style:{
                display: "none"
            }
        });
    }

    render() {
        let children = [];
        if(this.state.notification.sound){
            children.push(<audio id="__notification_audio" key={"audio"} src={this.props.notification.sound} preload="auto" loop></audio>);
        }
        let mode = this.state.mode;
        if(mode=="mixed" || mode=="push"){
            let wsprops: any = {
                type:"monitor",
                protocol:"monitor",
                reconnect:true,
                onmessage:(data: any)=>{
                    this._doHandle(JSON.parse(data));
                },
                onopen:()=>{
                }
            };
            children.push(<Websocket.default key={"websocket"} {...wsprops}/>);
        }
        return <div {...this.getProps()}>{children}</div>;
    }

    private readyNextLoadContent(){
        this._intervalHandler = window.setTimeout(()=>{
            this.loadContent();
        },this.state.interval);
    }

    loadContent() {
        if(this._runable==true){
            var method: methods = this.state.method || "get";
            // URL支持动态获取
            let url: any = this.state.url;
            url = Http.absoluteUrl(url);
            let data = {
                lastTime: this._lastTime
            };
            let fn = async () => {
                let result = await Http.ajax(method, url, data);
                if(result.success) {
                    let data = result.data;
                    this._doHandle(data);
                    this.readyNextLoadContent();
                }else {
                    console.error(result.message);
                    this.readyNextLoadContent();   
                }
            };
        }else{
            this.readyNextLoadContent();     
        }
    }

    private _doHandle(data: any){
        if(data){
            if(data.status==0 && data.data) {
                this._doNotification(data.data.notification);
            }
            if(data.status==2){
                // 如果当前未登录，则关闭定时器，停止数据获取
                if(this._intervalHandler!=null){
                    window.clearInterval(this._intervalHandler);
                    this._intervalHandler = null;
                }
            }
            let callback = ()=>{
                if(data.status==2){
                    // 没有登录
                    this._doLogout(data);
                }
            };
            if(data.data && data.data.warn){
                this._doWarn(data.data.warn,callback);
            }else{
                callback.call(this);
            }                    
        }
    }

    private _doNotification(data: any){
        if(data==null)
            return;
        if(this.haveEvent("notification")){
            this.doEvent("notification", data)
        }else{
            let selector;
            if(this.state.notification && this.state.notification.selector){
                selector = this.state.notification.selector;
            }else{
                selector = "#notificationTotal";
            }
            if(data){
                let total = data.total||"0";
                G.G$(selector).text(total);

                let duration;
                if(this.state.notification && this.state.notification.duration){
                    duration = this.state.notification.duration;
                }else{
                    duration = 60;
                }          

                this._lastTime = data.lastTime;
                let list = data.list;

                if(list && list.length>0){
                    // 播放提示音
                    this.__playNotificationSound();

                    for(let i=0;i<list.length;i++){
                        let n = list[i];
                        let content;
                        if(n.url){
                            content = <a href="javascript:void(0)" onClick={()=>{
                                this.show(n.url);
                            }}>{n.description}</a>;
                        }else{
                            content = n.description;
                        }
                        let footer = <span key="time" className="time"><b>时间：</b>{n.time}</span>;
                        if(n.source){
                            footer = <div className="footer">{footer}<span key="source" className="source"><b>来源：</b>{n.source}</span></div>;
                        }else{
                            footer = <div className="footer">{footer}</div>;
                        }
                        let description = <div className="notification-content">
                                            <div key="description" className="description">{content}</div>
                                            {footer}
                                        </div>;
                        let title;
                        if(n.typeUrl){
                            title = <div className="notification-title"><a href="javascript:void(0)" onClick={()=>{
                                this.show(n.typeUrl);
                            }}>{n.title}</a></div>;
                        }else{
                            title = <div className="notification-title">{n.title}</div>;
                        }

                        this._notifications[n.id] = Notification.show({
                            type:n.type,
                            duration:duration,
                            title:title,
                            description:description,
                            onClose:()=>{
                                delete this._notifications[n.id];
                                if(G.G$.isEmptyObject(this._notifications)){
                                    this.__pauseNotificationSound();
                                }
                            }
                        });                    
                    }
                }
            }else{
                G.G$(selector).text("0");
            }
        }
    }

    show(url?: any,options?:any) {
        let showDialog;
        if(this.state.notification && this.state.notification.dialog){
            showDialog = this.state.notification.dialog
        }else{
            showDialog = true;
        }
        if(showDialog==true){
            let dialogWidth = options && options.width?options.width:(this.state.notification && this.state.notification["dialog-width"]?this.state.notification["dialog-width"]:1200);
            let dialogHeight = options && options.height?options.height:(this.state.notification && this.state.notification["dialog-height"]?this.state.notification["dialog-height"]:650);
            let width: any = G.G$(window).width();
            let height: any = G.G$(window).height();
            if(width > dialogWidth)
                width = dialogWidth;
            if(height > dialogHeight)
                height = dialogHeight;
            Dialog.show({
                title:options && options.title?options.title:"查看通知",
                url:url,
                width:width,
                height:height,
            });
        }else{
            let target = options && options.target?options.target:(this.state.notification && this.state.notification.target?this.state.notification.target:"_blank");
            Http.triggerHyperlink(url,target);
        }
    }

    private _doWarn(data: any,callback?:Function){
        if(this.haveEvent("warn")){
            this.doEvent("warn");
        }else{
            if(data.title && data.description){
                G.messager.warning(data.title,data.description,()=>{
                    if(callback)
                        callback.call(this);
                });
            }
        }
    }

    private _doLogout(data: any){
        if(this.haveEvent("logout")){
            this.doEvent("logout");
        }else{
            document.location.href = Http.getRootPath() + "/logout";
        }
    }

    // 播放通知提醒声音
    private __playNotificationSound(){
        if(this._playNotificationSound==true){
            let audio: any = document.getElementById("__notification_audio");
            if(audio){
                audio.play();
            }
        }
    }

    // 停止播放提示音
    private __pauseNotificationSound(){
        let audio: any = document.getElementById("__notification_audio");
        if(audio){
            audio.pause();
        }
    }

    //监听当前页面是否是正在浏览的页面
    //Chrome 13  
    //Internet Explorer 10  
    //Firefox 10  
    //Opera 12.10 [read notes]  
    //The following code makes use of the API, falling back to the less reliable blur/focus method in incompatible browsers.  
    private _registerDocumentActiveListener(){
        var hidden = "hidden";  
        var __this = this;
        var onchange = (evt: any) => {
            //是否隐藏
            var isHidden = true;
            var evtMap = {   
                focus:false, 
                focusin:false, 
                pageshow:false, 
                blur:true, 
                focusout:true, 
                pagehide:true   
            };  
        
            evt = evt || window.event;  
            if (evt.type in evtMap) {
                isHidden = evtMap[evt.type];
            } else {         
                isHidden = this[hidden];
            }
            if(isHidden){
                __this._runable = false;
            }else{
                __this._runable = true;
            }
        };
        // Standards:  
        if (hidden in document)  
            document.addEventListener("visibilitychange", onchange);  
        else if ((hidden = "mozHidden") in document)  
            document.addEventListener("mozvisibilitychange", onchange);  
        else if ((hidden = "webkitHidden") in document)  
            document.addEventListener("webkitvisibilitychange", onchange);  
        else if ((hidden = "msHidden") in document)  
            document.addEventListener("msvisibilitychange", onchange);  
        // IE 9 and lower:  
        else if ('onfocusin' in document)  
            document["onfocusin"] = document["onfocusout"] = onchange;  
        // All others:  
        else  
            window.onpageshow = window.onpagehide = window.onfocus = window.onblur = onchange;  
    }

    // 播放提示音
    playNotificationSound(bool: any){
        this._playNotificationSound = bool;
        if(this._playNotificationSound==false){
            // 如果设为不播放，立即停止当前的播放
            this.__pauseNotificationSound()
        }
    }

}