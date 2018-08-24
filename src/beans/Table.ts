import App from './App';
import { Size } from './index';
import Constants from '../Constants';
const appSizeNumber = Constants.APP_SIZE_NUMBER;
export default class Table {

    private trs: Array<Tr> = [];
    private size: Size;
    private firstFreeTd: Td | null;
    private index: number;
    private initTdSize: number;

    readonly style = {
        margin: '0 auto'
    };

    readonly cellPadding = Constants.APP_PADDING / 2;
    
    constructor(index: number) {
        this.size = this.getSize();
        //创建tr
        this.createTrs();
        if(this.trs.length > 0) {
            this.initTdSize = this.trs[0].getTds().length;
        }
        //初始化的时候空置td默认为第一个
        this.firstFreeTd = this.trs[0] ? this.trs[0].getTds()[0] : null;
        this.index = index;
    }

    getInitTdSize() {
        return this.initTdSize;
    }

    getIndex() {
        return this.index;
    }

    createTrs() {
        let trSize = this.getTrSize();
        for(let i = 0; i < trSize; i++) {
            let tr = new Tr(this.size.width,i , this.trs[i - 1]);
            this.trs.push(tr);
        }
    }

    getSize():Size {
        return {
            width: window.innerWidth - 80,
            height: window.innerHeight - 80
        };
        // return {width: 1200, height: 535};
    }

    putApp(app: App) {
        
        let firstFreeTd = this.firstFreeTd;
        if(firstFreeTd) {
            //获取下一个可放置应用的td
            let canPutAppTd = firstFreeTd.getNextFreeCanPutApp(app);
            if(canPutAppTd) {

                // canPutAppTd.

                // let needRemoveTdFromX = colspan - 1;//横向需要删除的td个数
                
                // canPutAppTd.setColspan(colspan);
                // canPutAppTd.setRowspan(rowspan);
                // let tr = this.trs[canPutAppTd.getTrIndex()];
                // tr.remove(canPutAppTd,needRemoveTdFromX);
                // let tdTemp = canPutAppTd;
                // for(let i = 1; i < rowspan; i++) {
                //     tdTemp = tdTemp.yNext;
                //     let nextTr = this.trs[canPutAppTd.getTrIndex() + 1];
                //     nextTr.removeByRowspan(tdTemp,needRemoveTdFromX, canPutAppTd);
                // }
                // if(canPutAppTd == firstFreeTd) {
                //     this.firstFreeTd = firstFreeTd.nextFree;
                // }
                canPutAppTd.setApp(app);
                if(canPutAppTd == firstFreeTd) {
                    this.firstFreeTd = firstFreeTd.nextFree;
                }
                return true;
            }
        }
        
        return false;
    }

    getTrs() {
        return this.trs;
    }

    /**
     * 获取tr个数
     */
    getTrSize() {
        return parseInt((this.size.height / appSizeNumber).toString());
    }

}

export class Tr {

    private tds: Array<Td> = [];
    private width: number;
    next: Tr;
    prev: Tr;

    // private first: Td;
    // private last: Td;

    private trIndex: number;

    constructor(width: number,index: number, prev?: Tr) {
        this.trIndex = index;
        if(prev != null) {
            this.prev = prev;
            prev.next = this;
        }
        this.width = width;
        //创建td
        this.createTds();
    }

    getTrIndex() {
        return this.trIndex;
    }

    createTds() {
        let tdSize = this.getTdSize();
        for(let i = 0; i < tdSize; i++) {
            let td = new Td(this, this.trIndex,i);
            this.tds.push(td);
        }
        // this.first = this.tds[0];
        // this.last = this.tds[this.tds.length - 1];
    }

    getTds() {
        return this.tds;
    }

    getTdSize() {
        return parseInt((this.width / appSizeNumber).toString());
    }

    /**
     * 所有的td的rowspan是否相等
     */
    allRowspanEq() {
        let rowspan: any = null;
        let eq = true;
        this.tds.forEach((td: Td)=>{
            if(rowspan == null) {
                rowspan = td.getRowspan();
            }else {
                if(rowspan != td.getRowspan()) {
                    eq = false;
                    //return eq;
                }
            }
        });
        return eq;
    }
    
    // /**
    //  * 行合并清况下的删除
    //  * @param from 指定位置
    //  * @param size 指定个数
    //  * @param rowspanTd 行合并的结果td
    //  */
    // removeByRowspan(from: Td,size: number,rowspanTd: Td) {
    //     if(size > 0) {
    //         //先从当前位置开始删除后面的size个td，因为rowspan需要占用当前起始位置的td，所以在处理完成之后再删除自身
    //         this.remove(from,size);
    //         let prev = from.prev;
    //         let next = from.next;
    //         let yNext = from.yNext;
    //         let prevFree = from.prevFree;
    //         let nextFree = from.nextFree;

