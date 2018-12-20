package com.echinacoop.lightos.domain.dubbo;

import java.io.Serializable;
import java.util.List;

@SuppressWarnings("serial")
public class InterfaceMethod implements Serializable {

	private String className;
	private String classPackage;
	private List<MethodObj> method;

	public String getClassName() {
		return className;
	}

	public void setClassName(String className) {
		this.className = className;
	}

	public String getClassPackage() {
		return classPackage;
	}

	public void setClassPackage(String classPackage) {
		this.classPackage = classPackage;
	}

	public List<MethodObj> getMethod() {
		return method;
	}

	public void setMethod(List<MethodObj> method) {
		this.method = method;
	}
}
