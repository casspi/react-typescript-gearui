import CompilerOptionsFactory from './compiler/CompilerOptionsFactory';
import CompilerUtil from './compiler/CompilerUtil';
import HtmlCompiler from './compiler/HtmlCompiler';
export default class ParseHtml {

    finalOptions: any;

    constructor(optionsParam?: any) {
        optionsParam = optionsParam || {};
        let options = {
            shouldDecodeNewlines: CompilerUtil.shouldDecodeNewlines,
            shouldDecodeNewlinesForHref: CompilerUtil.shouldDecodeNewlinesForHref,
            delimiters: optionsParam.delimiters,
            comments: optionsParam.comments
        };
        const errors: any[] = [];
        const tips: any[] = [];
        let optionsFactory = new CompilerOptionsFactory();
        this.finalOptions = Object.create(optionsFactory.options());
        this.finalOptions.warn = (msg: any, tip: any) => {
            (tip ? tips : errors).push(msg);
        }
        if (options) {
            // copy options
            for (const key in options) {
                this.finalOptions[key] = options[key];
            }
        }
    }

    public parse(template: string): {["ast"]: ASTElement,["cacheHtml"]: string} {
        let compiler = new HtmlCompiler(template, this.finalOptions);
        return compiler.parse();
    }
}