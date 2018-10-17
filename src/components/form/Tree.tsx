import * as FormTag from './FormTag';
import * as React from 'react';
import { Tree as AntdTree } from 'antd';
//AntTreeNodeEvent,AntTreeNode,AntTreeNodeMouseEvent
import { TreeProps as AntdTreeProps, AntTreeNode } from 'antd/lib/tree';
import { Http, UUID } from '../../utils';
import { methods } from '../../utils/http';
import DicUtil from '../../utils/DicUtil';
const AntdTreeNodeJsx = AntdTree.TreeNode;
export var props = {
    ...FormTag.props,
    expandedKeys: GearType.Or(GearType.String, GearType.Array),
    cascadeCheck: GearType.Boolean,
    onlyLeafCheck: GearType.Boolean,
    lines: GearType.Boolean,
    showIcon: GearType.Boolean,
    multiple: GearType.Boolean,
    autoExpandParent: GearType.Boolean,
    checkbox: GearType.Boolean,
    dragable: GearType.Boolean,
    url: GearType.Or(GearType.String, GearType.Function),
    dictype: GearType.Or(GearType.Object, GearType.Function, GearType.String),
    method: GearType.Enum<methods>(),
    link: GearType.String,
    target: GearType.String,
    lower: GearType.String,
    upper: GearType.String,
    value: GearType.Or(GearType.Array, GearType.Function, GearType.String),
    selected: GearType.Or(GearType.Array, GearType.Function, GearType.String),
    defaultExpandLevel: GearType.Number,
};
export interface state extends FormTag.state {
    options: Array<TreeNode>,
    /** （受控）展开指定的树节点 */
    expandedKeys?: string | Array<string>,
    /** 是否支持级联 */
    cascadeCheck?: boolean,
    /** 是否只有叶子节点可选 */
    onlyLeafCheck?: boolean,
    /** 是否显示线 */
    showLine?: boolean,
    /** 是否显示图标 */
    showIcon?: boolean,
    /** 是否支持多选 */
    multiple?: boolean,
    /** 是否自动展开父节点 */
    autoExpandParent?: boolean,
    /** checkable状态下节点选择完全受控（父子节点选中状态不再关联）*/
    checkStrictly?: boolean,
    /** 是否支持选中 */
    checkable?: boolean,
    /** （受控）选中复选框的树节点 */
    checkedKeys?: Array<any>,
    /** 默认选中复选框的树节点 */
    defaultCheckedKeys?: Array<any>,
    /** （受控）设置选中的树节点 */
    selected?: any,
    /** 默认选中的树节点 */
    defaultSelectedKeys?: Array<any>,
    dragable?: boolean,
    dictype?: object | string | Function;
    url?: string | Function;
    method: methods;
    link?: string;
    target?: string;
    lower?: string;
    upper?: string;
    defaultExpandLevel?: number
}
export interface TreeNode {
    id:string;
    value:string;
    text:string;
    className:string;
    checked:boolean;
    state:"open"|"closed";
    attributes: any;
    properties: any;
    // 下级
    children:Array<TreeNode>;
    disabled:boolean;
    disableCheckbox:boolean;
    check:Function;
    unCheck:Function;
    // 上级
    parent: Function;
    // 前一个
    previous:Function;
    // 下一个
    next:Function;
    // 同级
    brothers:Function;
    // 上级
    getParent: Function;
    selected:boolean;
    select:Function;
    unSelect:Function;
    isLeaf:boolean;
    collapse:Function;
    expand:Function;
    label: string;
}
export default class Tree<P extends (typeof props) & AntdTreeProps, S extends state & AntdTreeProps> extends FormTag.default<P, S> {

    //所有的节点
    protected nodes: GearJson<TreeNode> = new GearJson<TreeNode>();

    //父级树
    parentTree: Tree<P, S>;
    //子级树
    childTree: Tree<P, S>;

    getInitialState():state & AntdTreeProps {
        return {
            options: [],
            expandedKeys: this.props.expandedKeys,
            defaultExpandedKeys: this.props.expandedKeys,
            cascadeCheck: this.props.cascadeCheck,
            selected: this.props.selected,
            defaultSelectedKeys: [],
            onlyLeafCheck: this.props.onlyLeafCheck,
            showLine: this.props.lines == true,
            showIcon: this.props.showIcon,
            multiple: this.props.multiple,
            autoExpandParent: this.props.autoExpandParent != false,
            /** checkable状态下节点选择完全受控（父子节点选中状态不再关联）*/
            checkStrictly: this.props.onlyLeafCheck ? true : (this.props.cascadeCheck != undefined ? !this.props.cascadeCheck : false),
            checkable: this.props.checkbox,
            dragable: this.props.dragable == true,
            method: this.props.method || "get",
            link: this.props.link,
            target: this.props.target,
            lower: this.props.lower,
            upper: this.props.upper,
            defaultExpandLevel: this.props.defaultExpandLevel,
            defaultExpandAll: this.props.defaultExpandAll,
            dictype: this.props.dictype,
            url: this.props.url
        };
    }

