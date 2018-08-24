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
}