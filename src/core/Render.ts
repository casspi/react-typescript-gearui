import * as ReactDOM from 'react-dom';
import { GearUtil } from '../utils';
export default class Render {

    /**
     * 渲染
     * @param asts ast树
     * @param parent 没有parent相当于从html直接渲染
     */
    public render(ast: ASTElement, parent: Element, callback?: Function) {
        let reactEles: any = [];
        let asts = ast.children;
        asts.forEach((ast)=>{
            let reactEle = GearUtil.newReactInstance(ast);
            reactEles.push(reactEle);
        });
        ReactDOM.render(reactEles, parent, ()=>{
            if(callback) {
                let childrenTags: any = [];
                let children = G.G$(parent).children();
                children.each((index, ele)=>{
                    childrenTags.push(G.$(ele));
                });
                callback.call(window, childrenTags);
            }
        });
    }
}