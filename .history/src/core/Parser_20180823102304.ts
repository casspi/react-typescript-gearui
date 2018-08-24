import ParseHtml from "../core/ParseHtml";
import { GearUtil } from "../utils";

export default class Parser {

    public parse(el: string|Element): {asts: ASTElement[], parent: Element} {
        let html:string = "";
        let parent:any = null;
        if(typeof el === "string") {
            
            let match;
			if ( el[ 0 ] === "<" && el[ el.length - 1 ] === ">" && el.length >= 3 ) {
                match = [ null, el, null ];
            } else {
                match = Constants.RQUICK_EXPR.exec( el );
            }
            // HANDLE: $(html) -> $(array)
            if ( match && match[ 1 ] ) {
                html = el;
                parent = document.body.appendChild(document.createElement("span"));

            } else {
                // HANDLE: $(#id)||$(exp)
                let elJ = G.G$(el);
                html = elJ.prop("outerHTML");
                parent = G.G$("<span></span>");
                parent.insertAfter(elJ);
                parent = parent[0];
                elJ.remove();
            }
        }else {
            if(el != document.body) {
                let elJ = G.G$(el);
                html = elJ.prop("outerHTML");
                parent = G.G$("<span></span>");
                parent.insertAfter(el);
                parent = parent[0];
                elJ.remove();
            }else {
                let elJ = G.G$(el);
                html = elJ[0].innerHTML;
                parent = G.G$("<span></span>");
                elJ.html(parent);
                parent = parent[0];
            }
        }
        let parserHtml = new ParseHtml();
        html = "<div>" + html + "</div>";
        let ast:ASTElement = parserHtml.parse(html);
        return {
            asts: ast.children,
            parent: parent
        };
    }

    public parseToReactInstance(html: string) {
        let parserHtml = new ParseHtml();
        html = "<div>" + html + "</div>";
        let ast:ASTElement = parserHtml.parse(html);
        let reactEles: any = [];
        ast.children.forEach((ast)=>{
            let reactEle = GearUtil.newReactInstance(ast);
            reactEles.push(reactEle);
        });
        return reactEles;
    }
}