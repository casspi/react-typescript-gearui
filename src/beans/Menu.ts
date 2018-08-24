/**
 * 一级菜单
 */
import Item from './Item';
export default interface Menu {
    menuId: string;
    menuName: string;
    key: string;
    items?: Array<Item>;
    __isPut?: string;
    menuUrl: string;
}