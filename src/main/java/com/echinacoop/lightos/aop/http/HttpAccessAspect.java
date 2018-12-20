package com.echinacoop.lightos.aop.http;

import java.lang.reflect.Method;
import java.util.Arrays;
import java.util.List;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.aspectj.lang.JoinPoint;
import org.aspectj.lang.ProceedingJoinPoint;
import org.aspectj.lang.Signature;
import org.aspectj.lang.annotation.AfterThrowing;
import org.aspectj.lang.annotation.Around;
import org.aspectj.lang.annotation.Aspect;
import org.aspectj.lang.annotation.Pointcut;
import org.aspectj.lang.reflect.MethodSignature;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;

import com.alibaba.fastjson.JSONObject;
import com.echinacoop.lightos.common.consts.StringConstant;
import com.echinacoop.lightos.domain.User;
import com.echinacoop.lightos.domain.base.Argument;
import com.echinacoop.lightos.domain.base.Response;
import com.echinacoop.lightos.domain.system.OsUserIconRight;
import com.echinacoop.lightos.service.system.OsUserIconRightService;
import com.yinsin.utils.CommonUtils;

/**
 * Aspect for http access execution Rest of Spring components.
 */
@Aspect
public class HttpAccessAspect {

    private final Logger log = LoggerFactory.getLogger(this.getClass());
    
    @Autowired
    protected HttpServletRequest request;
    
    @Autowired
    protected HttpServletResponse response;
    
    @Autowired
    protected OsUserIconRightService rightService;
    
    //&& @within(org.springframework.web.bind.annotation.PostMapping)
    @Pointcut("within(com.echinacoop.lightos.web.rest..*)")
    public void httpAccessPointcut() {
    }

    @AfterThrowing(pointcut = "httpAccessPointcut()", throwing = "e")
    public void accessAfterThrowing(JoinPoint joinPoint, Throwable e) {
        
        log.error("Exception in {}.{}() with cause = {}", joinPoint.getSignature().getDeclaringTypeName(),
        joinPoint.getSignature().getName(), e.getCause() != null? e.getCause() : "NULL");
        
    }

    @Around("httpAccessPointcut()")
    public Object httpAccessAround(ProceedingJoinPoint joinPoint) throws Throwable {
        String methodName = joinPoint.getSignature().getName();
        if (log.isDebugEnabled()) {
            log.debug("http access requst: {}.{}() with argument[s] = {}", joinPoint.getSignature().getDeclaringTypeName(),
                    methodName, Arrays.toString(joinPoint.getArgs()));
        }

        if("login|session|logout|".indexOf(methodName + "|") == -1){
        	User user = (User) request.getSession().getAttribute(StringConstant.USER_DATA_SESSION_KEY);
            if (user == null) {
                Response result = new Response();
                result.loginTimeout();
                return result;
            }
        }
        try {
        	Object[] args = joinPoint.getArgs();
        	if (args != null && args.length > 0) {
        	    String jsonValue = "";
	        	if (args[0] instanceof HttpServletRequest) {
	        		HttpServletRequest request = (HttpServletRequest)args[0];
	        		jsonValue = CommonUtils.stringUncode(request.getParameter("jsonValue"));
	        		request.setAttribute("jsonValue", jsonValue);
	        	} else if (args[0] instanceof String){
	        		jsonValue = CommonUtils.stringUncode((String) args[0]);
	        		args[0] = jsonValue;
	        	}
	        	
	        	if("login|session|logout|".indexOf(methodName + "|") == -1){
		        	Response res = hasPermission(joinPoint, jsonValue);
		        	if(!res.isSuccess()){
		        	    return res;
		        	}
	        	}
        	}
        	Object result = joinPoint.proceed(args);
            if (log.isDebugEnabled()) {
                log.debug("http access Exit: {}.{}() with result = {}", joinPoint.getSignature().getDeclaringTypeName(),
                    joinPoint.getSignature().getName(), result);
            }
            return result;
        } catch (IllegalArgumentException e) {
            log.error("Illegal argument: {} in {}.{}()", Arrays.toString(joinPoint.getArgs()),
                    joinPoint.getSignature().getDeclaringTypeName(), joinPoint.getSignature().getName());

            throw e;
        }
    }
    
    
    /**
     * 权限判断
     * @param joinPoint
     * @param jsonValue
     * @return
     */
    public Response hasPermission(ProceedingJoinPoint joinPoint, String jsonValue) throws Throwable {
        try {
            Signature sig = joinPoint.getSignature();
            MethodSignature msig = (MethodSignature) sig;
            Object target = joinPoint.getTarget();
            RequestMapping req = target.getClass().getAnnotation(RequestMapping.class);
            
            Method currentMethod = target.getClass().getMethod(msig.getName(), msig.getParameterTypes());
            OperationRight right = currentMethod.getAnnotation(OperationRight.class);
            PostMapping post = currentMethod.getAnnotation(PostMapping.class);
            GetMapping get = currentMethod.getAnnotation(GetMapping.class);
            User user = (User) request.getSession().getAttribute(StringConstant.USER_DATA_SESSION_KEY);
            
            if ((null == req && null == post && null == get) || StringConstant.ADMIN_ACCOUNT.equals(user.getAccount())) {
            	//没有注解@RequestMapping的类和@PostMapping方法不对权限控制
            	return new Response().success();
            }
            if(null != right){
                String[] types = right.value();
                if(null == types || types.length == 0){
                    return new Response().success();
                }
                if(CommonUtils.isNotBlank(jsonValue)){
                	JSONObject value = parseJsonValue(jsonValue);
                	Long appId = value.getLong("_APPID");
                	if (log.isDebugEnabled()) {
                        log.debug("requst function appid =>{}", appId);
                    }
                	OsUserIconRight entity = new OsUserIconRight();
                	entity.setDeskIconId(appId);
                	entity.setUserId(user.getRowId());
                	Argument arg = new Argument();
                	arg.setObj(entity);
                	arg = rightService.findByUserIdAndDeskIconId(arg);
                	if (arg.isSuccess()) {
                		List<OsUserIconRight> rightList = (List<OsUserIconRight>) arg.getDataForRtn();         
                        if(null != rightList && rightList.size() > 0){
                        	int num = types.length;
                        	OsUserIconRight userRight = null;
                        	for(int i = 0, k = types.length; i < k; i++){
                        		if("query".equals(types[i])){
                        			num--;
                        		} else {
                        			for (int j = 0, p = rightList.size(); j < p; j++) {
                        				userRight = rightList.get(j);
                        				if(userRight.getRightCode().equals(types[i])){
                        					num--;
                        				}
                        			}
                        		}
                        	}
                        	if(num == 0){
                        		return new Response().success();
                        	}
                        }
                	}
                	return new Response().noPermissions();
                }
            } else {
                // 没有增加操作权限注解的方法将都被拦截，提示无权限
                
                if(req != null){
                    StringBuilder sb = new StringBuilder("\n=========================================\n未加权限方法：");
                    if(req.value() != null && req.value().length > 0){
                        sb.append(req.value()[0]);
                    }
                    if(post != null && post.value() != null && post.value().length > 0){
                        sb.append(post.value()[0]);
                    }
                    sb.append("\n=========================================");
                    log.error(sb.toString());
                }
                return new Response().noPermissions();
            }
        } catch (NoSuchMethodException | SecurityException e) {
        	log.error("", e);
        	throw e;
        }
        return new Response().noPermissions();
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
    
}
