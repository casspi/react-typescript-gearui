class Constants {
    //属性和方法名重名时，方法的扩展名
    static EXPAND_NAME:string = '_g_';
    //应用图标的基准大小
    static APP_SIZE_NUMBER:number = 64;
    //应用图标的间隙
    static APP_PADDING: number = 8;

    static APP_NORMAL: string = 'normal';

    static APP_BIG: string = 'big';

    static APP_SMALL: string = 'small';

    static REDIRECT: string = 'redirect';

    static ROOT: string = window["_p_root"] || "/_p";

    static FILTER_PATH: string = window["_p_filterPath"] || "*"+ Constants.ROOT +"/index.html";

    //登录页面
    static LOGINPATH = Constants.ROOT + '/login';

    static RELOGINPATH = Constants.ROOT + '/reLogin';

    static MAINPATH = Constants.ROOT + '/desk';

    static SESSION_COOKIENAME = '__gsessionId';

    //标签匹配
    static RQUICK_EXPR = /^(?:\s*(<[\w\W]+>)[^>]*|#([\w-]+))$/;

    static TYPE = {
        String: "_g_string",
        Boolean: "_g_boolean",
        Number: "_g_number",
        Object: "_g_object",
        Function: "_g_function",
        Array: "_g_array",
        Undefined: "_g_undefined",
        Null: "_g_null",
        RegExp: "_g_RegExp",
        CssProperties: "_g_CssProperties",
        Any: "_g_any",
    };
}
window.Constants = <any>Constants;