import { DatePicker } from 'antd';
import * as moment from 'moment';
import * as FormTag from './FormTag';
import * as React from 'react';
// 推荐在入口文件全局设置 locale
import 'moment/locale/zh-cn';
import Tag from '../Tag';
moment.locale('zh-cn');
const { MonthPicker, RangePicker } = DatePicker;

export var props = {
    ...FormTag.props,
    prompt: GearType.Or(GearType.Array, GearType.Function, GearType.String),
    type: GearType.Enum<"date"|"month"|"range">(),//日期选择控件，date，month，range
    showTime: GearType.Boolean,//显示时间，month控件不可用此属性
    format: GearType.String,//指定日期格式
    start: GearType.String,//当选择为日历范围时，开始时间
    end: GearType.String,//当选择为日历范围时，结束时间
    size: GearType.Enum<"large"|"defaule"|"small">(),////可选large,defaule,small
    ableDate: GearType.String, //日期可选区间
    ok: GearType.Function,
    getCalendarContainer: GearType.Function,
};

export interface state extends FormTag.state {
    prompt?: any;
    format?: string;
    size?: "large"|"defaule"|"small",
    ableDate?: string;
    start?: string;
    end?: string;
    showTime?: boolean;
}

export default class Date<P extends typeof props, S extends state> extends FormTag.default<P, S> {

    //获取当前属性
    getProps() {
        let type = this.props.type || "date";
        let placeholder;
        if(type=="range"){
            let p = this.state.prompt;
            if(p && p.length > 0){
                if(p.length == 1){
                    placeholder = [p[0],p[0]];
                }else{
                    placeholder = [p[0],p[1]];
                }
            }else {
                placeholder = ["开始时间","结束时间"];
            }
        }else{
            placeholder = this.state.prompt || "请选择日期";
        }
        let limitStartNum: number = 0;
        let limitEndNum: number = 0;

        if (this.state.ableDate) {
            let ableDateArray = this.props.ableDate.split(",");
            if (ableDateArray[0].length > 1) {
                let limitStartMoment = moment(ableDateArray[0], this.getFormat());
                limitStartNum = limitStartMoment.valueOf();
            }
            if (ableDateArray[1].length > 1) {
                let limitEndMoment = moment(ableDateArray[1], this.getFormat());
                limitEndNum = limitEndMoment.valueOf() + 86200000;;
            }
        }

        let props: any = G.G$.extend({},this.state, {
            type: type,
            placeholder: placeholder,
            disabled: this.state.disabled || this.state.readOnly,
            showTime: false,
            format: this.state.format,
            size: this.state.size,
            value: this.state.value,
            defaultValue: this.state.value,
            disabledDate: (date: any) => {
                if (limitStartNum != 0 && limitEndNum == 0) {
                    return date && date.valueOf() < limitStartNum;
                } else if (limitStartNum == 0 && limitEndNum != 0) {
                    return date && date.valueOf() > limitEndNum;
                } else if (limitStartNum != 0 && limitEndNum != 0) {
                    return date.valueOf() < limitStartNum || date.valueOf() > limitEndNum;
                } else {
                    return false;
                }
            },
            onChange: (e: any) => {
                //控件基础改变事件
                this._change(e);
            },
            onOk: type == "month" ? null : () => {
                this._ok();
            },
            getCalendarContainer: ()=>{
                let container = document.body;
                let containerr = this.doEvent("getCalendarContainer");
                if(containerr && containerr.length > 0) {
                    container = containerr[0];
                }else {
                    // 在其父级
                    let parent = this.parent();
                    if(parent instanceof Tag) {
                        parent = parent.realDom;
                    }else {
                        parent = parent[0];
                    }
                    if(parent) {
                        container = parent;
                    }
                }
                return container;
            }
        });
        return props;
    }

    getFormat() {
        return this.state.format;
    }

    //插件初始化，状态发生变化重新进行渲染
    getInitialState(): state {
        let type = this.props.type || "date";
        let format = this.props.format || "YYYY-MM-DD";
        let start = null;
        if (this.props.start) {
            start = moment(this.props.start, format);
        }
        let end = null;
        if (this.props.end) {
            end = moment(this.props.end, format);
        }
        let value: any = null;
        if (this.props.value) {
            value = moment(this.props.value, format);
        }
        if (type == "range") {
            value = [];
            if (start) {
                value = [];
                value.push(start);
                if (end) {
                    value.push(end);
                }
            }
        }
        return {
            value: value,
            start: this.props.start,
            end: this.props.end,
            showTime: false,
            format: format,
            size: this.props.size,
        };
    }
    //渲染
    render() {
        let props = this.getProps();
        let type = this.props.type;
        if (type == null || type == "date") {
            return <DatePicker {...props}></DatePicker>;
        } else if (type == "month") {
            return <MonthPicker {...props}></MonthPicker>;
        } else if (type == "range") {
            // console.log(props);
            return <RangePicker {...props}></RangePicker>;
        }
        return null;
    }

    //改变事件
    protected _change(e: any) {
        let oldValue = this.getFormatValue();
        super.setValue(e, () => {
            let args = [this.getFormatValue(),oldValue];
            //执行自定义注册的事件
            this.doEvent("change", ...args);
            //执行控件属性指定的事件
        });
    }

    protected _ok() {
        this.doEvent("ok");
    }

    getFormatValue(values?: any) {
        let value = values || this.getValue();
        let valueRe: any = null;
        if (value instanceof Array) {
            valueRe = [];
            value.forEach((valueInner: moment.Moment) => {
                let val = valueInner.format(this.state.format);
                valueRe.push(val);
            });
        } else if (moment.isMoment(value)) {
            valueRe = value.format(this.state.format);
        }
        return valueRe;
    }

    focus(...args: any[]) { 
        this.find("input").focus(...args);      
    }

    blur(...args: any[]){
        this.find("input").blur(...args);
    }  

    setValue(val: any,callback?:Function){
        let value;
        if(val){
            if(this.props.type == "range") {
                if(val instanceof Array){
                    let v1,v2;
                    if(val.length>0)
                        v1 = moment(val[0], this.state.format);
                    if(val.length>1)
                        v2 = moment(val[1], this.state.format);    
                    value = [v1,v2];
                }else{
                    value = [moment(val, this.state.format),null];
                }
            }else{
                value = moment(val, this.state.format);
            }
        }
        super.setValue(value, callback);
    }
    
    setStart(val: any,callback?: Function) {
        if(this.props.type == "range") {
            let format = this.getFormat();
            let value: any = this.getValue();
            if(value instanceof Array) {
                value[0] = moment(val, format);
            }
            super.setValue(value);
        }
    }

    setEnd(val: any,callback?: Function) {
        if(this.props.type == "range") {
            let format = this.getFormat();
            let value: any = this.getValue();
            if(value instanceof Array) {
                value[1] = moment(val, format);
            }
            super.setValue(value);
        }
    }

}