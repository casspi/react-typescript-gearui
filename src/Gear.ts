import * as $ from 'jquery';
import JqueryTag from './components/JqueryTag';
import { Events, Parser } from './core';
import { GearUtil, StringUtil } from './utils';
import Tag from './components/Tag';
import Render from './core/Render';
export default class G {

    static SockJs:any = null;
    static G$:JQueryStatic = $;
    //是否渲染完成
    static parsed: boolean = false;
    //待执行的function
    static waitFuns: Array<Function> = [];

    static events: GearArray<string> = Events["keys"];

    static cannotSetStateEvents: GearArray<string> = Events["cannotSetState"];

    static components = {};

    static tag = {};

    static userComponents = {};

    //所有的虚拟dom节点都存放在这个div中，这个div只在内存中存在
    static voidParent = document.createElement("div");

    static cacheHtml:string = "";

    static cacheAst: ASTElement;

    //渲染
    static render(renderOptions: RenderOptions) {
        //渲染指定节点下的控件
        //el: 指定节点
        let el = renderOptions.el;
        let parser = new Parser();
        let astMsg  = parser.parse(el);
        let render = new Render();
        this.cacheHtml = astMsg.cacheHtml;
        this.cacheAst = astMsg.ast;
        render.render(astMsg.ast, astMsg.parent, renderOptions.mounted);
        this.G$.merge
    }

    //注册自定义组件
    static registerComponents(fun: Function) {
        let clazz = GearUtil.createClass(fun, Tag);
        if(clazz != null) {
            this.userComponents[clazz.name] = clazz.clazz;
        }
    }

    //注册组件
    static registerCustomComponents() {
        let requireComponent = require['context']('./components', true , /[A-Z]\w+\.(tsx)$/);
        requireComponent.keys().forEach((fileName: string) => {
            if(fileName.endsWith('index.ts')) {
                return;
            }
            let fileNameArr = fileName.split('/');
            let fileNameReal = "./" + fileNameArr[fileNameArr.length - 1];
            const componentConfig = requireComponent(fileName);
            let componentName:string = fileNameReal.replace(/^\.\/(.*)\.\w+$/, '$1');
            let componentNameReal = componentName;
            componentName = componentName.toLowerCase();
            //componentName = 'g-' + componentName.toLowerCase();
            let component = componentConfig.default || componentConfig;
            if(component) {
                component.props = componentConfig.props;
                component.state = componentConfig.state;
                this.components[componentName] = component;
                this.tag[componentNameReal] = component;
                this.tag[componentName] = component;
            }
        });
    }

    //查找页面中的元素
    static $(selector?:string|Element|Function|null, react?: boolean) {
        if(typeof selector == "string" || selector instanceof Element) {
            //如果是节点字符串(<a></a>),并且是要求返回react对象的，返回react对象
            if(typeof selector == "string" && react == true) {
                let isHtml = StringUtil.isHtmlString(selector);
                if(isHtml){
                    let parser = new Parser();
                    return parser.parseToReactInstance(selector);
                }
            }
            let doms:JQuery<HTMLElement>|undefined = undefined;
            let vmdoms = this.findVmDomFromCacheAst(selector);
            if(vmdoms.length > 0) {
                for(let i = 0; i < vmdoms.length; i++) {
                    let vmdom = vmdoms[i];
                    if(!doms) {
                        doms = this.G$(vmdom.realDom);
                    }else {
                        doms = doms.add(vmdom.realDom);
                    }
                }
            }
            doms = doms || this.G$(selector);
            if(doms.length == 0){
                doms = this.G$(this.voidParent).find(selector);
            }
            let fnNames = [];
            let eles:any = [];
            if(doms.length > 0) {
                for(let i = 0; i < doms.length;i++) {
                    let dom = this.G$(doms[i]);
                    try{
                        let gObj = dom.data("vmdom");
                        if(gObj) {
                            //记录自定义方法名称
                            for(let key in gObj) {
                                if(this.G$.isFunction(gObj[key])) {
                                    fnNames.push(key);
                                }
                            }
                            for(let key in dom) {
                                if(gObj[key] === undefined && this.G$.isFunction(dom[key])) {
                                    ((gObj,key)=>{
                                        gObj[key] = (...args: any[]) => {
                                            let jdom = this.G$(gObj.realDom);
                                            return jdom[key].call(jdom,...args);
                                        };
                                    })(gObj,key);
                                }
                            }
                            if(eles.indexOf(gObj) == -1) {
                                eles.push(gObj);
                            }
                        }else if(dom.length == 1) {
                            let jele = new JqueryTag();
                            jele.realDom = dom[0];
                            var constructor = dom.constructor;
                            this.G$.extend(dom,jele);
                            dom.constructor = constructor;
                            eles.push(dom);
                        }
                    }catch (e){
                        if(react == true) {
                            let parser = new Parser();
                            eles.push(parser.parseToReactInstance(dom[0].outerHTML));
                        }else {
                            if(dom.length == 1) {
                                let jele = new JqueryTag();
                                jele.realDom = dom[0];
                                var constructor = dom.constructor;
                                this.G$.extend(dom,jele);
                                dom.constructor = constructor;
                            }
                            eles.push(dom);
                        }
                    }
                }
            }
            if(eles.length > 1) {
                let domArrays = [];
                for(let i = 0; i < doms.length; i++) {
                    if(doms.eq(i).attr("ctype") == null) {
                        domArrays.push(doms[i]);
                    }
                }
                doms = this.G$(domArrays);
                //筛选器获取了多个元素的时候，将各自执行各自的方法
                this.G$.each(fnNames,(i,name)=>{
                    let fn:any = (...args:any[])=>{
                        let res = [];
                        for(let j = 0; j < eles.length;j ++) {
                            let ele = eles[j];
                            if(ele[name] != null && this.G$.isFunction(ele[name])) {
                                let re = ele[name].call(ele,...args);
                                res.push(re);
                            }
                        }
                        return res;
                    };
                    if(name.indexOf(Constants.EXPAND_NAME) != -1) {
                        name = name.replace(Constants.EXPAND_NAME, '');
                    }
                    if(doms) {
                        doms[name] = fn;
                    }
                });
                doms.eq = (index:number)=>{
                    return eles[index];
                };
                return doms;
            }else {
                if(eles.length > 0) {
                    return eles[0];
                }else {
                    return this.G$([]);
                }
            }
        }else if(typeof selector == "function") {
            if(this.parsed === true) {
                selector();
            }else {
                this.waitFuns.push(selector);
            }
        }else {
            return selector;
        }
    }

    /**
     * 执行排队的function
     */
    static doWaitFuns() {
        this.waitFuns.forEach(fun => {
            fun.call(this);
        });
    }

    private static findVmDomFromCacheAst(selector: string|Element) {
        let vmdoms: any[] = [];
        let jEleFromCache = G.G$(this.cacheHtml).find(selector);
        if(jEleFromCache.length > 0 && this.cacheAst) {
            jEleFromCache.each((i, ele)=>{
                let index = this.G$(ele).attr(Constants.HTML_PARSER_DOM_INDEX);
                if(index) {
                    let indexs: string[] = index.split(",");
                    let ast = this.cacheAst;
                    for(let i = 1; i < indexs.length; i++) {
                        let idx = indexs[i] ? parseInt(indexs[i]) : -1;
                        if(ast) {
                            ast = ast.children[idx];
                        }else {
                            break;
                        }
                    }
                    if(ast && ast != this.cacheAst) {
                        vmdoms.push(ast.vmdom);
                    }
                }
            });
            
        }
        return vmdoms;
    }
    
}