package com.echinacoop.lightos.domain.dubbo;

import java.io.Serializable;

@SuppressWarnings("serial")
public class ReqParam implements Serializable {
	private String jarName;
	private String jarPath;
	private String interfaceName;
	private String method;
	private Object param;
	private String paramType;
	private String address;
	private String version;
	
	public String getJarName() {
		return jarName;
	}

	public void setJarName(String jarName) {
		this.jarName = jarName;
	}

	public String getJarPath() {
		return jarPath;
	}

	public void setJarPath(String jarPath) {
		this.jarPath = jarPath;
	}

	public String getInterfaceName() {
		return interfaceName;
	}

	public void setInterfaceName(String interfaceName) {
		this.interfaceName = interfaceName;
	}

	public String getMethod() {
		return method;
	}

	public void setMethod(String method) {
		this.method = method;
	}

	public Object getParam() {
		return param;
	}

	public void setParam(Object param) {
		this.param = param;
	}
	
	public String getParamType() {
		return paramType;
	}

	public void setParamType(String paramType) {
		this.paramType = paramType;
	}

	public String getAddress() {
		return address;
	}

	public void setAddress(String address) {
		this.address = address;
	}

	public String getVersion() {
		return version;
	}

	public void setVersion(String version) {
		this.version = version;
	}

	@Override
	public String toString() {
		return "CallRequest{" + 
			"jarName='" + jarName + '\'' + 
			"jarPath='" + jarPath + '\'' + 
			"interfaceName='" + interfaceName + '\'' + 
			", method='" + method + '\'' + 
			", param=" + param + 
			", paramType='" + paramType + '\'' + 
			", address='" + address + '\'' + 
			", version='" + version + '\'' + 
		'}';
	}
}
