import * as ClickAction from './ClickAction';
import Dialog from '../pack/Dialog';

export var props = {
    ...ClickAction.props,
    dialogTitle: GearType.String,
    loadType: GearType.Enum<'async' | 'iframe'>(),
    dialogWidth: GearType.Number,
    dialogHeight: GearType.Number,
    maximized: GearType.Boolean,
    controlBar: GearType.Boolean,
    confirmText: GearType.String,
    cancelText: GearType.String,
    maskClosable: GearType.Boolean,
}

export interface state extends ClickAction.state {
    dialogTitle?: string;
    loadType?: 'async' | 'iframe';
    dialogWidth?: number;
    dialogHeight?: number;
    maximized?: boolean;
    controlBar?: boolean;
    confirmText?: string;
    cancelText?: string;
    maskClosable?: boolean;
}

export default class DialogAction<P extends typeof props, S extends state> extends ClickAction.default<P, S> {

    getInitialState(): state {
        return {
            maximized: this.props.maximized,
            dialogWidth: this.props.dialogWidth,
            dialogHeight: this.props.dialogHeight,
            confirmText: this.props.confirmText || "确定",
            cancelText: this.props.cancelText || "取消",
            maskClosable: this.props.maskClosable,
            loadType: this.props.loadType,
            url: this.props.url,
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
            r = DialogAction.beforeProcess();
        }
        if(r == true){
            if(this.haveEvent("process")) {
                this.doEvent("process");
            }else {
                DialogAction.process(this);
            }
        }
    }

    // 默认的处理过程，可以被覆盖
    static process(obj: DialogAction<typeof props, state>){
        let url = obj.state.url;
        if(url){
            Dialog.show({
                id: DialogAction.getDialogId(obj),
                "title":obj.state.dialogTitle||obj.state.title,
                "loadType":obj.state.loadType || "iframe",
                "width":obj.state.dialogWidth,
                "height":obj.state.dialogHeight,
                "maximized":obj.state.dialogWidth || obj.state.dialogHeight ? false : obj.state.maximized,
                "url": url,
                "controlBar":obj.state.controlBar==true?true:false,
                "onConfirm":obj.props.onConfirm,
                "onCancel":obj.props.onCancel,
                "confirmText":obj.state.confirmText,
                "cancelText":obj.state.cancelText,
                "maskClosable": obj.state.maskClosable
            }); 
        } 
    };

    static getDialogId(obj: DialogAction<typeof props, state>) {
        return obj.props.id + "_dialog";
    }

    // 当被点击时触发
    static close(obj: DialogAction<typeof props, state>){
        if(obj){
            // 移除指定的
            let handle = window._dialog[DialogAction.getDialogId(obj)];
            if(handle){
                handle.destroy();
            }
        }else{
            // 移除所有的
            for (var key in window._dialog) {
                let handle = window._dialog[key];
                if(handle){
                    handle.close();
                }                
            }
            window._dialog = {};
        }
    };

    private getDialogHandle(){
        return window._dialog[DialogAction.getDialogId(this)];
    }

    // 设置loading状态
    setConfirmLoading(loading: boolean){
        let handle = this.getDialogHandle();
        if(handle){
            handle.setConfirmLoading(loading);
        }
    }

    close(){
        DialogAction.close.call(this,this);
    }

    static beforeProcess() {
        return true;
    }

}
