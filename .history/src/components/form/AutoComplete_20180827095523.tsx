import * as React from 'react';
import * as Text from './Text';
import { AutoComplete as AntdAutoComplete, Input as AntdInput } from 'antd';
import { InputProps } from "antd/lib/input";
import { UUID, ObjectUtil } from '../../utils';
const AntdOption = AntdAutoComplete.Option;
const AntdOptGroup = AntdAutoComplete.OptGroup;
const AntdTextArea = AntdInput.TextArea;
export var props = {
    ...Text.props,
    controlType: GearType.String,
    //是否严格匹配
    mustMatch: GearType.Boolean,
    // 行数
    rows: GearType.Number,
    dicType: GearType.Or(GearType.String, GearType.Object),
    limit: GearType.Number,
    onMatchFormat: GearType.Function,
    category: GearType.Boolean,
}
export interface state extends Text.state {
    controlType?: string;
    mustMatch?: boolean;
    options?: Array<OptionData>;
    rows?: number;
    text?: string;
    limit?: number;
    category?: boolean;
}
interface OptionData {
    value?: string;
    text?: string;
    children?: Array<OptionData>;
    attribute?: any;
    parent?: OptionData;
    disabled?: boolean;
}
export default class AutoComplete<P extends typeof props & InputProps, S extends state & InputProps> extends Text.default<P, S> {

    private _selectedData: Array<string> | null;

    // 数据集
    private _options: Array<any> | null;

    getInitialState(): state {
        return {
            mustMatch: this.props.mustMatch,
            rows: this.props.rows,
            options: [],
            controlType: this.props.controlType,
            text: this.props.value,
            limit: this.props.limit,
            category: this.props.category == true
        };
    }

    getTextareaProps() {
        let props = this.getInputProps();
        // 下面这几个属性在textarea中是不被支持的，因此移除
        delete props["addonBefore"];
        delete props["addonAfter"];
        delete props["prefix"];
        delete props["suffix"];
        // textarea警告defaultValue和value不建议同时设置，建议移除一个
        delete props["defaultValue"];
        return props;
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

    /**
     * 获取所有的option选项
     */
    private getOptionJsxs() {
        let options = this.state.options;
        let optionsJsx: React.ReactElement<any>[] = [];
        if(options) {
            options.forEach(option => {
                optionsJsx.push(this.getOptionJsx(option));
            });
        }
        return optionsJsx;
    }

    /**
     * 获取单个option选项
     * @param option 
     */
    private getOptionJsx(option: OptionData): React.ReactElement<any> {
        let value = option.value || option.text;
        let text  = option.text;
        let children = option.children;
        let optionJsx: React.ReactElement<any>;
        if(children && children.length > 0 && this.state.category == true && option.parent == undefined) {
            let childrenJsx: any[] = [];
            children.forEach(optionChild => {
                optionChild.parent = option;
                childrenJsx.push(this.getOption(optionChild));
            });
            optionJsx = <AntdOptGroup key={text} label={text}>{childrenJsx}</AntdOptGroup>;
        }else {
            let props = {
                key: text,
                value: value,
                title: text,
                disabled: option.disabled == true
            };
            optionJsx = <AntdOption {...props}>{text}</AntdOption>;
        }
        return optionJsx;
    }

    private getOption() {

    }

    getAutoCompleteProps() {
        return {
            allowClear : false,
            className : "autocomplete-control" + (this.state.className ? " " + this.state.className : ""),
            style : { width: this.state.style ? this.state.style.width : null,height: this.state.style ? this.state.style.height : null},
            size: this.state.size,
            dataSource : this.state.options,
            optionLabelProp : "text",
            onChange : (value: any) => {
                if(this.state.mustMatch == true){
                    let v: any = "";
                    let t = value;
                    if(this._selectedData){
                        // 如果是选中的，根据选中的值赋值
                        v = this._selectedData[0];
                        t = this._selectedData[1];
                        this._selectedData = null;
                    }else{
                        // 如果是输入的，在输入中value都无值，因为未确定选项
                        v = null;
                    }
                    // 判断如果当前值和之前值不同，则触发change事件
                    if(ObjectUtil.isValueEqual(v, this.getValue())){
                        this.setValue(v,t);
                    }else{
                        this._change(v,t);
                    }
                }else{
                    if(this._selectedData){
                        let text = this._selectedData[1];
                        this._selectedData = null;
                        this._change(text,text);   
                    }else{
                        this._change(value,value);   
                    }
                }            
            },
            onSearch : (value: any) => {
                // 如果是异步查询，需要在每次输入内容变更时重新去后台获取数据
                this.loadData(value);
            },
            onSelect : (value: any,option: any) => {
                this._select(value,option);
            },
            defaultValue : this.state["text"],
            value : this.state["text"],
            getPopupContainer: ()=>{
                let container:any = document.body;
                if(this.props.popupcontainer) {
                    if("parent"==this.props.popupcontainer){
                        // 在其父级
                        if(this.realDom != null) {
                            container = this.realDom;
                        }
                    }else{
                        // 在自定义的选择器内，如果自定义的选择器无效，则生成在document.body下
                        let c = G.G$(this.props.popupcontainer);
                        if(c.length>0)
                            container = c[0];
                    }
                }
                return container;                   
            },            
        };
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

    // 根据自定义函数返回的格式对显示内容进行格式化
    private _doMatchFormat(option: any){
        let props = {
            key : option.value || UUID.get(),
            value : option.value || option.text,
            text : option.text,
            attributes: option.attributes
        }        
        if(this.haveEvent("matchFormat")){
            return <AntdOption {...props}>{G.$(this.doEvent("matchFormat", option))}</AntdOption>;
        }else{
            return <AntdOption {...props}>{option.text}</AntdOption>;
        }
    }

    // 设置初始时的默认Options
    private setDefaultOptions(value?: any, callback?: Function) {
        let options = this._options;
        let newOptions = [];
        for (var i = 0; options && i < options.length && newOptions.length < this.state.limit; i++) {
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
        let input;
        if(this.state.controlType == "textarea") {
            input = <AntdTextArea {...this.getTextareaProps()}></AntdTextArea>;
        }else {
            input= <AntdInput {...this.getInputProps()}></AntdInput>;
        }
        return <div></div>;
    }

    getText() {
        return this.state.text;
    }

}