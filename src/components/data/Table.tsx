import * as React from 'react';
import * as Tag from '../Tag';
import { Table as AntdTable, Button, Icon } from 'antd';
import { TableProps } from '../../../node_modules/antd/lib/table/interface';
import { UUID, ObjectUtil } from '../../utils';
import Http, { methods } from '../../utils/http';
import * as Content from './Content';
import { Form } from '../form/Form';
import * as Column from './Column';
import * as Text from '../form/Text';
import * as Date from '../form/Date';
import * as Datetime from '../form/Datetime';
import * as Combotree from '../form/Combotree';
export var props = {
    ...Tag.props,
    url: GearType.Or(GearType.String, GearType.Function),
    sequence: GearType.Or(GearType.String, GearType.Boolean, GearType.Function),
    method: GearType.Enum<methods>(),
    pagination: GearType.Boolean,
    selections: GearType.Any,
    checkType: GearType.Enum<"radio" | "checkbox">(),
    scrollx: GearType.Number,
    scrolly: GearType.Number,
    emptyText: GearType.String,
    checkAll: GearType.Boolean,
    formId: GearType.String,
    sequenceLabel: GearType.String,
    lazy: GearType.Boolean,
    paginationId: GearType.String
};

export interface state extends Tag.state, TableProps<any> {
    title?: any;//
    url?: string | Function;
    method?: methods;
    checkedRowKeys?: Array<any>;
    checkedRows?: Array<any>;
    selections?: any;
    sorterInfo?: any;
    filteredInfo?: any;
    checkType?: "radio" | "checkbox";
    isCheckedAll?: boolean;//是否全部被选中
    filtered?: any;
    filterVisible?: any;
    scrolly?: number;
    scrollx?: number;
    otherParam?: any;
    emptyText?: string;
    checkAll?: boolean;//
    formId?: string;//
    sequence?: string|Function|boolean;//
    sequenceLabel?: string;//
    lazy?: boolean;//
    paginationId?: Array<string>;//
}

export interface TableColumns {
    //字段名称
    name: string;
    //字段中文名称
    title?: string;
    //字段数据key
    dataIndex?: string;
    className?: string;
    width?: number;
    key?: string;
    fixed?: "left"|"right";
    render?: any;
    ellipsisSpanWidth?: number;
    orderColumn?: any;
    sortOrder?: boolean;
    sorter?: Function;
    filterDropdown?: any;
    filterDropdownVisible?: any;
    onFilterDropdownVisibleChange?: Function;
    filterIcon?: any;
    children?: any[];
    rowspan?: any;
    index?: any;
}
export interface Data<T> {
    total?: number;
    pageSize?: number;
    currentPage?: number;
    dataList: T[];
    columns?: Array<TableColumns>;
    
}

export var ColumnPropsPlus = {
    ...Column.props,
    children: GearType.Any
}
export default class Table<P extends typeof props & TableProps<any>, S extends state> extends Tag.default<P, S> {

    
    protected paginations: Array<any> = [];
    protected formEle: Form<any, any>;
    protected ctrl = false;
    //是否是通过点击table中的分页以及排序等操作进行提交到后台的
    // protected submitByTable = false;
    //最后一次查询的参数
    private lastQueryParam = {};
    //过滤器控件
    private searchNodes: any = {};
    public isFixed = false;
    //已经展开行
    private expandedRowCached = {};
    private filterContainerId = UUID.get();
    //当前展开的记录行
    private _expandRecord = null;

    //获取form对象，并且绑定提交成功事件
    getForm() {
        let formId = this.state.formId;
        if(formId && this.formEle == null) {
            let gearform: Form<any, any> = G.$("#" + formId);
            if(gearform instanceof Form == false) {
                if(gearform[0]) {
                    gearform.doRender();
                    gearform = G.$(gearform[0]);
                }
            }
            if(gearform instanceof Form) {
                this.formEle = gearform;
            }
        }
    }

    //清除排序信息
    clearSorterInfo(callback?: Function) {
        this.setState({
            sorterInfo: null
        },()=>{
            if(callback) {
                callback();
            }
        });
    }

    clearAll(callback?: Function) {
        this.setState({
            sorterInfo: null,
            checkedRowKeys:[],
            checkedRows: [],
            otherParam: {}
        },()=>{
            if(callback) {
                callback();
            }
        });
    }

    clearSelected(callback?: Function) {
        this.setState({
            checkedRowKeys:[],
            checkedRows: []
        },()=>{
            if(callback) {
                callback();
            }
        });
    }

    //获取最后一次查询的参数
    getLastQueryParam() {
        return this.lastQueryParam;
    }

