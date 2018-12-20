package com.echinacoop.lightos.web.rest;

import java.io.IOException;
import java.io.InputStream;

import javax.servlet.ServletOutputStream;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.apache.commons.lang3.StringUtils;
import org.apache.log4j.Logger;
import org.springframework.beans.factory.annotation.Autowired;

import com.alibaba.fastjson.JSONArray;
import com.alibaba.fastjson.JSONObject;
import com.echinacoop.lightos.common.consts.StringConstant;
import com.echinacoop.lightos.domain.User;
import com.echinacoop.lightos.domain.base.Response;
import com.echinacoop.lightos.security.DesJS;
import com.echinacoop.lightos.security.SecurityCode;
import com.echinacoop.lightos.service.UserService;
import com.echinacoop.lightos.web.rest.util.JSONUtils;
import com.yinsin.utils.CommonUtils;

/**
 * 控制器父类，提供简单的父类辅助操作
 * 
 * @author Yisin
 * @date 2015-1-21
 * @since 1.0
 * @version 1.0
 */
public abstract class BaseController {
    protected static final Logger log = Logger.getLogger(BaseController.class);
    
    @Autowired
    protected HttpServletRequest request;
    @Autowired
    protected HttpServletResponse response;
    
    @Autowired
    private UserService userService;

    protected User getUser() {
        return (User) request.getSession().getAttribute(StringConstant.USER_DATA_SESSION_KEY);
    }
    
    /**
     * 获取用户ID
     * @author yisin
     * @return Integer
     */
    protected Long getUserId() {
    	User user = getUser();
        return null != user ? user.getRowId() : null;
    }
    
    /**
     * 将UserInfo对象设置到session中去
     * @author Yisin
     */
    public void putUserToSession(User user) {
        if (request != null) {
        	request.getSession().setAttribute(StringConstant.USER_DATA_SESSION_KEY, user);
        }
    }
    
    /**
     * 设置参数到seesion
     * @author Yisin
     */
    public void setSessionAttribute(String name, Object obj) {
        if (request != null) {
        	request.getSession().setAttribute(name, obj);
        }
    }

    /**
     * 从session中删除某个对象
     * 
     * @author Yisin
     */
    public void removeSessionAttribute(String name) {
        if (request != null) {
        	request.getSession().removeAttribute(name);
        }
    }
    
    /**
	 * 获取jsonValue值
	 * @param request
	 * @return JSONObject
	 */
	public JSONObject getJsonValue(HttpServletRequest request){
		JSONObject jsonValue = null;
		try{
			String str = CommonUtils.stringUncode((String) request.getParameter("jsonValue"));
			jsonValue = JSONObject.parseObject(str);
		}catch(Exception e){
			log.error("数据格式错误，请检查：" + e.getMessage(), e);
		}
		return jsonValue;
	}
    
    /**
	 * 获取jsonValue值
	 * @param request
	 * @return JSONObject
	 */
	public JSONObject getJsonValue(){
		return getJsonValue(request);
	}
    
    /**
	 * 获取jsonValue值
	 * @param request
	 * @return JSONObject
	 */
	public JSONObject parseJsonValue(String jsonValue){
		JSONObject jsonObj = null;
		try{
			// 过滤器中已增加编码转换
	        jsonValue = CommonUtils.stringUncode(jsonValue);
			jsonObj = JSONObject.parseObject(jsonValue);
		}catch(Exception e){
			log.error("数据格式错误，请检查：" + e.getMessage(), e);
		}
		return jsonObj;
	}
	
	/**
	 * 获取jsonValue值
	 * @param request
	 * @return JSONArray
	 */
	public JSONArray getJsonArrayValue(){
		JSONArray jsonValue = null;
		try{
			String str = CommonUtils.stringUncode(request.getParameter("jsonValue"));
			jsonValue = JSONArray.parseArray(str);
		}catch(Exception e){
			log.error("数据格式错误，请检查：" + e.getMessage(), e);
		}
		return jsonValue;
	}
	
