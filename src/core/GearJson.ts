import { GearUtil } from '../utils';
export default class GearJson<T> {
    private objs:{[idx:string]: T} = {};
    constructor(objs?: any){
        if(objs) {
            this.objs = objs;
        }else {
            this.objs = {};
        }
    }
    put(name:string,obj: T) {
        this.objs[name+""] = obj;
    }
    get(name:string):T {
        return this.objs[name+""];
    }
    toJson():{[idx:string]: T} {
        return this.objs;
    }
    static fromStyle(val:string):GearJson<string> {
        let json = new GearJson<string>();
        if(val) {
            let valArr = val.split(";");
            valArr.forEach(function(val,index) {
                let item = val;
                let itemArr = item.split(":");
                if(itemArr.length > 1) {
                    json.put(GearUtil.parseStyleType(itemArr[0].trim()),itemArr[1].trim().replace(";",""));
                }
            });
        }
        return json;
    }

    static fromString(val:string):GearJson<string>|undefined {
        if(val) {
            val = "{" + val + "}";
            val = eval("(" + val + ")");
            return new GearJson(val);
        }
        return undefined;
    }

    toString():string {
        return JSON.stringify(this.objs);
    }

    forEach(callback:((key:string,value:T) => void)) {
        for(let key in this.objs) {
            callback(key,this.objs[key]);
        }
    }

    clear() {
        delete this.objs;
        this.objs = {};
    }
}
window.GearJson = <any>GearJson;