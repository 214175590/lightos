package com.echinacoop.lightos.socket.dto;

import java.lang.reflect.Method;

public class HandlerMethod {

	private String namespace;
	private String req;
	private String url;
	
	private Object instance;

	private Method method;

	public String getNamespace() {
		return namespace;
	}

	public HandlerMethod setNamespace(String namespace) {
		this.namespace = namespace;
		return this;
	}

	public String getReq() {
		return req;
	}

	public HandlerMethod setReq(String req) {
		this.req = req;
		return this;
	}

	public String getUrl() {
		return url;
	}

	public HandlerMethod setUrl(String url) {
		this.url = url;
		return this;
	}

	public Object getInstance() {
		return instance;
	}

	public HandlerMethod setInstance(Object instance) {
		this.instance = instance;
		return this;
	}

	public Method getMethod() {
		return method;
	}

	public HandlerMethod setMethod(Method method) {
		this.method = method;
		return this;
	}
	
}
