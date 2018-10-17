
import CompilerUtil from './CompilerUtil';
import HtmlParser from "./HtmlParser";

const ieNSBug = /^xmlns:NS\d+/;
const ieNSPrefix = /^NS\d+:/;

export default class HtmlCompiler {

    decodeHTMLCached = CompilerUtil.cached(CompilerUtil.decode);
    warn: any;
    platformIsPreTag: any;
    platformMustUseProp: any;
    platformGetTagNamespace: any;

    stack: any[] = [];
    preserveWhitespace: boolean;
    root: any;
    currentParent: ASTElement;
    inPre = false;
    warned = false;
    options: CompilerOptions;
    template: string;

    constructor(template: string, options: CompilerOptions) {
        this.template = template;
        this.options = options;
    }

    parse(): {["ast"]: ASTElement,["cacheHtml"]: string} {
        this.warn = this.options.warn || CompilerUtil.baseWarn;
        this.platformIsPreTag = this.options.isPreTag || CompilerUtil.no
        this.platformMustUseProp = this.options.mustUseProp || CompilerUtil.no
        this.platformGetTagNamespace = this.options.getTagNamespace || CompilerUtil.no

        this.preserveWhitespace = this.options.preserveWhitespace !== false;

        let htmlParser = new HtmlParser(this.template, {
            warn: this.warn,
            expectHTML: this.options.expectHTML,
            isUnaryTag: this.options.isUnaryTag,
            canBeLeftOpenTag: this.options.canBeLeftOpenTag,
            shouldDecodeNewlines: this.options.shouldDecodeNewlines,
            shouldDecodeNewlinesForHref: this.options.shouldDecodeNewlinesForHref,
            shouldKeepComment: this.options.comments,
            isNonPhrasingTag: this.options.isNonPhrasingTag,
            start: (tag: any, attrs: any, unary: any) => {
                // check namespace.
                // inherit parent ns if there is one
                const ns = (this.currentParent && this.currentParent.ns) || this.platformGetTagNamespace(tag);

                // handle IE svg bug
                /* istanbul ignore if */
                if (CompilerUtil.isIE && ns === 'svg') {
                    attrs = this.guardIESVGBug(attrs);
                }

                let element: ASTElement = this.createASTElement(tag, attrs, this.currentParent);
                if (ns) {
                    element.ns = ns;
                }

                if (this.isForbiddenTag(element)) {
                    element.forbidden = true;
                    process.env.NODE_ENV !== 'production' && this.warn(
                        'Templates should only be responsible for mapping the state to the ' +
                        'UI. Avoid placing tags with side-effects in your templates, such as ' +
                        `<${tag}>` + ', as they will not be parsed.'
                    );
                }

                if (this.platformIsPreTag(element.tag)) {
                    this.inPre = true;
                }
                if (!element.processed) {
                    this.processElement(element, this.options);
                }

                // tree management
                if (!this.root) {
                    element.index = [0];
                    this.root = element;
                }
                if (this.currentParent && !element.forbidden) {
                    element.index = element.index.concat(this.currentParent.index);
                    element.index.push(this.currentParent.children.length);
                    this.currentParent.children.push(element);
                    element.parent = this.currentParent;
                }
                if (!unary) {
                    this.currentParent = element;
                    this.stack.push(element);
                } else {
                    this.closeElement(element);
                }
                return element.index;
            },
            end: () => {
                // remove trailing whitespace
                const element = this.stack[this.stack.length - 1];
                const lastNode = element.children[element.children.length - 1];
                if (lastNode && lastNode.type === 3 && lastNode.text === ' ' && !this.inPre) {
                    element.children.pop();
                }
                // pop stack
                this.stack.length -= 1;
                this.currentParent = this.stack[this.stack.length - 1];
                this.closeElement(element);
            },

            chars: (text: string) => {
                if (!this.currentParent) {
                    if (process.env.NODE_ENV !== 'production') {
                        if (text === this.template) {
                            this.warnOnce(
                                'Component template requires a root element, rather than just text.'
                            );
                        } else if ((text = text.trim())) {
                            this.warnOnce(
                                `text "${text}" outside root element will be ignored.`
                            );
                        }
                    }
                    return;
                }
                // IE textarea placeholder bug
                /* istanbul ignore if */
                if (CompilerUtil.isIE &&
                    this.currentParent.tag === 'textarea' &&
                    this.currentParent.attrsMap.placeholder === text
                ) {
                    return;
                }
                const children: any = this.currentParent.children;
                text = this.inPre || text.trim() ? this.isTextTag(this.currentParent) ? text : this.decodeHTMLCached(text)
                    // only preserve whitespace if its not right after a starting tag
                    : this.preserveWhitespace && children.length ? ' ' : ''
                if (text) {
                    if (text !== ' ' || !children.length || children[children.length - 1].text !== ' ') {
                        let index: number[] = [];
                        index = index.concat(this.currentParent.index);
                        index.push(this.currentParent.children.length);
                        children.push({
                            type: 3,
                            text,
                            index
                        })
                    }
                }
            },
            comment: (text: string) => {
                const children: any = this.currentParent.children;
                let index: number[] = [];
                index = index.concat(this.currentParent.index);
                index.push(this.currentParent.children.length);
                children.push({
                    type: 3,
                    text,
                    isComment: true,
                    index
                })
            }
        });
        let cacheHtml = htmlParser.parseHTML();
        return {"ast": this.root, "cacheHtml": cacheHtml};
    }

