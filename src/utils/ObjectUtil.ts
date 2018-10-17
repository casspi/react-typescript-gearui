import { UUID } from '../utils';

export default class ObjectUtil {

    static class2type = ObjectUtil.getClass2Type();

    static hasOwn = ObjectUtil.class2type.hasOwnProperty;

    static getProto = Object.getPrototypeOf;

    static fnToString = ObjectUtil.hasOwn.toString;

    static ObjectFunctionString = ObjectUtil.fnToString.call( Object );

    private static getClass2Type() {
        let class2type: any = [];
        "Boolean Number String Function Array Date RegExp Object Error Symbol".split( " " ).forEach(( name ) => {
            class2type[ "[object " + name + "]" ] = name.toLowerCase();
        });
        return class2type;
    }
    
    static extend(target?: any, object1?: any, ...objects: any[]) {
        var options, name, src, copy, copyIsArray, clone,
		target = arguments[ 0 ] || {},
		i = 1,
		length = arguments.length,
		deep = false;

        // Handle a deep copy situation
        if ( typeof target === "boolean" ) {
            deep = target;

            // Skip the boolean and the target
            target = arguments[ i ] || {};
            i++;
        }

        // Handle case when target is a string or something (possible in deep copy)
        if ( typeof target !== "object" && !this.isFunction( target ) ) {
            target = {};
        }

        // Extend jQuery itself if only one argument is passed
        if ( i === length ) {
            target = this;
            i--;
        }

        for ( ; i < length; i++ ) {

            // Only deal with non-null/undefined values
            if ( ( options = arguments[ i ] ) != null ) {

                // Extend the base object
                for ( name in options ) {
                    src = target[ name ];
                    copy = options[ name ];

                    // Prevent never-ending loop
                    if ( target === copy ) {
                        continue;
                    }

                    // Recurse if we're merging plain objects or arrays
                    if ( deep && copy && ( this.isPlainObject( copy ) ||
                        ( copyIsArray = Array.isArray( copy ) ) ) ) {

                        if ( copyIsArray ) {
                            copyIsArray = false;
                            clone = src && Array.isArray( src ) ? src : [];

                        } else {
                            clone = src && this.isPlainObject( src ) ? src : {};
                        }

                        // Never move original objects, clone them
                        target[ name ] = this.extend( deep, clone, copy );

                    // Don't bring in undefined values
                    } else if ( copy !== undefined ) {
                        target[ name ] = copy;
                    }
                }
            }
        }

        // Return the modified object
        return target;
    }

    static type(obj: any) {
		if ( obj == null ) {
			return obj + "";
		}

		// Support: Android <=2.3 only (functionish RegExp)
		return typeof obj === "object" || typeof obj === "function" ?
			this.class2type[ toString.call( obj ) ] || "object" :
			typeof obj;
    }
    
    static isFunction(obj: any) {
		return this.type( obj ) === "function";
    }
    
    static isPlainObject(obj: any) {
		var proto, Ctor;

		// Detect obvious negatives
		// Use toString instead of jQuery.type to catch host objects
		if ( !obj || toString.call( obj ) !== "[object Object]" ) {
			return false;
		}

		proto = this.getProto( obj );

		// Objects with no prototype (e.g., `Object.create( null )`) are plain
		if ( !proto ) {
			return true;
		}

		// Objects with prototype are plain iff they were constructed by a global Object function
		Ctor = this.hasOwn.call( proto, "constructor" ) && proto.constructor;
		return typeof Ctor === "function" && this.fnToString.call( Ctor ) === this.ObjectFunctionString;
	}

	static isEmptyObject(obj: any) {
		let name;

		for ( name in obj ) {
			return false;
		}
		return true;
    }
    
    /**
     * 将一个数组按其中的属性名称的值来分组
     * @param key 分组的属性名称
     * @param arr 需要分组的数组
     */
    static groupByKey(key: any, arr:Array<any>) {
        let dest = {};  
        for(let i = 0; i < arr.length; i++){  
            let ai = arr[i];  
            if(ai[key]) {
                dest[ai[key]] = dest[ai[key]]||[];
                dest[ai[key]].push(ai);
            }
        }
        return dest;  
    }

