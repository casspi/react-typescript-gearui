import { Http } from ".";
import { methods } from "./http";
import HttpResponse from "../beans/HttpResponse";

export interface DicParam {
    url?: any;
    method?: methods;
    dictype?: any;
}
export default class DicUtil {
    private static url_global = "/dictionary/tree";

    static url_data_global = "/dictionary/data";

    static updateDic(dictype: any, dic: any) {
        if(dictype && window[dictype]) {
            window[dictype] = dic;
        }
    }

    static async getDic(param: DicParam) {
        let url = param.url;
        let method = param.method || "get";
        let dictype = param.dictype;
        if (typeof dictype == "string" && window[dictype]) {
            dictype = window[dictype];
        }
        if (url && url.length > 0) {
            return Http.ajax(method, url);
        } else {
            if(dictype){
                let dicNew;
                if (typeof dictype == "object") {
                    if (dictype instanceof Array) {
                        let arr = new GearArray<any>(dictype);
                        dicNew = arr.clone().toArray();
                    } else {
                        dicNew = G.G$.extend(true, {}, dictype);
                    }
                } else if (typeof dictype == "string") {
                    //如果dic_url在当前代码之前被执行，就直接执行获取字典代码，否则就定义事件，等待自定义设置解析完成之后触发
                    if (DicUtil.url_global) {
                        let result = await DicUtil.getDicFromDependUrl(dictype, method);
                        if(result.success && result.data && result.data.status == 0) {
                            window[dictype] = result.data.data;
                        }else {
                            window[dictype] = result.data;
                        }
                        if (window[dictype] instanceof Array) {
                            let arr = new GearArray<any>(window[dictype]);
                            dicNew = arr.clone().toArray()
                        } else {
                            dicNew = G.G$.extend(true, {}, window[dictype]);
                        }
                    }
                }
                let response = new HttpResponse(true, "",0 , dicNew);
                return Promise.resolve(response);
            }else{
                return Promise.reject({success: false, message: "无字典", statuCode: 99});
            }
        }
    }

    private static async getDicFromDependUrl(dictype: any, method: methods) {
        var url = DicUtil.url_global;
        if (url.indexOf(".json") != -1 && url.indexOf(".json") == (url.length - 5)) {
            return DicUtil.getJsonDic(url, dictype);
        } else {
            url = DicUtil.getGlobalUrl(dictype);
            return Http.ajax(method, url);
        }
    }

    //从静态json文件中获取字典
    private static async getJsonDic(url: string, dictype: any) {
        let result = await Http.ajax("get", url);
        if(result.success) {
            let dic = result.data;
            if(dictype) {
                var diclib = dictype.split(".");
                var dicTemp = dic[diclib[0]];
                for (var i = 1; i < diclib.length; i++) {
                    if (dicTemp) {
                        dicTemp = dicTemp[diclib[i]];
                    } else {
                        break;
                    }
                }
                dic = dicTemp;
            }
            result.data = dic;
            return Promise.resolve(result);
        }
        return Promise.reject(result);
    }

    //获取全局字典的url
    private static getGlobalUrl(dictype?: string) {
        let url = DicUtil.url_global;
        if (dictype) {
            if (url.indexOf('?') != -1) {
                url += '&type=' + dictype;
            } else {
                url += '?type=' + dictype;
            }
        }
        return url;
    }

    static filterDic(dic: any) {
        let treeNodes: Array<any>;
        if(dic['data']) {
            treeNodes = dic.data;
        }else {
            treeNodes = dic;
        }
        let parse = (dataInner:any) => {
            if(!dataInner["label"]) {
                dataInner["label"] = dataInner["text"];
            }
            if(!dataInner["value"]) {
                dataInner["value"] = dataInner["id"];
            }
        };
        for(let i = 0; i < treeNodes.length; i++) {
            parse(treeNodes[i]);
        }
        return treeNodes;
    }

    // 通过文本获取对应值
    static getTextByValue(value: any,options?:Array<any>): any {
        options = options||[];
        let text = null;
        for(let i = 0; i < options.length; i++) {
            let ele = options[i];
            if(ele instanceof Array) {
                return DicUtil.getTextByValue(value,ele);
            }else {
                if(ele.value == value) {
                    return ele.label;
                }else {
                    if(ele.children instanceof Array) {
                        let label: any = DicUtil.getTextByValue(value,ele.children);
                        if(label != null) {
                            return label;
                        }
                    }
                }
            }
        }
        return text;
    }
}