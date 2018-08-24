import { TabBean, App, Menu, Item } from "../beans";

export default class TabUtil {
    /**
     * 获取正在活动的tab
     */
    static getVisibleTab(tabs: Array<TabBean>) {
        let tab = tabs.filter((tab)=>{
            return tab.visible;
        });
        return tab[0];
    }

    /**
     * 将指定的所有tab置为不活动
     * @param tabs 
     */
    static allTabUnVisible(tabs: Array<TabBean>) {
        tabs.forEach((tab)=>{
            tab.visible = false;
        });
    }

    /**
     * 比较两个tab是否相等
     * @param src 
     * @param dest 
     */
    static eq(src: TabBean, dest: TabBean) {
        if(src.item) {
            if(dest.item) {
                return this.itemEq(src.item, dest.item) && this.menuEq(src.menu, dest.menu) && this.appEq(src.app, dest.app);
            }else {
                return false;
            }
        }else {
            if(src.menu) {
                return this.appEq(src.app, dest.app) && this.menuEq(src.menu, dest.menu);
            }else {
                return this.appEq(src.app, dest.app);
            }
        }
    }

    static appEq(src: App| undefined, dest: App| undefined) {
        if(src) {
            if(dest) {
                if(src.key == dest.key) {
                    return true;
                }else {
                    return false;
                }
            }else {
                return false
            }
        }
        return true;
    }

    static menuEq(src: Menu|undefined, dest: Menu|undefined) {
        if(src) {
            if(dest) {
                if(src.key == dest.key) {
                    return true;
                }else {
                    return false;
                }
            }else {
                return false
            }
        }
        return true;
    }

    static itemEq(src: Item|undefined, dest: Item|undefined) {
        if(src) {
            if(dest) {
                if(src.key == dest.key) {
                    return true;
                }else {
                    return false;
                }
            }else {
                return false
            }
        }
        return true;
    }
}