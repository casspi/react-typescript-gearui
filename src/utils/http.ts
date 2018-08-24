import { Message } from "../beans";
import Config from './Config';
const {YQL, CORS} = Config.config();
const qs = require('qs');
const jsonp = require('jsonp');
// const lodash = require('lodash');
const pathToRegexp = require('path-to-regexp');
import HttpResponse from "../beans/HttpResponse";
import { WindowUtil, config } from ".";
const axios = require('axios').default;
// axios.defaults.withCredentials = true;
axios.interceptors.request.use((config: any) => {
    config.withCredentials = true;
    const token = Http.getCookie("sessionId") || WindowUtil.getSessionId();
    const data = config.data;
    config.data = qs.stringify(data);
    config.headers = {
        'Content-Type': 'application/x-www-form-urlencoded',
    };
    config.headers[Constants.SESSION_COOKIENAME] = token;
    let ieVersion = WindowUtil.getIeVersion();
    if(ieVersion > -1 && ieVersion < 10) {
        if(token) {
            config.params = data;
            config.params[Constants.SESSION_COOKIENAME] = token;
        }
    }
    return config;
},(err: any) => {
    return Promise.reject(err.response.data);
});
axios.interceptors.response.use((response: any)=>{
    return response;
},(err: any) => {
    return Promise.reject(err);
});
export type methods = 'post'|'get'|'delete'|'put'|'options'|'trace'|'head';
export default class Http {

    static ajaxDataType = ["xml","html","text","script","json","jsonp"];

    static fetch(options: any):Promise<any> {
        let {
            method = options.method,
            data,
            dataType,
            url,
        } = options

        const cloneData = G.G$.extend(true,{},data);

        try {
            let domin = ''
            if (url.match(/[a-zA-z]+:\/\/[^/]*/)) {
                domin = url.match(/[a-zA-z]+:\/\/[^/]*/)[0]
                url = url.slice(domin.length)
            }
            const match = pathToRegexp.parse(url)
            url = pathToRegexp.compile(url)(data)
            for (let item of match) {
                if (item instanceof Object && item['name'] in cloneData) {
                    delete cloneData[item['name']]
                }
            }
            url = domin + url
        } catch (e) {
            console.error(e);
        }

        if (dataType === 'JSONP') {
            return new Promise((resolve, reject) => {
                // options.jsonp = "jsonpCallback";
                // G.G$.ajax(options).done((data)=>{
                //     resolve( { statusText: 'OK', status: 200, data: data })
                // }).fail((error) => {
                //     reject(error)
                // });
                jsonp(url, {
                    param: `${qs.stringify(data)}&callback`,
                    name: `jsonp_${new Date().getTime()}`,
                    timeout: 6400,
                }, (error: any, result: any) => {
                    if (error) {
                        reject(error)
                    }
                    resolve( { statusText: 'OK', status: 200, data: result })
                })
            });
        } else if (dataType === 'YQL') {
            url = `http://query.yahooapis.com/v1/public/yql?q=select * from json where url='${options.url}?${encodeURIComponent(qs.stringify(options.data))}'&format=json`
            data = null
        }


        switch (method.toLowerCase()) {
            case 'get':
                return axios.get(url, {
                    params: cloneData,
                })
            case 'delete':
                return axios.delete(url, {
                    data: cloneData,
                })
            case 'post':
                return axios.post(url, cloneData)
            case 'put':
                return axios.put(url, cloneData)
            case 'patch':
                return axios.patch(url, cloneData)
            default:
                return axios(options)
        }
    }