    //获取jsx格式的node节点
    getTreeNode(optionsParam?:Array<TreeNode>,parent?:TreeNode): Array<AntTreeNode> {
        let __this = this;
        let treeNodes: Array<any> = [];
        let options: Array<TreeNode> = optionsParam || this.state.options || [];
        options.map((ele,index) => {
            this.nodes.put(ele.id,ele);
            // 为ele对象的checked属性增加取值过程，以便在获取属性时可以按照我们的思路进行
            ele = G.G$.extend(ele,{
                // 设置选中状态
                set checked(val:boolean){
                    ele.checked = val;
                },
                // 得到当前节点的选中状态
                get checked(){
                    let value: any = __this.state.value;
                    return new GearArray(value).contains(ele.id);
                },
                // 得到当前节点的展开状态
                get state(){
                    let expandedKeys = __this.state.expandedKeys;
                    return new GearArray(expandedKeys).contains(ele.id) ? "open" : "closed";                    
                }
            });
            // 父节点
            ele.parent = () => {
                return parent;
            };
            // 上一个节点
            ele.previous = () => {
                let brothers = ele.brothers();
                if(brothers){
                    for(let i=0;i<brothers.length;i++){
                        if(ele === brothers[i]){
                            if(i>0)
                                return brothers[i-1];
                        }
                    }
                }
                return null;
            };  
            // 下一个节点
            ele.next = () => {
                let brothers = ele.brothers();
                if(brothers){
                    for(let i=0;i<brothers.length;i++){
                        if(ele === brothers[i]){
                            if(i<brothers.length-1)
                                return brothers[i+1];
                        }
                    }
                }
                return null;
            };   
            // 同级节点
            ele.brothers = () => {
                if(parent){
                    return parent.children;
                }else{
                    return this.state.options;
                }
            };                 
            ele.getParent = () => {
                return parent;
            };
            ele.check = (callback?:Function) => {
                let keyValue:Array<any> = this.getCheckedKeys() || this.state.value;
                if((keyValue instanceof Array) == false) {
                    keyValue = [];
                }else {
                    keyValue = new GearArray(keyValue).clone().toArray();
                }
                if(new GearArray(keyValue).contains(ele.id) == false) {
                    keyValue.push(ele.id);
                }

                // ---------------------------------------------------------------------------------------------
                // modify by hechao 2018.3.2
                // 因为在同一个树上，可能有多个节点的值相同，因此在选中一个节点，同样要选中与其值相同的其它节点                    
                
                // 本次操作新添加的值
                let addValues = [];
                if(ele.value){
                    // 非级连情况，添加的值只有选中节点的值
                    addValues.push(ele.value);
                }
                if(this.state.cascadeCheck) {
                    // 选中下级所有子节点
                    this._checkAll(keyValue,ele.children,addValues);
                }

                // 如果节点有值，在选中时，如果有其它同值的节点，也应一同选中
                // 对所有节点进行遍历，如果有节点的值在本次添加的值中，也应添加到选中节点列表中
                let gAddValues = new GearArray(addValues);
                let gArray = new GearArray(keyValue);
                this.nodes.forEach((key,node)=>{
                    if(node.value && gAddValues.contains(node.value)){
                        if(!gArray.contains(node.id)) {
                            gArray.add(node.id);
                        }
                    }
                });
                // ---------------------------------------------------------------------------------------------
                this.setState({
                    value: keyValue
                },()=>{
                    if(callback)
                        callback.call(this,true);
                });            
            };

            ele.unCheck = (callback?:Function) => {
                let keyValue:Array<any> = this.getCheckedKeys()||this.state.value;

                // 当节点取消选中时，移除自已经包括所有上级的选中
                let removeParentChecked = (id: any,keys: any)=>{
                    let gvalue = new GearArray(keys);
                    if(gvalue.contains(id)) {
                        gvalue.remove(id);
                        if(this.state.cascadeCheck) {
                            // 取消所有上级的选中
                            let pele = this.getNode(id);
                            while(pele && pele.parent()){
                                gvalue.remove(pele.parent().id);
                                pele = pele.parent();
                            }
                        }
                    } 
                }
                if(keyValue instanceof Array) {
                    removeParentChecked(ele.id,keyValue);
                }else {
                    keyValue = [];
                }                         
                
                // ---------------------------------------------------------------------------------------------
                // modify by hechao 2018.3.2
                // 因为在同一个树上，可能有多个节点的值相同，因此在取消选中一个节点，同样要取消选中与其值相同的其它节点                    
                
                // 本次操作移除的值
                let removedValues = [];
                if(ele.value){
                    removedValues.push(ele.value);
                }
                if(this.state.cascadeCheck) {
                    // 取消所有下级的选中
                    this._unCheckAll(keyValue,ele.children,removedValues);
                }
                // 如果节点有值，在取消选中时，如果有其它同值的节点，也应一同取消选中
                // 对所有节点进行遍历，如果有节点的值在本次移除的值中，也应从选中节点列表中移除
                let gRemovedValues = new GearArray(removedValues);
                this.nodes.forEach((key,node)=>{
                    if(node.value && gRemovedValues.contains(node.value)){
                        removeParentChecked(node.id,keyValue);
                    }
                });
                // ---------------------------------------------------------------------------------------------
                this.setState({
                    value: keyValue
                },()=>{
                    if(callback)
                        callback.call(this,false);
                });                
            };

            ele.select = () => {
                let select:Array<any>;
                if(this.state.multiple==true) {
                    select = this.state.selected || [];
                }else{
                    select = [];
                }
                select.push(ele.id);
                this.setState({
                    selected: select
                });
                ele.selected = true;
                this._triggerOnSelect(ele);
            };

            ele.unSelect = () => {
                let selected:Array<any>;
                if(this.state.multiple==true) {
                    selected = this.state.selected || [];
                    let valueArr = new GearArray(selected);
                    if(valueArr.contains(ele.id)) {
                        valueArr.remove(ele.id);
                        selected = valueArr.toArray();
                    }  
                }else{
                    selected = [];
                }                              
                this.setState({
                    selected: selected
                });
                ele.selected = false;
            };

            ele.expand = () => {
                let expandedkeys:Array<any> = new GearArray(this.state.expandedKeys ||[]).clone().toArray();
                if((expandedkeys instanceof Array) == false) {
                    expandedkeys = [];
                }
                if(new GearArray(expandedkeys).contains(ele.id) == false) {
                    expandedkeys.push(ele.id);
                }
                this.setState({
                   expandedKeys: expandedkeys
                });
            };

            ele.collapse = () => {
                this.doEvent("beforeCollapse");
                let expandedkeys:Array<any> = new GearArray(this.state.expandedKeys ||[]).clone().toArray();
                if(expandedkeys instanceof Array) {
                    this._collaseAll(expandedkeys,ele);
                    this.setState({
                        expandedKeys: expandedkeys
                    });
                }else {
                    expandedkeys = [];
                }
                this.doEvent("collapse",ele);
            };
            // 为了让后台可以控制是否叶子节点，这里将“ele.children.length == 0”这个判断去除
            if(ele.children == null) {
                ele.isLeaf = true;
            }else {
                ele.isLeaf = false;
            }

            let disabled = ele.disabled;
            let disableCheckbox = ele.disableCheckbox;
            let children = ele.children;
            let childrenMap;
            if(children && children instanceof Array) {
                childrenMap = this.getTreeNode(children,ele);
            }
            if(this.state.onlyLeafCheck == true && !ele.isLeaf) {
                disableCheckbox = true;
            }
            if(ele.isLeaf){
                // 如果是叶子节点，去除子集合
                childrenMap = null;
            }
            let nodeProps: any = {
                nodeEle: ele,
                className: ele.className,
                disabled: (this.state.disabled==true)?this.state.disabled:disabled,
                disableCheckbox: disableCheckbox,
                title: ele.text,
                value: ele.value,
                text: ele.text
            };
            let node = <AntdTreeNodeJsx key={ele.id} {...nodeProps}>{childrenMap}</AntdTreeNodeJsx>;
            treeNodes.push(node);
        });
        return treeNodes;
    }

