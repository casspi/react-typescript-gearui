import * as Tag from "../Tag";
import { Calendar as AntdCalendar } from 'antd';
import * as React from 'react';
import * as moment from 'moment';
import 'moment/locale/zh-cn';
moment.locale('zh-cn');
export var props = {
    ...Tag.props,
    fullScreen: GearType.Boolean,
    onDateCellRender: GearType.Function,

};
export interface state extends Tag.state {
    fullScreen?: boolean;
    dateCellRender?: (date: moment.Moment) => any
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
}