    getQueryParam(tableSubmit?:boolean) {
        let param = {};
        let paramTemp = null
        if(this.formEle !== null) {
            if(tableSubmit == true) {
                paramTemp = this.getLastQueryParam();
            }else {
                this.formEle.addOtherParams();
                this.formEle.addParams();
                paramTemp = this.formEle.serializeArray();
            }
        }
        if(paramTemp instanceof Array) {
            for(let i = 0; i < paramTemp.length; i++) {
                let name = paramTemp[i].name;
                let value = paramTemp[i].value;
                if(param[name] != null) {
                    if(param[name] instanceof Array) {
                        param[name].push(value);
                    }else {
                        let valueArr = [param[name]];
                        valueArr.push(value);
                        param[name] = valueArr;
                    }
                }else {
                    param[name] = value;
                }
            }
        }else {
            param = paramTemp;
        }
        //如果是从外界提交的查询，就清空页码以及排序条件
        if(tableSubmit == true) {
            param = G.G$.extend(param,this.getQueryParamWithoutForm());
        }else {
            param = G.G$.extend(param,this.getClearQueryParamWithoutForm());
        }
        let otherParam = this.getOtherParam();
        if(otherParam) {
            param = G.G$.extend(param,otherParam);
        }
        return param;
    }

    getQueryParamWithoutForm() {
        return G.G$.extend({
            pageSize: this.getPageSize() + "",
            currentPage: this.getCurrent() + "",
            orderColumn: this.getOrderColumn()
        },this.getFilterParam());
    }
    // 得到批量操作请求使用的参数
    getBatchRequestParam(checkedIdsKey?: any,checkAllKey?: any){
        checkedIdsKey = checkedIdsKey || "checkedIds";
        checkAllKey = checkAllKey || "checkedAll";
		var param = this.getQueryParam() || {};
		if(this.isCheckedAll()){
            // 如果是全选
            param[checkAllKey] = "YES";
		}else{
            // 获得选中行
            param[checkAllKey] = "NO";
			var checkedRows = this.getCheckedRows();
			if(checkedRows){
				var checkedIds = [];
				for(var i=0;i<checkedRows.length;i++){
					checkedIds.push(checkedRows[i].id);
				}
				param[checkedIdsKey] = checkedIds;
			}	
		}
		return param;
    }

    getClearQueryParamWithoutForm() {
        return {
            pageSize: this.getPageSize() + "",
            currentPage: 1 + "",
            orderColumn: []
        }
    }

    getPageSize() {
        if(this.paginations.length > 0) {
            return this.paginations[0].getPageSize();
        }
        return 10;
    }

    getCurrent() {
        if(this.paginations.length > 0) {
            return this.paginations[0].getCurrent();
        }
        return 0;
    }

    getTotal() {
        if(this.paginations.length > 0) {
            return this.paginations[0].getTotal() || 0;
        }
        return 0;
    }

    //是否选中全部
    isCheckedAll() {
        return this.state.isCheckedAll;
    }
    // 是否有选中行
    hasCheckedRow(){
        let checkedRowKeys: any = this.getCheckedRowKeys();
        if(checkedRowKeys instanceof Array) {
            if(checkedRowKeys.length >0) {
                return true;
            }
        }  
        return false;      
    }

    getOtherParam() {
        return this.state.otherParam;
    }

    addOtherParam(key: any,val: any,callback?: Function) {
        let otherParam = this.getOtherParam() || {};
        otherParam[key] = val;
        this.setOtherParam(otherParam,callback);
    }

    setOtherParam(param: any,callback?: Function) {
        if(param) {
            this.setState({
                otherParam: param
            },()=>{
                if(callback) {
                    callback.call(this);
                }
            });
        }
    }

    delOtherParam(key: any,val: any,callback?: Function) {
        let otherParam = this.getOtherParam() || {};
        delete otherParam[key];
        this.setOtherParam(otherParam,callback);
    }

    clearOtherParam(callback?: Function) {
        this.setState({
            otherParam: {}
        },()=>{
            if(callback) {
                callback.call(this);
            }
        });
    }

    //获取过滤参数
    getFilterParam() {
        let filterParam: any = {};
        let filteredInfo = this.getFilteredInfo();
        for(let key in filteredInfo) {
            let filterId = key;
            filterParam[filterId] = filteredInfo[key];
        }
        return filterParam;
    }

    //获取排序字段信息
    getOrderColumn() {
        let sorterInfo = this.state.sorterInfo;
        let orderColumns = " ";
        if(sorterInfo) {
            for(let key in sorterInfo) {
                let info  = sorterInfo[key];
                let orderColumn:string = info.column.orderColumn;
                let sortType:string = info.order == "descend" ? " desc " : " asc ";
                if(orderColumns.trim() != "") {
                    orderColumns += ","
                }
                orderColumns += (orderColumn + sortType) + " ";
            }
        }
        return orderColumns.trim();
    }

    //获取所有的分页器对象
    getPaginations() {
        if(this.state.paginationId && this.paginations.length == 0) {
            for(let i = 0; i < this.state.paginationId.length; i++) {
                let p = this.getPagination(this.state.paginationId[i]);
                if(ObjectUtil.isExtends(p, "Pagination")) {
                    this.paginations.push(p);
                }
            }
        }
    }

