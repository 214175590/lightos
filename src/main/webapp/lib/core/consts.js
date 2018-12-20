/**
 * ##常量定义模块，包含一些框架用到的常量##
 * @module core/consts
 * @author yisin
 */
define({
    /**
     * **项目根目录**
     *
     * **如果页面通过服务器访问，可能是这样的：http://localhost:8080/webapp/**
     *
     * **如果页面在本地访问，可能是这样的：file:///C:/Users/Administrator/Desktop/webapp/**
     * @type string
     */
    WEB_BASE: seajs.data.base,

    WEB_ROOT: seajs.data.root,

    /**
     * **获取用户信息后台接口地址**
     * @type string
     */
    USER_INFO_URL: "api/getUserInfo",

    /**
     * **encrypkey后台接口地址**
     * @type string
     */
    ENCRYPT_KEY_URL: "api/getEncryptKey",

    /**
     * **login后台接口地址**
     * @type string
     */
    LOGIN_URL: "api/login",

    /**
     * **获取session用户信息接口地址**
     * @type string
     */
    SESSION_URL: "api/session",

    /**
     * **logout后台接口地址**
     * @type string
     */
    LOGOUT_URL: "api/logout",
    
    /**
     * ** unlock后台接口地址 **
     * @type string
     */
    UNLOCK: "api/unlock",
    
    /**
     * ** unlock后台接口地址 **
     * @type string
     */
    LOGIN_PAGE: "apps/auth/login.html",

    /**
     * **标识一个字符串常量"service"**
     * @type string
     */
    SERVICE: "service",

    /**
     * **标识一个字符串常量"json"**
     * @type string
     */
    REQ_TYPE_JSON: "json",

    /**
     * **标识一个字符串常量"xml"**
     * @type string
     */
    REQ_TYPE_XML: "xml",
    
    /**
     * 页面加载超时时间（毫秒）
     */
    PAGE_LOAD_TIME: 20000
});