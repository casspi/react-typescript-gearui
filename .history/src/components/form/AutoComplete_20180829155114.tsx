import * as React from 'react';
import * as Text from './Text';
import { AutoComplete as AntdAutoComplete, Input as AntdInput } from 'antd';
import { InputProps } from "antd/lib/input";
import { ObjectUtil, Http } from '../../utils';
const AntdOption = AntdAutoComplete.Option;
const AntdOptGroup = AntdAutoComplete.OptGroup;
const AntdTextArea = AntdInput.TextArea;
export var props = {
    ...Text.props,
    controlType: GearType.String,//是input还是textarea
    //是否严格匹配
    mustMatch: GearType.Boolean,
    // 行数
    rows: GearType.Number,
    dicType: GearType.Or(GearType.String, GearType.Object),
    limit: GearType.Number,
    onMatchFormat: GearType.Function,
    category: GearType.Boolean,
    popupContainer: GearType.String,
    async: GearType.Boolean,
    dictype: GearType.Or(GearType.Object, GearType.Function, GearType.String),
    url: GearType.Or(GearType.String, GearType.Function)
}
export interface state extends Text.state {
    controlType?: string;
    mustMatch?: boolean;
    options?: Array<OptionData>;
    rows?: number;
    // text?: string;
    limit?: number;
    category?: boolean;
    searchOptions?: Array<OptionData>;
    dictype?: object | string | Function,
    url?: string | Function
}
interface OptionData {
    value?: string;
    text?: string;
    children?: Array<OptionData>;
    attribute?: any;
    parent?: OptionData;
    disabled?: boolean;
    pinyin?: string;
    shortPinyin?: string;
}
export default class AutoComplete<P extends typeof props & InputProps, S extends state & InputProps> extends Text.default<P, S> {

    selectedData: OptionData|null;

    getInitialState(): state {
        return {
            mustMatch: this.props.mustMatch,
            rows: this.props.rows,
            options: [],
            searchOptions: [],
            controlType: this.props.controlType,
            // text: this.props.value,
            limit: this.props.limit || 10,
            category: this.props.category == true,
            dictype: this.props.dictype,
            url: this.props.url
        };
    }

