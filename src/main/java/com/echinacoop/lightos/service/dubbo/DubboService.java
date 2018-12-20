package com.echinacoop.lightos.service.dubbo;

import java.io.IOException;
import java.lang.reflect.Method;
import java.net.MalformedURLException;
import java.text.MessageFormat;
import java.util.ArrayList;
import java.util.Enumeration;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.jar.JarEntry;
import java.util.jar.JarFile;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import com.alibaba.dubbo.common.utils.StringUtils;
import com.alibaba.dubbo.config.ApplicationConfig;
import com.alibaba.dubbo.config.ReferenceConfig;
import com.alibaba.dubbo.config.RegistryConfig;
import com.alibaba.dubbo.rpc.service.GenericService;
import com.echinacoop.lightos.domain.dubbo.DubboJar;
import com.echinacoop.lightos.domain.dubbo.DubboServer;
import com.echinacoop.lightos.domain.dubbo.InterfaceMethod;
import com.echinacoop.lightos.domain.dubbo.MethodObj;
import com.echinacoop.lightos.domain.dubbo.ReqParam;
import com.echinacoop.lightos.web.rest.util.Telnet;
import com.yinsin.utils.CommonUtils;

public class DubboService {
	private static Logger logger = LoggerFactory.getLogger(DubboService.class);
	public static Map<String, Telnet> telnetMap = new HashMap<String, Telnet>();
	
	// 当前应用的信息
	private static ApplicationConfig application = new ApplicationConfig();
	// 注册中心信息缓存
	private static Map<String, RegistryConfig> registryConfigCache = new ConcurrentHashMap<>();

	// 各个业务方的ReferenceConfig缓存
	private static Map<String, ReferenceConfig<?>> referenceCache = new ConcurrentHashMap<>();

	static {
		application.setName("consumer-test");
	}

	/**
	 * 获取注册中心信息
	 *
	 * @param address
	 *            zk注册地址
	 * @param group
	 *            dubbo服务所在的组
	 * @return
	 */
	private static RegistryConfig getRegistryConfig(String address, String group, String version) {
		String key = address + "-" + group + "-" + version;
		RegistryConfig registryConfig = registryConfigCache.get(key);
		if (null == registryConfig) {
			registryConfig = new RegistryConfig();
			if (StringUtils.isNotEmpty(address)) {
				registryConfig.setAddress(address);
			}
			if (StringUtils.isNotEmpty(version)) {
				registryConfig.setVersion(version);
			}
			if (StringUtils.isNotEmpty(group)) {
				registryConfig.setGroup(group);
			}
			registryConfigCache.put(key, registryConfig);
		}
		return registryConfig;
	}

	private static ReferenceConfig<?> getReferenceConfig(String interfaceName, Class<?> myClass1, String address, String group, String version) {
		String referenceKey = interfaceName;
		ReferenceConfig<?> referenceConfig = referenceCache.get(referenceKey);
		if (null == referenceConfig) {
			try {
				referenceConfig = new ReferenceConfig<>();
				referenceConfig.setApplication(application);
				referenceConfig.setRegistry(getRegistryConfig(address, group, version));
				referenceConfig.setInterface(myClass1);
				if (StringUtils.isNotEmpty(version)) {
					referenceConfig.setVersion(version);
				}
				referenceConfig.setGeneric(true);
				// referenceConfig.setUrl("dubbo://10.1.50.167:20880/com.test.service.HelloService");
				referenceCache.put(referenceKey, referenceConfig);
			} catch (Exception e) {
				e.printStackTrace();
			}
		}
		return referenceConfig;
	}

	public static Object invoke(ReqParam param) throws Exception {
		// String u = "file:F:/other/jars/act-api-0.0.1-SNAPSHOT.jar";
		Class<?> jarClass = DubboManager.getJarClass(param.getJarName(), param.getInterfaceName());
		ReferenceConfig<?> reference = getReferenceConfig(param.getInterfaceName(), jarClass, param.getAddress(), null, param.getVersion());
		if (null != reference) {
			GenericService genericService = (GenericService) reference.get();
			if (genericService == null) {
				logger.debug("Service 不存在:{}", param.getInterfaceName());
				throw new Exception(MessageFormat.format("Service不存在：{0} -> {1}", param.getJarName(), param.getInterfaceName()));
			}
			return genericService.$invoke(param.getMethod(), getMethodParamType(jarClass, param.getMethod()), new Object[] { param.getParam() });
		}
		return null;
	}

