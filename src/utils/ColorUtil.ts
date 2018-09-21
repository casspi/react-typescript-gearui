const appColors = ["#1ba0e1","#5135ac","#d34827","#00a000","#0d58bd","#2d86ee","#b71c46","#9d00a5","#00849b","#da5824"];
export default class ColorUtil {
    static getColor(){  
        var color="#";  
        for(var i=0;i<6;i++){  
            color += (Math.random()*16 | 0).toString(16);  
        }  
        return color;  
    }

    private static colorIndex = 0;
    //应用的随机颜色
    static getBgColor() {
        if(this.colorIndex >= appColors.length) {
        	this.colorIndex = 0;
    	}
        var color = appColors[this.colorIndex];
        this.colorIndex += 1;
        return color;
    };
    //格式化颜色代码
    public static getValidColor(value: any) {
        if(value) {
            if(value.length > 6) {
                value = value.substring(0,6);
            }else if(value.length != 3){
                let zeroLength = 6 - value.length;
                let zero = "000000".substr(0,zeroLength);
                value = value + zero;
            }
        }
        return value;
    }
}