    //根据ID获取分页器对象
    getPagination(paginationId: string) {
        if(!paginationId) {
            return null;
        }
        let p = G.$("#" + paginationId);
        if((ObjectUtil.isExtends(p, "Pagination")) == false) {
            if(p[0]) {
                p.doRender();
                p = G.$(p[0]);
            }
        }
        if(ObjectUtil.isExtends(p, "Pagination")) {
            p.onChange((current: number, size: number)=>{
                this.request(true);
            });
        }
        return p;
    }

    getInitialState(): state {
        let columns: any = this._parseColumns();        
        return {
            dataSource: this.props.dataSource,
            url: this.props.url,
            method: this.props.method||"get",
            pagination: this.props.pagination,
            checkedRowKeys: [],
            checkedRows: [],
            selections: this.props.selections,
            sorterInfo: null,
            loading: false,
            filteredInfo: null,
            checkType: this.props.checkType,
            isCheckedAll: false,
            filtered: {},
            filterVisible: {},
            scrollx: this.props.scrollx,
            scrolly: this.props.scrolly,
            otherParam: {},
            columns: columns,
            emptyText: this.props.emptyText || "",
            checkAll: this.props.checkAll,
            sequence: this.props.sequence,
            sequenceLabel: this.props.sequenceLabel,
            lazy: this.props.lazy,
            paginationId: this.props.paginationId ? this.props.paginationId.split(",") : [],
            formId: this.props.formId
        };
    }

    getProps() {
        //记录ctrl按键
        G.G$(document).keydown((event)=>{
            let eventInner = event || window.event;
            if(eventInner.keyCode == 17) {
                this.ctrl = true;
            }
        });
        G.G$(document).keyup((event)=>{
            let eventInner = event || window.event;
            if(eventInner.keyCode == 17) {
                this.ctrl = false;
            }
        });
        let scroll = {
            x: this.state.scrollx,
            y: this.state.scrolly
        };

        let containerProps: any = {
            onAfterRender:(robj: any)=>{
                this.doEvent("afterExpand",robj,this._expandRecord);
            }
        };

        return G.G$.extend({},props,{
            locale: {
                emptyText: this.state.emptyText,
            },
            dataSource: this.state.dataSource,
            columns: this.getColumnsFromState(),
            pagination: this.state.pagination,
            expandedRowRender: this.haveEvent("expandedrow")?(record: any)=>{
                this._expandRecord = record;
                if(this.expandedRowCached[record.key] == null){
                    let re = this.doEvent("expandedrow",record);
                    if(re && re.length > 0) {
                        let html = re[0];
                        let ele = <Content.default {...containerProps}>{G.$(html, true)}</Content.default>;
                        this.expandedRowCached[record.key] = ele;
                        return ele;
                    }
                    console.error("expandedrow的回调函数返回数据为空");
                    return <p>{"无数据"}</p>;
                }else {
                    return this.expandedRowCached[record.key];
                }
            }:null,
            scroll: scroll,
            loading: this.state.loading,
            rowSelection: this.state.checkType != null? {
                type: this.state.checkType,
                onChange: (checkedRowKeys: any, checkedRows: any) => {
                    let isCheckAll = false;
                    let data = this.getData()||[];
                    if(data.length == checkedRowKeys.length) {
                        isCheckAll = true;
                    }
                    this.setState({
                        checkedRowKeys,
                        checkedRows,
                        isCheckAll
                    },()=>{
                        this.doEvent("selectedChange",checkedRows);
                    });
                },
                onSelect:(record: any,selected: any,selectedRows: any) =>{
                    this.doEvent("select",record,selected,selectedRows);
                },
                onSelectAll: (selected: any, selectedRows: any, changeRows: any)=> {
                    this.doEvent("selectAll",selected, selectedRows, changeRows);
                },
                selectedRowKeys: this.state.checkedRowKeys,
                getCheckboxProps: (record: any) => ({
                    disabled: (record.disabled === 'true' || record.disabled === true), // Column configuration not to be checked
                }),
                selections: this.state.selections,
                hideDefaultSelections: this.state.checkAll,
            }:null,
            onChange: (pagination: any,filter: any,sorter: any)=>{
                let sorterInfo = this.state.sorterInfo||{};
                if(this.ctrl == false) {
                    sorterInfo = {};
                }
                let key = sorter.columnKey;
                if(key) {
                    sorterInfo[key] = sorter;
                }
                this.setState({
                    filteredInfo: filter,
                    sorterInfo: sorterInfo,
                    loading: true
                },()=>{
                    this.request(true);
                });
                this.doEvent("change",filter,sorter);
            },
            onRowClick: (record: any,index: any,event: any) => {
                this._onRowClick(record,index,event);
            },
            rowClassName:(record: any,index: any)=>{
                if(record.__className__) {
                    return "list-row-index" + record.key + " " + record.__className__;
                }
                return "list-row-index" + record.key;
            },
            onRowMouseEnter:(record: any,index: any,event: any) => {
                this._onMouseEnter(record,index,event);
            },
            onRowMouseLeave:(record: any,index: any,event: any) =>{
                this._onMouseLeave(record,index,event);
            },
            onExpand:(expanded: any,record: any)=>{
                this.doEvent("expand",expanded,record);
            },
            onExpandedRowsChange:(expandedRows: any)=>{
                this.doEvent("expandedRowsChange",expandedRows);
            }
        });
    }

