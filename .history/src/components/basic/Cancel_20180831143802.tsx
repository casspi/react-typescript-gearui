import * as Button from './Button';
export var props = {
    ...Button.props
};
export interface state extends Button.state {

}
export default class Cancel<P extends typeof props, S extends state> extends Button.default<P, S> {

    // 点击事件
    protected clickEvent(){
        if(this.haveEvent("beforeCancel")){
            let r = this.doEvent("beforeCancel");
            if(r && r[0] == false)
                return;
        }
        if(this.haveEvent("process")){
            this.doEvent("process");
        }else{
            Cancel.process.call(this);
        }
    }

    // 默认的处理过程，可由外部自定义
    static process: Function = function(){

    }

}