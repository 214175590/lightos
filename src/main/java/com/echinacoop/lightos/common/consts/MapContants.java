package com.echinacoop.lightos.common.consts;

import java.util.HashMap;
import java.util.Map;

public class MapContants {

	/**处理成功 */
    public static final  String MSG_CODE_SUCCESS = "000000";
    
    /** 非法请求 */
    public static final  String MSG_CODE_INVALID_REQ = "100001";
    
    /** 参数不正确 */
    public static final  String MSG_CODE_INVALID_PARAM = "100002";
    
    /**无效账号 */
    public static final  String MSG_CODE_INVALID_ACCOUNT = "100003";
    
    /**密码不正确 */
    public static final  String MSG_CODE_INVALID_PWD = "100004";
    
    /**已登录，不允许重复登录 */
    public static final  String MSG_CODE_REPEAT_LOGIN = "100005";
    
    /**重复请求 */
    public static final  String MSG_CODE_REPEAT_REQ = "100006";
    
    /**用户锁定 */
    public static final  String MSG_CODE_REPEAT_LOCK= "000009";
    
    /**支付中，重复支付 */
    public static final  String MSG_CODE_PAYMENT_ING_REQ = "100106";
    
    /**支付成功，重复支付 */
    public static final  String MSG_CODE_PAYMENT_SUCCESS_REQ = "100107";
    
    /** 未登录或会话超时 */
    public static final  String MSG_CODE_SESSION_TIMEOUT = "888888";
    
    /** 无权限操作 */
    public static final  String MSG_CODE_NOT_RIGHT = "888999";
    
    /** 服务器异常 */
    public static final  String MSG_CODE_EXCEPTION = "800001";
    
    /** 缺少注册手机号 */
    public static final  String MSG_CODE_PHONE = "029925";
    
    /** 用户未实名认证*/
    public static final  String MSG_CODE_AYTH = "026007";
    
    /** 处理失败 */
    public static final  String MSG_CODE_FAILED = "999999";
    

    /** 未做实名认证 */
    public static final  String MSG_CODE_AUTH_REAL = "1000054";
    
    /** 是否是信用卡 */
    public static final  String MSG_CODE_BANK_REAL = "1000954";

    /** 未绑定手机号 */
    public static final  String MSG_CODE_WITHOUT_PHONE = "009925";
    
    /** 用户是否存在*/
    public static final  String MSG_USER_SAVE ="100000";
    
    /** 业务类型 SEND 表示推送类型，VALIDATION 表示验证类型*/
    public static final String VALIDATION = "VALIDATION";

    /** 本系统编码（在UIA系统中定义的唯一编码） */
    public static final String SYSTEM_CODE = "7w999a90";
    
    /** 是否对接UIA */
    public static final boolean CONNECT_UIA = true;
    
    /** 正则表达式：验证手机号 */ 
    public static final String REGEX_MOBILE = "^((13[0-9])|(14[5|7])|(15([0-3]|[5-9]))|(17([0-1]|3|[5-8]))|(18[0-9]))\\d{8}$";
    
    /**
	 * 处理码Map
	 */
    public static final Map<String, String> MessageCodeMap = new HashMap<String, String>();
    
    
    static {
    	MessageCodeMap.put(MSG_CODE_SUCCESS, "成功");
    	MessageCodeMap.put(MSG_CODE_INVALID_REQ, "非法请求");
    	MessageCodeMap.put(MSG_CODE_INVALID_PARAM, "参数不正确");
    	MessageCodeMap.put(MSG_CODE_INVALID_ACCOUNT, "账号不存在");
    	MessageCodeMap.put(MSG_CODE_INVALID_PWD, "密码错误");
    	MessageCodeMap.put(MSG_CODE_SESSION_TIMEOUT, "未登录或会话超时");
    	MessageCodeMap.put(MSG_CODE_REPEAT_LOGIN, "已登录，请不要重复登录");
    	MessageCodeMap.put(MSG_CODE_REPEAT_REQ, "重复请求");
    	MessageCodeMap.put(MSG_CODE_NOT_RIGHT, "无权限操作");
    	MessageCodeMap.put(MSG_CODE_EXCEPTION, "服务器异常");
    	MessageCodeMap.put(MSG_CODE_FAILED, "处理失败");
    	MessageCodeMap.put(MSG_CODE_AUTH_REAL, "未做实名认证");
    	MessageCodeMap.put(MSG_CODE_PAYMENT_SUCCESS_REQ, "此订单已经支付成功，请勿重复支付！");
    	MessageCodeMap.put(MSG_CODE_PAYMENT_ING_REQ, "此订单正在支付处理中，请勿重复支付！");    	
    	MessageCodeMap.put(MSG_CODE_BANK_REAL, "抱歉，您输入的是信用卡卡号，暂不支持信用卡转账！");
    	MessageCodeMap.put(MSG_CODE_REPEAT_LOCK, "用户被锁定！");
    }
    
    public static final String getMessage(String code){
    	return MessageCodeMap.get(code);
    }
    
}
