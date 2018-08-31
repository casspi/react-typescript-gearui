export var GearType = {
    String: "_g_string",
    Boolean: "_g_boolean",
    Number: "_g_number",
    Object: "_g_object",
    Function: "_g_function",
    Array: "_g_array",
    Undefined: "_g_undefined",
    Null: "_g_null",
    RegExp: "_g_RegExp",
    VoidT:() => {
        return "_g_object";
    },
    CssProperties: "_g_CssProperties",
    Any: "_g_any",
    Enum: () => {
        return "_g_string";
    },
    Or:(...types: any[]) => {
        let type = "_g_any";
        for(let i = 0; i < types.length; i ++) {
            type += "," +types[i];
        }
        return type;
    }
}
window.GearType = <any>GearType;