	private static String[] getMethodParamType(Class<?> class1, String methodName) {
		try {
			// 获取所有的公共的方法
			Method[] methods = class1.getMethods();
			for (Method method : methods) {
				if (method.getName().equals(methodName)) {
					Class<?>[] paramClassList = method.getParameterTypes();
					String[] paramTypeList = new String[paramClassList.length];
					int i = 0;
					for (Class<?> className : paramClassList) {
						paramTypeList[i] = className.getTypeName();
						i++;
					}
					return paramTypeList;
				}
			}
		} catch (Exception e) {
			logger.error("获取方法参数类型时异常：" + methodName, e);
		}
		return null;
	}

	public static List<InterfaceMethod> getJarClassList(String jarName) throws IOException, ClassNotFoundException {
		List<InterfaceMethod> classList = new ArrayList<InterfaceMethod>();
		JarFile jar = null;
		try {
			DubboJar dubboJar = DubboManager.getJar(jarName);
			if(null != dubboJar){
				// 通过jarFile 和JarEntry得到所有的类
				jar = new JarFile(dubboJar.getJarPath().substring(5));
				
				Enumeration<JarEntry> enumFiles = jar.entries();// 返回 zip 文件条目的枚举
				JarEntry entry = null;
				InterfaceMethod classObj = null;
				MethodObj methodObj = null;
				List<MethodObj> methodList = null;
				while (enumFiles.hasMoreElements()) {// 测试此枚举是否包含更多的元素。
					entry = (JarEntry) enumFiles.nextElement();
					if (entry.getName().indexOf("META-INF") < 0) {
						methodList = new ArrayList<MethodObj>();
						String classFullName = entry.getName();
						if (classFullName.indexOf(".class") < 0) {
							classFullName = classFullName.substring(0, classFullName.length() - 1);
						} else {
							String classPackage = classFullName.substring(0, classFullName.length() - 6).replace("/", ".");// 去掉后缀.class
							Class<?> classz = DubboManager.getJarClass(jarName, classPackage);
							classObj = new InterfaceMethod();
							classObj.setClassPackage(classPackage);
							classObj.setClassName(classz.getSimpleName());
							// 通过getMethods得到类中包含的方法
							Method m[] = classz.getMethods();
							for (int i = 0; i < m.length; i++) {
								String sm = m[i].getName();
								methodObj = new MethodObj();
								methodObj.setMethodName(sm);
								methodObj.setParamType(getMethodParamType(classz, sm));
								methodList.add(methodObj);
							}
							classObj.setMethod(methodList);
							classList.add(classObj);
						}
					}
				}
			}
		} catch (Exception e) {
			logger.error("get jar class list error：" + jarName, e);
		} finally {
			if(jar != null){
				jar.close();
			}
		}
		return classList;
	}
	
	public static boolean install(String jarName) throws MalformedURLException, ClassNotFoundException{
		DubboJar jar = DubboManager.getJar(jarName);
		if(null != jar && !jar.isLoaded()){
			return DubboManager.installJar(jar) != null;
		}
		return false;
	}
	
	public static boolean uninstall(String jarName){
		DubboJar jar = DubboManager.getJar(jarName);
		if(null != jar && jar.isLoaded()){
			return DubboManager.uninstallJar(jar);
		}
		return true;
	}
	
	public static DubboServer parseDubboServer(String param){
		List<MethodObj> moList = null;
		String[] arr = param.split("&"), methods = null, type = new String[]{ "java.lang.String" };
		String kv = null, value = null;
		DubboServer server  = new DubboServer();
		MethodObj mo = null;
		for (int i = 0; i < arr.length; i++) {
			kv = arr[i];
			value = kv.substring(kv.indexOf("=") + 1);
			if(kv.startsWith("anyhost")){
				server.setAnyhost(value);
			} else if(kv.startsWith("application")){
				server.setApplication(value);
			} else if(kv.startsWith("bind.ip")){
				server.setIp(value);
			} else if(kv.startsWith("bind.port")){
				server.setPort(CommonUtils.stringToInt(value));
			} else if(kv.startsWith("dubbo")){
				server.setDubbo(value);
			} else if(kv.startsWith("generic")){
				server.setGeneric(Boolean.parseBoolean(value));
			} else if(kv.startsWith("interface")){
				server.setClassPackage(value);
				server.setClassName(value.substring(value.lastIndexOf(".")));
			} else if(kv.startsWith("methods")){
				methods = value.split(",");
				moList = new ArrayList<MethodObj>();
				for (int j = 0; j < methods.length; j++) {
					mo = new MethodObj();
					mo.setMethodName(methods[j]);
					mo.setParamType(type);
					moList.add(mo);
				}
				server.setMethod(moList);
			} else if(kv.startsWith("pid")){
				server.setPid(CommonUtils.stringToInt(value));
			} else if(kv.startsWith("side")){
				server.setSide(value);
			} else if(kv.startsWith("timestamp")){
				server.setTimestamp(CommonUtils.stringToLong(value));
			}
		}
		return server;
	}

}