    protected getColumnsFromState() {
        let columns: any = this.state.columns;
        let columnsNew = [];
        if(columns) {
            for(let i=0; i<columns.length;i++) {
                if(columns[i] && columns[i].display != "none") {
                    columnsNew.push(columns[i]);
                }
            }
        }
        return columnsNew;
    }

    protected _loadSuccess() {}

    protected _onMouseLeave(record: any,index: any,event: any) {}

    protected _onMouseEnter(record: any,index: any,event: any) {}

    protected _onRowClick(record: any,index: any,event: any) {
        let dataSource = this.getData()||[];
        for(let i = 0; i< dataSource.length;i++){
            let row = dataSource[i];
            if(row.key == record.key) {
                G.G$(".list-row-index" + row.key).addClass("list-row-selected");
            }else {
                G.G$(".list-row-index" + row.key).removeClass("list-row-selected");
            }
        }
        this.doEvent("rowClick",record,index,event);
    }

    //设置table滚动范围大小
    setScroll(option: any) {
        this.setState({
            scrollx:option.x,
            scrolly:option.y
        });
    }
    // 设置x轴长度
    setScrollx(x: any){
        this.setState({
            scrollx:x,
        });        
    }
    // 设置y轴长度
    setScrolly(y: any){
        this.setState({
            scrolly:y,
        });        
    }

    //设置多选框的下拉选择项
    setSelections(selections: any,callback?: Function) {
        this.setState({selections},()=>{
            if(callback) {
                callback();
            }
        });
    }

    checkable(checkable: any,callback?: Function) {
        this.setState({
            checkable
        },()=>{
            if(callback) {
                callback();
            }
        });
    }

    //处理数据
    /**
     * [{
     *  name: 'zhangsan',
     *  age: 12,
     *  address: '三里屯'
     * }]
     */
    protected _loadFilter(data:Data<any>) {
        let dataInner = data.dataList;
        let indexStart = this.getPageSize() * (this.getCurrent() - 1);
        indexStart = indexStart < 0 ? 0 : indexStart;
        for(let i = 0;i < dataInner.length;i++) {
            let item = dataInner[i];
            if(item.key == null) {
                item.key = UUID.get();
            }
            
            let sequence:any = this.state.sequence;
            item.sequence = sequence || (indexStart + i + 1);
        }
        return data;
    }

    //解析表头
    /**
     * 两种方式
     * 1：从json数据中直接解析
     * 2：从子节点中解析
     */
    protected _parseColumns(data?:Data<any>) {
        if(data && data.columns) {
            return data.columns;
        }
        let columns: Array<TableColumns> = [];
        if(this.state.sequence != false) {
            columns.push(G.G$.extend({
                key: UUID.get(),
                name: "sequence",
                width: 40,
                dataIndex: "sequence",
                title: this.state.sequenceLabel || "序号",
                className: "ant-table-sequence-column",
            }, this.getColumnProtype()));
        }
        
        let children = this.props.children;
        if(!(children instanceof Array)) {
            children = [children];
        }
        if(children instanceof Array) {
            children.map((child:any, index)=>{
                let props = child.props;
                let column = this._parseColumn(index,props);
                if(this.state.sequence != false && (column.fixed == "left" || column.fixed == "right")) {
                    columns[0].fixed = "left";
                    this.isFixed = true;
                }
                columns.push(column);
            });
        }
        return columns;
    }

    /** 
     * 获取column原型
    */
    protected getColumnProtype() {
        let __this = this;
        let columnT = {
            show: function() {
                this.display = "block";
                __this.updateColumns();
            },
            hide: function() {
                this.display = "none";
                __this.updateColumns();
            },
            setTitle: function(title: any) {
                this.title = title;
                __this.updateColumns();
            },
            setWidth: function(width: any) {
                this.width = width;
                __this.updateColumns();
            },
            addClass: function(clazz: any) {
                let className:string = this.className;
                if(className == null) {
                    this.className = clazz;
                }else if((className.indexOf(" ") == -1 && className.indexOf(clazz) == -1) || (className.indexOf(" ") != -1 && className.indexOf(" " + clazz) == -1)){
                    this.className += " " + clazz;
                }
                __this.updateColumns();
            }

        };
        return columnT;
    }

    /**
     * 更新column
     */
    protected updateColumns() {
        let columns = this.state.columns;
        this.setState({
            columns
        });
    }

