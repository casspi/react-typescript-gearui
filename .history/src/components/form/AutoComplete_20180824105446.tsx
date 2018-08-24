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
    dicType: GearType.Or(GearType.String, GearType.Object)
}
export interface state extends Text.state {
    controlType?: string;
    mustMatch?: boolean;
    options?: any;
    rows?: number;
    text?: string;
}
export default class AutoComplete<P extends typeof props & InputProps, S extends state & InputProps> extends Text.default<P, S> {

    private _selectedData: Array<string> | null;

    // 数据集
    private _options: Array<any> | null;

    // 最大选项数量
    private _limit: number;

    getInitialState(): state {
        return {
            mustMatch: this.props.mustMatch,
            rows: this.props.rows,
            options: [],
            controlType: this.props.controlType,
            text: this.props.value
        };
    }

    getTextareaProps() {
        let state = super.getInitialState();
    }

    getInputProps() {
        let state: state = G.G$.extend({}, this.state);

        let value = state.value || "";
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
                    this.loadData(value);
                }              
            },
            onBlur: (e: any) => {
                if(state.mustMatch == true){
                    // 当文本框失去焦点时，检查文本框中的值是否在选项内
                    let options = state.options;
                    let matched: boolean = false;
                    if(options && options.length > 0){
                        // 如果当前选项不为空，说明有能够匹配的，但是要检查当前输入值是否能完全匹配的上
                        // 当前填写值
                        let value = this.getText();
                        if(options.length == 1){
                            // 如果可选条件仅剩一个，检查当前选中值与可选项中是否相等，如果不等触发select
                            let option = options[0];
                            if((option.props.value && option.props.value == value) || option.props.text == value){
                                // 相等
                                this._change(option.props.value, option.props.text);    
                                matched = true;                        
                            }
                        }else{
                            // 如果可选条件还有好几个，检查当前选中值是否包含在其中，如果包含则不用做什么
                            for (let i = 0; i < options.length; i++) {
                                let option = options[i];
                                if ((option.props.value && option.props.value == value) || option.props.text == value) {
                                    this.setState({ options: [option] });
                                    this._change(option.props.value, option.props.text);
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
                //执行自定义注册的事件
                this.doEvent("blur", e);
            },              
        });
    }

    private loadData(value?: any, callback?:Function){
        if(this.haveEvent("search")){
            let options = this.doEvent("search", value);
            // 如果onsearch有返回值，则以onsearch返回的值作为选项集
            this._options = options;
            this.setDefaultOptions(null, callback);
            return;
        }
        if(this._async==true || (this._async==false && this._inited==false)){
            let url = this.state["url"];
            let dictype = this.props.dictype;
            if(url==null && dictype){
                url = Util.getRootPath()+"/dictionary/query?type="+dictype;
            }         
            if(url){
                let __this = this;
                let __limit = this._limit;
                let options;
                // 如果不是异步查询，则设置查询上线为0，表示返回所有记录
                if(this._async==false)
                    __limit = 0;
                
                if(this._async==false && dictype && window[dictype+"_matcher"]){
                    // 如果页面上本身就有数据集，则不需要异步载入
                    options = window[dictype+"_matcher"];
                }else{
                    Ajax.get(url,{q:q,limit:__limit},false).done(function(message){
                        if(message && message.data && typeof message.data == "object"){
                            options = message.data.map((ele,index) => {
                                if(!ele["text"])
                                    ele["text"] = ele["label"];
                                delete ele["label"];
                                return ele;
                            })
                        }
                    }).fail(function(err){
                        console.error(err);
                    });
                }
                __this._inited = true;
                __this._options = options;
                if(this._async==true)
                    __this.setDefaultOptions(null,callback);
                else
                    // 由于非异步查询是一次性载入数据，因此这里要根据初始的默认值做一次过滤
                    __this.setDefaultOptions(__this.getValue(),callback);       
            }     
        }else if(this._async==false && this._inited==true){
            // 非异步方式的，如果已经初始化过了，则进行前端匹配
            this._matched = 0;
            // 如果是在本地比较，则需进行前端的数据匹配
            if(this._options){
                let options = [];
                for(let i=0;i<this._options.length;i++){
                    let option = this._options[i];
                    if((option["value"] && option["value"].indexOf(q)!=-1) 
                            || (option["text"] && option["text"].indexOf(q)!=-1)
                            || (option["pinyin"] && option["pinyin"].indexOf(q)!=-1)
                            || (option["shortPinyin"] && option["shortPinyin"].indexOf(q)!=-1)){
                        this._matched++;
                        options.push(this._doMatchFormat(option));
                    }
                    if(this._matched>=this._limit){
                        break;
                    }
                }
                this.setState({
                    options:options
                },()=>{
                    if(callback)
                        callback.call(this);
                });
            }           
        }  
    }

    // 设置初始时的默认Options
    private setDefaultOptions(value?: any, callback?: Function) {
        let options = this._options;
        let newOptions = [];
        for (var i = 0; options && i < options.length && newOptions.length < this._limit; i++) {
            let option = options[i];

            if (value && value.length > 0) {
                if (option.value == value || option.text == value)
                    newOptions.push(this._doMatchFormat(option));
            } else
                newOptions.push(this._doMatchFormat(option));
        }
        this.setState({
            options: newOptions
        }, () => {
            if (callback)
                callback.call(this);
        });
    }

    //改变事件
    protected _change(value: any,text?: any) {
        value = value || "";
        let oldValue = this.getValue();
        if(oldValue != value){
            this.setValue(value, text, () => {
                let args = [value , oldValue];
                //执行自定义注册的事件
                this.doEvent("change", ...args);
                this._selectedData = null;
            });
        }else{
            this.setValue(value, text);
        }
    }
    
    setValue(value: any, text?:any, callback?: Function) {
        if(this.props.form) {
            this.triggerChange(value, callback);
        }else {
            this.setState({
                value,
                text
            }, () => {
                if(callback) {
                    callback();
                }
            });
        }
    }

    render() {
        if(this.state.controlType == "textarea") {

        }
        return <div></div>;
    }

    getText() {
        return this.state.text;
    }

}