/**
 * 桌面数据
 */
import App from './App';
import { Tool, LoginInfo, Notification } from '.';
export default interface Platform {
    applications?: Array<App>;
    friends?: Array<any>;
    loginInfo?: LoginInfo;
    status?: number;
    tools?: Tool;
    systemNotification?: Notification;
}