import * as FormTag from './FormTag';
import * as React from 'react';
import { default as ColorPicker } from '../basic/ColorPicker';
import * as Text from './Text';
import { InputProps } from "antd/lib/input";
export var props = {
    ...Text.props,
    //默认是否显示颜色面板
    showPicker: GearType.Boolean,
}
export interface state extends FormTag.state {
    showPicker?: boolean;
    color?: string;
}
export default class Color<P extends typeof props & InputProps, S extends state & InputProps> extends Text.default<P, S> {

    protected _change(color: any,callback?: Function) {
        this.setValue(color.hex.replace("#",""),callback);
    }

    getInitialState(): state & InputProps {
        let style = G.G$.extend(props.style || {},{background: "#" + this.state.color, color: this.state.color > "aaaaaa"?"#000000":"#FFFFFF",display:"block",disabled:false});
        
        return {
            onClick: (e: any)=>{
                this.showPicker();
                this.doEvent("click", e);
            },
            style,
            onKeyDown:(e: any) => {
                let keyCode = e.keyCode;
                //放置输入非数字字符
                var e = e||window.event;
                var target = e.srcElement||e.target;
                if((keyCode < 48 || (keyCode > 57 && keyCode < 65) || keyCode > 70) || target.value.length > 5) {
                    if (e.stopPropagation){  
                        e.stopPropagation();  
                    }else{  
                        e.cancelBubble=true;  
                    } 
                    if (e.preventDefault){  
                        e.preventDefault();  
                    }else{  
                        e.returnValue=false;  
                    }
                }
            },
            value: this.getValue(),
            showPicker: this.props.showPicker
        };
    }

    

    getPickerProps() {
        
        return {
            onChange: (color: any, event: any)=>{
                let oldValue = this.getValue();
                this._change(color,()=>{
                    let value = this.getValue();
                    this.doEvent("change",value,oldValue);
                });
            },
            value: this.getValue(),
        };
    }

    getProps() {
        let props: any = G.G$.extend({},this.state);
        delete props.showPicker;
        return props;
    }

    render() {
        let position1:any = "absolute";
        let position2:any = "fixed";
        const styles = {
            "popover": {
                "position": position1,
                "zIndex": 2
            },
            cover: {
                position: position2,
                top: '0px',
                right: '0px',
                bottom: '0px',
                left: '0px',
            }
            
        };
        let pickerProps: any = this.getPickerProps();
        return <span>
                {super.render()}
                {this.state.showPicker ? 
                    <div style={ styles.popover }>
                        <div style={ styles.cover } onClick={this.closePicker.bind(this)}/>
                            <ColorPicker {...pickerProps}/>
                        </div> 
                    : null}
        </span>;
    }

    closePicker(callback?: Function) {
        this.setState({
            showPicker: false
        },()=>{
            if(callback && G.G$.isFunction(callback)) {
                callback();
            }
        });
    }

    //显示面板
    showPicker(callback?: Function) {
        this.setState({
            showPicker: true
        },()=>{
            if(callback && G.G$.isFunction(callback)) {
                callback();
            }
        });
    }

    getValue() {
        return this.state.color;
    }

}