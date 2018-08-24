// import { Http } from ".";
// import { methods } from "./http";

// export interface DicParam {
//     error?: Function;
//     url?: string;
//     method?: methods;
//     dictype?: string | Object;
// }
// export default class DicUtil {
//     static url_global = "/dictionary/tree";

//     static url_data_global = "/dictionary/data";

//     static updateDic(dictype: string,dic: any) {
//         if(dictype && window[dictype]) {
//             window[dictype] = dic;
//         }
//     }

//     static getDic(param: DicParam) {
//         let error = param.error || function () { };
//         let url = param.url;
//         let method = param.method || "get";
//         let dic = param.dictype;
//         if (typeof dic == "string" && window[dic]) {
//             dic = window[dic];
//         }
//         if (url && url.length > 0) {
//             if (url.indexOf("http:") != 0) {
//                 //url = Util.getRootPath() + url;
//             }
//             let json: any = Http.getMethod(method)(url);
//             if(json && json.status==0) {
//                 return json.data;
//             } else {
//                 return json;
//             }
//         } else {
//             if(dic){
//                 if (typeof dic == "object") {
//                     if (dic instanceof Array) {
//                         let arr = new GearArray<any>(dic);
//                         return arr.clone().toArray();
//                     } else {
//                         return G.G$.extend(true, {}, dic);
//                     }
//                 } else if (typeof dic == "string") {
//                     //如果dic_url在当前代码之前被执行，就直接执行获取字典代码，否则就定义事件，等待自定义设置解析完成之后触发
//                     if (this.url_global) {
//                         this.getDicFromDependUrl(dic, function(json){
//                             if(json && json.status==0) {
//                                 window[dic] = json.data;
//                             }else {
//                                 window[dic] = json;
//                             }
//                             if (window[dic] instanceof Array) {
//                                 let arr = new GearArray<any>(window[dic]);
//                                 callback(arr.clone().toArray());
//                             } else {
//                                 callback(G.G$.extend(true, {}, window[dic]));
//                             }
//                         }, error, method);
//                     }
//                 }
//             }else{
//                 return dic;
//             }
//         }
//     }

//     private static getDicFromDependUrl(dic: any, callback, error, method) {
//         var url = this.url_global;
//         if (url) {
//             if (url.indexOf(".json") != -1 && url.indexOf(".json") == (url.length - 5)) {
//                 this.getJsonDic(url, callback);
//             } else {
//                 url = this.getGlobalUrl(dic);
//                 Ajax.getMethod(method)(url).done(callback).fail(error);
//             }
//         }
//     }

//     private static getJsonDic(url, callback) {
//         //从静态json文件中获取字典
//         Ajax.get(url).done(function (dic) {
//             if (dic && this.attr("dictype")) {
//                 var diclib = this.attr("dictype").split(".");
//                 var dicTemp = dic[diclib[0]];
//                 for (var i = 1; i < diclib.length; i++) {
//                     if (dicTemp) {
//                         dicTemp = dicTemp[diclib[i]];
//                     } else {
//                         break;
//                     }
//                 }
//                 dic = dicTemp;
//                 if (callback) {
//                     if (dic instanceof Array) {
//                         let arr = new GearArray<any>(dic);
//                         callback(arr.clone().toArray());
//                     } else {
//                         callback(G.G$.extend(true, {}, dic));
//                     }

//                 }
//             }
//         }.bind(this));
//     }

//     //获取全局字典的url
//     private static getGlobalUrl(dictype?) {
//         let url = Util.getRootPath() + this.url_global;
//         if (dictype) {
//             if (url.indexOf('?') != -1) {
//                 url += '&type=' + dictype;
//             } else {
//                 url += '?type=' + dictype;
//             }
//         }
//         return url;
//     }

//     static filterDic(dic) {
//         let treeNodes:Array<any> = null;
//         if(dic['data']) {
//             treeNodes = dic.data;
//         }else {
//             treeNodes = dic;
//         }
//         let parse = (dataInner:any) => {
//             if(!dataInner["label"]) {
//                 dataInner["label"] = dataInner["text"];
//             }
//             if(!dataInner["value"]) {
//                 dataInner["value"] = dataInner["id"];
//             }
//         };
//         for(let i = 0; i < treeNodes.length; i++) {
//             parse(treeNodes[i]);
//         }
//         return treeNodes;
//     }

//     // 通过文本获取对应值
//     static getTextByValue(value,options?:Array<any>) {
//         options = options||[];
//         let text = null;
//         for(let i = 0; i < options.length; i++) {
//             let ele = options[i];
//             if(ele instanceof Array) {
//                 return this.getTextByValue(value,ele);
//             }else {
//                 if(ele.value == value) {
//                     return ele.label;
//                 }else {
//                     if(ele.children instanceof Array) {
//                         let label = this.getTextByValue(value,ele.children);
//                         if(label != null) {
//                             return label;
//                         }
//                     }
//                 }
//             }
//         }
//         return text;
//     }
// }