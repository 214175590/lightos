package com.echinacoop.lightos.domain.dubbo;

import java.util.List;

public class DubboServer {
	
	private String className;
	private String classPackage;
	private String application;
	private String anyhost;
	private String ip;
	private int port;
	private int pid;
	private String dubbo;
	private String side;
	private long timestamp;
	private boolean generic;
	
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

	public String getApplication() {
		return application;
	}

	public void setApplication(String application) {
		this.application = application;
	}

	public String getAnyhost() {
		return anyhost;
	}

	public void setAnyhost(String anyhost) {
		this.anyhost = anyhost;
	}

	public String getIp() {
		return ip;
	}

	public void setIp(String ip) {
		this.ip = ip;
	}

	public int getPort() {
		return port;
	}

	public void setPort(int port) {
		this.port = port;
	}

	public int getPid() {
		return pid;
	}

	public void setPid(int pid) {
		this.pid = pid;
	}

	public String getDubbo() {
		return dubbo;
	}

	public void setDubbo(String dubbo) {
		this.dubbo = dubbo;
	}

	public String getSide() {
		return side;
	}

	public void setSide(String side) {
		this.side = side;
	}

	public long getTimestamp() {
		return timestamp;
	}

	public void setTimestamp(long timestamp) {
		this.timestamp = timestamp;
	}

	public boolean isGeneric() {
		return generic;
	}

	public void setGeneric(boolean generic) {
		this.generic = generic;
	}

	public List<MethodObj> getMethod() {
		return method;
	}

	public void setMethod(List<MethodObj> method) {
		this.method = method;
	}
	
}
