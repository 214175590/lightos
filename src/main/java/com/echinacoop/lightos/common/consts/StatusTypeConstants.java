package com.echinacoop.lightos.common.consts;

import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

public class StatusTypeConstants {
	
	@Target(ElementType.FIELD)
    @Retention(RetentionPolicy.RUNTIME)
    public @interface FieldDesc {
		String type() default "";
    	String value() default "";
    }
	
	//========== 联系人类型  ===========//
	@FieldDesc(type="联系人类型", value="好友")
	public static final String CONTACTER_TYPE_FRIEND  = "01";
	@FieldDesc(type="联系人类型", value="群组")
	public static final String CONTACTER_TYPE_GROUP   = "02";
	@FieldDesc(type="联系人类型", value="消息")
	public static final String CONTACTER_TYPE_MESSAGE = "03";
	
	//========== 数据状态  ===========//
	@FieldDesc(type="数据状态", value="缺省")
	public static final String DATA_STATUS_DEF               = "01";
	@FieldDesc(type="数据状态", value="正常使用")
	public static final String DATA_STATUS_NORMAL            = "02";
	@FieldDesc(type="数据状态", value="待审核")
	public static final String DATA_STATUS_PENDING_AUDIT     = "03";
	@FieldDesc(type="数据状态", value="审核不通过")
	public static final String DATA_STATUS_AUDIT_FAILED      = "04";
	@FieldDesc(type="数据状态", value="待生效")
	public static final String DATA_STATUS_PENDING_EFFECT    = "05";
	
	//========== 聊天群组成员类型  ===========//
	@FieldDesc(type="聊天群组成员类型", value="群主")
	public static final String CHAT_GROUP_USER_TYPE_OWNER     = "1";
	@FieldDesc(type="聊天群组成员类型", value="管理员")
	public static final String CHAT_GROUP_USER_TYPE_MANAGER   = "2";
	@FieldDesc(type="聊天群组成员类型", value="普通成员")
	public static final String CHAT_GROUP_USER_TYPE_MEMBER    = "3";
	
	//========== 聊天类型  ===========//
	@FieldDesc(type="聊天类型", value="单聊")
	public static final String CHAT_TYPE_SINGLE               = "01";
	@FieldDesc(type="聊天类型", value="群聊")
	public static final String CHAT_TYPE_GROUP                = "02";
	
	//========== 用户类型  ===========//
	@FieldDesc(type="用户类型", value="内部用户")
	public static final String USER_TYPE_INNER                = "0";
	@FieldDesc(type="用户类型", value="外部用户")
	public static final String USER_TYPE_OUTER                = "1";
	
	//========== 基本权限类型  ===========//
	@FieldDesc(type="基本权限类型", value="查看")
	public static final String RIGHT_TYPE_QUERY               = "query";
	@FieldDesc(type="基本用户类型", value="新增")
	public static final String RIGHT_TYPE_ADD                 = "add";
	@FieldDesc(type="基本权限类型", value="修改")
	public static final String RIGHT_TYPE_EDIT                = "edit";
	@FieldDesc(type="基本用户类型", value="删除")
	public static final String RIGHT_TYPE_DEL                 = "del";
	
	//========== 会议状态  ===========//
	@FieldDesc(type="会议状态", value="待执行")
	public static final int MEETINT_STATUS_WAIT               = 1;
	@FieldDesc(type="会议状态", value="已取消")
	public static final int MEETINT_STATUS_CANCEL             = 2;
	@FieldDesc(type="会议状态", value="已完成")
	public static final int MEETINT_STATUS_FINISHED           = 3;
	
	//========== 数据状态  ===========//
	@FieldDesc(type="数据状态", value="有效")
	public static final int DATA_STATUS_YES                   = 1;
	@FieldDesc(type="数据状态", value="无效")
	public static final int DATA_STATUS_NO                    = 2;
	
}
