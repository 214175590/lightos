package com.echinacoop.lightos.domain.dubbo;

import java.io.Serializable;

@SuppressWarnings("serial")
public class MethodObj implements Serializable {

	private String methodName;
	private String[] paramType;

	public String getMethodName() {
		return methodName;
	}

	public void setMethodName(String methodName) {
		this.methodName = methodName;
	}

	public String[] getParamType() {
		return paramType;
	}

	public void setParamType(String[] paramType) {
		this.paramType = paramType;
	}

}