    // 获取渲染属性
    getProps(): any {
        return G.G$.extend({},this.state,{
            checkedKeys: this.state.value,
            defaultCheckedKeys: this.state.value,
            selectedKeys: this.state.selected,
            defaultSelectedKeys: this.state.value,
            /** （受控）设置选中的树节点 */
            disabled:this.state.disabled || this.state.readOnly, 
            /** 展开/收起节点时触发 */
            onExpand: (expandedKeys: Array<string>, info: {
                node: any;
                expanded: boolean;
            }) => {
                let node = info.node.props.nodeEle;
                this.doEvent("beforeExpand", node, expandedKeys);
                this._onBeforeExpand(node);
                Tree.onBeforeExpand.call(expandedKeys,info);
                
                if(info.expanded == true) {
                    this.expand(node.id);
                }else {
                    this.collapse(node.id);
                }
                this._onExpand(node);
                this.doEvent("expand", node, expandedKeys);
                Tree.onExpand.call(expandedKeys,info);
            },
            /** 点击复选框触发 */
            onCheck: (checkedKeys: Array<string>, e: any) => {
                let node = e.node.props.nodeEle;
                let eventRe = this.doEvent("beforeSelect");
                if(eventRe instanceof Array && eventRe[0] == false) {
                    return;
                }
                let re = this._onBeforeSelect(node);
                if(re == false) {
                    return;
                }

                let oldValue = this.getValue();
                var callback = ()=>{
                    this._change(this.getValue(),oldValue);
                    this._onCheck(node);
                    Tree.onCheck.call(this,node);
                    this.doEvent("check",node,e.checked);
                };
                if(e.checked == true) {
                    this.check(node.id,callback);
                }else {
                    this.unCheck(node.id,callback);
                }
            },
            /** 点击树节点触发 */
            onSelect: (selected: Array<string>, e: any) => {
                let node = e.node.props.nodeEle;
                this._triggerOnSelect(node,e);            
            },
            /** filter some AntTreeNodes as you need. it should return true */
            filterAntTreeNode: (node: AntTreeNode) => {
                return true;
            },
            /** 异步加载数据 */
            loadData: this.props.loadData?this.props.loadData.bind(this):null,
            /** 响应右键点击 */
            onRightClick: (options: any) => {
                let node = options.node.props.nodeEle;
                this._onRightClick(node);
                this.doEvent("rightClick",node);
                Tree.onRightClick.call(this,node);
            },
            /** 设置节点可拖拽（IE>8）*/
            draggable: this.state.dragable,
            /** 开始拖拽时调用 */
            onDragStart: (options: any) => {
                this._onStartDrag(options);
                Tree.onStartDrag.call(this, options);
                let node: any = options.node;
                let dragNode: any = options.dragNode;
                let dragNodeData = this.getNode(dragNode ? dragNode.props.nodeEle.id : "");
                let nodeData = this.getNode(node ? node.props.nodeEle.id : "");
                this.doEvent("startDrag", dragNodeData, nodeData);
            },
            /** dragenter 触发时调用 */
            onDragEnter: (options: any) => {
                this._onDragEnter(options);
                Tree.onDragEnter.call(this,options);
                let node:any = options.node;
                let dragNode:any = options.dragNode;
                let dragNodeData = this.getNode(dragNode?dragNode.props.nodeEle.id:"");
                let nodeData = this.getNode(node?node.props.nodeEle.id:"");
                this.doEvent("dragEnter",dragNodeData,nodeData);
            },
            /** dragover 触发时调用 */
            onDragOver: (options: any) => {
                this._onDragOver(options);
                Tree.onDragOver.call(this,options);
                let node:any = options.node;
                let dragNode:any = options.dragNode;
                let dragNodeData = this.getNode(dragNode?dragNode.props.nodeEle.id:"");
                let nodeData = this.getNode(node?node.props.nodeEle.id:"");
                this.doEvent("dragOver",dragNodeData,nodeData);
            },
            /** dragleave 触发时调用 */
            onDragLeave: (options: any) => {
                this._onDragLeave(options);
                Tree.onDragLeave.call(this,options);
                let node:any = options.node;
                let dragNode:any = options.dragNode;
                let dragNodeData = this.getNode(dragNode?dragNode.props.nodeEle.id:"");
                let nodeData = this.getNode(node?node.props.nodeEle.id:"");
                this.doEvent("dragLeave",dragNodeData,nodeData);
            },
            /** drop 触发时调用 */
            onDrop: (options: any) => {
                this._onBeforeDrop(options);
                Tree.onBeforeDrop.call(this,options);
                this.doEvent("beforeDrop", options);
                
                let node:any = options.node;
                let dragNode:any = options.dragNode;
                let dropPosition:number = options.dropPosition;
                let dragNodeData = this.getNode(dragNode?dragNode.props.nodeEle.id:"");
                let nodeData = this.getNode(node?node.props.nodeEle.id:"");
                if(dragNodeData) {
                    this.remove(dragNodeData.id);
                }
                if(nodeData) {
                    if(nodeData.getParent()) {
                        dropPosition = dropPosition - new GearArray(nodeData.getParent().children).indexOf(nodeData);
                    }else {
                        dropPosition = dropPosition - new GearArray(this.state.options).indexOf(nodeData);
                    }
                    if(dropPosition == 0) {
                        this.append({
                            parent: nodeData,
                            data: dragNodeData
                        });
                    }else {
                        let param = {
                            data: dragNodeData,
                            before: "",
                            after: ""
                        };
                        if(dropPosition == -1) {
                            param.before = nodeData.id;
                        }else {
                            param.after = nodeData.id;
                        }
                        this.insert(param);
                    }
                    if(this._onDrop) {
                        this._onDrop = this._onDrop.bind(this);
                        this._onDrop(nodeData);
                    }else {
                        Tree.onDrop.call(this,nodeData);
                    }
                    this.doEvent("drop",dragNodeData,nodeData);
                }
                
                
            },
            filterTreeNode: (node: AntTreeNode):boolean => {
                return false;
            }
        });
    }