    //         if(prev) {
    //             prev.next = rowspanTd;
    //         }

    //         if(next) {
    //             next.prev = rowspanTd;
    //         }
            
    //         if(prevFree) {
    //             prevFree.nextFree = nextFree;
    //         }
            
    //         if(nextFree) {
    //             nextFree.prevFree = prevFree;
    //         }
            
    //         if(rowspanTd) {
    //             rowspanTd.yNext = yNext;
    //         }

    //         if(yNext) {
    //             yNext.yPrev = rowspanTd;
    //         }
        
    //         //删除自身
    //         this.tds.splice(from.getTdIndex(),1);
    //     }
    //     this.resetTdIndex();
    // }

    // /**
    //  * 从指定位置删除指定个数的td
    //  * @param from 指定位置
    //  * @param size 指定个数
    //  */
    // remove(from: Td,size: number) {
    //     for(let i=0;i< size; i++) {
    //         let next = from.next;
    //         if(next) {
    //             let nextNext = next.next;
    //             let nextNextFree = next.nextFree;
    //             let nextPrevFree = next.prevFree;
    //             let nextYNext = next.yNext;
    //             let nextYPrev = next.yPrev;
    //             let tdIndex = next.getTdIndex();

    //             if(nextNext) {
    //                 nextNext.prev = from;
    //                 from.next = nextNext;
    //                 if(next.getTrIndex() == nextNext.getTrIndex()) {
    //                     nextNext.setTdIndex(next.getTdIndex());
    //                 }
    //             }
                
    //             if(nextNextFree) {
    //                 nextNextFree.prevFree = nextPrevFree;
    //             }
                
    //             if(nextPrevFree) {
    //                 nextPrevFree.nextFree = nextNextFree;
    //             }
                
    //             if(nextYNext) {
    //                 nextYNext.yPrev = from;
    //             }

    //             if(nextYPrev) {
    //                 nextYPrev.yNext = from;
    //             }
    //         }
    //     }
    //     this.tds.splice(from.getTdIndex() + 1, size);
    //     this.resetTdIndex();
    // }

    /**
     * 删除一个td
     * @param td td 或者td的下标
     */
    remove(td: (Td | number)) {
        if(td instanceof Td) {
            this.tds.splice(this.tds.indexOf(td), 1);
        }else {
            this.tds.splice(td, 1);
        }
    }

    get(index: number) {
        return this.tds[index];
    }

    //获取本行最后一个td
    getLast() {
        return this.tds[this.tds.length - 1];
    }

    //获取本行第一个td
    getFirst() {
        return this.tds[0];
    }

    // /**
    //  * 重置td下标
    //  */
    // resetTdIndex() {
    //     for(let i=0; i < this.tds.length; i++) {
    //         let td = this.tds[i];
    //         td.setTdIndex(i);
    //     }
    // }

    static appNeed(app: App) {
        if(app.appSize == Constants.APP_BIG || app.appSize == Constants.APP_NORMAL) {
            return 2;
        }else {
            return 1;
        }
    }
}

export class Td {
    private colspan: number;
    private rowspan: number;
    private app: App;
    private width: number = appSizeNumber;
    private height: number = appSizeNumber;

    private trIndex: number;

    private tdIndex: number;

    tr: Tr;

    next: Td;
    prev: Td;

    //下一个空置的td
    nextFree: Td;
    //上一个空置的td
    prevFree: Td;

    private free: boolean = true;

    constructor(tr: Tr,trIndex:number, index: number) {
        this.tr = tr;
        this.trIndex = trIndex;
        this.tdIndex = index;
        // if(prev != null) {
        //     this.prev = prev;
        //     prev.next = this;
        //     prev.nextFree = this;
        //     this.prevFree = prev;
        // }
        // let yNext = tr.next ? tr.next.getTds()[this.tdIndex] : null;
        // this.yNext = yNext;
        // if(yNext) {
        //     yNext.yPrev = this;
        // }
        //获取y轴上的前一个td
        let yPrev = tr.prev ? tr.prev.getTds()[this.tdIndex] : null;
        //判断当前的tr的下标是不是奇数
        let trIndexType = (trIndex % 2 != 0);
        //将td按两行一分组，进行串联。例如: [0][0].next = [1][0];[1][0].prev = [0][0];[1][0].next = [0][1];[0][1].prev = [1][0];....
        if(trIndexType && yPrev) {
            this.prev = yPrev;
            this.prev.next = this;
            this.prevFree = this.prev;
            this.prevFree.nextFree = this;
            let next = this.prev.tr.get(this.prev.getTdIndex() + 1);
            if(next) {
                this.next = next;
                this.next.prev = this;
                this.nextFree = next;
                this.nextFree.prevFree = this;
            }
        }else {
            //第三行的第一个td和第二行的最后一个td进行连接
            let trPrev = tr.prev;
            if(trPrev && this.getTdIndex() == 0) {
                let prev = trPrev.getLast();
                this.prev = prev;
                this.prev.next = this;
                this.prevFree = this.prev;
                this.prevFree.nextFree = this;
            }
        }
        // let xPrev = tr.get(this.tdIndex - 1);
        // if(xPrev) {
        //     xPrev.xNext = this;
        //     this.xPrev = xPrev;
        // }
    }

