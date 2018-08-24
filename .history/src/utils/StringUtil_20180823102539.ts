export default class StringUtil {

    public static maxLength(val: string, length: number, adonAfter?: string): string {
        if(val.length > length) {
            val = val.substring(0, length) + (adonAfter || '...');
        }
        return val;
    }

    static isIp(value: any) {
        return /^(?:(?:1[0-9][0-9]\.)|(?:2[0-4][0-9]\.)|(?:25[0-5]\.)|(?:[1-9][0-9]\.)|(?:[0-9]\.)){3}(?:(?:1[0-9][0-9])|(?:2[0-4][0-9])|(?:25[0-5])|(?:[1-9][0-9])|(?:[0-9]))$/.test(value);
    }

    static isMac(value: any) {
        return /[A-F\d]{2}:[A-F\d]{2}:[A-F\d]{2}:[A-F\d]{2}:[A-F\d]{2}:[A-F\d]{2}/.test(value);
    }

    //整型解析为IP地址
    static int2iP(num: any){
        var str;
        var tt = new Array();
        tt[0] = (num >>> 24) >>> 0;
        tt[1] = ((num << 8) >>> 24) >>> 0;
        tt[2] = (num << 16) >>> 24;
        tt[3] = (num << 24) >>> 24;
        str = String(tt[0]) + "." + String(tt[1]) + "." + String(tt[2]) + "." + String(tt[3]);
        return str;
    }

    //IP转成整型
    static ip2int(ip: any){
        var num = 0;
        let ipArr = ip.split(".");
        num = Number(ipArr[0]) * 256 * 256 * 256 + Number(ipArr[1]) * 256 * 256 + Number(ipArr[2]) * 256 + Number(ipArr[3]);
        num = num >>> 0;
        return num;
    }

    // 是否整数
    static isInteger(str: any){
        if(str!=null && (typeof str =="string" || typeof str =="number"))
            return /^\d+$/.test(str+"");
        return false;
    }

    // 是否数字
    static isNumber(str: any){
        if(str!=null && typeof str =="number")
            return true;
        else if(str!=null && typeof str =="string")
            return /^\d+(\.\d+)?$/.test(str);
        return false;
    }

    static zeroize_mac(value: any) {
        var strs = value.split(":");
        var pStrs = new GearArray();
        for(var i = 0; i < strs.length; i++) {
        	if(strs[i].length == 1) {
        		pStrs.add("0" + strs[i]);
        	}else if(strs[i].length == 0){
        		pStrs.add("00");
        	}else {
        		pStrs.add(strs[i]);
        	}
        }
        return pStrs.toString(":");
    }

    static isHtmlString(html: string) {
        let match;
        if ( html[ 0 ] === "<" && html[ html.length - 1 ] === ">" && html.length >= 3 ) {
            match = [ null, html, null ];
        } else {
            match = Constants.RQUICK_EXPR.exec( html );
        }
        // HANDLE: $(html) -> $(array)
        if ( match && match[ 1 ] ) {
            return true;
        }
        return false;
    }
}