    //转换列
    protected _parseColumn(index: any,props: typeof ColumnPropsPlus): TableColumns {
        
        let name = props.name || "";
        let dataIndex = props.dataIndex || "";
        let title = props.label || props.title || "";
        
        let width = props.width || 0;
        let fixed = props.fixed;
        let className = props.class;
        let rowspan = props.rowspan;
        let classNameArr = GearArray.fromString(className," ")||new GearArray();
        let ellipsis = props.ellipsis;
        let ellipsisSpanWidth = 0;
        if(ellipsis){
            classNameArr.add("ant-table-ellipsis-column");
            ellipsisSpanWidth = width;
        }        
        if(this.state.sequence != false) {
            index = index+1;
        }
        if(this.state.checkType != null) {
            index = index+1;
        }
        if(this.haveEvent("expandedRow")) {
            index = index+1;
        }
        let column: TableColumns = G.G$.extend({
            key: name,
            name: name,
            dataIndex: dataIndex,
            title: title,
            index: index,
            rowspan: rowspan,
            ref: name,
        }, this.getColumnProtype());
        if(fixed != null) {
            column.fixed = fixed;
        }
        if(width > 0) {
            column.width = width;
        }
        if(ellipsisSpanWidth > 0) {
            column.ellipsisSpanWidth = ellipsisSpanWidth;
        }
        //获取排序信息
        let orderColumn:any = props.orderColumn;
        if(classNameArr.length() > 0) {
            if(orderColumn != null && orderColumn != "") {
                classNameArr.add(orderColumn);
            }
            column.className = classNameArr.toString(" ");
        }
        if(orderColumn != null && orderColumn != "") {
            column.orderColumn = orderColumn;
            //打开该字段的排序
            column.sorter = (a: any,b: any) => {};
            //禁用排序图标的自动控制，使用自定义控制setSortClass方法
            column.sortOrder = false;
        }
        let filter:any = props.filter;
        let filterId:any = props.filterId;
        let filterType:any = props.filterType;
        if(filterId && filter && filterType) {
            column.filterDropdown = this.getFilter(props);
            column.filterDropdownVisible = this.state.filterVisible[filterId];
            column.onFilterDropdownVisibleChange = (visible: any) => {
                let filterVisible = this.state.filterVisible||{};
                filterVisible[filterId] = visible;
                this.setState({
                    filterVisible: filterVisible
                },()=>{
                    if(visible == true) {
                        this.searchNodes[filterId].focus();
                    }else {
                        this._search();
                    }
                });
            };
            column.filterIcon = <Icon type="filter" style={{ color: this.state.filtered[filterId] ? '#108ee9' : '#aaa' }} />;
        }
        let childrenInProps = props.children;
        if(childrenInProps) {
            if(!(childrenInProps instanceof Array)) {
                childrenInProps = [childrenInProps];
            }
            column.render = this.parseRender(props, ellipsisSpanWidth);
            if(childrenInProps instanceof Array) {
                let childrenJsx: any[] = [];
                childrenInProps.map((child:any, index: any)=>{
                    if(ObjectUtil.isExtends(child.type, "Column")) {
                        let columnInnder = this._parseColumn(index,child.props);
                        childrenJsx.push(columnInnder);
                    }
                });
                column.children = childrenJsx;
            }
        }
        return column;
    }

    //过滤器查询事件
    protected _search() {
        let filter = {};
        let searchNodes = this.searchNodes;
        let filterVisible = this.state.filterVisible;
        let filtered = {};
        for(let filterId in searchNodes) {
            let node = searchNodes[filterId];
            let value = null;
            if(ObjectUtil.isExtends(node, "Date")) {
                value = node.getFormatValue();
            }else {
                value = node.getValue();
            }
            let valueRe = null;
            if(value instanceof Array) {
                valueRe = [];
                for(let i = 0; i< value.length;i++) {
                    let item = value[i];
                    if(item.value) {
                        valueRe.push(item.value);
                    }else {
                        valueRe.push(item);
                    }
                }
            }else {
                if(value.value) {
                    valueRe = value.value;
                }else {
                    valueRe = value;
                }
            }
            filter[filterId] = valueRe;
            filterVisible[filterId] = false;
            if(valueRe instanceof Array && valueRe.length > 0) {
                filtered[filterId] = true;
            }else {
                if(valueRe && valueRe != "") {
                    filtered[filterId] = true;
                }else {
                    filtered[filterId] = false;
                }
            }
        }
        this.setState({
            filteredInfo: filter,
            filterVisible,
            filtered,
            loading: true
        },()=>{
            this.request(true);
        });
    }

