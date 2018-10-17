import * as Icon from '../basic/Icon';
import * as Button from '../basic/Button';
import * as React from 'react';
import { notification } from 'antd';
import { UUID, GearUtil } from '../../utils';
export default class Notification {

    // 显示一个提醒
    // type：通知类型、info、warning、error、success，默认为null
    // duration：设置自动关闭的时间，默认为 null 不自动关闭
    // icon：图标名称或图标属性对象
    // button：按钮属性对象
    // class：样式类名称
    // placement：显示位置，默认为右下角，可选值为topLeft、topRight、bottomLeft、bottomRight
    // title：通知提醒标题
    // description：通知提醒内容
    // onClose：关闭时触发的回调函数
    static show(options: any):any{
        let key:string;
        if(options.class){
            options.className = options.class;
            delete options.class;
        }
        if(options.title){
            options.message = options.title;
            delete options.title;
        }
        if(options.key){
            key = options.key;
        }else{
            key = "n_"+UUID.get();
            options.key = key;
        }
        if(options.icon && typeof options.icon=="string"){
            let props: any = {
                icon:options.icon
            };
            options.icon = <Icon.default {...props} />;
        }else if(options.icon && typeof options.icon=="object"){
            let props: any = GearUtil.toProps(options.icon);
            options.icon = <Icon.default {...props} />;
        }
        if(!options.placement){
            options.placement = "bottomRight";
        }
        if(options.button){
            if(options.button instanceof Array){
                let btns = [];
                for(let i=0;i<options.button.length;i++){
                    let props: any = GearUtil.toProps(options.button[i]);
                    props.key = "b"+i;
                    btns.push(<Button.default {...props} />);
                }
                options.btn = btns;
            }else{
                let props: any = GearUtil.toProps(options.button);
                options.btn = <Button.default {...props} />;
            }
        }
        if(!options.duration){
            options.duration = null;
        }
        if(options.width){
            if(/^\d+$/.test(options.width)){
                let style = options.style || {};
                style.width = options.width;
                if(options.placement=="bottomRight" || options.placement=="topRight")
                    style.marginLeft = 335 - parseInt(options.width);
                options.style = style;
            }
        }        
        if(options.type){
            notification[options.type](options);
        }else{
            notification.open(options);
        }

        return {
            id:key,
            options:options,
            close:()=>{
                notification.close(key);
            }
        };
    }

    static success(options: any):any{
        options.type = "success";
        return this.show(options);
    }

    static error(options: any):any{
        options.type = "error";
        return this.show(options);
    }

    static info(options: any):any{
        options.type = "info";
        return this.show(options);
    }

    static warning(options: any):any{
        options.type = "warning";
        return this.show(options);
    }

    static close(key:string):any{
        notification.close(key);
    }

    static destroy(){
        notification.destroy();
    }

}