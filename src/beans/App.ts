/**
 * 应用
 */
import Menu from './Menu';
export default interface App {
    appId: string;
    appName: string;
    key: string;
    menus?: Array<Menu>;
    appDescription?: string;
    appSize?: string;
    __isPut?: string;
    width?: number;
    height?: number;
    sortIndex?: number;
    background: string;
    appUrl: string;
    
}