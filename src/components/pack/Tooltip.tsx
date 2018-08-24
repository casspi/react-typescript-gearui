import * as React from 'react';
import { Tooltip as AntdTooltip } from 'antd';

export default class Tooltip {

    // 添加验证失败的提示信息
    static addInvalidTooltip(ele: any,eleId: string,message: any,titleAlign: any) {
        let tooltipId = eleId+"-tooltip";
        return <AntdTooltip placement={titleAlign||"topRight"} overlayClassName={tooltipId+" ant-tooltip-formitem-invalid"} title={message} trigger={"hover"} onVisibleChange={(visible: boolean)=>{
        }}><span>{ele}</span></AntdTooltip>;  
    }

    //添加提示信息
    static addTooltip(ele: any,message: any,titleAlign: any) {
        return <AntdTooltip placement={titleAlign||"topRight"} title={message}><span>{ele}</span></AntdTooltip>;
    }
}