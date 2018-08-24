import { Sex } from "./Sex";

export default interface LoginInfo {

	/**
	 * 权限功能点
	 */
	functions: Array<string>;

    /**
	 * 用户姓名
	 */
	name: string;

	/**
	 * 数据对象
	 */
	data: any;
	
	/**
	 * 性别
	 */
	sex: Sex;
	
	/**
	 * 出生日期
	 */
	birthday: string;

	/**
	 * 单位ID
	 */
	unitIds: Array<string>;

	/**
	 * 部门ID
	 */
	departmentIds: Array<string>;

	/**
	 * 用户组ID
	 */
	groupIds: Array<string>;

	/**
	 * 角色ID
	 */
	roleIds: Array<string>;

	/**
	 * 身份证号码
	 */
	idNumber: string;

	/**
	 * 联系电话，包括手机
	 */
	telephones: Array<string>;
	
	/**
	 * 仅手机号码
	 */
	mobiles: Array<string>;

	/**
	 * 电子邮件
	 */
	email: Array<string>;

	/**
	 * token
	 */
	token: string;

	/**
	 * 用户个性化设置，每页显示记录数
	 */
	pageSize: number;
	
	/**
	 * 登录次数
	 */
	loginTimes: number;
	
	/**
	 * 本次登录时间
	 */
	loginTime: string;
	
	/**
	 * 上次登录时间
	 */
	prevLoginTime: string;
	
	/**
	 * 登录IP
	 */
	loginIp: string;

	/**
	 * 其他额外属性
	 */
	properties: any;
}