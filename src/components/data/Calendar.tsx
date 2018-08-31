import * as Tag from "../Tag";
import { Calendar as AntdCalendar } from 'antd';
import * as React from 'react';
import * as moment from 'moment';
import 'moment/locale/zh-cn';
moment.locale('zh-cn');
export var props = {
    ...Tag.props,
    //是否全屏显示
    fullScreen: GearType.Boolean,
    //自定义渲染日期单元格，返回内容会被追加到单元格
    onDateCellRender: GearType.Function,
    //自定义渲染日期单元格，返回内容覆盖单元格
    onDateFullCellRender: GearType.Function,
    value: GearType.String,
    //指定日期格式
    format: GearType.String,                         
    //日期是否需要禁用
    onDisabledDate: GearType.Function,
    //初始显示格式
    mode: GearType.Enum<"month"|"year">(),
    //自定义渲染月单元格，返回内容会被追加到单元格
    onMonthCellRender: GearType.Function,
    //自定义渲染月单元格，返回内容覆盖单元格
    onMonthFullCellRender: GearType.Function,
    //可以显示的日期区间;[0]是开始，[1]是结束
    validRange: GearType.Array<Date>(),
    //日期面板变化回调
    onPanelChange: GearType.Function,
    onSelect: GearType.Function,
    onChange: GearType.Function,
};
export interface state extends Tag.state {
    fullScreen?: boolean;
    defaultValue?: moment.Moment;
    mode?: "month"|"year";
    validRange?: [moment.Moment, moment.Moment];
    value?: moment.Moment;
}
export default class Calendar<P extends typeof props, S extends state> extends Tag.default<P, S> {

    getInitialState():state {
        return {
            fullScreen: this.props.fullScreen,
            defaultValue: moment(this.props.value || new Date(), this.getFormart()),
            mode: this.props.mode,
            validRange: this.props.validRange instanceof Array ? [moment(this.props.validRange[0]), moment(this.props.validRange[1])]: undefined,
            value: moment(this.props.value || new Date(), this.getFormart()),
        };
    }

    private getProps() {
        return {
            dateCellRender: (date: moment.Moment) => {
                if(this.haveEvent("dateCellRender")) {
                    let r = this.doEvent("dateCellRender", date.toDate());
                    if(r && r[0]) {
                        return G.$(r[0]);
                    }
                }
                return <span></span>;
            },
            dateFullCellRender: (date: moment.Moment) => {
                if(this.haveEvent("dateFullCellRender")) {
                    let r = this.doEvent("dateFullCellRender", date.toDate());
                    if(r && r[0]) {
                        return G.$(r[0]);
                    }
                }
                return <div className="ant-fullcalendar-value">{date.date()}</div>;
            },
            disabledDate: (currentDate: moment.Moment) => {
                if(this.haveEvent("disabledDate")) {
                    let r = this.doEvent("disabledDate", currentDate.toDate());
                    if(r && r[0]) {
                        return r[0];
                    }
                }
                return false;
            },
            monthCellRender: (date: moment.Moment) => {
                if(this.haveEvent("dateCellRender")) {
                    let r = this.doEvent("dateCellRender", date.toDate());
                    if(r && r[0]) {
                        return G.$(r[0]);
                    }
                }
                return <span></span>;
            },
            monthFullCellRender: (date: moment.Moment) => {
                if(this.haveEvent("dateFullCellRender")) {
                    let r = this.doEvent("dateFullCellRender", date.toDate());
                    if(r && r[0]) {
                        return G.$(r[0]);
                    }
                }
                return <div className="ant-fullcalendar-value">{date.month() + "月"}</div>;
            },
            onPanelChange: (date: moment.Moment, mode: string) => {
                this.doEvent("panelChange", date, mode);
            },
            onSelect: (date: moment.Moment) => {
                this.doEvent("select", date);
            },
            onChange: (date: moment.Moment) => {
                this.doEvent("change", date);
            },
        }
    }

    render() {
        if (this.state.fullScreen == false) {
            return <div style={{ width: this.state.style ? this.state.style.width || 300 : 300, border: '1px solid #d9d9d9', borderRadius: 4 }}>
                <AntdCalendar {...this.state} {...this.getProps()}></AntdCalendar>
            </div>;
        } else {
            return <AntdCalendar {...this.state} {...this.getProps()}></AntdCalendar>;
        }
    }

    protected getFormart() {
        return this.props.format || "YYYY-MM-DD";
    }
}