    render() {
        let children = this.getTreeNode();
        let props = this.getProps();
        return <AntdTree {...props}>{children}</AntdTree>;
    }

    afterRender() {
        //获取父子树的映射关联
        this.getParentTree();
        this.getChildTree();
        if(this._onBeforeLoad) {
            this._onBeforeLoad();
        }
        this.doEvent("beforeLoad");
        //如果存在父节点，需要父节点有初始值的情况下才去加载子节点
        if(this.parentTree == null) {
            this.loadData(null,(dic: any,callback?: Function)=>{
                let keyValue: any[] = [];
                // 默认值
                let defaultValue: any = this.state.value || this.state.selected;
                if(defaultValue){
                    // 如果默认值存在，则根据默认值获得相应的节点id，放到value中
                    this._findKeyByValue(defaultValue,dic,keyValue);
                }
                let value = [];
                if(keyValue.length > 0) {
                    value = this.getInitValue(dic,keyValue);
                }else{
                    value = this.getInitValue(dic);
                }
                if(this.state.defaultExpandAll == true) {
                    let expandedKeys = this._expandAll(this.getRoots(),this.state.defaultExpandLevel);
                    this.setState({
                        expandedKeys,
                        value: value
                    },()=>{
                        if(callback)
                            callback.call(this);
                    });
                }else {
                    this.setState({
                        value: value
                    },()=>{
                        if(callback)
                            callback.call(this);
                    });
                }
                
            });
        }
    }

    getParentTree() {
        let upperName = this.state.upper;
        if(!upperName) {
            return;
        }
        let parentTree = G.$("#"+upperName);
        if(parentTree instanceof Tree) {
            this.parentTree = parentTree;
            if(parentTree.childTree == null) {
                parentTree.childTree = this;
                if(parentTree.state.options instanceof Array && parentTree.state.options.length > 0) {
                    parentTree.afterUpdate();
                }
            }
        }
    }

    getChildTree() {
        let lowerName = this.state.lower;
        if(!lowerName) {
            return;
        }
        let lower:Tree<P, S> = G.$("#"+lowerName);
        if(lower instanceof Tree) {
            this.childTree = lower;
            lower.parentTree = this;
        }
    }

    afterUpdate() {
        let checked: any = this.getChecked();
        if(checked.length <= 0) {
            checked = this.getSelected();
        }
        
        let node = checked instanceof Array ? (checked.length > 0 ? checked[0] : null) : checked;
        if(this.childTree instanceof Tree) {
            if(this.state.options != null && this.state.options.length > 0) {
                if(node) {
                    this.childTree.loadData(Http.appendUrlParam(this.childTree.state.url,{code:(node.value || node.id)}));
                }else {
                    this.childTree.setState({
                        options: []
                    },()=>{
                        this.childTree.clear();
                    });
                }
            }else {
                this.childTree.setState({
                    options: []
                },()=>{
                    this.childTree.clear();
                });
            }
            
        }
    }
    protected _onClear(){
        var lowerName = this.state.lower;
        if(!lowerName) {
            return;
        }
        //清空下一级
        var lower = G.$("[comboname='"+lowerName+"']");
        if(lower instanceof Tree) {
            lower.clear();
        }
    }

    //清空数据
    clear() {
        super.clear();
        this.setState({
            value: []
        });
        this._onClear();
        this.doEvent("clear");
    }

    parse(dataInner: TreeNode) {
        if(!dataInner) {
            return;
        }
        if(dataInner.id == null || dataInner.id == "") {
            dataInner.id = dataInner.value || UUID.get();
        }
        if(dataInner.attributes == null) {
            dataInner.attributes = {};
        }
        // 支持将lvb中properties的属性加入到树节点的attributes中
        if(dataInner.properties){
            dataInner.attributes = G.G$.extend({},dataInner.attributes,dataInner.properties);
            delete dataInner.properties;
        }
        
        let link = dataInner.attributes.link || this.state.link;
        if(link){
            //处理link
            link = link.replace("{id}",dataInner.id);
            for(let key in dataInner.attributes) {
                link = link.replace("{"+key+"}",dataInner.attributes[key]);
            }
            dataInner.attributes.link = link;
            dataInner.attributes.target = dataInner.attributes.target || this.state.target;
        }
        
        if(dataInner.children && dataInner.children.length > 0) {
            for(let i = 0; i < dataInner.children.length; i++) {
                this.parse(dataInner.children[i]);
            }
        }
        if(!dataInner.text) {
            dataInner.text = dataInner.label;
        }
        return dataInner;
    }

    //格式化数据
    protected _loadFilter(data: any) {
        if(!data) {
            return null;
        }
        if(this.state.dictype != null) {
            let dic: TreeNode | null = null;
            if(this.parentTree && this.parentTree instanceof Tree) {
                let parentCheckedKeys = this.parentTree.getCheckedKeys();
                if(parentCheckedKeys.length > 0) {
                    let code = parentCheckedKeys[0];
                    for(var i=0;i<data.length;i++){
                        if(data[i].value==code || data[i].id==code){
                            dic = data[i];
                        }
                    }
                    if(dic) {
                        data = dic.children;
                    }else {
                        data = null;
                    }
                }else {
                    data = null;
                }
            }
        }
        if(data != null) {
            let treeNodes: Array<TreeNode>;
            if(data.status==0 && data.data instanceof Array) {
                treeNodes = data.data;
            }else if(data instanceof Array){
                treeNodes = data;
            }else{
                return null;
            }
            for(let i = 0; i < treeNodes.length; i++) {
                let nodeTemp = this.parse(treeNodes[i]);
                if(nodeTemp) {
                    treeNodes[i] = nodeTemp;
                }
            }
            return treeNodes;
        }
        return null;
        
    }
    //数据过滤
    loadFilter(fun: Function) {
        if(fun && $.isFunction(fun)) {
            this.bind("loadFilter",fun);
        }
    }

