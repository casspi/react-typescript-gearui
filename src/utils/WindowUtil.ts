import config from './Config';
// import TokenUtil from './Token';
import { UUID, Http } from '.';
// TokenUtil.secret = config.config().prefix;
// TokenUtil.timeStep = 24 * 60 * 60;
export default class WindowUtil {

    static events= {};

    static onresize(fun?: Function) {
        let resizeEvents = this.events["resize"]||[];
        resizeEvents.push(fun);
        this.events["resize"] = resizeEvents;
    }

    //注册window事件
    static init() {
        if(window.addEventListener) {
            document.addEventListener('DOMMouseScroll',this.mouseScroll.bind(this),false);
        }else {
            window.onmousewheel = document.onmousewheel = this.mouseScroll.bind(this);
        }
        window.onresize = this.resize.bind(this);
        window.onscroll = document.onscroll = this.scroll.bind(this);
    }

    private static mouseScroll(e:Event):any {
        let scrollEvents = this.events["mouseScroll"]||[];
        if(scrollEvents.length > 0) {
            for(let i = 0; i < scrollEvents.length; i++) {
                let event = scrollEvents[i];
                if(event instanceof Function) {
                    let re = event(e);
                    if(re == false) {
                        return false;
                    }
                }
            }
        }
    }

    private static scroll(e:Event):any {
        let scrollEvents = this.events["scroll"]||[];
        if(scrollEvents.length > 0) {
            for(let i = 0; i < scrollEvents.length; i++) {
                let event = scrollEvents[i];
                if(event instanceof Function) {
                    let re = event(e);
                    if(re == false) {
                        return false;
                    }
                }
            }
        }
    }

    private static resize(e:Event):any {
        let resizeEvents = this.events["resize"]||[];
        if(resizeEvents.length > 0) {
            for(let i = 0; i < resizeEvents.length; i++) {
                let event = resizeEvents[i];
                if(event instanceof Function) {
                    let re = event(e);
                    if(re == false) {
                        return false;
                    }
                }
            }
        }
    }

    /*
        * 事件注册
        * @param Element     ele 
        * @param String      eventType
        * @param Function    fn
        * @param Boolean     isRepeat
        * @param Boolean     isCaptureCatch
        * @return undefined
    */
    static loginEvent(ele: any, eventType: any, fn: any, isRepeat: any, isCaptureCatch: any) {
        if (ele == undefined || eventType === undefined || fn === undefined) {
            throw new Error('传入的参数错误！');
        }

        if (typeof ele !== 'object') {
            throw new TypeError('不是对象！');
        }

        if (typeof eventType !== 'string') {
            throw new TypeError('事件类型错误！');
        }

        if (typeof fn !== 'function') {
            throw new TypeError('fn 不是函数！');
        }

        if (isCaptureCatch === undefined || typeof isCaptureCatch !== 'boolean') {
            isCaptureCatch = false;
        }

        if (isRepeat === undefined || typeof isRepeat !== 'boolean') {
            isRepeat = true;
        }

        if (ele.eventList === undefined) {
            ele.eventList = {};
        }

        let typeN = "";
        if (document["mozFullScreen"] !== undefined) {
            typeN = "DOMMouseScroll";
        }

        if (isRepeat === false) {
            for (var key in ele.eventList) {
                if (key === eventType || key == typeN) {
                    return '该事件已经绑定过！';
                }
            }
        }

        // 添加事件监听
        if (ele.addEventListener) {
            if (document["mozFullScreen"] !== undefined) {
                eventType = "DOMMouseScroll";
            }
            ele.addEventListener(eventType, fn, isCaptureCatch);
            
        } else if (ele.attachEvent) {
            ele.attachEvent('on' + eventType, fn);
        } else {
            return false;
        }

        ele.eventList[eventType] = true;
        return;
    }

    static getUserIdFromSession() {
        if(window.localStorage) {
            return window.localStorage.getItem(`${config.config().prefix}userId`);
        }else {
            return Http.getCookie(`${config.config().prefix}userId`);
        }
        
    }

    static setUserIdFromSession(userId: string) {
        if(window.localStorage) {
            window.localStorage.setItem(`${config.config().prefix}userId`, userId);
        }else {
            Http.setCookie(`${config.config().prefix}userId`, userId);
        }
    }

