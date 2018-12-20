package com.echinacoop.lightos.domain.base;

import java.util.HashMap;
import java.util.Map;

import com.alibaba.fastjson.JSONObject;
import com.echinacoop.lightos.common.consts.MapContants;
import com.echinacoop.lightos.common.consts.StringConstant;

/**
 * 统一的结果对象<br>
 * 统一写出到前端的数据包<br>
 * 出入参均以Map容器存储
 * 
 * @Time 2016-12-05 19:51
 * @GeneratedByCodeFactory
 */
public class Response {
	
    private String code = MapContants.MSG_CODE_FAILED;

    private String message = MapContants.MessageCodeMap.get(code);

    private Map<String, Object> rtn = new HashMap<String, Object>();

    public Response fail() {
        this.code = MapContants.MSG_CODE_FAILED;
        this.message = MapContants.MessageCodeMap.get(this.code);
        return this;
    }

    public Response fail(String msg) {
        this.code = MapContants.MSG_CODE_FAILED;
        this.message = msg;
        return this;
    }

    public Response fail(String code, String msg) {
        if (code == null || code.equals(MapContants.MSG_CODE_SUCCESS)) {
        	code = MapContants.MSG_CODE_FAILED;
        }
        this.code = code;
        this.message = msg;
        return this;
    }

    public Response fail(String code, String msg, Map<String, Object> result) {
        if (code == null || code.equals(MapContants.MSG_CODE_SUCCESS)) {
        	code = MapContants.MSG_CODE_FAILED;
        }
        this.code = code;
        this.message = msg;
        this.rtn = result;
        return this;
    }

    public Response fail(Map<String, Object> result) {
        this.code = MapContants.MSG_CODE_FAILED;
        this.message = MapContants.MessageCodeMap.get(this.code);
        this.rtn = result;
        return this;
    }
    
    /**
     * 未登录或会话超时
     * @return
     */
    public Response loginTimeout() {
        this.code = MapContants.MSG_CODE_SESSION_TIMEOUT;
        this.message = MapContants.MessageCodeMap.get(this.code);
        return this;
    }
    
    /**
     * 无权限操作
     * @return
     */
    public Response noPermissions() {
        this.code = MapContants.MSG_CODE_NOT_RIGHT;
        this.message = MapContants.MessageCodeMap.get(this.code);
        return this;
    }
    
    /**
     * 服务器异常
     * @return
     */
    public Response exception() {
        this.code = MapContants.MSG_CODE_EXCEPTION;
        this.message = MapContants.MessageCodeMap.get(this.code);
        return this;
    }

    public Response success() {
        this.code = MapContants.MSG_CODE_SUCCESS;
        this.message = MapContants.MessageCodeMap.get(this.code);
        return this;
    }

    public Response success(String message) {
        this.code = MapContants.MSG_CODE_SUCCESS;
        this.message = message;
        return this;
    }

    public Response success(String code, String msg) {
    	if (code == null || !code.equals(MapContants.MSG_CODE_SUCCESS)) {
            code = MapContants.MSG_CODE_SUCCESS;
        }
    	this.code = code;
        this.message = msg;
        return this;
    }

    public Response success(String code, String msg, Map<String, Object> result) {
    	if (code == null || !code.equals(MapContants.MSG_CODE_SUCCESS)) {
            code = MapContants.MSG_CODE_SUCCESS;
        }
    	this.code = code;
        this.message = MapContants.MessageCodeMap.get(MapContants.MSG_CODE_SUCCESS);
        this.rtn = result;
        return this;
    }

    public Response success(Map<String, Object> result) {
        this.code = MapContants.MSG_CODE_SUCCESS;
        this.message = MapContants.MessageCodeMap.get(this.code);
        this.rtn = result;
        return this;
    }

    public String getCode() {
        return code;
    }

    public Response setCode(String code) {
        this.code = code;
        return this;
    }

    public String getMessage() {
        return message;
    }

    public Response setMessage(String message) {
        this.message = message;
        return this;
    }

    public Map<String, Object> getRtn() {
        return rtn;
    }

    public Response setRtn(Map<String, Object> result) {
        this.rtn = result;
        return this;
    }

    public Response setRtnAll(Map<String, Object> result) {
        if (this.rtn != null) {
            this.rtn.putAll(result);
        }
        return this;
    }

    /**
     * 判断操作是否成功
     * 
     * @return true 成功，false 失败
     */
    public boolean isSuccess() {
    	if(null != this.code && MapContants.MSG_CODE_SUCCESS.equals(this.code)){
    		return true;
    	}
		return false;
    }

    public Response setToRtn(String key, Object value) {
        this.rtn.put(key, value);
        return this;
    }

    public Response setDataToRtn(Object value) {
        this.rtn.put(StringConstant.DATA_KEY, value);
        return this;
    }
    
    public Response setToRtn(Object value) {
    	JSONObject json = (JSONObject) JSONObject.toJSON(value);
        this.rtn.putAll(json);
        return this;
    }

}