    /**
     * 发起请求
     * @param options 
     */
    static requestAxios(options: any) {
        if (options.url && options.url.indexOf('//') > -1) {
            const origin = `${options.url.split('//')[0]}//${options.url.split('//')[1].split('/')[0]}`;
            if (window.location.origin !== origin) {
                if (CORS && CORS.indexOf(origin) > -1) {
                    options.dataType = 'CORS'
                } else if (YQL && YQL.indexOf(origin) > -1) {
                    options.dataType = 'YQL'
                } else {
                    options.dataType = 'JSONP'
                }
            }
        }
        return Http.fetch(options).then((response: any) => {
            const { statusText, status } = response;
            let data = options.fetchType === 'YQL' ? response.data.query.results.json : response.data;
            if(status == 200) {
                let dataStatus = data.status;
                if(dataStatus != undefined) {
                    if(dataStatus == Message.SUCCESS) {
                        return Promise.resolve(new HttpResponse(true, statusText, status, data));
                    }else if(dataStatus == Message.NOLOGIN) {
                        return Promise.resolve(new HttpResponse(true, statusText, dataStatus, data));
                    }else {
                        let msg = data.message || statusText;
                        return Promise.reject(new HttpResponse(false, msg, dataStatus));
                    }
                }else {
                    return Promise.resolve(new HttpResponse(true, statusText, status, data));
                }
            }else {
                const { data, statusText } = response;
                let statusCode = response.status;
                let msg = data.message || statusText;
                return Promise.reject(new HttpResponse(false, msg, statusCode));
            }
        }).catch((error: any) => {
            const { response } = error;
            let msg;
            let statusCode;
            if (response && response instanceof Object) {
                const { data, statusText } = response
                statusCode = response.status
                msg = data.message || statusText
            } else {
                statusCode = 600;
                msg = error.message || 'Network Error';
            }
            return Promise.reject(new HttpResponse(false, msg, statusCode));
        })
    }

    static putSessionIdInCookie(exdays?: number) {
        let cname = Constants.SESSION_COOKIENAME;
        let cvalue:any = WindowUtil.getSessionId();
        Http.setCookie(cname,cvalue);
    }

    static setCookie(cname: any,cvalue: any,exdays?: number) {
        exdays = exdays || 30;
        var d: any = new Date();
        d.setTime(d.getTime() + (exdays * 24 * 60 * 60 * 1000));
        var expires = "expires=" + d.toGMTString();
        document.cookie = cname + "=" + escape(cvalue) + "; " + expires;
    }

    static getCookie(name: any) {
        const reg = new RegExp('(^| )' + name + '=([^;]*)(;|$)');
        const arr = document.cookie.match(reg);
        if (arr) {
            // unescape
            return decodeURIComponent(arr[2]);
        } else {
            return null;
        }
    }

    //用于获取web-root-url
    static rootPath(){
        return Http.getRootPath();
    }

