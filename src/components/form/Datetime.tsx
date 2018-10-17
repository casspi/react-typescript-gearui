import { DatePicker } from 'antd';
import * as moment from 'moment';
import * as React from 'react';
import * as FormTag from './FormTag';
import Tag from '../Tag';
// 推荐在入口文件全局设置 locale
import 'moment/locale/zh-cn';
moment.locale('zh-cn');
const { RangePicker } = DatePicker;

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
    ableTime: GearType.String, //时间可选区间
    ableDatetime: GearType.String, //日期时间可选范围
    hideTime: GearType.Boolean, //是否隐藏不可选择时间区间
    ok: GearType.Function,
    getCalendarContainer: GearType.Function,
}

export interface state extends FormTag.state {
    prompt?: any;
    format: string;
    size?: "large"|"defaule"|"small",
    ableDate?: string;
    start?: string;
    end?: string;
    showTime?: any;
    ableTime?: string;
    hideTime?: boolean;
}

export default class GDatetime<P extends typeof props, S extends state> extends FormTag.default<P, S> {

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
            }else
                placeholder = ["开始时间","结束时间"];
        }else{
            placeholder = this.props.prompt || "请选择日期";
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

        let ableTimeParams = this.getAbleTimeParams(this.state.ableTime);

        let props = G.G$.extend({}, this.state, {
            type: type,
            placeholder: placeholder,
            disabled: this.state.disabled || this.state.readOnly,
            showTime: this.state.showTime,
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
            disabledTime: type != "range" ? null : (current: any, timeType: any) : any => {
                if (timeType === 'start') {
                    if (ableTimeParams.ableTimeRangeArrayStart != null) {
                        return {
                            disabledHours: () => ableTimeParams.ableTimeRangeArrayStartHour,
                            disabledMinutes: () => ableTimeParams.ableTimeRangeArrayStartMin,
                            disabledSeconds: () => ableTimeParams.ableTimeRangeArrayStartSec,
                        }
                    }
                } else if (timeType === 'end') {
                    if (ableTimeParams.ableTimeRangeArrayEnd != null) {
                        return {
                            disabledHours: () => ableTimeParams.ableTimeRangeArrayEndHour,
                            disabledMinutes: () => ableTimeParams.ableTimeRangeArrayEndMin,
                            disabledSeconds: () => ableTimeParams.ableTimeRangeArrayEndSec,
                        }
                    }
                }
                return undefined;
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
        let format = this.props.format || "YYYY-MM-DD HH:mm:ss";
        let value: any = null;
        let start = null;
        let end = null;
        if (this.props.value) {
            let valueStr: string = this.props.value;
            let valueArr = valueStr.split(",");
            if (valueArr[0]) {
                start = moment(valueArr[0], format);
            }
            if (valueArr[1]) {
                end = moment(valueArr[1], format);
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
            } else {
                value = moment(this.props.value, format);
            }
        }

        if (type == "range") {
            return {
                value: value,
                start: this.props.start,
                end: this.props.end,
                showTime: { hideDisabledOptions: this.state.hideTime },
                format: format,
                size: this.props.size,
            };
        }else {
            return {
                value: value,
                start: this.props.start,
                end: this.props.end,
                showTime: this.showTime(this.state.hideTime),
                format: format,
                size: this.props.size,
            };
        }
    }

    private getAbleTimeParams(ableTime: any) {
        let ableTimeArray;
        let abletimeStr;
        let ableTimeRangeArrayStart;
        let ableTimeRangeArrayStartHour;
        let ableTimeRangeArrayStartMin;
        let ableTimeRangeArrayStartSec;
        let ableTimeRangeArrayEnd;
        let ableTimeRangeArrayEndHour;
        let ableTimeRangeArrayEndMin;
        let ableTimeRangeArrayEndSec;
        let type = this.props.type || "date";

        if (ableTime) {
            abletimeStr = ableTime;                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                
            if (type == null || type == "date") {
                //8:8:9-8:8:9
                if (abletimeStr.indexOf("-") > 0) {
                    ableTimeArray = abletimeStr.split("-").join(":").split(":");
                } else {
                    ableTimeArray = abletimeStr.split(":");
                }
            } else if (type = "range") {
                //8:8:9-8:8:9,8:8:9-8:8:9,8:8:9-8:8:9
                ableTimeArray = abletimeStr.split(",");
                if (ableTimeArray.length == 1) {
                    ableTimeArray.push(ableTimeArray[0]);
                    // ableTimeArray.push(ableTimeArray[0]);
                }
                if (ableTimeArray[0] != "") {
                    if (ableTimeArray[0].indexOf("-") > 0) {
                        ableTimeRangeArrayStart = ableTimeArray[0].split("-").join(":").split(":");
                        ableTimeRangeArrayStartHour = this.disH(parseInt(ableTimeRangeArrayStart[0]), parseInt(ableTimeRangeArrayStart[3]));
                        ableTimeRangeArrayStartMin = this.disMS(parseInt(ableTimeRangeArrayStart[1]), parseInt(ableTimeRangeArrayStart[4]));
                        ableTimeRangeArrayStartSec = this.disMS(parseInt(ableTimeRangeArrayStart[2]), parseInt(ableTimeRangeArrayStart[5]));
                    } else {
                        ableTimeRangeArrayStart = ableTimeArray[0].split(":");
                        ableTimeRangeArrayStartHour = this.disH(parseInt(ableTimeRangeArrayStart[0]), parseInt(ableTimeRangeArrayStart[0]));
                        ableTimeRangeArrayStartMin = this.disMS(parseInt(ableTimeRangeArrayStart[1]), parseInt(ableTimeRangeArrayStart[1]));
                        ableTimeRangeArrayStartSec = this.disMS(parseInt(ableTimeRangeArrayStart[2]), parseInt(ableTimeRangeArrayStart[2]));
                    }

                } else {
                    ableTimeRangeArrayStart == null;
                }
                if (ableTimeArray[1] != "") {
                    if (ableTimeArray[0].indexOf("-") > 0) {
                        ableTimeRangeArrayEnd = ableTimeArray[1].split("-").join(":").split(":");
                        ableTimeRangeArrayEndHour = this.disH(parseInt(ableTimeRangeArrayEnd[0]), parseInt(ableTimeRangeArrayEnd[3]));
                        ableTimeRangeArrayEndMin = this.disMS(parseInt(ableTimeRangeArrayEnd[1]), parseInt(ableTimeRangeArrayEnd[4]));
                        ableTimeRangeArrayEndSec = this.disMS(parseInt(ableTimeRangeArrayEnd[2]), parseInt(ableTimeRangeArrayEnd[5]));
                    } else {
                        ableTimeRangeArrayEnd = ableTimeArray[1].split(":");
                        ableTimeRangeArrayEndHour = this.disH(parseInt(ableTimeRangeArrayEnd[0]), parseInt(ableTimeRangeArrayEnd[0]));
                        ableTimeRangeArrayEndMin = this.disMS(parseInt(ableTimeRangeArrayEnd[1]), parseInt(ableTimeRangeArrayEnd[1]));
                        ableTimeRangeArrayEndSec = this.disMS(parseInt(ableTimeRangeArrayEnd[2]), parseInt(ableTimeRangeArrayEnd[2]));
                    }
                } else {
                    ableTimeRangeArrayEnd == null;
                }
            }
        }
        return {ableTimeRangeArrayStart, ableTimeRangeArrayEnd, ableTimeRangeArrayStartHour, ableTimeRangeArrayStartMin, ableTimeRangeArrayStartSec, ableTimeRangeArrayEndHour, ableTimeRangeArrayEndMin, ableTimeRangeArrayEndSec};
    }

    showTime(hideTime: any) {
        if (this.props.ableTime || this.props.ableDatetime) {
            let ableTimeNumArray = this.getAbleTimeParams(this.props.ableTime);
            return {
                hideDisabledOptions: hideTime,
                disabledHours: () => this.disH(parseInt(ableTimeNumArray[0]), parseInt(ableTimeNumArray[3])),
                disabledMinutes: () => this.disMS(parseInt(ableTimeNumArray[1]), parseInt(ableTimeNumArray[4])),
                disabledSeconds: () => this.disMS(parseInt(ableTimeNumArray[2]), parseInt(ableTimeNumArray[5])),
            }
        } else {
            return true;
        }
    }

    disH(startH: any, endH: any) {
        const result = [];
        //8:00-17:00
        if (startH < endH) {
            for (let i = 0; i < 24; i++) {
                if (i < startH || i > endH) {
                    result.push(i);
                }
            }
            //17:00-8:00(day+1)
        } else if (startH > endH) {
            for (let i = 0; i < 24; i++) {
                if (i > startH || i < endH) {
                    result.push(i);
                }
            }
        } else if (startH = endH) {
            for (let i = 0; i < 24; i++) {
                if (i = startH) {

                } else {
                    result.push(i);
                }
            }
        }
        return result;
    }

    disMS(startMS: any, endMS: any) {
        const result = [];
        if (startMS < endMS) {
            for (let i = 0; i < 60; i++) {
                if (i < startMS || i > endMS) {
                    result.push(i);
                }
            }
        } else if (startMS > endMS) {
            for (let i = 0; i < 60; i++) {
                if (i > startMS || i < endMS) {
                    result.push(i);
                }
            }
        } else if (startMS = endMS) {
            if (startMS == 0) {
                for (let i = 0; i < 60; i++) {
                    result.push(i);
                }
            } else {
                for (let i = 0; i < 60; i++) {
                    if (i = startMS) {

                    } else {
                        result.push(i);
                    }
                }
            }
        }
        return result;
    }

    // arrayMerge(arrA, arrB) {
    //     let array = new Array();
    //     array.concat(arrA).concat(arrB);
    //     return array;
    //     // for(let i=0;i++;i<arrA.length){

    //     // }
    // }

    //渲染
    render() {
        let props: any = this.getProps();
        let type = this.props.type;
        if (type == null || type == "date") {
            return <DatePicker {...props}></DatePicker>;
        } else if (type == "range") {
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