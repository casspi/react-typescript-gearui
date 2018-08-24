import * as ClickAction from './ClickAction';
import { Http } from '../../utils';
import { methods } from '../../utils/http';
import HttpResponse from '../../beans/HttpResponse';
export var props = {
    ...ClickAction.props,
    method: GearType.VoidT<methods>(),
    data: GearType.Or(GearType.Function, GearType.Any),
    confirm: GearType.String,
};
export interface state extends ClickAction.state {
    data?: any;
}
export default class AjaxAction<P extends typeof props, S extends state> extends ClickAction.default<P, S> {

    getInitialState(): state {
        let superState: state = super.getInitialState();
        superState.data = this.props.data;
        return superState;
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

        let r = this.doEvent("beforeprocess");
        if(!r || r.length <= 0 || r[0] == true){
            if(this.haveEvent("process")) {
                this.doEvent("process");
            }else {
                AjaxAction.process(this);
            }
            this.doEvent("afterProcess");
        }
    }

    onBeforeProcess(fun?: Function){
        if(fun instanceof Function) {
            this.bind("beforeprocess", fun);
        }
    }

    onAfterProcess(fun?: Function){
        if(fun instanceof Function) {
            this.bind("afterProcess", fun);
        }  
    }  

    static process(obj: AjaxAction<typeof props, state>) {
        
        var method: methods = obj.props.method || "post";
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
                let data = result.data;
                if(data) {
                    if(obj.haveEvent("complete")) {
                        obj.doEvent("complete");
                    }else {
                        AjaxAction.complete();
                    }
                }
            }
            // Ajax.getMethod(method)(url,data).done((data) => {
            //     // ajax请求成功
            //     if(obj._complete==null)
            //         AjaxAction._complete(obj,data);
            //     else
            //         obj._complete.call(obj,data);
            //     if(obj._afterProcess){
            //         obj._afterProcess.call(obj,"finish",data);
            //     }else{
            //         Ajaxaction._afterProcess(obj,"finish",data);
            //     }                         
            // }).fail((err) => {
            //     // ajax请求失败
            //     if(obj._error==null)
            //         Ajaxaction._error(obj,err);
            //     else
            //         obj._error.call(obj,err);
            //     if(obj._afterProcess){
            //         obj._afterProcess.call(obj,"error",err);
            //     }else{
            //         Ajaxaction._afterProcess(obj,"error",err);
            //     }                         
            // });
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
            if(obj._success) {
                obj._success.call(obj,data);
            }else {
                Ajaxaction._success(obj,data);
            }         
        }else{
            // 状态为失败，调用失败的处理过程
            if(obj._failed) {
                obj._failed.call(obj,data);
            }else {
                Ajaxaction._failed(obj,data);
            }
        }  
    }

    static success() {

    }

    onSuccess(fun?: Function){
        if(fun instanceof Function) {
            this.bind("success", fun);
        }  
    }

    onComplete(fun?: Function){
        if(fun instanceof Function) {
            this.bind("complete", fun);
        }  
    }

}