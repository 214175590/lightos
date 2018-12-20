package com.echinacoop.lightos.socket;

import java.lang.reflect.Method;
import java.util.HashMap;
import java.util.Map;

import org.hibernate.AnnotationException;

import com.echinacoop.lightos.socket.annotation.MessageHandler;
import com.echinacoop.lightos.socket.annotation.Req;
import com.echinacoop.lightos.socket.dto.HandlerMethod;
import com.yinsin.other.LogHelper;
import com.yinsin.utils.CommonUtils;

public class HandleHelper {
	private static final LogHelper logger = LogHelper.getLogger(HandleHelper.class);
	
	private static Map<String, HandlerMethod> handleMap = new HashMap<String, HandlerMethod>();
	
	private static class HandleHelperUtil {
		public final static HandleHelper handleHelper = new HandleHelper();
	}
	
	public static HandleHelper getInstance(){
		return HandleHelperUtil.handleHelper;
	}
	
	public void registerHandle(Class<?>... classz) throws AnnotationException, InstantiationException, IllegalAccessException {
		if(null == classz || classz.length == 0){
			throw new AnnotationException("参数为空");
		}
		
		MessageHandler handle = null;
		Req req = null;
		String namespace = null, reqName = null, url = null;
		Method[] methods = null;
		HandlerMethod handleMethod = null;
		
		for (Class<?> cla : classz) {
			handle = cla.getAnnotation(MessageHandler.class);
			if(null == handle){
				logger.error("Failed to initialize handler.", new AnnotationException("Missing annotation name definition for \"" + cla.getName() + "\""));
				continue;
			}
			namespace = handle.value();
			if(null == namespace || namespace.trim().length() < 1){
				namespace = CommonUtils.firstCharToLowerCase(cla.getSimpleName());
			}
			
			methods = cla.getMethods();
			
			for (Method method : methods) {
				req = method.getAnnotation(Req.class);
				if(null != req){
					reqName = req.value();
					if(null == reqName || reqName.trim().length() < 1){
						reqName = method.getName();
					}
					url = namespace + "." + reqName;
					handleMethod = new HandlerMethod();
					handleMethod.setInstance(cla.newInstance())
					.setMethod(method)
					.setNamespace(namespace).setReq(reqName)
					.setUrl(url);
					logger.debug("Register \"" + url + "\" Handler Success.(" + cla.getName() + ")");
					handleMap.put(url, handleMethod);
				}
			}
		}
	}
	
	public static HandlerMethod getHandlerMethod(String url){
		return handleMap.get(url);
	}
	
}
