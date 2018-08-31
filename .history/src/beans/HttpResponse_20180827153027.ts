// 网络请求返回的信息
export default class HttpResponse {
    success: boolean;
    message: string;
    statuCode: number;
    data: any|undefined;

    constructor(success: boolean, message: string, statuCode: number, data?: object) {
        this.success = success;
        this.message = message;
        this.statuCode = statuCode;
        this.data = data;
    }
}