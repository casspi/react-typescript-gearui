import * as React from 'react';
import * as ClickAction from './ClickAction';
import Http, { methods } from '../../utils/http';
import Table from '../data/Table';
export var props = {
    ...ClickAction.props,
    method: GearType.Enum<methods>(),
    actionName: GearType.String,
    listId: GearType.String,
    refreshList: GearType.Boolean,
    parameters: GearType.Or<Function, string>(GearType.Function, GearType.String),
    confirm: GearType.String,
};

export interface state extends ClickAction.state {
    method: methods;
    actionName?: string;
    listId?: string;
    refreshList?: boolean;
    parameters?: string|Function;
    confirm?: string;
}

export default class ListAction<P extends typeof props, S extends state> extends ClickAction.default<P, S> {


    getInitialState():state {
        return {
            method: this.props.method || "post",
            listId: this.props.listId,
            actionName: this.props.actionName,
            refreshList: this.props.refreshList != false,
            parameters: this.props.parameters,
            confirm: this.props.confirm
        };
    }

    // 点击事件
    protected clickEvent(e: any){
        if(this.doJudgementEvent("click",e)==false){
            return;
        }

        let actionType = this.state.actionType;
        if(!actionType) {
            G.messager.error("错误提示","未设置动作类型");
            return;
        }
        if(actionType == "batchAction"){
            this.batchAction();
        }else if(actionType == "exportAction"){
            this.exportAction();
        }else {
            G.messager.error("错误提示","未定义的动作“"+actionType+"”");
        }
    }     

    // 批量操作
    batchAction(){
        // 数据列表ID
        let url = this.state.url;
        if(!url){
            G.messager.alert("提示消息","请使用“url”属性设置请求的服务地址！");
        }
        let method = this.state.method;
        // 操作名称
        let actionName = this.state.actionName || "处理";
        // 数据列表ID
        let listId = this.state.listId || "result";
        let list = G.$("#"+listId);
        // 是否刷新列表
        let refreshList = this.state.refreshList;
        if(list instanceof Table){
            if(list.hasCheckedRow() || !(list.isRowSelection())) {
                var param = list.getBatchRequestParam();
                if(this.state.parameters){
                    let p = this.state.parameters;
                    if(p && typeof p == "object"){
                        param = G.G$.extend({},param,p);
                    }
                }
                let confirm:any = this.state.confirm;
                if(!confirm){
                    if(list.isCheckedAll()){
                        confirm = "你选中了全选项，你确定要"+actionName+"所有的记录吗？";
                    }else{
                        confirm = "你确定要"+actionName+"选中的记录吗？";
                    }
                }
                G.messager.confirm("操作确认",confirm,"danger",(r: any) => {
                    if(r){
                        let fn = async () => {
                            let result = await Http.ajax(method, url, param);
                            if(result.success) {
                                let data = result.data;
                                if(data) {
                                    if(data.status==0){
                                        let message = data.message || "操作成功！"
                                        G.messager.alert("提示消息",message);
                                        // 刷新列表
                                        if(refreshList){
                                            list.refresh();
                                        }
                                        this.doEvent("afterSuccess");
                                    }else{
                                        let message = data.message || "操作失功，消息代码“"+data.status+"”！"
                                        G.messager.error("错误",message);
                                    }
                                }else {
                                    G.messager.error("错误","返回消息格式不正确！");
                                }
                            }else {
                                G.messager.error("错误","操作失败，发生未知错误！");
                            }
                        }
                        fn();
                    }
                });

            }else{
                G.messager.alert("提示消息","请先选择要"+actionName+"的记录！");
            }
        }else{
            G.messager.alert("提示消息","请使用“listid”属性指定正确的数据列表！");
        }
    }

    // 批量导出
    exportAction(){
        // 数据列表ID
        let url = this.state.url;
        if(!url){
            G.messager.alert("提示消息","请使用“url”属性设置请求的服务地址！");
        }        
        let method = this.state.method;
        // 数据列表ID
        let listId = this.state.listId || "result";
        let list = G.$("#"+listId);
        if(list instanceof Table){
            if(list.hasCheckedRow() || !(list.isRowSelection())) {
                let fun = ()=>{
                    var param = list.getBatchRequestParam();
                    if(this.state.parameters){
                        let p = this.state.parameters;
                        if(p && typeof p == "object"){
                            param = G.G$.extend({},param,p);
                        }
                    }  
                    let fn = async () => {
                        let result = await Http.ajax(method, url, param);
                        if(result.success) {
                            if(result.data) {
                                if(result.data.status==0){
                                    let rd = result.data.data;
                                    if(rd){
                                        let path;
                                        if(typeof rd=="string"){
                                            path = rd;
                                        }else{
                                            path = rd.url;
                                        }
                                        Http.triggerHyperlink(path);
                                    }else{
                                        G.messager.error("错误","返回消息格式不正确！");
                                    }
                                }else{
                                    let message = result.data.message || "操作失功，消息代码“"+ result.data.status +"”！"
                                    G.messager.error("错误",message);
                                }
                            }else {
                                G.messager.error("错误","返回消息格式不正确！");
                            }
                        }else {
                            G.messager.error("错误","导出失功，发生未知错误！");
                        }
                    }                  
                    fn();                   
                }
                let confirm: any = this.state.confirm;
                if(confirm){
                    G.messager.confirm("操作确认",confirm,"danger",(r: any)=>{
                        if(r){
                            fun.call(this);
                        }
                    });
                }else{
                    fun.call(this);
                }

            }else{
                G.messager.alert("提示消息","请先选择要导出的记录！");
            }
        }else{
            G.messager.alert("提示消息","请使用“listid”属性指定正确的数据列表！");
        }
    }    

}
