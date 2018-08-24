import Constants from '../Constants';
import { Size } from '../beans';
/**
 * 单元格
 */
export default class Unit {
    private xCount: number;
    private yCount: number;
    private unit: number[];
    readonly length: number;

    constructor(size: Size) {
        this.xCount = this.getUnitX(size);
        this.yCount = this.getUnitY(size);
        this.unit = this.getUnit(this.xCount, this.yCount);
        this.length = this.unit.length;
    }

    //获取指定位置上的单元格的X坐标
    getX(index : number) {
        let a:any = index / 2;
        a = parseInt(a);
        let b = a % this.xCount;
        let c = b * Constants.APP_SIZE_NUMBER;
        return c;
    }
    //获取指定位置上的单元格的Y坐标
    getY(index: number) {
        let a = this.xCount * 2;
        let b:any = index / a;
        b = parseInt(b);
        let c = b * Constants.APP_SIZE_NUMBER * 2;
        let d = index % 2;
        let f = d * Constants.APP_SIZE_NUMBER;
        let h = c + f;
        return h;
    };
    //从当前元素至下一个x坐标为零,y坐标为当前坐标的两倍时的单元的个数
    nextCountNotX_to_0(index: number) {
        var count = 0;
        var unitXDouble = (this.xCount * 2);
        let a:any = index / unitXDouble;
        a = parseInt(a);
        let b = a * unitXDouble;
        for(var i = index; i < unitXDouble + b; i++) {
            if(!this.isFree(i)) {
                return count;
            }
            count++;
        }
        return count;
    };
    //是否被占用
    isFree(index: number) {
        let gearArray = new GearArray(this.unit);
        if(gearArray.contains(index)) {
            return true;
        }
        return false;
    };
    //根据空白的单元格判断可以放下什么类型的图标
    getCanPutAppType(unitCount: number) {
        if(unitCount >= 8) {
            return "big";
        }else if(unitCount >= 4) {
            return "normal";
        }else if(unitCount >= 1) {
            return "small";
        }
        return null;
    }

    /**
     * 
     * @param count 占用多少个单元格
     */
    use(count: number) {
        // let gearArray = new GearArray<number>(this.unit);
        // for(var n = 0; n < count; n++) {
        //     gearArray.removeByIndex(n);   
        // }
        this.unit.splice(0,count);
        // this.unit = gearArray.toArray();
    }

    /**
     * 计算单元格
     */
    public getUnit(xCount: number, yCount: number) {
        let unit = [];
        for(let i = 0; i < (xCount * yCount); i++) {
            unit.push(i);
        }
        return unit;
    }

    /**
     * X 轴上的单元格个数
     * @param size 
     */
    public getUnitX(size: Size) {
        let unitX:any = (size.width / Constants.APP_SIZE_NUMBER);
        return parseInt(unitX);
    }

    /**
     * Y 轴上的单元格个数
     * @param size 
     */
    public getUnitY(size: Size) {
        let unitY:any = (size.height / Constants.APP_SIZE_NUMBER);
        return parseInt(unitY);
    }
}