    static getSessionId() {
        if(window.localStorage) {
            return window.localStorage.getItem(`${config.config().prefix}sessionId`);
        }else {
            return Http.getCookie(`${config.config().prefix}sessionId`);
        }
        
    }

    static setSessionId() {
        let sessionId = UUID.uuid(24,88);
        if(window.localStorage) {
            window.localStorage.setItem(`${config.config().prefix}sessionId`, sessionId);
        }else {
            Http.setCookie(`${config.config().prefix}sessionId`, sessionId);
        }
    }

    static getIeVersion() {
        if(navigator) {
            var browser=navigator.appName;
            var b_version=navigator.appVersion;
            if(browser && b_version) {
                var version=b_version.split(";"); 
                if(version && version[1]) {
                    var trim_Version=version[1].replace(/[ ]/g,"");
                    if(browser=="Microsoft Internet Explorer") {
                        if(browser=="Microsoft Internet Explorer" && trim_Version=="MSIE6.0") {
                            return 6;
                        }
                        else if (browser == "Microsoft Internet Explorer" && trim_Version == "MSIE7.0") {
                            return 7;
                        }
                        else if (browser == "Microsoft Internet Explorer" && trim_Version == "MSIE8.0") {
                            return 8;
                        }
                        else if (browser == "Microsoft Internet Explorer" && trim_Version == "MSIE9.0") {
                            return 9;
                        } else {
                            return 10;
                        }
                    }
                }
            }
        }
        return -1;
    }

    static extendPrototype() {
        //扩展js原生方法
        if (typeof String.prototype["startsWith"] != 'function') {  
            String.prototype["startsWith"] = function (prefix: any){  
               try {
                    var reg = new RegExp("^" + prefix);
                    return reg.test(this.toString());
                } catch (e) {
                    console.error("字符" + prefix + "可能需要转义");
                }
                return false;
            };  
        }
        //扩展js原生方法
        if (typeof String.prototype["endsWith"] != 'function') {  
            String.prototype["endsWith"] = function (prefix: any){  
                try {
                    var reg = new RegExp(prefix + "$");
                    return reg.test(this.toString());
                } catch (e) {
                    console.error("字符" + prefix + "可能需要转义");
                }
                return false;
            };  
        }
        //扩展js原生方法
        if (typeof Array.prototype["toStringBySeparator"] != 'function') { 
            Array.prototype["toStringBySeparator"] = function (separator: any){  
                var re = "";
                for (var i = 0; i < this.length; i++) {
                    if(re.length > 0) {
                        re += separator;
                    }
                    re += this[i];
                }
                return re;
            };  
        }
        //为数组增加contain方法，用于判断数组中是否存在传入值
        if(typeof Array.prototype["contains"] != "function") {
            Array.prototype["contains"] = function (val: any){
                var i = this.length;  
                while (i--) {
                    if (this[i] === val) {  
                        return true;  
                    }  
                }  
                return false;                 
            }
        }

        //为数组增加indexOf方法，用于判断数组中传入值的位置，返回-1则表示未的攻到
        if (!Array["indexOf"]){
            if(typeof Array.prototype["indexOf"] != "function") {
                Array.prototype["indexOf"] = function (val){
                    for (var i = 0; i < this.length; i++) {  
                        if (this[i] == val) {  
                            return i;  
                        }  
                    }  
                    return -1;                 
                }
            }    
        }    

        if(typeof Date.prototype["format"] != "function") {
            Date.prototype["format"] = function(fmt: any) { 
                var o = { 
                   "M+" : this.getMonth()+1,                 //月份 
                   "d+" : this.getDate(),                    //日 
                   "h+" : this.getHours(),                   //小时 
                   "m+" : this.getMinutes(),                 //分 
                   "s+" : this.getSeconds(),                 //秒 
                   "q+" : Math.floor((this.getMonth()+3)/3), //季度 
                   "S"  : this.getMilliseconds()             //毫秒 
               }; 
               if(/(y+)/.test(fmt)) {
                       fmt=fmt.replace(RegExp.$1, (this.getFullYear()+"").substr(4 - RegExp.$1.length)); 
               }
                for(var k in o) {
                   if(new RegExp("("+ k +")").test(fmt)){
                        fmt = fmt.replace(RegExp.$1, (RegExp.$1.length==1) ? (o[k]) : (("00"+ o[k]).substr((""+ o[k]).length)));
                    }
                }
               return fmt; 
           } 
        }
    }
}