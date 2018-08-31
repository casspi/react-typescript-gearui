import * as Tag from "../Tag";
import { Calendar as AntdCalendar } from 'antd';
import * as React from 'react';
import * as moment from 'moment';
import 'moment/locale/zh-cn';
moment.locale('zh-cn');
export var props = {
    ...Tag.props,
    fullScreen: GearType.Boolean,
    //自定义渲染日期单元格，返回内容会被追加到单元格
    onDateCellRender: GearType.Function,
    //自定义渲染日期单元格，返回内容覆盖单元格
    onDateFullCellRender: GearType.Function,
    value: GearType.String,
    format: GearType.String,                         //指定日期格式
    //日期时候需要禁用
    onDisabledDate: GearType.Function,
};
export interface state extends Tag.state {
    fullScreen?: boolean;
    dateCellRender?: (date: moment.Moment) => any;
    dateFullCellRender?: (date: moment.Moment) => any;
    defaultValue?: moment.Moment;
    disabledDate?: (currentDate: moment.Moment) => boolean;
}
export default class Calendar<P extends typeof props, S extends state> extends Tag.default<P, S> {

    getInitialState():state {
        return {
            fullScreen: this.props.fullScreen,
            dateCellRender: (date) => {
                if(this.haveEvent("dateCellRender")) {
                    let r = this.doEvent("dateCellRender", date);
                    if(r && r[0]) {
                        return G.$(r[0]);
                    }
                }
                return <span></span>;
            },
            dateFullCellRender: (date) => {
                if(this.haveEvent("dateFullCellRender")) {
                    let r = this.doEvent("dateFullCellRender", date);
                    if(r && r[0]) {
                        return G.$(r[0]);
                    }
                }
                return <div className="ant-fullcalendar-value">{date.date()}</div>;
            },
            defaultValue: moment(this.props.value || new Date(), this.getFormart()),
            disabledDate: (currentDate: moment.Moment) => {
                if(this.haveEvent("disabledDate")) {
                    let r = this.doEvent("disabledDate", currentDate.toDate());
                    if(r && r[0]) {
                        return r[0];
                    }
                }
                return false;
            }
        };
    }

    render() {
        if (this.state.fullScreen == false) {
            return <div style={{ width: this.state.style ? this.state.style.width || 300 : 300, border: '1px solid #d9d9d9', borderRadius: 4 }}>
                <AntdCalendar {...this.state}></AntdCalendar>
            </div>;
        } else {
            return <AntdCalendar {...this.state}></AntdCalendar>;
        }
    }

    protected getFormart() {
        return this.props.format || "YYYY-MM-DD";
    }
}