    /**
     * keySet
     * @param obj 
     */
    static keySet(obj: any) {
        let keys = [];
        for(let key in obj) {
            keys.push(key);
        }
        return keys;
    }

    /**
     * 从一个数组中删除一个对象
     * @param arr 数组
     * @param obj 需要删除的对象
     */
    static deleteFromArray(arr: Array<any>, obj: any) {
        let garr = new GearArray(arr);
        garr.remove(obj);
        return garr.toArray();
    }

    /**
     * 对一个数组进行排序（冒泡）
     * @param arr 需要排序的数组
     * @param desc 是否倒序
     * @param key 如果存在，代表数组中元素的一个key
     */
    static sort(arr: Array<any>,desc: boolean, key?: string) {
        // let tmp = null;
        for(let i=0; i < arr.length; i++) {
            for(let j=i; j < arr.length; j++) {
                let tempJ = arr[j];
                if(desc == true) {
                    if(key) {
                        if(arr[j][key] > arr[i][key]) {
                            arr[j] = arr[i];
                            arr[i] = tempJ;
                        }
                    }else {
                        if(arr[j] > arr[i]) {
                            arr[j] = arr[i];
                            arr[i] = tempJ;
                        }
                    }
                    
                }else {
                    if(key) {
                        if(arr[j][key] < arr[i][key]) {
                            arr[j] = arr[i];
                            arr[i] = tempJ;
                        }
                    }else {
                        if(arr[j] < arr[i]) {
                            arr[j] = arr[i];
                            arr[i] = tempJ;
                        }
                    }
                    
                }
            }
        }
    }

    /**
     * 从一个数组中获取 运算符运算结果后的最接近的一个值
     * @param arr 数组
     * @param val 值
     * @param operator 运算符
     * @param key 如果存在，代表数组中元素的一个key
     */
    static getNearFromCompareSize(arr: Array<any>, val: any, sort: boolean, key?: string): any {
        if(!arr || arr.length == 0) {
            return null;
        }
        let arrTemp = [];
        if(sort == true) {
            let arrTemp = ObjectUtil.extend([],arr);
            //先对数组倒序排列
            ObjectUtil.sort(arrTemp,true,key);
        }else {
            arrTemp = arr;
        }

        //获取数组的排列方式
        let desc = ((arr: Array<any>)=>{
            if(arrTemp[0] > arrTemp[1]) {
                return true;
            }
            return false;
        })(arrTemp);
        //先取中间的值
        let normalIndex:any = arr.length / 2;
        normalIndex = parseInt(normalIndex);
        let normal = arr[normalIndex];
        let arrTemp1 = arrTemp.splice(0,normalIndex);
        let arrTemp2 = arrTemp;
        if(arrTemp1.length == 1 || arrTemp2.length == 1) {
            return arrTemp1[0] || arrTemp2[0];
        }
        //倒序的比较
        if(desc == true) {
            if(val > normal) {
                return ObjectUtil.getNearFromCompareSize(arrTemp1,val,sort,key);
            }else {
                return ObjectUtil.getNearFromCompareSize(arrTemp2,val,sort,key);
            }
        }else {
            //正序的比较
            if(val < normal) {
                return ObjectUtil.getNearFromCompareSize(arrTemp1,val,sort,key);
            }else {
                return ObjectUtil.getNearFromCompareSize(arrTemp2,val,sort,key);
            }
        }
    }

    static toProps(options: any){
        let props = {};
        if(options){
            for(let key in options){
                let value = options[key];
                if("class"==key.toLowerCase()){
                    props["className"] = value;
                }else if("invalidmessage"==key.toLowerCase()){
                    props["invalidMessage"] = value;
                }else if("events"==key.toLowerCase()){
                    props["events"] = value;
                }else{
                    props[key.toLowerCase()] = value;
                }
            }
        }
        if(!props["id"]){
            props["id"] = UUID.get();
        }
        return props;
    }