    /**
     * 设置应用
     * @param app 应用
     */
    setApp(app: App) {
        this.app = app;
        let tdNeed = Td.appNeed(app);
        //只需要删除 tdNeed - 1个td,例如：如果应用需要占用8个td，那就只需要删除7个td就可以了。相当于把另外七个td并入当前td中
        while(tdNeed > 1) {
            this.removeNext();
            tdNeed -= 1;
        }
        let rowspan = Tr.appNeed(app);
        this.setRowspan(rowspan);
        tdNeed = Td.appNeed(app);
        let colspan = tdNeed / rowspan;
        this.setColspan(colspan);
        this.use();
    }

    /**
     * 删除下一个td
     */
    removeNext() {
        let next = this.next;

        // let nextPrev = next.prev;
        this.next = next.next;
        if(next.next) {
            next.next.prev = this;
            this.nextFree = next.next;
            next.next.prevFree = this;
        }
        let nextTr = next.tr;
        nextTr.remove(next);
        // nextTr.resetTdIndex();
    }

    setColspan(colspan: number) {
        this.colspan = colspan;
    }

    setRowspan(rowspan: number) {
        this.rowspan = rowspan;
    }

    /**
     * 将当前td设置为已使用
     */
    use() {
        this.free = false;
        //重置free链
        let prevFree = this.prevFree;
        let nextFree = this.nextFree;
        if(nextFree) {
            nextFree.prevFree = prevFree;
        }
        if(prevFree) {
            prevFree.nextFree = nextFree;
        }
    }

    getTrIndex() {
        return this.trIndex;
    }

    setTdIndex(tdIndex: any) {
        this.tdIndex = tdIndex;
    }

    getTdIndex() {
        return this.tdIndex;
    }

    isFree() {
        return this.free;
    }

    /**
     * 下一个是否是空置并且相连
     */
    nextIsConnect() {
        if((this.next.getTrIndex() - 1 == this.getTrIndex() && this.next.getTdIndex() == this.getTdIndex()) || (this.next.getTrIndex() + 1 == this.getTrIndex() && this.next.getTdIndex() - 1 == this.getTdIndex())) {
            return true;
        }
        return false;
    }

    /**
     * 获取能放下app的td，包括自身
     * @param app 
     */
    getNextFreeCanPutApp(app: App):Td|null {
        if(this.canPutApp(app)) {
            return this;
        }else {
            if(this.nextFree) {
                return this.nextFree.getNextFreeCanPutApp(app);
            }
        }
        return null;
    }

    //当前td是否可以放下应用
    canPutApp(app: App) {
        let needTd = Td.appNeed(app);
        // let needTr = Tr.appNeed(app);
        if(needTd == 1) {
            return true;
        }else {
            //如果占用td超过1个，就需要从偶数行开始
            if(this.getTrIndex() % 2 == 0) {
                let tdTemp: Td = this;
                while(needTd > 0) {
                    if(tdTemp.next && tdTemp.next.isFree() && tdTemp.nextIsConnect()) {
                        needTd -= 1;
                        tdTemp = tdTemp.next;
                    }else {
                        break;
                    }
                }
                if(needTd > 1) {
                    return false;
                }
                return true;
            }
            return false;
        }
    }

    getApp() {
        return this.app;
    }

    getColspan() {
        return this.colspan || 1;
    }

    getRowspan() {
        return this.rowspan || 1;
    }

    getWidth() {
        return this.width;
    }

    getHeight() {
        return this.height;
    }

    static appNeed(app: App) {
        if(app.appSize == Constants.APP_BIG) {
            return 8;
        }else if(app.appSize == Constants.APP_NORMAL) {
            return 4;
        }else {
            return 1;
        }
    }
}