    getCheckedKeys() {
        let result:Array<string> = [];
        this.nodes.forEach((key,node) => {
            if(node.checked == true) {
                result.push(node.id);
            }
        });
        return result;
    }

    // 全选指定集合（包括下级），并添加当前选中的值和设置option中节点状态为checked=true
    private _checkAll(keyValue:Array<string>,options: any,addValues?:Array<string>){
        if(options){
            let optionsNew: Array<TreeNode> = [];
            if((options instanceof Array)==false){
                optionsNew = [options];
            }
            let gAddValues:GearArray<string>;
            if(addValues) {
                gAddValues = new GearArray(addValues);
            }
            let gArray = new GearArray(keyValue);
            let seek = (array: Array<TreeNode>) => {
                if(array){
                    for(var i=0;i<array.length;i++){
                        if(array[i] && array[i].children){
                            seek(array[i].children);
                        }
                        //array[i].checked = true;
                        if(gArray.contains(array[i].id)==false){
                            keyValue.push(array[i].id);
                        }
                        if(gAddValues && array[i].value){
                            // 记录本次操作添加的值
                            if(!gAddValues.contains(array[i].value)) {
                                gAddValues.add(array[i].value);
                            }
                        }
                    }
                }
            }
            seek(optionsNew);
        }
    }

    // 反选指定集合（包括下级），同时移除当前选中值和设置option中节点状态为checked=false
    private _unCheckAll(keyValue:Array<string>,options:any,removedValues?:Array<string>){
        if(options){
            if((options instanceof Array)==false){
                options = [options];
            }
            let gRemovedValues:GearArray<string>;
            if(removedValues) {
                gRemovedValues = new GearArray(removedValues);
            }
            let gArray = new GearArray(keyValue);
            let seek = (array: Array<TreeNode>) => {
                if(array){
                    for(var i=0;i<array.length;i++){
                        if(array[i] && array[i].children){
                            seek(array[i].children);
                        }
                        //array[i].checked = false;
                        gArray.remove(array[i].id);
                        if(gRemovedValues && array[i].value){
                            // 记录本次操作移除的值
                            if(!gRemovedValues.contains(array[i].value)) {
                                gRemovedValues.add(array[i].value);
                            }
                        }
                    }
                }
            }
            seek(options);
        }
    }

    getNode(id?: any): TreeNode | undefined {
        if(id) {
            return this.nodes.get(id);
        }
        return undefined;
    }

    //合并json数据中设置的默认选中
    addDefaultChecked(options:Array<TreeNode>,value:Array<string>,checked?:boolean) {
        if(!options) {
            return;
        }
        let valueInner: any[] = [];
        if(value instanceof Array == false) {
            if(value != null && new GearArray(valueInner).contains(value) == false) {
                valueInner.push(value);
            }
        }else {
            valueInner = value;
        }
        options.map((ele) => {
            let childrenChecked = false;
            if((ele.checked || checked) && new GearArray(valueInner).contains(ele.id) == false) {
                valueInner.push(ele.id);
                //如果是级联关系，就自动选中子元素节点
                if(this.state.cascadeCheck) {
                    childrenChecked = true;
                }
            }
            if(ele.children) {
                this.addDefaultChecked(ele.children,valueInner,childrenChecked);
            }
        });
        return valueInner;
    }

    //合并json数据中设置的默认展开
    addDefaultExpand(options:Array<TreeNode>,expanded: any) {
        if(!options) {
            return;
        }
        options.map((ele) => {
            if((ele.state && ele.state=="open")) {
                expanded.push(ele.id);
            }
            if(ele.children) {
                this.addDefaultExpand(ele.children,expanded);
            }
        });
    }
    // 加载数据
    loadData(param: any,callback?:Function) {
        let url: any = null;
        let data: any = null;
        let method = this.state.method;
        if(param) {
            if(typeof param == "string") {
                url = param;
                this.reload(url,null,method,callback);
            }
            if(param instanceof Object) {
                data = param;
                this.reload(null,data,this.state.method,callback);
            }
        }else {
            url = this.state.url;
            data = this.state.dictype;
            this.reload(url,data,this.state.method,callback);
        }
    }
    // 通过指定的url或者data加载数据
    reload(url: any,dictype: any,method: methods,callback?:Function) {
        let fn = async ()=> {
            let result = await DicUtil.getDic({url, method, dictype});
            if(result.success) {
                let dic = result.data;
                if(dic) {
                    dic = this._loadFilter(dic);
                    if(!dic) {
                        this.setValue([]);
                        this.nodes.clear();
                        this.setState({
                            url: url,
                            dictype: dictype,
                            selected: [],
                            value: [],
                            options: []
                        }, ()=>{
                            // 放到回调里，确保树渲染完成后触发
                            // modify by hechao 2017.11.20
                            let loadSuccessCallback = ()=>{
                                this._onLoadSuccess(null);
                                this.doEvent("loadSuccess");
                            }
                            // 增加回调，用于单独调用时感知树重新渲染完成
                            // modify by hechao 2017.11.20
                            if(callback){
                                callback.call(this,dic,loadSuccessCallback);
                            }else{
                                loadSuccessCallback.call(this);
                            }
                        });
                        return;
                    }
                    let result = this.doEvent("loadFilter",dic);
                    if(result && result.length > 0) {
                        dic = result[result.length - 1];
                    }
                    let expanded = this.state.expandedKeys||[];
                    this.addDefaultExpand(dic,expanded);
                    let initValue = this.getInitValue(dic);
                    this.triggerChange(initValue);
                    this.setState({
                        url: url,
                        dictype: dictype,
                        selected: initValue,
                        value: initValue,
                        options: dic,
                        expandedKeys: expanded
                    },()=>{
                        // 放到回调里，确保树渲染完成后触发
                        // modify by hechao 2017.11.20
                        let loadSuccessCallback = ()=>{
                            this._onLoadSuccess(dic);
                            this.doEvent("loadSuccess");
                        }
                        // 增加回调，用于单独调用时感知树重新渲染完成
                        // modify by hechao 2017.11.20
                        if(callback){
                            callback.call(this,dic,loadSuccessCallback);
                        }else{
                            loadSuccessCallback.call(this);
                        }
                    });
                }
            }else {
                this._onLoadError(result);
                this.doEvent("loadError",result);
                // 当加载失败时也触发回调
                // modify by hechao 2017.11.20
                if(callback){
                    callback.call(this);
                }  
            }
        }
        fn();
    }