    // 文本过滤器
    protected getFilter(props: any) {
        let filterId:any = props.filterId;
        let filterProps: any = {
            getCalendarContainer: ()=> {
                return G.G$("#" + this.filterContainerId)[0];
            }
        };
        let filterJsx: any;
        let filterType:any = props.filterType;
        if(filterType == "text") {
            let textProps: any = {
                prompt: "请输入查询条件...",
                buttonIcon: "search",
                width: 200,
                onClickButton: this._search.bind(this)
            };
            filterJsx = <Text.default ref={ele => this.searchNodes[filterId] = ele} {...textProps}/>;
        }else {
            let elseProps: any;
            if(filterType == "date" || filterType == "datetime") {
                elseProps = {
                    ...filterProps,
                    type: "range",
                }
            }else {
                let filterMutiple:any = props.filterMutiple;
                let filters:any = props.filters;
                let filtersUrl:any = props.filtersUrl;
                let filtersMethod:any = props.filtersMethod;
                elseProps = {
                    ...filterProps,
                    multiple: filterMutiple,
                    treeCheckable: filterMutiple == true? true:false,
                    cascadeCheck: false,
                    dictype: filters,
                    url: filtersUrl,
                    method: filtersMethod,
                    width: 300,
                }
            }
            filterJsx = [];
            if(filterType == "date") {
                filterJsx.push(<Date.default ref={ele => this.searchNodes[name] = ele} {...elseProps}/>);
            }else if(filterType == "datetime") {
                filterJsx.push(<Datetime.default ref={ele => this.searchNodes[name] = ele} {...elseProps}/>);
            }else {
                filterJsx.push(<Combotree.default ref={ele => this.searchNodes[name] = ele} {...elseProps}/>);
            }
            filterJsx.push(<Button type="primary" onClick={this._search.bind(this)}>查询</Button>);
        }
        return <div className="list-custom-filter-dropdown">
            {filterJsx}
      </div>;
    }

    //获取当前排序信息
    getFilteredInfo() {
        return this.state.filteredInfo;
    }

    //在ctype=column中存在内部节点的渲染处理
    protected parseRender(props: typeof ColumnPropsPlus, ellipsisSpanWidth?: number) {
        let children = props.children;
        let render = null;
        ((children, ellipsisSpanWidth)=>{
            render = (text: any,record: any,indexColumn: any) => {
                let jsxEles: any[] = [];
                if(!(children instanceof Array)) {
                    children = [children];
                }
                if(children instanceof Array) {
                    children.map((child:any, index: any)=>{
                        jsxEles.push(this.parseColumnChild(child, ellipsisSpanWidth, record, indexColumn, index));
                    });
                }else {
                    jsxEles.push(this.parseColumnChild(children, ellipsisSpanWidth, record, indexColumn, 0));
                }
                return jsxEles;
            };
        })(children, ellipsisSpanWidth || 0);
        return render;
    }

    //解析column的子节点
    private parseColumnChild(child: any, ellipsisSpanWidth: any, record: any, indexColumn: any, index: any) {
        if(!(ObjectUtil.isExtends(child.type, "Column"))) {
            let childProps = child.props;
            childProps = this.parseRegexColumnValue(childProps,record);
            let style = childProps.style instanceof String ? GearJson.fromStyle(childProps.style || "") : new GearJson(childProps.style);
            if(ellipsisSpanWidth > 0) {
                style.put("width", ellipsisSpanWidth+"");
            }
            childProps.style = style.toJson();
            childProps.id = record.key + indexColumn + index;
            childProps.__record__ = record;
            childProps.key =record.key + indexColumn + index;
            let jsxEle = React.cloneElement(child, childProps, childProps.children);
            return jsxEle;
        }
        return null;
    }

    protected parseRegexColumnValue(props: any,record: any) {
        let newProps: any = ObjectUtil.parseDynamicProps(props, record);
        return newProps;
    }

    render() {
        let props: any = this.getProps();
        return <AntdTable {...props}></AntdTable>;
    }

    afterRender() {
        this.getPaginations();
        this.getForm();
        //加载数据
        if(this.state.lazy != true) {
            this.request();
        }
        let className: any = this.state.className || "";
        let classNameArr = GearArray.fromString(className," ")||new GearArray();
        classNameArr.add(this.getDefaultClassName());
        this.addClass(classNameArr.toString(" "));
        this.setEllipsisSpanWidth();
    }
    // 得到默认的样式名称
    protected getDefaultClassName() {
        return "ant-table-ajaxlist";
    }

    afterUpdate() {
        if(this.formEle && this.formEle.state.action != this.state.url) {
            this.formEle.setForm({action: this.state.url});
        }
        this.setSortClass();
        this.hideCheckAllBtn();
        // this.setCheckAllBtn();
        this.setEllipsisSpanWidth();
    }

    protected setEllipsisSpanWidth() {
        let tbody = this.find(".ant-table-body").find(".ant-table-tbody");
        let td = tbody.find(".ant-table-ellipsis-column");
        if(td.length > 0) {
            td.each((i, ele)=>{
                let index = G.G$(ele).index();
                if(index != -1) {
                    let colgroup = this.find(".ant-table-body").find("colgroup");
                    let cols = colgroup.find("col");
                    let col = cols.eq(index);
                    let width = col.css("width");
                    let span = G.G$(ele).find("span");
                    
                    span.eq(0).css("width", width);
                }
            });
            
        }
        
        
    }

    //隐藏全选按钮
    protected hideCheckAllBtn() {
        if(this.state.checkAll == false) {
            this.find(".ant-table-thead").find(".ant-table-selection-column").children().hide();
        }
    }

