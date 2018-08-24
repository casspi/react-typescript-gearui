import ObjectUtil from "../utils/ObjectUtil";

class GearArray<T> {
    private arr:Array<T> = [];
    constructor(arr?: Array<T>) {
        if(arr != null) {
            if(arr instanceof Array) {
                this.arr = arr;
            }else {
                this.arr = [arr];
            }
        }else {
            this.arr = [];
        }
    }

    indexOf(ele: T) {
        for(var i = 0; i < this.arr.length; i++) {
            if(this.arr[i] === ele) {
                return i;
            }
        }
        return -1;
    }

    //字符串转换成array
    static fromString (val:string,split:string) {
        if(val != null) {
            let array = new GearArray<string>();
            array.arr = val.split(split);
            return array;
        }
        return null;
    }

    addAll(arr:Array<T>) {
        this.arr = this.arr.concat(arr);
    }

    toArray() {
        return this.arr;
    }
    get(index:number) {
        return this.arr[index];
    }

    add(obj:T) {
        this.arr.push(obj);
    }

    insert(obj:T,index:number) {
        this.arr.splice(index,0,obj);
    }

    length():number {
        return this.arr.length;
    }

    toString(split?:string):string {
        split = split||",";
        let str = "";
        for(var i = 0; i < this.arr.length; i++) {
            if(i > 0) {
                str += split;
            }
            str += this.arr[i];
        }
        return str;
    }

    clone(deep?: boolean):GearArray<T> {
        var arr = new Array();
        for(var i = 0; i < this.arr.length;i++) {
            let item = this.arr[i];
        	if((typeof item) == "object" && deep == true) {
        		arr.push(ObjectUtil.extend(typeof deep != "boolean" ? false : deep,{},this.arr[i]));
        	}else {
        		arr.push(this.arr[i]);
        	}
        }
        return new GearArray<T>(arr);
    }

    contains(ele:T):boolean {
        for(var i = 0; i < this.arr.length; i++) {
            if(this.arr[i] === ele) {
                return true;
            }
        }
        return false;
    }

    remove(ele:T) {
        let eleRe = null;
        for (var i = 0; i < this.arr.length; i++) {
            if (this.arr[i] === ele) {
                eleRe = this.arr.splice(i, 1);
                i--;
            }
        }
        return eleRe;
    }

    removeByIndex(ele?: number) {
        for (var i = 0; i < this.arr.length; i++) {
            if (ele === i) {
                return this.arr.splice(i, 1);
            }
        }
        return null;
    }    

    up(ele:T|number) {
        let index: number|undefined = -1;
        if(typeof ele != "number") {
            index = this.indexOf(ele);
        }
        let eleInner = this.removeByIndex(index);
        if(index != null && index > 0 && eleInner != null) {
            this.insert(eleInner[0],index - 1);
        }   
    }

    down(ele:T|number) {
        let index: number|undefined = -1;
        if(typeof ele != "number") {
            index = this.indexOf(ele);
        }
        let eleInner = this.removeByIndex(index);
        if(index != null && index < this.arr.length && eleInner != null) {
            this.insert(eleInner[0],index + 1);
        }  
    }
}
window.GearArray = <any>GearArray;