    /* 
    * 检测对象是否是空对象(不包含任何可读属性)。 //如你上面的那个对象就是不含任何可读属性
    * 方法只既检测对象本身的属性，不检测从原型继承的属性。 
    */
    static isOwnEmpty(obj: any) { 
        for(var name in obj) 
        { 
            if(obj.hasOwnProperty(name)) 
            { 
                return false; 
            } 
        } 
        return true; 
    }

    static isBasicType(ele: any) {
        if(ele === String || ele === Number || ele === Boolean || ele === Function || ele === Object || ele === Array || ele === Symbol) {
            return true;
        }
        return false;
    }

    static isExtends(clazz: any, parent: string):boolean {
        if(clazz && !(clazz instanceof Function) && clazz.__proto__ && clazz.__proto__ != Object && clazz.__proto__.constructor) {
            clazz = clazz.__proto__.constructor;
        }
        if(clazz && clazz.toString() && clazz.name != "Object") {
            if(ObjectUtil.isInstance(clazz, parent)) {
                return true;
            }
            return ObjectUtil.isExtends(clazz.__proto__, parent);
        }
        return false;
    }

    static isInstance(clazz: any, name: string) {
        let clazzStr = clazz.toString();
        let clazzRegExp = new RegExp("function[ ]{1,}" + name + "[ ]?\\(");
        if(clazzRegExp.test(clazzStr)) {
            return true;
        }
        return false;
    }

    static newVoidInstance<T>(): T {
        let o: any = null;
        return o;
    }