    getSuperInitState() {
        return super.getInitialState;
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
        delete state.mustMatch;
        delete state.searchOptions;
        delete state.controlType;
        delete state.category;
        delete state.validation;
        delete state.invalidType;
        delete state.options;
        return G.G$.extend({}, state, {
            onFocus: (e: any) => {
                // 获得焦点时，如果searchOptions为空，则加载一次
                if(this.state.mustMatch == true && (!this.state.searchOptions || this.state.searchOptions.length == 0)) {
                    // 重新加载数据
                    this.search(value);
                }              
            },
            onBlur: (e: any) => {
                if(this.state.mustMatch == true){
                    // 当文本框失去焦点时，检查文本框中的值是否在选项内
                    let options = this.state.options;
                    let matched: boolean = false;
                    if(options && options.length > 0){
                        // 如果当前选项不为空，说明有能够匹配的，但是要检查当前输入值是否能完全匹配的上
                        // 当前填写值
                        let value = this.getText();
                        for (let i = 0; i < options.length; i++) {
                            let option = options[i];
                            if ((option.value && option.value == value) || option.text == value) {
                                this.setState({ searchOptions: [option] });
                                this._change(option.value, option.text);
                                matched = true;
                                break;
                            }
                        }
                    }
                    if(matched == false){
                        // 如果当前选项为空，说明没有任何能匹配上的
                        this._change("", "");
                        this.setState({searchOptions: []});
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
        let options = this.state.searchOptions;
        let optionsJsx: React.ReactElement<any>[] = [];
        if(options) {
            let limit = 0;
            options.forEach(option => {
                if(limit <= this.state.limit) {
                    let optionJsxAndLimit = this.getOptionJsx(option, limit);
                    if(optionJsxAndLimit && optionJsxAndLimit.limit <= this.state.limit) {
                        if(optionJsxAndLimit.optionJsx) {
                            optionsJsx.push(optionJsxAndLimit.optionJsx);
                            limit = optionJsxAndLimit.limit;
                        }
                    }
                }
            });
        }
        return optionsJsx;
    }

    /**
     * 获取单个option选项
     * @param option 
     */
    private getOptionJsx(option: OptionData, limit: number): {optionJsx?: React.ReactElement<any>, limit: number} | undefined {
        let value = option.value || option.text;
        let text  = option.text;
        let children = option.children;
        let optionJsx: React.ReactElement<any>|undefined = undefined;
        let thisValue = this.getValue();
        if(limit < this.state.limit) {
            if(children && children.length > 0 && this.state.category == true) {
                //组的情况下AntdOptGroup也算一个节点，所以limit要先加
                limit ++;
                let childrenJsx: React.ReactElement<any>[] = [];
                children.forEach(optionChild => {
                    optionChild.parent = option;
                    let optionJsxAndLimit = this.getOptionJsx(optionChild, limit);
                    if(optionJsxAndLimit != undefined) {
                        if(optionJsxAndLimit.optionJsx) {
                            childrenJsx.push(optionJsxAndLimit.optionJsx);
                        }
                        limit = optionJsxAndLimit.limit;
                    }
                });
                if(thisValue == value || thisValue == text || !thisValue || thisValue == '' || childrenJsx.length > 0) {
                    optionJsx = <AntdOptGroup key={text} label={text}>{childrenJsx}</AntdOptGroup>;
                }
            }else {
                if(thisValue == value || thisValue == text || !thisValue || thisValue == '') {
                    let props = {
                        key: text,
                        value: value,
                        title: text,
                        disabled: option.disabled == true
                    };
                    //通过自定义格式化输出
                    if(this.haveEvent("matchFormat")) {
                        let r = this.doEvent("matchFormat", option);
                        if(r && r[0]) {
                            optionJsx = <AntdOption {...props}>{G.$(r[0])}</AntdOption>;
                        }
                    }else {
                        optionJsx = <AntdOption {...props}>{text}</AntdOption>;
                    }
                    limit ++;
                }
            }
            return {optionJsx, limit};
        }
        return undefined;
    }

    /**
     * 获取指定节点数据
     * @param value 
     * @param optionsParam 
     */
    public getOption(value: any, optionsParam?: OptionData[]): OptionData | null {
        let options = optionsParam || this.state.options;
        if(options) {
            for(let i = 0; i < options.length; i++) {
                let option = options[i];
                if(option.value == value) {
                    return option;
                }else {
                    if(option.children && option.children.length > 0 && this.state.category) {
                        let optionInner = this.getOption(value, option.children);
                        if(optionInner) {
                            return optionInner;
                        }
                    }
                }
            }
        }
        return null;
    }

    //当选中值时触发
    protected _select(value: any,option: any){
        //执行自定义注册的事件
        this.doEvent("select", value, option);
        // 由于触发onSelect事件时，紧接着会触发onChange事件，因此在这里先设置选中的文本值，值的改变在文本框中触发
        this.selectedData = {
            value,
            text: ''
        }
    }

    getAutoCompleteProps(): any {
        return {
            allowClear : false,
            className : "autocomplete-control" + (this.state.className ? " " + this.state.className : ""),
            style: { width: this.state.style ? this.state.style.width : null,height: this.state.style ? this.state.style.height : null},
            size: this.state.size,
            dataSource : this.getOptionJsxs(),
            optionLabelProp : "text",
            onChange : (value: any) => {
                let selectedData = this.selectedData;
                if(this.state.mustMatch == true){
                    let value: any = "";
                    let text = value;
                    if(selectedData) {
                        // 如果是选中的，根据选中的值赋值
                        value = selectedData.value;
                        text = selectedData.text;
                        this.selectedData = null;
                    }else{
                        // 如果是输入的，在输入中value都无值，因为未确定选项
                        value = null;
                    }
                    // 判断如果当前值和之前值不同，则触发change事件
                    if(ObjectUtil.isValueEqual(value, this.getValue())){
                        this.setValue(value, text);
                    }else{
                        this._change(value, text);
                    }
                }else{
                    if(selectedData){
                        let text = selectedData.text;
                        this.selectedData = null;
                        this._change(text, text);   
                    }else{
                        this._change(value, value);
                    }
                }            
            },
            onSearch : (value: any) => {
                // 如果是异步查询，需要在每次输入内容变更时重新去后台获取数据
                this.search(value);
            },
            onSelect : (value: any,option: any) => {
                //this._select(value, option);
            },
            defaultValue : this.state.value,
            value : this.state.value,
            getPopupContainer: ()=>{
                let container:any = document.body;
                if(this.props.popupContainer) {
                    if("parent" == this.props.popupContainer){
                        // 在其父级
                        if(this.realDom != null) {
                            container = this.realDom;
                        }
                    }else{
                        // 在自定义的选择器内，如果自定义的选择器无效，则生成在document.body下
                        let c = G.G$(this.props.popupContainer);
                        if(c.length>0)
                            container = c[0];
                    }
                }
                return container;                   
            },            
        };
    }

    private search(value?: any, callback?: () => void) {
        if(this.haveEvent("search")){
            let options = this.doEvent("search", value);
            // 如果onsearch有返回值，则以onsearch返回的值作为选项集
            this.setState({
                options: options ? options[0] : [],
                searchOptions: options ? options[0] : [],
            }, callback);
            return;
        }
        if(this.props.async) {
            this.loadData(value, callback);
        }else {
            this.match(value, callback);  
        }
    }

    private match(value?: any, callback?: () => void) {
        // 非异步方式的，如果已经初始化过了，则进行前端匹配
        let options = this.state.options;
        // 如果是在本地比较，则需进行前端的数据匹配
        if(options){
            let searchOptions = [];
            for(let i = 0;i < options.length; i++){
                let option = options[i];
                if((option.value && option.value.indexOf(value)!=-1) 
                        || (option.text && option.text.indexOf(value)!=-1)
                        || (option.pinyin && option.pinyin.indexOf(value)!=-1)
                        || (option.shortPinyin && option.shortPinyin.indexOf(value)!=-1)){
                    searchOptions.push(option);
                }
            }
            this.setState({
                searchOptions
            },callback);
        }   
    }

    private loadData(value?: any, callback?: () => void) {
        let url = this.state.url;
        let dictype = this.state.dictype;
        if(url == null && dictype && typeof dictype == 'string'){
            url = Http.getRootPath() + "/dictionary/query?type=" + dictype;
        }
        if(url){
            let options: any[];
            if(this.props.async == false && dictype && window[dictype+"_matcher"]){
                // 如果页面上本身就有数据集，则不需要异步载入
                options = window[dictype+"_matcher"];
                this.setState({
                    options: options,
                    searchOptions: options
                }, callback);
            }else{
                let fn = async ()=> {
                    // 如果不是异步查询，则设置查询上线为0，表示返回所有记录
                    let result = await Http.ajax("get", url, {q: value,limit: this.props.async == false ? 0 : this.state.limit});
                    if(result.success) {
                        let message = result.data;
                        if(message && message.data && typeof message.data == "object"){
                            options = message.data.map((ele: any,index: any) => {
                                if(!ele["text"])
                                    ele["text"] = ele["label"];
                                delete ele["label"];
                                return ele;
                            });
                        }
                        this.setState({
                            options: options,
                            searchOptions: options
                        }, callback);
                    }else {
                        this.doEvent("error", result);
                    }
                }
                fn();
            }
        }    
    }

    // 设置初始时的默认Options
    private setDefaultOptions(callback?: Function) {
        let options = this.state.options;
        this.setState({
            searchOptions: options
        }, () => {
            if (callback)
                callback.call(this);
        });
    }

    //改变事件
    protected _change(value: any, text?: any) {
        value = value || "";
        let oldValue = this.getValue();
        if(oldValue != value){
            this.setValue(value, () => {
                let args = [value , oldValue];
                //执行自定义注册的事件
                this.doEvent("change", ...args);
                this.selectedData = null;
            });
        }else{
            this.setValue(value, text);
        }
    }
    
    afterRender() {
        let callback = ()=>{
            // 加载完成后触发
            if(ObjectUtil.isEmpty(this.props.value) == false){
                if(this.state.mustMatch == true){
                    // 如果是必须匹配，检查当前options中的记录数量，如果为0表示默认值没有命中任何数据，应清空
                    let options = this.state.options;
                    if(options && options.length==1){
                        let option = options[0];
                        this.setValue(option.value);
                    }else{
                        if(ObjectUtil.isEmpty(this.getValue())) {
                            this.clear();
                        }                  
                    }
                }else{
                    this.reset();              
                }
            }
        };
        if(this.props.async == true)
            // 异步查询根据默认值加载数据
            this.loadData(this.getValue(), callback);
        else
            // 非异步查询第一次时载入所有数据放到内存，以后根据内存中数据进行过滤
            this.loadData(null, callback);
    }

    render() {
        let input;
        if(this.state.controlType == "textarea") {
            input = <AntdTextArea {...this.getTextareaProps()}></AntdTextArea>;
        }else {
            input= <AntdInput {...this.getInputProps()}></AntdInput>;
        }
        let acprops = this.getAutoCompleteProps();    
        if(this.state.mustMatch == true){
            let hiddenProps = {
                key: this.getKey(),
                type: "hidden",
                value: this.state.value,
                name: this.state.name
            };
            return <AntdAutoComplete {...acprops}>{input}<input {...hiddenProps}/></AntdAutoComplete>;
        }else {
            return <AntdAutoComplete {...acprops}>{input}</AntdAutoComplete>;
        }
             
    }

    // setValue(value: any, text?:any, callback?: Function) {
    //     if(this.props.form) {
    //         this.triggerChange(value);
    //     }else {
    //         this.setState({
    //             value,
    //             // text
    //         }, () => {
    //             if(callback) {
    //                 callback();
    //             }
    //         });
    //     }
        
    // }

    reset(){
        super.reset();
        this.setState({
            value:this.props.value || "",
            // text:this.props.value || "",
        },()=>{
            this.loadData();
        });
    }

    clear(){
        this.setValue("");
        this.setDefaultOptions();
    }

    getText() {
        // return this.state.text;
        let option = this.getOption(this.state.value);
        return option ? option.text : "";
    }

    focus(...args: any[]) { 
        this.find("input").focus(...args);      
    }

    blur(...args: any[]){
        this.find("input").blur(...args);
    }    


}