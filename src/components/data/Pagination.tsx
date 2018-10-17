import * as React from 'react';
import {Pagination} from 'antd';
export interface GPaginationProps extends tags.TagProps {
    total: string;//数据总数
    defaultcurrent?: string;//默认的当前页数
    current?: string;//当前页数
    defaultpageSize?: string;//默认的每页条数
    pagesize?: string;//每页条数
    onbeforechange?:Function;//在change前触发，如果返回false可以阻止改变
    onchange?: Function;//页码改变的回调，参数是改变后的页码及每页条数
    showsizechanger?: boolean;//是否可以改变 pageSize
    pagesizeoptions?: string[];//指定每页可以显示多少条
    onpagesizechange?: Function;//pageSize 变化的回调
    showquickjumper?: boolean;//是否可以快速跳转至某页
    showtotal?: (total: number, range: [number, number]) => React.ReactNode;//用于显示数据总量和当前数据顺序
    size?: string;//当为「small」时，是小尺寸分页
    simple?: boolean;//当添加该属性时，显示为简单分页
    locale?: Object;
    selectprefixcls?: string;
    itemrender?: (page: number, type: 'page' | 'prev' | 'next' | 'jump-prev' | 'jump-next') => React.ReactNode;//用于自定义页码的结构，可用于优化 SEO
}
export default class GPagination<P extends GPaginationProps> extends tags.Tag<P> {

    constructor(props) {
        super(props);
        if(this.props.onbeforechange)
            this.bind("beforeChange",this.props.onbeforechange);        
        if(this.props.onchange)
            this.bind("change",this.props.onchange);
        if(this.props.onpagesizechange)
            this.bind("pageSizeChange",this.props.onpagesizechange);
    }

    getInitialState() {
        let state = super.getInitialState();
        return G.G$.extend({},state,{
            total: this.getPropIntValue(this.props.total),
            pageSize: this.getPropIntValue(this.props.pagesize),
            current: this.getPropIntValue(this.props.current),
            pageSizeOptions: this.getPropStringArrayValue(this.props.pagesizeoptions),
        });
    }

    getProps() {
        let props = super.getProps();
        return G.G$.extend({},props,{
            total: this.state["total"]||0,//数据总数
            defaultCurrent: this.state["current"],//默认的当前页数
            current: this.state["current"],//当前页数
            defaultPageSize: this.state["pageSize"],//默认的每页条数
            pageSize: this.state["pageSize"],//每页条数
            onChange: (page: number, pageSize: number) => {
                this._onChange(page,pageSize);
            },//页码改变的回调，参数是改变后的页码及每页条数
            showSizeChanger: this.props.showsizechanger || false,//是否可以改变 pageSize
            pageSizeOptions: this.state["pageSizeOptions"] || ["10","20","30","40"],//指定每页可以显示多少条
            onShowSizeChange: (current: number, size: number) => {
                this._onPageSizeChange(current,size);
            },//pageSize 变化的回调
            showQuickJumper: this.props.showquickjumper==false?false:true,//是否可以快速跳转至某页
            //showTotal?: (total: number, range: [number, number]) => {},//用于显示数据总量和当前数据顺序
            size: this.props.size,//当为「small」时，是小尺寸分页
            simple: this.props.simple,//当添加该属性时，显示为简单分页
            locale: this.props.locale,
            selectPrefixCls: this.props.selectprefixcls,
            showTotal: (total, range) => `共${total}条记录`,
            //itemRender?: this.props.itemrender || (page: number, type: 'page' | 'prev' | 'next' | 'jump-prev' | 'jump-next')
        });
    }

    makeJsx() {
        let props = this.getProps();
        return <Pagination {...props}/>;
    }

    getPageSize() {
        return this.state["pageSize"]||10;
    }

    getCurrent() {
        return this.state["current"]||1;
    }

    getTotal() {
        return this.state["total"]||0;
    }

    protected _onChange(page: number, pageSize: number) {
        let ret = this.doEvent("beforeChange",page,pageSize);
        if(ret && ret instanceof Array){
            for(var i=0;i<ret.length;i++){
                if(ret[i]==false)
                    return;
            }
        }
        this.setState({
            current: page,
            pageSize: pageSize
        },()=>{
            this.doEvent("change",page,pageSize);
        });
    }

    onBeforeChange(fun) {
        if(fun && G.G$.isFunction(fun)) {
            this.bind("beforeChange",fun);
        }
    }

    onChange(fun) {
        if(fun && G.G$.isFunction(fun)) {
            this.bind("change",fun);
        }
    }

    protected _onPageSizeChange(current: number, size: number){
        this.setState({
            current: current,
            pageSize: size
        },()=>{
            this.doEvent("pageSizeChange",current,size);
        });
    }
    onPageSizeChange(fun) {
        if(fun && G.G$.isFunction(fun)) {
            this.bind("pageSizeChange",fun);
        }
    }

    setParam(param) {
        let paramInner = {};
        if(param.pageSize != null) {
            paramInner["pageSize"] = param.pageSize;
        }
        if(param.current != null) {
            paramInner["current"] = param.current;
        }
        if(param.total != null) {
            paramInner["total"] = param.total;
        }
        this.setState(paramInner);
    }

    setPageSizeOptions(pageSizeOptions){
        this.setState({
            pageSizeOptions:this.getPropStringArrayValue(pageSizeOptions)
        });
    }
}