	/**
	 * 获取jsonValue值并转换为实体对象
	 * @param request
	 * @return T
	 */
	public <T> T parseJsonValueObject(Class<T> classz){
		JSONObject jsonValue = getJsonValue();
		return JSONUtils.toJavaObject(jsonValue, classz);
	}
	
	/**
	 * 获取jsonValue值并转换为实体对象
	 * @param request
	 * @return T
	 */
	public <T> T parseJsonValueObject(String jsonValue, Class<T> classz){
		JSONObject jsonObj = parseJsonValue(jsonValue);
		return JSONUtils.toJavaObject(jsonObj, classz);
	}
	
    /**
     * 判断用户是否处于已登录状态（会话未超时）
     * 
     * @author Yisin
     * @return true:已登录/未超时,false：未登录/已超时
     */
    protected User isLogined(Response res) {
    	User user = getUser();
    	if(null == user){
    		res.loginTimeout();
    	}
        return user;
    }
    
    /**
     * 判断用户是否处于已登录状态（会话未超时）
     * 
     * @author Yisin
     * @return true:已登录/未超时,false：未登录/已超时
     */
    protected boolean isLogined() {
        return getUser() != null;
    }
    
    protected void isAllowCrossDomainRequest(boolean allow) {
        if(allow){
            // 指定允许其他域名访问
            response.addHeader("Access-Control-Allow-Origin", "*");
            // 响应类型
            response.addHeader("Access-Control-Allow-Methods", "POST");
            // 响应头设置
            response.addHeader("Access-Control-Allow-Headers", "x-requested-with,content-type");
        }        
    }

    /**
	 * 输出数据到前端
	 * @param str
	 */
    protected void outByte(byte[] byt) {
        try {
            response.setCharacterEncoding("text/html;UTF-8");
            response.setContentType("text/html;charset=UTF-8");
            ServletOutputStream sos = response.getOutputStream();
            sos.write(byt);
            sos.flush();
            sos.close();
        } catch (Exception e) {
            log.error(e.getMessage(), e);
        }
    }

    /**
     * 获取请求参数并解密
     * 
     * @return
     * @throws IOException
     */
    protected String getRequestString() {
        String str = "";
        try {
            String method = request.getMethod().toLowerCase();
            if ("get".equals(method)) {
                str = request.getQueryString();
            } else {
                InputStream in = request.getInputStream();
                byte[] byt = new byte[1024];
                int i = -1;
                StringBuffer sb = new StringBuffer("");
                while ((i = in.read(byt)) != -1) {
                    sb.append(new String(byt, 0, i));
                }
                str = sb.toString();
            }
            if (CommonUtils.isNotEmpty(str)) {
                try {
                    str = DesJS.decrypt(str, SecurityCode.getEncryptKey());
                } catch (Exception e) {
                    log.error("解密参数失败，key值：" + SecurityCode.getEncryptKey() + "，密文：" + str, e);
                    str = "{}";
                }
            } else {
                log.warn("请求非法：" + request.getRequestURI());
            }
        } catch (Exception e) {
            log.warn("请求非法：" + request.getRequestURI());
        }
        return str;
    }

    /**
     * 判断入参是否为空，包括空字符串
     * 
     * @author Yisin
     * @date 2016年3月23日 - 下午9:09:02
     * @param key
     * @return
     */
    public boolean isNullable(String... key) {
        boolean isnull = false;
        if (key != null) {
            Object value = null;
            for (int i = 0, k = key.length; i < k; i++) {
                value = request.getParameter(key[i]);
                if (CommonUtils.isEmpty(value) || CommonUtils.isBlank(value.toString())) {
                    isnull = true;
                    break;
                }
            }
        }
        return isnull;
    }

    /**
     * 记录操作日志
     * 
     * @author Yisin
     * @since 1.0
     * @param operLogs
     * 
     */
    public void operationLog(String operLogs) {
        if (StringUtils.isNotBlank(operLogs)) {
            request.setAttribute("opResult", operLogs);
        }
    }
}
