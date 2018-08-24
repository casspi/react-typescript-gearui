export default interface Token {

    //登录状态： 0成功
    status: number;
    //信息
    message: string;
    //登录成功后转向的地址
    url: string;
    //参数
    properties: any;
    rule: any;

}