    //获取初始值
    getInitValue(dic: any,values?: any) {
        let keyValue = values || this.state.value;
        if(!keyValue){
            keyValue = [];
        }
        // 将数据集中节点上有checked=true属性的id加入到keyValue中，表示选中
        keyValue = this.addDefaultChecked(dic,keyValue);
        let valueC = [];
        if(this.state.multiple == true || this.state.checkable == true) {
            // 多选
            valueC = keyValue;
            valueC = this._removeNotExistKey(keyValue,dic);
        }else {
            // 单选
            if(keyValue && keyValue.length > 0) {
                valueC = [keyValue[0]];
            
                let nodeRe = Tree.getNodeFromRoot(dic,valueC);
                if(nodeRe == null) {
                    valueC = [];
                }
            }
            
        }
        return valueC;
    }
    // 根据节点的值得到节点的key
    private _findKeyByValue(value:Array<string>,options:any,keyValue:Array<string>){
        if(options){
            let gArray = new GearArray(value);
            if((options instanceof Array)==false){
                options = [options];
            }
            for(var i=0;i<options.length;i++){
                if(options[i].value && gArray.contains(options[i].value)){
                    keyValue.push(options[i].id);
                }
                this._findKeyByValue(value,options[i].children,keyValue);
            }
        }
    }

    // 检查当前数据组中的值是否都在节点中，如果不在则移除
    private _removeNotExistKey(keyValue: any,options: any){
        let newKeyValue: any[] = [];
        if(typeof keyValue=="string")
            keyValue = [keyValue];
        if(keyValue && keyValue instanceof Array) {
            keyValue.forEach((key)=>{
                let nodeRe = Tree.getNodeFromRoot(options,key);
                if(nodeRe != null) {
                    if(this.state.cascadeCheck){
                        // 如果级连设置为true
                        this._checkAll(newKeyValue,nodeRe);
                    }else{
                        newKeyValue.push(key);
                    }
                }
            });
        }
        return newKeyValue;    
    }    

    //从一个数组中递归获取node节点
    private static getNodeFromRoot(root: any,key: any): any {
        let eleRe = null;
        for(let i = 0;i<root.length;i++) {
            let ele = root[i];
            if(ele.id == key) {
                eleRe = ele;
                break;
            }else {
                let children = ele.children;
                if(children && children instanceof Array) {
                    eleRe = this.getNodeFromRoot(children,key);
                    if(eleRe != null) {
                        break;
                    }
                }
            }
        }
        return eleRe;
    }
    getValue(){
        let value = new GearArray<string>([]);
        let options = this.state.options;
        if(options){
            var seek = (array: Array<TreeNode>) => {
                if(array){
                    for(var i=0;i<array.length;i++){
                        let treeNode = array[i];
                        if(treeNode.checked == true && treeNode.value && value.contains(treeNode.value)==false)
                            value.add(treeNode.value);
                        if(treeNode.children){
                            seek(treeNode.children);
                        }
                    }
                }                
            }
            seek(options);
        }
        return value.toArray();
    }
    setValue(value: any,callback?:Function){
        if(typeof value =="string")
            value = [value]; 
        let keyValue: any[] = [];      
        // 设置的是值，先根据值找到对应节点的key 
        this._findKeyByValue(value,this.state.options,keyValue);
        // 在级连情况下，如果设置值为父级的值，子级也须全选
        // modify by hechao
        let newKeyValue: any;     
        if(this.state.cascadeCheck){
            newKeyValue = [];
            // 如果级连为true
            for(let i=0;i<keyValue.length;i++){
                let node = this.getNode(keyValue[i]);
                if(node){
                    this._checkAll(newKeyValue,node);
                }
            }
        }else{
            newKeyValue = keyValue;
        }
        super.setValue(newKeyValue, callback);
    }
    addValue(value: any,callback?:Function){
        if(value){
            if(typeof value =="string") {
                value = [value];
            }
            let stateValue: any = this.state.value || [];
            let garray = new GearArray(stateValue);
            garray.addAll(value);
            this.setValue(garray.toArray(),callback);
        }
    }

    getNodesByValue(value: any):Array<TreeNode> {
        let nodes:Array<TreeNode> = [];
        this.nodes.forEach((key,node) => {
            if(node.value == value) {
                nodes.push(node);
            }
        });
        return nodes;
    }
    getDataById(id: any) {
        return this.getNode(id);
    }
    getRoot() {
        return this.state.options[0];
    }
    getRoots() {
        return this.state.options;
    }
    getParent(id: any) {
        let node = this.getNode(id);
        return node?node.getParent():null;
    }
    getChildren(id: any) {
        let node = this.getNode(id);
        return node?node.children:null;
    }
    getChecked() {
        let result:Array<TreeNode> = [];
        this.nodes.forEach((key,node) => {
            if(node.checked == true) {
                result.push(node);
            }
        });
        return result;
    }

    getSelected() {
        let result = null;
        let selected: any = this.state.selected;
        if(selected){
            this.nodes.forEach((key,node) => {
                if(key == selected[0]) {
                    result = node;
                }
            });
        }
        return result;
    }
    isLeaf(id: any) {
        let node = this.getNode(id);
        if(node)
            return node.isLeaf;
        else
            return null;
    }

    findByText(text:string,contains?:boolean): any {
        let re: any[] = [];
        if(contains) {
            this.nodes.forEach((key,node)=>{
                if(node.text.indexOf(text) != -1) {
                    re.push(node);
                }
            });
        }else {
            this.nodes.forEach((key,node)=>{
                if(node.text == text) {
                    re.push(node);
                }
            });
        }
        return re;
    }
    select(id: any) {
        var node = this.getNode(id);
        if(node)
            node.select();
    }
    unSelect(id: any) {
        var node = this.getNode(id);
        if(node)
            node.unSelect();
    }

