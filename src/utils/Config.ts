// const APIV1 = '/api/v1'
// const APIV2 = '/api/v2'
// const root = 'http://10.10.11.131:8080';
let root:string = window["_p_root_path"] && window["_p_root_path"].startsWith('http://') ? window["_p_root_path"] : '';
export default class Config {
    static config() {
        // 设置非跨域访问的跟路径
        let CORS = new Array<any>();
        CORS.push(root);
        return {
            name: 'gearplatform',
            prefix: 'gearplatform',
            CORS: CORS,
            YQL: new Array<any>(),
            noRulePages: ['/login', '/logout'],
            api: {
                root: root,
                rootContext: '/',
                // wzMenu: `${root}/data.json`
                mainInfo: `${root}/platform/mainInfo`,
                userLogin: `${root}/login`,
                userLogout: `${root}/logout`,
                systemNotification: `${root}/system/monitor`,
                getPermissions: (menu: {items: Array<{permissions: Array<string>}>}) => {
                    let permissions: Array<string> = [];
                    for (let i = 0; i < menu.items.length; i++) {
                        let item = menu.items[i];
                        if (item.permissions) {
                            permissions = permissions.concat(item.permissions);
                        }
                    }
                    return permissions;
                },
                modules: {
                    // permissions: ['PLATFORM_SYSTEMMODULES','PLATFORM_SYSTEMMENU','PLATFORM_SYSTEMITEM'],
                    items: [
                        {
                            key: 'platform_application',
                            name: '应用管理',
                            url: `${root}/platform/systemModules/frame`,
                            permissions: ['PLATFORM_APPLICATION']
                        }
                    ]
                },
                userAndAuth: {
                    // permissions: ['AUTH_USER','AUTH_ROLE','AUTH_UNIT','AUTH_DEPARTMENT','AUTH_GROUP'],
                    items: [{
                        key: 'auth_user_frame',
                        name: '用户管理',
                        url: `${root}/auth/user/frame`,
                        permissions: ['AUTH_USER'],
                    }, {
                        key: 'auth_role_query',
                        name: '角色管理',
                        url: `${root}/auth/role/query`,
                        permissions: ['AUTH_ROLE'],
                    }, {
                        key: 'auth_unit_frame',
                        name: '单位管理',
                        url: `${root}/auth/unit/frame`,
                        permissions: ['AUTH_UNIT'],
                    }, {
                        key: 'auth_department_frame',
                        name: '部门管理',
                        url: `${root}/auth/department/frame`,
                        permissions: ['AUTH_DEPARTMENT'],
                    }, {
                        key: 'auth_group_query',
                        name: '用户组管理',
                        url: `${root}/auth/group/query`,
                        permissions: ['AUTH_GROUP'],
                    }]
                },
                system: {
                    // permissions: ["SYSTEM_ACCESS_LOG","DICTIONARY_MANAGER"],
                    items: [
                        {
                            key: 'system_accesslog_query',
                            name: '系统访问日志管理',
                            url: `${root}/system/accesslog/query`,
                            permissions: ['SYSTEM_ACCESS_LOG']
                        },
                        {
                            key: 'system_dictionary',
                            name: '代码集管理',
                            url: `${root}/dictionary`,
                            permissions: ['DICTIONARY_MANAGER']
                        },
                        {
                            key: 'system_application_register',
                            name: '系统接入注册',
                            url: `${root}/application_manager/application/query`,
                            permissions: ['APPLICATION_MANAGER_APPLICATION']
                        },
                        {
                            key: 'system_online_user',
                            name: '在线用户管理',
                            url: `${root}/system/onlineUserManage/query`,
                            permissions: ['ONLINE_USER_MANAGE']
                        }
                    ]
                }
            }
        };
    }
}