    protected setCheckAllBtn() {
        let checkedKeys = this.getCheckedRowKeys();
        let data = this.getData();
        let haveNowPageKeys = false;
        let haveAll = true;
        if(data instanceof Array && checkedKeys instanceof Array) {
            let checkedKeysArray = new GearArray(checkedKeys);
            for(let i = 0; i < data.length; i++) {
                let key = data[i].key;
                let c = checkedKeysArray.contains(key);
                if(c == true) {
                    haveNowPageKeys = true;
                }else {
                    haveAll = false;
                }
            }
        }
        if(haveNowPageKeys == true) {
            if(haveAll == true) {
                this.find(".ant-table-thead").find(".ant-table-selection-column").find(".ant-checkbox").removeClass("ant-checkbox-indeterminate").addClass("ant-checkbox-checked");
            }else {
                this.find(".ant-table-thead").find(".ant-table-selection-column").find(".ant-checkbox").removeClass("ant-checkbox-checked").addClass("ant-checkbox-indeterminate");
            }
        }else {
            this.find(".ant-table-thead").find(".ant-table-selection-column").find(".ant-checkbox").removeClass("ant-checkbox-indeterminate").removeClass("ant-checkbox-checked");
        }
        
    }

    //设置排序的图标样式
    setSortClass() {
        let sorterInfo = this.state.sorterInfo;
        this.find(".ant-table-column-sorter-up").removeClass("on");
        this.find(".ant-table-column-sorter-up").addClass("off");
        this.find(".ant-table-column-sorter-down").removeClass("on");
        this.find(".ant-table-column-sorter-down").addClass("off");
        this.find(".ant-table-thead").find(".ant-table-column-sort").removeClass("ant-table-column-sort");
        if(sorterInfo) {
            for(let key in sorterInfo) {
                let info  = sorterInfo[key];
                let className:string = info.column.className;
                if(className != null) {
                    className = className.trim();
                }
                let th:JQuery<HTMLElement> = this.find(".ant-table-thead").find("tr").find("th." + className);
                th.addClass("ant-table-column-sort");
                if(info.order == "descend") {
                    th.find(".ant-table-column-sorter-up").removeClass("on");
                    th.find(".ant-table-column-sorter-up").addClass("off");
                    th.find(".ant-table-column-sorter-down").removeClass("off");
                    th.find(".ant-table-column-sorter-down").addClass("on");
                }else {
                    th.find(".ant-table-column-sorter-up").removeClass("off");
                    th.find(".ant-table-column-sorter-up").addClass("on");
                    th.find(".ant-table-column-sorter-down").removeClass("on");
                    th.find(".ant-table-column-sorter-down").addClass("off");
                }
            }
        }
    }

    //通过指定url加载数据
    loadUrl(url: any) {
        this.setState({url},()=>{
            this.request();
        });
    }

    // 使用最后一次的查询条件来刷新表格数据，如果之前没有查询过则触发一次查询
    refresh() {
        this.setState({
            loading: true
        },()=>{
            this.clearSelected(()=>{
                this.submitXhrRefresh();
            });
        });
        
    }

    request(tableSubmit?: boolean) {
        let canQuery = true;
        if(this.formEle != null) {
            let result = this.formEle.validate();
            if(result == false) {
                canQuery = false;
            }
        }
        if(canQuery) {
            this.setState({
                loading: true
            },()=>{
                if(tableSubmit == true) {
                    this.clearSelected(()=>{
                        this.submitXhr(tableSubmit);
                    });
                }else {
                    this.clearAll(()=>{
                        this.submitXhr(tableSubmit);
                    });
                }
            });
        }
    }

    loadData(data:Data<any>) {
        if(data){
            if(typeof data == "string"){
                this.loadUrl(data);
            }else if(data instanceof Object) {  
                if(!data.dataList){
                    if(data instanceof Array)
                        data = {dataList: data};
                    else
                        data = {dataList: []};
                }
                data = this._loadFilter(data);
                this.setState({
                    dataSource: data.dataList,
                    columns: data.columns||this.state.columns
                });
                this.setPagination(data);
            }
        }
    }

    //设置分页器的属性
    protected setPagination(data:Data<any>) {
        let total = data.total || 0;
        let current = data.currentPage;
        let pageSize = data.pageSize;

        let paginations = this.paginations;
        if(paginations.length > 0) {
            for(let i = 0; i < paginations.length; i++) {
                let p = paginations[i];
                if(data.currentPage!=null && data.pageSize!=null){
                    p.show();
                    p.setParam({
                        total,
                        current,
                        pageSize
                    });
                }else{
                    p.hide();
                }
            }
        }
    }

    /**
     * 获取列
     * @param indexOrKey 下标或key
     */
    getColumn(indexOrKey: number|string) {
        let columns = this.state.columns;
        if(columns) {
            if(typeof indexOrKey == "number") {
                return columns[indexOrKey];
            }else {
                for(let i = 0; i < columns.length; i++) {
                    if(columns[i].key == indexOrKey) {
                        return columns[i];
                    }
                }
            }
        }
        return null;
    }

