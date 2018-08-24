import { message as AntdMessage, Modal as AntdModal } from 'antd';
import { ObjectUtil } from '../../utils';
import * as Spin from './Spin';
export default class Messager {

    static spin: Spin.default<any, any>;

    static progress(type?: string) {
        if(type == "close") {
            if(this.spin) {
                this.spin.close();
            }
        }else {
            if(this.spin) {
                this.spin.open();
            }else {
                G.render({
                    el: "<g-spin spinning='true'></g-spin>",
                    mounted: (ele: any) => {
                        this.spin = ele[0]
                    },
                });
            }
        }
    }

    // 显示一个消息提示框
    static alert(title:string,message:string,...args: any[]){
        let type;
        let fun: Function;
        let delay;
        if(args){
            for(let i=0;i<args.length;i++){
                if(ObjectUtil.isInteger(args[i]))
                    delay = parseInt(args[i]);
                else if(ObjectUtil.isFunction(args[i]))
                    fun = args[i];
                else if(ObjectUtil.isString(args[i]))
                    type = args[i];
            }
        }    
        let param = {
            title: title||"操作提示",
            content: message,
            okText:"确定",
            onOk:function() {
                if(fun)
                    fun.call(this);
            },
            zIndex:999999999
        };
        let modal: any;
        if(type && type=="success")
            modal = AntdModal.success(param);
        else if(type && type=="error")
            modal = AntdModal.error(param);
        else if(type && type=="warning")
            modal = AntdModal.warning(param);
        else
            modal = AntdModal.info(param);
        if(delay)
            setTimeout(() => modal.destroy(), delay);
    }

    static info(title:string,message:string,...args: any[]){
        this.alert(title,message,"info",...args);
    }

    static warning(title:string,message:string,...args: any[]){
        this.alert(title,message,"warning",...args);
    }

    static success(title:string,message:string,...args: any[]){
        this.alert(title,message,"success",...args);
    }

    static error(title:string,message:string,...args: any[]){
        this.alert(title,message,"error",...args);
    }    
    
    // 有模式的消息提示框
    static modal = {

        alert : Messager.alert,
        info : Messager.info,
        warning : Messager.warning,
        success : Messager.success,
        error : Messager.error
    }

    // 简单的消息提示
    static simple = {
        alert : function(content:string,duration?:number,onClose?:Function){
            AntdMessage.info(content, duration);
        },
        info : function(content:string,duration?:number,onClose?:Function){
            AntdMessage.info(content, duration);
        },
        warning : function(content:string,duration?:number,onClose?:Function){
            AntdMessage.warning(content, duration);
        },
        error : function(content:string,duration?:number,onClose?:Function){
            AntdMessage.error(content, duration);
        },
        success : function(content:string,duration?:number,onClose?:Function){
            AntdMessage.success(content, duration);
        },
        loading : function(content:string,duration?:number,onClose?:Function){
            AntdMessage.loading(content, duration);
        }
    }

    // 显示一个确认消息框
    static confirm(title:string,message:string,...args: any[]){
        // 按钮类型 primary、danger
        let type;
        let fun: Function;
        let delay;
        if(args){
            for(let i=0;i<args.length;i++){
                if(ObjectUtil.isInteger(args[i]))
                    delay = parseInt(args[i]);
                else if(ObjectUtil.isFunction(args[i]))
                    fun = args[i];
                else if(ObjectUtil.isString(args[i]))
                    type = args[i];
            }
        }
        let param = {
            title: title||"操作确认",
            content: message||"你确定要进行该操作吗？",
            okText:"确定",
            cancelText:"取消",
            iconType:"question-circle",
            okType:type||"primary",
            onOk:function(){
                if(fun)
                    fun.call(this,true);
            },
            onCancel:function(){
                if(fun)
                    fun.call(this,false);         
            },
            zIndex:9999
        };
        let modal = AntdModal.confirm(param);
        if(delay)
            setTimeout(() => modal.destroy(), delay);        
    }

}