    //转换相对路径的url为完整路径，url须以/开头
	static absoluteUrl(url: string){
        var root = Http.getRootContext();
        if(url){
            if(/^\//.test(url))
                return root + url;
            else
                return url;
        }else{
            return root;
        }
    }

    static getRootContext() {
        var meta = document.getElementsByTagName("meta")["web-context"];
        var projectName= '';
        if(meta && meta[0]) {
            projectName = meta.attr("content");
        }else {
            projectName= config.api.rootContext||this.getPathName().substring(0,this.getPathName().substr(1).indexOf('/')+1);
        }
        return projectName;
    }

    //获取项目根目录 如： http://localhost:8083/uimcardprj
    static getRootPath (){
        //获取带"/"的项目名，如：/uimcardprj
        let projectName = this.getRootContext();
        var rootPath = (this.getLocalhostPath());
        if(rootPath.indexOf("localhost") != -1 || rootPath.indexOf("127.0.0.1") != -1) {
            rootPath = rootPath + projectName;
        }
        return rootPath;
    }

    //获取主机地址之后的目录，如： uimcardprj/share/meun.jsp      
    static getPathName() {
        return window.document.location.pathname;
    }

    //获取主机地址，如： http://localhost:8083
    static getLocalhostPath() {
        var pos=this.getPath().indexOf(this.getPathName());    
        return this.getPath().substring(0,pos); 
    }

    //获取当前网址，如： http://localhost:8083/uimcardprj/share/meun.jsp   
    static getPath() {
        return window.document.location.href;
    }

    // 通过超链接的方式打开地址
    static triggerHyperlink(url:string,target?:string){
        var tempid = "_hiden_Hyperlink_";  
        var obj = document.getElementById(tempid);  
        if(!obj) {  
            var el = document.createElement("A");  
            el.style.display = "none";  
            el.setAttribute("id", tempid);  
            el.setAttribute("href", "javascript:void(0);");  
            document.body.appendChild(el);  
            obj = document.getElementById(tempid);
        } 
        if(obj != null) {
            obj.setAttribute("href", url||"");  
            obj.setAttribute("target", target||"");  
            obj.click(); 
        }
    }

    static formatParam(args: any) {
        if(args.length==1 && typeof args[0] == "object"){
            return args[0];
        }
        var url = "";
        var async = true;
        var dataType = "json";
        var data = null;
        for(var i in args) {
            if(typeof args[i] == "string") {
                if(typeof args[i] == "string" && Http.ajaxDataType.indexOf(args[i]) != -1) {
                    dataType = args[i];
                }else {
                    if(args[i].indexOf("?")==-1 && args[i].indexOf("=")!=-1){
                        data = args[i];
                    }else if(args[i].length>0){
                        url = args[i];
                    }
                }
            }
            if(typeof args[i] == "boolean") {
                async = args[i];
            }
            if(typeof args[i] == "object") {
                data = args[i];
            }
            if(typeof args[i] == "number"){

            }
        }

        if(url && url.length > 0) {
            return {url: url,async: async,dataType: dataType,data: data,traditional:true};
        }else {
            console.error("找不到参数 url");
            return false;
        }
    }

    static getMethod(name: methods) {
        if(name == 'delete') {
            return Http.delete;
        }else if(name == 'get') {
            return Http.get;
        }else if(name == 'head') {
            return Http.head;
        }else if(name == 'options') {
            return Http.options;
        }else if(name == 'post') {
            return Http.post;
        }else if(name == 'put') {
            return Http.put;
        }else {
            return Http.trace;
        }
    }

    static post(...args: any[]) {
        var param = Http.formatParam(args);
        if(param === false) {
            return Promise.reject(new HttpResponse(false, "param is null", 600));
        }
        var _param = G.G$.extend(param,{method:"POST"});
        if(_param.async == false) {
            return G.G$.ajax(_param);
        }
        return Http.requestAxios(_param);
    }
    static get(...args: any[]) {
        var param = Http.formatParam(args);
        if(param === false) {
            return Promise.reject(new HttpResponse(false, "param is null", 600));
        }
        var _param = G.G$.extend(param,{method:"GET"});
        if(_param.async == false) {
            return G.G$.ajax(_param);
        }
        return Http.requestAxios(_param);
    }
    static put(...args: any[]) {
        var param = Http.formatParam(args);
        if(param === false) {
            return Promise.reject(new HttpResponse(false, "param is null", 600));
        }
        if(!param.data){
            param.data = {};
        }    
        param.data["_method"] = "PUT";    
        var _param = G.G$.extend(param,{method:"POST"});
        if(_param.async == false) {
            return G.G$.ajax(_param);
        }
        return Http.requestAxios(_param);
    }
    static delete(...args: any[]) {
        var param = Http.formatParam(args);
        if(param === false) {
            return Promise.reject(new HttpResponse(false, "param is null", 600));
        }
        if(!param.data){
            param.data = {};
        }    
        param.data["_method"] = "DELETE"; 
        var _param = G.G$.extend(param,{method:"POST"});
        if(_param.async == false) {
            return G.G$.ajax(_param);
        }
        return Http.requestAxios(_param);
    }
    static options(...args: any[]) {
        var param = Http.formatParam(args);
        if(param === false) {
            return Promise.reject(new HttpResponse(false, "param is null", 600));
        }
        var _param = G.G$.extend(param,{method:"OPTIONS"});
        if(_param.async == false) {
            return G.G$.ajax(_param);
        }
        return Http.requestAxios(_param);
    }
    static head(...args: any[]) {
        var param = Http.formatParam(args);
        if(param === false) {
            return Promise.reject(new HttpResponse(false, "param is null", 600));
        }
        var _param = G.G$.extend(param,{method:"HEAD"});
        if(_param.async == false) {
            return G.G$.ajax(_param);
        }
        return Http.requestAxios(_param);
    }
    static trace(...args: any[]) {
        var param = Http.formatParam(args);
        if(param === false) {
            return Promise.reject(new HttpResponse(false, "param is null", 600));
        }
        var _param = G.G$.extend(param,{method:"TRACE"});
        if(_param.async == false) {
            return G.G$.ajax(_param);
        }
        return Http.requestAxios(_param);
    }
    //跳转到一个指定页面
    static redirect(page: string) {
        if(page.startsWith("http://")) {
            document.location.href = page;
        }else {
            if(!page.startsWith("/")) {
                document.location.href = Http.getRootPath() + "/" + page;
            }else {
                document.location.href = Http.getRootPath() + page;
            }
        }
    }

    static async ajax(method: methods,...args: any[]):Promise<HttpResponse> {
        let p = Http.getMethod(method)(...args);
        if(p) {
            return p.then((response)=>{
                return Promise.resolve(response);
            }).catch((error)=>{
                return Promise.resolve(error);
            });
        }
        return p;
    }

}