    private isTextTag(el: any): boolean {
        return el.tag === 'script' || el.tag === 'style'
    }

    private processElement(element: ASTElement, options: CompilerOptions) {

        // determine whether this is a plain element after
        // removing structural attributes
        element.plain = !element.key && (!element.attrsList || !element.attrsList.length);
        this.processAttrs(element)
    }

    private processAttrs(el: any) {
        const list = el.attrsList
        let i, l, name, rawName, value;
        //  modifiers: any, isProp;
        for (i = 0, l = list.length; i < l; i++) {
            name = rawName = list[i].name;
            value = list[i].value;
            CompilerUtil.addAttr(el, name, JSON.stringify(value));
            // #6887 firefox doesn't update muted state if set via attribute
            // even immediately after element creation
            if (!el.component && name === 'muted' && this.platformMustUseProp(el.tag, el.attrsMap.type, name)) {
                CompilerUtil.addProp(el, name, 'true');
            }
        }
    }

    private isForbiddenTag(el: any): boolean {
        return (
            el.tag === 'style' ||
            (el.tag === 'script' && (
                !el.attrsMap.type ||
                el.attrsMap.type === 'text/javascript'
            ))
        );
    }

    private createASTElement(tag: string, attrs: Array<Attr>, parent: ASTElement): ASTElement {
        return {
            type: 1,
            tag,
            attrs: [],
            props: [],
            attrsList: attrs,
            attrsMap: this.makeAttrsMap(attrs),
            parent,
            children: [],
            index:[]
        };
    }

    private makeAttrsMap(attrs: Array<any>): any {
        const map = {};
        for (let i = 0, l = attrs.length; i < l; i++) {
            if (process.env.NODE_ENV !== 'production' && map[attrs[i].name] && !CompilerUtil.isIE && !CompilerUtil.isEdge) {
                this.warn('duplicate attribute: ' + attrs[i].name);
            }
            map[attrs[i].name] = attrs[i].value;
        }
        return map;
    }

    private guardIESVGBug(attrs: any) {
        const res = [];
        for (let i = 0; i < attrs.length; i++) {
            const attr = attrs[i];
            if (!ieNSBug.test(attr.name)) {
                attr.name = attr.name.replace(ieNSPrefix, '');
                res.push(attr);
            }
        }
        return res;
    }

    private warnOnce(msg: string) {
        if (!this.warned) {
            this.warned = true;
            this.warn(msg);
        }
    }

    private closeElement(element: any) {
        if (this.platformIsPreTag(element.tag)) {
            this.inPre = false;
        }
    }
}