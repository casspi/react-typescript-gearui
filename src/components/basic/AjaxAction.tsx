import * as ClickAction from './ClickAction';
import { Http } from '../../utils';
import { methods } from '../../utils/http';
import HttpResponse from '../../beans/HttpResponse';
export var props = {
    ...ClickAction.props,
    method: GearType.Enum<methods>(),
    data: GearType.Or(GearType.Function, GearType.Any),
    confirm: GearType.String,
};
export interface state extends ClickAction.state {
    data?: any;
    method?: methods;
}
export default class AjaxAction<P extends typeof props, S extends state> extends ClickAction.default<P, S> {

    getInitialState(): state {
        return {
            data: this.props.data,
            method: this.props.method
        };
    }

    clickEvent(e?: any) {
        let ret = this.doEvent("click", e);
        if(ret!=null && ret instanceof Array){
            for(let i=0;i<ret.length;i++){
                if(ret[0]!=null && ret[0]==false){
                    return;
                }
            }
        }
        let r = false;
        if(this.haveEvent("beforeProcess")) {
            let re = this.doEvent("beforeProcess");
            r = re ? re[0] : true;
        }else {
            r = AjaxAction.beforeProcess();
        }
        if(r == true){
            if(this.haveEvent("process")) {
                this.doEvent("process");
            }else {
                AjaxAction.process(this);
            }
        }
    }

    static beforeProcess() {
        return true;
    }

    static afterProcess(status?: any,data?: any) {
    }

    static process(obj: AjaxAction<typeof props, state>) {
        
        var method: methods = obj.state.method || "post";
        let url = obj.state.url;
        // 获得请求参数
        let param = obj.state.data;    
        // 提示框的标题
        var title:string = obj.props.title;
        // 提示框中的提醒内容
        var confirm:string = obj.props.confirm;
        var fun = async ()=>{
            if(url != null) {
                let result: HttpResponse = await Http.ajax(method, url, param);
                let data = result.data || {};
                if(result.success) {
                    if(obj.haveEvent("complete")) {
                        obj.doEvent("complete", data);
                    }else {
                        AjaxAction.complete.bind(obj)(obj, data);
                    }
                }else {
                    if(obj.haveEvent("error")) {
                        obj.doEvent("error");
                    }else {
                        AjaxAction.error.bind(obj)(result.message);
                    }
                }
                if(obj.haveEvent("afterProcess")) {
                    obj.doEvent("afterProcess", "finish", data);
                }else {
                    AjaxAction.afterProcess.bind(obj)("finish", data);
                }
            }
        };
        if(confirm){
            G.messager.confirm(title,confirm,(r: boolean)=>{
                if(r){
                    fun.call(obj,obj);
                }
            });
        }else{
            fun.call(obj,obj);
        }
    }

    static complete(obj: AjaxAction<typeof props, state>, data: any) {
        if(data && data.status!=null && data.status==0) {
            // 状态为成功，调用成功的处理过程
            if(obj.haveEvent("success")) {
                obj.doEvent("success", data);
            }else {
                AjaxAction.success.bind(obj)(data);
            }         
        }else{
            // 状态为失败，调用失败的处理过程
            if(obj.haveEvent("failed")) {
                obj.doEvent("failed", data);
            }else {
                AjaxAction.failed.bind(obj)(data);
            }
        }  
    }

    static success(data: any) {
        let message = data.data;
        if(message)
            G.messager.alert("操作提示",message,"info");
        else
            G.messager.alert("操作提示","操作成功","info");
    }

    static failed(data: any) {
        if(data && data.status!=null){
            let message = data.message || data.data;
            if(message){
                if(typeof message == "string") {
                    G.messager.alert("操作提示",message,"error");
                } else {
                    G.messager.alert("操作提示","操作失败","error");
                }
            }else {
                G.messager.alert("操作提示","操作失败","error");
            }
        }else {
            G.messager.alert("操作提示","数据处理失败，返回了错误的数据格式","error");
        }
    }

    static error(err: any) {
        console.error(err);
        G.messager.alert("操作提示","数据请求失败","error"); 
    }

}