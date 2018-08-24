// Elements that you can, intentionally, leave open
// (and which close themselves)
// HTML5 tags https://html.spec.whatwg.org/multipage/indices.html#elements-3
// Phrasing Content https://html.spec.whatwg.org/multipage/dom.html#phrasing-content
export default class CompilerUtil {

    static makeMap(
        str: string,
        expectsLowerCase?: boolean
    ): (key: string) => true | void {
        const map = Object.create(null)
        const list: Array<string> = str.split(',')
        for (let i = 0; i < list.length; i++) {
            map[list[i]] = true
        }
        return expectsLowerCase
            ? val => map[val.toLowerCase()]
            : val => map[val]
    }

    static no = (a?: any, b?: any, c?: any) => false;

    static inBrowser = typeof window !== 'undefined';

    static UA: any = CompilerUtil.inBrowser && window.navigator.userAgent.toLowerCase();

    static isIE = CompilerUtil.UA && /msie|trident/.test(CompilerUtil.UA);

    static isEdge = CompilerUtil.UA && CompilerUtil.UA.indexOf('edge/') > 0;

    static baseWarn = (msg: string) => {
        console.error(`[Vue compiler]: ${msg}`);
    }

    static addAttr(el: ASTElement, name: string, value: any) {
        (el.attrs || (el.attrs = [])).push({ name, value });
        el.plain = false;
    }

    static cached(fn: Function): Function {
        const cache = Object.create(null);
        return ((str: string) => {
            const hit = cache[str];
            return hit || (cache[str] = fn(str));
        });
    }
    static addProp(el: ASTElement, name: string, value: string) {
        (el.props || (el.props = [])).push({ name, value });
        el.plain = false;
    }
    
    static div: any;
    static getShouldDecode (href: boolean): boolean {
        CompilerUtil.div = CompilerUtil.div || document.createElement('div');
        CompilerUtil.div.innerHTML = href ? `<a href="\n"/>` : `<div a="\n"/>`;
      return CompilerUtil.div.innerHTML.indexOf('&#10;') > 0;
    }
    
    // #3663: IE encodes newlines inside attribute values while other browsers don't
    static shouldDecodeNewlines = CompilerUtil.inBrowser ? CompilerUtil.getShouldDecode(false) : false;
    // #6828: chrome encodes content in a[href]
    static shouldDecodeNewlinesForHref = CompilerUtil.inBrowser ? CompilerUtil.getShouldDecode(true) : false;
    static decoder: any;
    static decode(html: string) {
        CompilerUtil.decoder = CompilerUtil.decoder || document.createElement('div');
        CompilerUtil.decoder.innerHTML = html;
        return CompilerUtil.decoder.textContent;
    }
}