import CompilerUtil from "./CompilerUtil";

// this map is intentionally selective, only covering SVG elements that may
// contain child elements.

export default class CompilerOptionsFactory {

    isSVG: any;
    acceptValue: any;
    isPreTag: any;
    isUnaryTag: any;
    canBeLeftOpenTag: any;
    isNonPhrasingTag: any;
    constructor() {
        this.isSVG = CompilerUtil.makeMap(
            'svg,animate,circle,clippath,cursor,defs,desc,ellipse,filter,font-face,' +
            'foreignObject,g,glyph,image,line,marker,mask,missing-glyph,path,pattern,' +
            'polygon,polyline,rect,switch,symbol,text,textpath,tspan,use,view',
            true
        );
    
        this.acceptValue = CompilerUtil.makeMap('input,textarea,option,select,progress');
    
        this.isPreTag = (tag: string): boolean => tag === 'pre';
        
        this.isUnaryTag = CompilerUtil.makeMap(
            'area,base,br,col,embed,frame,hr,img,input,isindex,keygen,' +
            'link,meta,param,source,track,wbr'
        );
        
        this.canBeLeftOpenTag = CompilerUtil.makeMap(
            'colgroup,dd,dt,li,options,p,td,tfoot,th,thead,tr,source'
        );
        
        this.isNonPhrasingTag = CompilerUtil.makeMap(
            'address,article,aside,base,blockquote,body,caption,col,colgroup,dd,' +
            'details,dialog,div,dl,dt,fieldset,figcaption,figure,footer,form,' +
            'h1,h2,h3,h4,h5,h6,head,header,hgroup,hr,html,legend,li,menuitem,meta,' +
            'optgroup,option,param,rp,rt,source,style,summary,tbody,td,tfoot,th,thead,' +
            'title,tr,track'
        );
    }

    mustUseProp(tag: string, type: string, attr: string): boolean {
        return (
            (attr === 'value' && this.acceptValue(tag)) && type !== 'button' ||
            (attr === 'selected' && tag === 'option') ||
            (attr === 'checked' && tag === 'input') ||
            (attr === 'muted' && tag === 'video')
        )
    }

    getTagNamespace(tag: string): string | undefined | null {
        if (this.isSVG(tag)) {
            return 'svg'
        }
        if (tag === 'math') {
            return 'math'
        }
        return null;
    }

    options(): CompilerOptions {
        return {
            expectHTML: true,
            isPreTag: this.isPreTag,
            isUnaryTag: this.isUnaryTag,
            mustUseProp: this.mustUseProp.bind(this),
            canBeLeftOpenTag: this.canBeLeftOpenTag,
            isNonPhrasingTag: this.isNonPhrasingTag,
            getTagNamespace: this.getTagNamespace.bind(this),
        };
    }
}