    private _expandAll(eles: Array<TreeNode>,defaultExpandLevel: any,keyValue?:Array<string>) {
        if(!keyValue) {
            keyValue = [];
        }
        if(eles instanceof Array){
            let gArray = new GearArray(keyValue);
            let seek = (array:Array<any>,defaultExpandLevelInner: any) => {
                if(defaultExpandLevelInner != null) {
                    defaultExpandLevelInner --;
                }
                if(array && (defaultExpandLevelInner > 0 || defaultExpandLevelInner == null)){
                    for(var i=0;i<array.length;i++){
                        if(array[i].children){
                            seek(array[i].children,defaultExpandLevelInner);
                        }
                        gArray.add(array[i].id);
                    }
                }
            }
            for(let i = 0; i < eles.length; i++) {
                let ele = eles[i];
                let parent = ele.parent();
                if(parent) {
                    if(gArray.contains(parent.id) == false) {
                        gArray.add(parent.id);
                    }
                }
                gArray.add(ele.id);
                let defaultExpandLevelSeek = defaultExpandLevel;
                seek(ele.children,defaultExpandLevelSeek);
            }
        }
        return keyValue;
    }

    
    // 全选和反选
    checkAll(callback?: Function){
        let value: any[] = [];
        var options = this.state.options;
        if(options){
            this._checkAll(value,options);
            this.setState({
                value:value
            },function(){
                if(callback){
                    callback();
                }
            });
        }
    }
    unCheckAll(callback?:Function){
        var options = this.state.options;
        if(options){
            this._unCheckAll([],options);
            this.setState({
                value:[],
                options:options,
            },function(){
                if(callback){
                    callback();
                }                
            });   
        }  
    }  
    
    getExpandKeys(): any{
        return this.state.expandedKeys;
    }
    collapseAll(id: any) {
        if(id){
            var node = this.getNode(id);
            if(node) {
                let keys = this._expandAll([node],null);
                if(keys){
                    let expandKeys: Array<string> = this.getExpandKeys();
                    let expandKeysArr = new GearArray(expandKeys||[]);
                    for(let i = 0; i < keys.length;i++) {
                        if(expandKeysArr.contains(keys[i]) == true) {
                            expandKeysArr.remove(keys[i]);
                        }
                    }
                    this.setState({
                        expandedKeys: expandKeysArr.toArray()
                    });
                }
            }
        }else{
            this.setState({
                expandedKeys: []
            });    
        }        
    }

    expandAll(id: any) {
        if(id){
            let node = this.getNode(id);
            if(node) {
                let keys = this._expandAll([node],null);
                if(keys){
                    let expandKeys: Array<string> = this.getExpandKeys();
                    let expandKeysArr = new GearArray(expandKeys);
                    for(let i = 0; i < keys.length;i++) {
                        if(expandKeysArr.contains(keys[i]) == false) {
                            expandKeysArr.add(keys[i]);
                        }
                    }
                    this.setState({
                        expandedKeys: expandKeysArr.toArray()
                    });
                }
            }
        }else{
            let keys = this._expandAll(this.getRoots(),null);   
            this.setState({
                expandedKeys: keys
            });
        }	
    }
    expandTo(id: any) {
        let parent = this.getParent(id);
        if(parent) {
            parent.expand();
        }
    }
    scrollTo(id: any) {
        let node = this.getNode(id);
        if(node) {
            if(node.getParent()) {
                node.getParent().expand();
            }
            node.select();
        }
    }
    //添加节点
    append(param: any) {
        let parent: any = param.parent;
        if(typeof parent == "string" || (typeof parent == "number")) {
            parent = this.getNode(parent);
        }
        let updateFn = (data: any) => {
            if(parent) {
                if(!parent.children) {
                    parent.children = [];
                }
                if(data instanceof Array) {
                    data.map((ele) => {
                        ele = this.parse(ele);
                        parent.children.push(ele);
                    });
                }else {
                    data = this.parse(data);
                    parent.children.push(data);
                }
            }else {
                let options = this.state.options;
                data = this.parse(data);
                options.push(data);
            }
            DicUtil.updateDic(this.state.dictype,this.state.options);
            this.setState({
                options: this.state.options
            });
        }
        let data:any = param.data;
        let url = param.url;
        if(url != null) {
            let fn = async () => {
                let result = await Http.ajax(this.state.method, url);
                if(result.success) {
                    let data = result.data;
                    if(data) {
                        updateFn(data.data);
                    }
                }
            }
            fn();
        }else {
            updateFn(data);
        }
    }
    // 插入节点
    insert(param: any) {
        let index = -1;
        let parent: any = null;
        let before: any = param.before;
        if(typeof before == "string") {
            before = this.getNode(before);
            parent = before.getParent();
            if(parent) {
                index = new GearArray(parent.children).indexOf(before);
                index = index>0?index:index;
            }
        }
        let after = param.after;
        if(typeof after == "string") {
            after = this.getNode(after);
            parent = after.parent;
            if(parent) {
                index = new GearArray(parent.children).indexOf(after);
                index = index>0?index+1:index;
            }
        }
        let updateFn = (data: any) => {
            let garray: GearArray<TreeNode> = new GearArray<TreeNode>(this.state.options);
            if(parent) {
                garray = new GearArray<TreeNode>(parent.children);
            }
            if(data instanceof Array) {
                data.map((ele) => {
                    ele = this.parse(ele);
                    garray.insert(ele,index);
                });
            }else {
                if(parent) {
                    garray = new GearArray<TreeNode>(parent.children);
                }else {
                    garray = new GearArray<TreeNode>(this.state.options);
                }
                data = this.parse(data);
                garray.insert(data,index);
            }
            DicUtil.updateDic(this.state.dictype,garray.toArray());
            this.setState({
                options: garray.toArray()
            });
        }
        let data:any = param.data;
        let url = param.url;
        if(url != null) {
            let fn = async () => {
                let result = await Http.ajax(this.state.method, url);
                if(result.success) {
                    let data = result.data;
                    if(data.data) {
                        updateFn(data);
                    }
                }
            }
            fn();
        }else {
            updateFn(data);
        }
    }
    //删除指定节点
    remove(id: any) {
        let node = this.getNode(id);
        let garray:GearArray<TreeNode>;
        if(node) {
            if(node.parent()) {
                garray = new GearArray<TreeNode>(node.parent().children);
            }else {
                garray = new GearArray<TreeNode>(this.state.options);
            }
            let data = garray.remove(node);
            DicUtil.updateDic(this.state.dictype, this.state.options);
            this.setState({
                options: this.state.options
            });
            return data;
        }
        return null;
    }
    // 删除指定节点并返回
    pop(id: any) {
        return this.remove(id);
    }
    // 更新节点
    update(id: any,data: any) {
        let node = this.getNode(id);
        let garray: GearArray<TreeNode>;
        if(node) {
            if(node.getParent()) {
                garray = new GearArray<TreeNode>(node.getParent().children);
            }else {
                garray = new GearArray<TreeNode>(this.state.options);
            }
            let before = null;
            let after = null;
            let index = garray.indexOf(node);
            if(index == garray.length() - 1) {
                after = garray.get(garray.length() - 2).id;
            }else {
                before = garray.get(index + 1).id;
            }
            this.remove(id);
            this.insert({
                before: before,
                after: after,
                data: data
            });
        }
        
    }
    //禁用拖拽
    enableDnd() {
        this.setState({
            dragable: true
        });
    }
    // 启用拖拽
    disableDnd() {
        this.setState({
            dragable: false
        });
    }
    beginEdit(id: any) {
        // return this[this.tagName]("beginEdit",this.getNode(id).target);
    }
    endEdit(id: any) {
        // return this[this.tagName]("endEdit",this.getNode(id).target);
    }
    cancelEdit(id: any) {
        // return this[this.tagName]("cancelEdit",this.getNode(id).target);
    }
    doFilter(text: any) {
        // return this[this.tagName]("doFilter",text);
    }
    refresh() {
        this.loadData(null);
    }
    isAlone(id: any) {
        let node = this.getNode(id);
        if(node){
            if(node.parent()==null && (node.children==null || node.children.length==0))
                return true;
            else
                return false;
        }else
            return null;
    }
    previous(id: any) {
        let node = this.getNode(id);
        if(node){
            return node.previous();
        }else{
            return null;
        }
    }
    next(id: any) {
        let node = this.getNode(id);
        if(node){
            return node.next();
        }else{
            return null;
        }
    }

