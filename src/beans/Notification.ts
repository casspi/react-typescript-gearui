export default interface Notification {
    total?: number;
    lastTime?: string;
    list?: Array<NotificationData>
}
export interface NotificationData {
    url: string;
    description: string;
    time: string;
    source: string;
    typeUrl: string;
    title: string;
    id: string;
    type: 'success' | 'info' | 'error' | 'warning';
}