    getRow(key: any) {
        let dataSource = this.state.dataSource;
        if(dataSource instanceof Array && dataSource.length > 0) {
            for(let i = 0; i < dataSource.length;i++) {
                if(dataSource[i].key == key) {
                    return dataSource[i];
                }
            }
        }
        return null;
    }

    //是否支持行选择
    isRowSelection(){
        if(this.state.checkType == null)
            return false;
        else
            return true;
    }

    //行选择方式
    getRowSelectionType(){
        return this.state.checkType;
    }

    //获取选中的列
    getCheckedRows() {
        return this.state.checkedRows;
    }

    //获取选中的列的key
    getCheckedRowKeys() {
        return this.state.checkedRowKeys;
    }

    getData():Array<any>|undefined {
        return this.state.dataSource;
    }

    getDataJsonString():string {
        let data = this.getData();
        if(data){
            return JSON.stringify(data);
        }else{
            return "";
        }
    }

    getColumns() {
        return this._parseColumns();
    }

    submitXhrRefresh(){
        let method: any = this.state.method || "get";
        let url = this.state.url;
        if(url && method) {
            let ret:any = this.doJudgementEvent("beforeLoad",url,this.getLastQueryParam());
            if(ret!=false){
                let fun = async () => {
                    let result = await Http.ajax(method, url, this.getLastQueryParam());
                    let data = result.data;
                    if(result.success) {
                        this.doEvent("afterLoad","success",data);
                        this.success(data);
                    }else {
                        this.doEvent("afterLoad","fail",data);
                        this.doEvent("loadFailed",data);
                    }
                };
                fun();
            }
        }else {
            this.setState({
                loading: false
            });
        }
    }

    //执行ajax提交
	submitXhr(tableSubmit?:boolean){
        let method: any = this.state.method || "get";
        let url = this.state.url;
        if(url) {
            let ret:any = this.doJudgementEvent("beforeLoad",url,this.getQueryParam(tableSubmit));
            if(ret!=false){
                let fun = async () => {
                    let result = await Http.ajax(method, url, this.getQueryParam(tableSubmit));
                    let data = result.data;
                    if(result.success) {
                        this.lastQueryParam = this.getQueryParam(tableSubmit);
                        this.doEvent("afterLoad","success",data);
                        this.success(data);
                    }else {
                        this.doEvent("afterLoad","fail",data);
                        this.doEvent("loadFailed",data);
                    }
                };
                fun();
            }
        }else {
            this.setState({
                loading: false
            });
        }
    }

    protected success(datainner: any) {
        if(typeof datainner == "string") {
            try{
                datainner = eval("(" + datainner + ")");
            }catch(e) {
                this.doEvent("loadFailed",e);
                console.error("Error:");
                console.error(e);
                return false;
            }
        }
        if(datainner){
            if(datainner.status!=null && datainner.status==0 && datainner.data) {
                datainner = datainner.data;
            }
            if(!datainner.dataList) {
                if(datainner instanceof Array)
                    datainner = {dataList: datainner};
                else
                    datainner = {dataList: []};
            }
        }else{
            datainner = {dataList: []};
        }
        // 设置分页对象
        this.setPagination(datainner);
        datainner = this._loadFilter(datainner);
        this.setState({
            loading: false,
            dataSource: datainner.dataList,
            columns: datainner.columns||this.state.columns
        },()=>{
            this.doEvent("loadSuccess");
            this._loadSuccess();
        });
        return true;
    }

    // 重载了React的setState方法，做一些拦载处理
    setState(props: any,callback?:()=>any):void{
        super.setState(props,()=>{
            if(callback)
                callback.call(this);
            this._doAutoRowspan();
        });
    } 

    //数据加载完成之后执行的操作
    protected _doAutoRowspan() {
        try{
            let columns = this._parseColumns();
            for(let i=0;i<columns.length;i++){
                let column = columns[i];
                if(column && column.rowspan=="auto"){
                    this.find(".ant-table-body,.ant-table-body-outer").each(function(){
                        let preData: any = null;
                        let preJdom: any = null;
                        let array = G.G$(this).find("table tbody tr").toArray().reverse();
                        G.G$(array).each(function(){
                            let trJdom = G.G$(this);
                            G.G$(this).find("td:eq("+column.index+")").each(function(){
                                let jdom = G.G$(this);
                                let data = (trJdom.data("_text")||"")+"-"+jdom.text();
                                if(preData!=null && preData==data && preJdom){
                                    let rowspan = preJdom.attr("_rowspan") || "1";
                                    preJdom.attr("_delete","Y");
                                    jdom.attr("_rowspan",parseInt(rowspan)+1);
                                }
                                preJdom = jdom;
                                preData = data;
                                trJdom.data("_text",data);
                            });
                        });
                    });
                }
            }
            this.find("td[_delete=Y]").hide();
            this.find("td[_rowspan]").each(function(){
                let jdom = G.G$(this);
                let __rowspan: any = jdom.attr("_rowspan");
                jdom.attr("rowspan", __rowspan);
            });        
        }catch(err){
            console.error(err);
        }
    }


}