    // 将字符串转换为函数，如果传入值本身就是函数则不转换，直接返回
    static toFunction(obj: any){
        if(obj){
            if(typeof obj=="string")
                obj = window[obj.replace("()","").replace(";","")];
            if(typeof obj=="function")
                return obj;
        }
        return null;
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

    // 是否字符串
    static isString(str: any){
        return (str!=null && typeof str =="string")
    }   

    // 是否是true
    static isTrue(str: any){
        if(str!=null && typeof str=="boolean")
            return str;
        return (str!=null && str=="true");
    }

    // 是否为空对象
    static isEmpty(e: any){
        if(e){
            if(e instanceof Array)
                if(e.length==0)
                    return true;
                else
                    return false;
            else if(typeof e == "string")
                if((e+"").length==0)
                    return true;
                else
                    return false;
            else if(typeof e == "object")
                return this.isEmptyObject(e);
            else
                return false;
        }else
            return true;
    }

    /**
     * 对象中的所有的值都转换成string
     * @param value 
     */
    static valueToString(value: any) {
        for(let key in value) {
            value[key] = value[key] + "";
        }
        return value;
    }

    // 比较两个对象值是否相同
    static isValueEqual(v1: any,v2: any){
        if(v1==null && v2==null)
            return true;
        if(v1==null || v2==null)
            return false;
        if(v1===v2){
            return true;
        }
        if(v1 instanceof Array && v2 instanceof Array){
            if(v1.length != v2.length)
                return false;
            for(var i = 0; i < v1.length; i++){
                if (this.isValueEqual(v1[i],v2[i])==false) {
                    return false;
                }
            }
            return true;
        }else if(v1 instanceof Object && v2 instanceof Object){
            var aProps = Object.getOwnPropertyNames(v1);
            var bProps = Object.getOwnPropertyNames(v2);
 
            if (aProps.length != bProps.length) 
                return false;
            
            for (var i = 0; i < aProps.length; i++) {
                var propName = aProps[i];
                if (this.isValueEqual(v1[propName],v2[propName])==false) {
                    return false;
                }
            }
            return true;
        }
        return false;
    }

    // 解析字符串中的动态值{value}，支持以下几种格式
    // {name}  默认处理方式，对部分html中的特殊字符进行转义，以防止破坏html格式
    // {!name} 变量前有!，表示对获得的值要做转码处理，一般用于url
    // {#name} 变量前有#，表示对获得的值不作任何处理
    // {name:defaultValue} 可以在变量名称后指定默认值，当变量值取不到时使用默认值
    // {!name:"defaultValue"} 可以为默认值加引号括起来，表示这个默认值是未转码过的，如果变量前有!，则应对默认值同样转码
    // {!(age>34?'老了':'有点老了'):"defaultValue"} 也可以使用表达式
    static parseDynamicValue(text:string,data: any){
        try {
            if(text && typeof text == "string"){
                // 原始值在后台会被转义，因此这里需做一次反转义
                text = text.replace(/&amp;/g,"&")
                            .replace(/&lt;/g,"<")
                            .replace(/&gt;/g,">")
                            .replace(/&nbsp;/g," ")
                            .replace(/&#39;/g,"\'")
                            .replace(/&quot;/g,"\"");                   
                //正则表达式中使用{}两个符号作为判断边界，因此如果表达式中如果使用这两个字符需转义   
                //console.log(text);           
            	text = text.replace(/\\\{/g,"&#7B;").replace(/\\\}/g,"&#7D;");
                text = text.replace(/\{([\!\#]?)((?:[a-zA-Z0-9_\-]+)|(?:\([^{}]+\)))(\:([^{}]*?))?\}/g,function(match,m0,m1,m2,m3){
					// m0：感叹号，如果有值表示值需要做编码处理
					// m1：变量名
					// m2：默认值段，不存在则表示无默认值
                    // m3：默认值		
					var value = null;
                    var propertyName = m1;
                    if (data[propertyName] != null) {
                        value = data[propertyName];
                        if(value && typeof value == "object"){
                            value = JSON.stringify(value);
                        }                   
                    }else if(/^\(.+\)$/.test(propertyName)){
                        // 用括号括起的，认为可能是表达式，下面去除括号
                        propertyName = propertyName.substring(1,propertyName.length-1);
                        // 取消对{}两个字符的转义
                        propertyName = propertyName.replace(/\&\#7B;/g,"{").replace(/\&\#7D;/g,"}");                        
						var fun = function(){
                            var script;
							try{
								var expression = "";
								for(var k in data){
									var v = data[k];
									if(v!=null){
                                        if(typeof v == "object"){
                                            v = JSON.stringify(v);
                                        }
										if(typeof v == "string"){
                                            expression = expression + "var "+k+"=\""+(v+"").replace(/\\/g,"\\\\").replace(/\"/g,"\\\"").replace(/\n/g,"\\n").replace(/\r/g,"\\r")+"\";\n";
										}else{
                                            v = v + "";
                                            if(v.length==0)
                                                expression = expression + "var "+k+"=null;\n";
                                            else
											    expression = expression + "var "+k+"="+v+";\n";
										}
									}else{
										expression = expression + "var "+k+"=null;\n";
									}
                                }
                                script = expression+propertyName;
								return eval(script);
							} catch (error) {
                                console.error("=======================================");
                                console.error(script);
                                console.error("=======================================");
								console.error(error);
								return null;
							}  							
						};
						value = fun.call(this);
					}
					if(value==null){
						if(m2 && m3){
							if(/^".+"$/.test(m3) || /^'.+'$/.test(m3)){
								// 是使用引号包起来的，则认为是原始值，如果有!则需要转义
								value = m3.replace(/^"(.+)"$/,"$1").replace(/^'(.+)'$/,"$1");
							}else{
								// 不需要转义
								m0 = "";
								value = m3;
							}
						}
                    }
					if(value==null)
						return "";
					else if(m0=="!")
                        return encodeURIComponent(value);
                    else if(m0=="#")
						return value;
					else{
                        return (value+"").replace(/&/g, '&amp;')
                                    .replace(/"/g, '&quot;')
                                    .replace(/'/g, '&#39;')
                                    .replace(/</g, '&lt;')
                                    .replace(/>/g, '&gt;')
                                    .replace(/\n/g, '&#10;');
                    }
                });
                // 取消对{}两个字符的转义
                text = text.replace(/\&\#7B;/g,"{").replace(/\&\#7D;/g,"}");
            }
            return text; 
        } catch (error) {
			console.error(error);
            return text;
        }      
    }

    //解析props中的动态值
    public static parseDynamicProps(props: any, value: any) {
        let propsNew: any = {};
        for(let key in props) {
            key = ObjectUtil.parseDynamicValue(key, value);
            let valueInProps = ObjectUtil.parseDynamicValue(props[key], value);
            propsNew[key] = valueInProps;
        }
        return propsNew;
    }
}