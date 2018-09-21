import * as React from 'react';
import * as FormTag from './FormTag';
import { Checkbox as AntdCheckbox } from 'antd';
import { ObjectUtil, Http } from '../../utils';
import DicUtil from '../../utils/DicUtil';
const AntdCheckboxGroup = AntdCheckbox.Group;
export var props = {
    //checkbox属性
    checked: GearType.Boolean,
    indeterminate: GearType.Boolean,
    url: GearType.Or(GearType.String, GearType.Function),
    dictype: GearType.Or(GearType.Object, GearType.Function, GearType.String),
    //公共属性
    //目标对象ID（用于连动全选的全选项）
    target: GearType.String,
    //关联对象ID（用于连动全选的子选项）
    related: GearType.String,
    cascadeTarget: GearType.String,
    label: GearType.String,
    ...FormTag.props
}
export interface state extends FormTag.state {
    dictype?: object | string | Function,
    url?: string | Function,
    options?: Array<OptionData>;
    indeterminate?: boolean;
    target?: string;
    related?: string;
    checked?: boolean;
    label?: string;
}
interface OptionData {
    label?: any;
    value?: any;
}
export default class Check<P extends typeof props, S extends state> extends FormTag.default<P, S> {

    getInitialState(): state {
        return {
            dictype: this.props.dictype,
            url: this.props.url,
            indeterminate: this.props.indeterminate,
            target: this.props.target,
            related: this.props.related,
            checked: this.props.checked,
            label: this.props.label
        };
    }

    render() {
        return <AntdCheckboxGroup></AntdCheckboxGroup>;
    }

    afterRender() {
        this.blur(()=>{
            this.removeAttr("tabindex");
        })       

        let callback = ()=>{
            if(this.state.indeterminate == true) {
                this.setIndeterminate(true);
            }
            if(this.state.target) {
                // 如果连动的目标存在，则对目标进行绑定
                let target = G.$("#"+this.state.target);
                if(target instanceof Check){
                    if(!target.state.related){
                        target.attr("related",this.state.id);
                        target.doRelated();
                    }
                }else{
                    if(!target.attr("related"))
                        target.attr("related",this.state.id);
                }
            }
            if(this.state.related) {
                // 如果连动的控件对象存在，则对目标进行绑定
                let related = G.$("#"+this.state.related);
                if(related instanceof Check){
                    if(!related.state.target){
                        related.attr("target",this.state.id);
                        related.doRelated();
                    }
                }else{
                    if(!related.attr("target"))
                        related.attr("target",this.state.id);                
                }
            }
        }        

        if (this.state.url || this.state.dictype) {
            let url = this.state.url;
            let dictype = this.state.dictype;
            let fn = async () => {
                let result = await DicUtil.getDic({url, dictype});
                if(result.success) {
                    let dic = result.data;
                    if(dic) {
                        this.setState({
                            options: dic
                        },()=>{
                            callback.call(this);
                        });
                    }
                }
            }
            fn();
        }else{
            // 如果是未指定集合的复先框，则使用它本身的label和value来创建集合
            this.setState({
                options: [{
                    label: this.state.label||"",
                    value: this.state.value||"on",
                }]
            },()=>{
                callback.call(this);
            });
            // 检查checked属性是否默认为true，如果是则设置它为选中
            if(ObjectUtil.isTrue(this.state.checked)) {
                this.setValue([this.state.value||"on"]);
            }
        }
    }

    doRelated(){
        let related = this.state.related;
        if(related){
            let obj = G.$("#"+related);
            if(obj instanceof Check) {
                if(this.isCheckedAll()){
                    obj.checkAll();
                }else if(this.hasChecked()){
                    obj.unCheckAll(true);
                }else{
                    obj.unCheckAll(false);
                }
            }
        }

        let target = this.state.target;
        if(target){
            let obj = G.$("#"+target);
            if(obj instanceof Check){
                if(this.isCheckedAll()){
                    obj.checkAll();
                }else{
                    obj.unCheckAll();
                }
            }
        }
    }

    setIndeterminate(indeterminate?: boolean){
        if(indeterminate == true){
            this.find(".ant-checkbox").addClass("ant-checkbox-indeterminate");
        }else{
            this.find(".ant-checkbox").removeClass("ant-checkbox-indeterminate");
        }
    }

    //获取值
    getValue(): any {
        return this.state.value || [];
    }

    getText() {
        let texts = [];
        let values = this.getValue();
        let options = this.state.options;
        if(options) {
            for(var i=0;i< options.length;i++){
                let arr = new GearArray(values);
                if(arr.contains(options[i].value)) {
                    texts.push(options[i].label);
                }
            }
        }
        return texts;
    }

    // 选中所有
    checkAll(){
        let options = this.state.options;
        if(options && options.length > 0) {
            let array = new Array();
            for(var i=0;i<options.length;i++){
                array.push(options[i].value);
            }
            this.setValue(array);
            this.setState({
                indeterminate: false
            });
        }        
    }

    // 选中指定值
    check(value: any){
        if(value){
            var valueArray = new GearArray(this.getValue());
            if(value instanceof Array){
                for(var i=0;i<value.length;i++){
                    if(!valueArray.contains(value[i]))
                        valueArray.add(value[i]);
                }
            }else{
                if(!valueArray.contains(value))
                    valueArray.add(value);
            }
            this.setValue(valueArray.toArray());
        }
    }

    // 得到当前数据
    getData(){
        return this.state.options;
    }

    // 设置数据
    setData(options: any, callback?: ()=> void){
        return this.setState({options:options}, callback);
    }   

    // 全部不选中
    unCheckAll(indeterminate?:boolean){
        this.setState({
            value:[],
        },()=>{
            this.setIndeterminate(indeterminate);
        });
        this.triggerChange([]);
    }

    // 取消对指定值的选中
    unCheck(value: any){
        if(value){
            var valueArray = new GearArray(this.getValue());
            if(value instanceof Array){
                for(var i=0;i<value.length;i++){
                    valueArray.remove(value[i]);
                }
            }else{
                valueArray.remove(value);
            }
            this.setValue(valueArray.toArray());
        }
    }

    // 是否有选中项
    hasChecked(){
        let options = this.state.options;
        if(options && options.length>0){
            let vals = this.getValue();

            for(let i=0;i<options.length;i++){
                if(vals.contains(options[i].value))
                    return true;
            }
        }
        return false;        
    }

    // 值是否被选中
    isChecked(val: any){
        let options = this.state.options;
        if(options && options.length>0){
            for(let i=0;i<options.length;i++){
                if(options[i].value==val)
                    return true;
            }
        }
        return false;         
    }

    // 是否全选了
    isCheckedAll(vals?: any) {
        let options = this.state.options;
        if(options && options.length>0){
            if(vals){
                // 如果传入值存在，则检查传入值是否包含了给定集合的所有值
                if(!(vals instanceof Array))
                    vals = [vals+""];
            }else
                vals = this.getValue();

            let garray = new GearArray(vals);
            for(let i=0;i<options.length;i++){
                if(!garray.contains(options[i].value))
                    return false;
            }
            return true;           
        }else
            return false;
    } 
}