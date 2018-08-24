import * as React from 'react';
import * as Text from './Text';
import { InputProps } from "antd/lib/input";
export var props = {
    ...Text.props,
    controlType: GearType.String,
    //是否严格匹配
    mustMatch: GearType.Boolean,
    // 行数
    rows: GearType.Number,
}
export interface state extends Text.state {
    controlType?: string;
    mustMatch?: boolean;
    options?: any;
    rows?: number;
}
export default class AutoComplete<P extends typeof props & InputProps, S extends state & InputProps> extends Text.default<P, S> {

    getInitialState(): state {
        return {
            mustMatch: this.props.mustMatch,
            rows: this.props.rows,
            options: [],
            controlType: this.props.controlType
        };
    }

    getTextareaProps() {
        let state = super.getInitialState();
    }

    getInputProps() {
        let state: state = G.G$.extend({}, this.state);

        let name;
        if(state.mustMatch == true){
            // 如果控件值必与是列表中存在的值，这里应使用隐藏字段传值，所以原控件不应有名称
            delete state.name;
        }   
        // 移除在父类定义的属性
        delete state.className;
        // 取消父对象Text中对value属性的设置
        delete state.value;
        delete state.ref;
        return G.G$.extend({}, state, {
            onFocus: (e: any) => {
                // 获得焦点时，如果options为空，则加载一次
                if(state.mustMatch == true && !state.options){
                    // 重新加载数据
                    this.loadData(this.getValue());
                }              
            },
            onBlur: (e: any) => {
                if(state.mustMatch == true){
                    // 当文本框失去焦点时，检查文本框中的值是否在选项内
                    let options = this.state["options"];
                    let matched:boolean = false;
                    if(options && options.length>0){
                        // 如果当前选项不为空，说明有能够匹配的，但是要检查当前输入值是否能完全匹配的上
                        // 当前填写值
                        let value = this.getText();
                        if(options.length==1){
                            // 如果可选条件仅剩一个，检查当前选中值与可选项中是否相等，如果不等触发select
                            let option = options[0];
                            if((option.props.value && option.props.value==value) || option.props.text==value){
                                // 相等
                                this._change(option.props.value,option.props.text);    
                                matched = true;                        
                            }else{
                                //this._select(option.props.value,option);
                            }
                        }else{
                            // 如果可选条件还有好几个，检查当前选中值是否包含在其中，如果包含则不用做什么
                            for(let i=0;i<options.length;i++){
                                let option = options[i];
                                if((option.props.value && option.props.value==value) || option.props.text==value){
                                    this.setState({options:[option]});
                                    this._change(option.props.value,option.props.text);
                                    matched = true;
                                    break;
                                }
                            }
                        }
                    }
                    if(matched==false){
                        // 如果当前选项为空，说明没有任何能匹配上的
                        this._change("","");
                        this.setState({"options":null});
                    }
                }        
                //控件基础改变事件
                this._blur(e);
                //执行自定义注册的事件
                this.doEvent("blur", e);
                //执行控件属性指定的事件
                if (this.props.onblur) {
                    this.props.onblur.call(this, e);
                }
            },              
        });
    }

    render() {
        if(this.state.controlType == "textarea") {

        }
        return <div></div>;
    }

}