    // 解发onSelect事件，这个方法由两处调用，所以公共出来，一外是Tree的OnSelect事件，一处是节点的select
    private _triggerOnSelect(node?: TreeNode,e?: any){
        let rebe = this._onBeforeSelect(node);
        if(rebe == false) {
            return;
        }
        let re = this.doEvent("beforeSelect");
        if(re instanceof Array && re[0] == false) {
            return;
        }
        if(e){
            if(e.selected == true) {
                this.select(e.node.props.nodeEle.id);
            }
        }
        this._onSelect(node);
        this.doEvent("select",node);
        Tree.onSelect.call(this,node);
    }

    // 在选中节点之前触发
    protected _onBeforeSelect(node?: TreeNode){
        if(node) {
            if(node && node.attributes && (node.attributes.disabled == true || node.attributes.disabled == "true")) {
                return false;
            }
        }
        return true;
    };

    private _collaseAll(keyValue:Array<string>,ele: TreeNode) {
        if(ele){
            let gArray = new GearArray(keyValue);
            let parent = ele.parent();
            if(parent) {
                if(gArray.contains(parent.id) == false) {
                    gArray.add(parent.id);
                }
            }
            gArray.remove(ele.id);
            let seek = (array: Array<TreeNode>) => {
                if(array){
                    for (var i = 0; i < array.length; i++) {
                        if (array[i] && array[i].children) {
                            seek(array[i].children);
                        }
                        gArray.remove(array[i].id);
                    }
                }
            }
            seek(ele.children);
        }
    }

    collapse(id: any) {
        var node = this.getNode(id);
        if(node)
            node.collapse();
    }
    expand(id: any) {
        var node = this.getNode(id);
        if(node)
            node.expand();
    }

    check(id: any,callback?:Function) {
        var node = this.getNode(id);
        if(node)
            node.check(callback);
    }
    unCheck(id: any,callback?:Function) {
        var node = this.getNode(id);
        if(node)
            node.unCheck(callback);
    }

    private _change(newValue: any,oldValue: any){
        this.triggerChange(newValue);
        this.doEvent("change",newValue,oldValue);  
    }

    protected _onBeforeExpand(node?: TreeNode){}
    static onBeforeExpand(expandedKeys: any,info: any){}

    protected _onExpand(node?: TreeNode){}
    static onExpand(expandedKeys: any,info: any){}

    protected _onRightClick(node?: TreeNode) {}
    static onRightClick(node?: TreeNode) {}

    protected _onCheck(node?: TreeNode){}
    static onCheck(e: any) {}

    //当选中节点的时候触发
    protected _onSelect(node?: TreeNode){}
    //静态-全局的tree.onSelect
    static onSelect(node?: TreeNode) {
        // 如果节点上配置了link地址，则转向指定地址
        let url = null;
        if(node && node.attributes) {
            url = node.attributes.link || node.attributes.url;
            if(url){
                let target = node.attributes.target;
                Http.triggerHyperlink(url,target);
            }  
        }
    }

    protected _onStartDrag(options: any) {}
    static onStartDrag(info: any) {}

    protected _onDragEnter(options: any) {}
    static onDragEnter(info: any){}

    protected _onDragOver(info: any){}
    static onDragOver(info: any){}

    protected _onDragLeave(info: any){}
    static onDragLeave(info: any){}

    protected _onBeforeDrop(info: any){}
    static onBeforeDrop(info: any){}

    protected _onDrop(info: any){}
    static onDrop(info: any){}

    protected _onLoadError(data: any) {}

    //当加载完成的时候触发
    protected _onLoadSuccess(data: any){}

    protected _onBeforeLoad(){}
}