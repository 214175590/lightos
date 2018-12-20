package com.echinacoop.lightos.socket.dto;

import java.io.IOException;
import java.net.Socket;
import java.util.HashMap;
import java.util.Map;

import org.springframework.web.socket.WebSocketSession;

import com.alibaba.fastjson.JSONObject;
import com.echinacoop.lightos.socket.WSUtils;
import com.yinsin.utils.CommonUtils;

public class WSClient {

    private String userId;
    private String sid;
    private Long lastActiveTime = System.currentTimeMillis();
    private WebSocketSession wsSession;
    private Socket socket;
    private ProtocolType type = ProtocolType.WS;
    private Object value;
    private Map<String, Object> attrs = new HashMap<String, Object>();
    
    public WSClient(){
    	
    }
    
    public WSClient(Socket socket){
    	this.setSocket(socket);
    	this.setType(ProtocolType.TCP);
    }

    public boolean sendMessage(WSData wsData) {
    	boolean result = false;
    	if(this.type == ProtocolType.TCP){
    		result = WSUtils.sendMessage(this, wsData);
    	} else {
    		result = WSUtils.sendMessage(wsSession, wsData);
    	}
        return result;
    }
    
    public void close(){
    	if(this.type == ProtocolType.TCP && socket != null){
    		try {
				socket.close();
			} catch (IOException e) {
			}
    	}
    }
    
    public void setAttr(String key, Object value){
    	attrs.put(key, value);
    }
    
    public Object getAttr(String key){
    	return attrs.get(key);
    }
    
    public String getStringAttr(String key){
    	return (String) attrs.get(key);
    }
    
    public int getIntegerAttr(String key){
    	return CommonUtils.objectToInt(attrs.get(key));
    }
    
    public long getLongAttr(String key){
    	return CommonUtils.objectToLong(attrs.get(key));
    }
    
    public JSONObject getJSONObjectAttr(String key){
    	return (JSONObject) attrs.get(key);
    }
    
    public <T> Map<String, T> getMapAttr(String key){
    	return (Map<String, T>)attrs.get(key);
    }

    public String getUserId() {
        return userId;
    }

    public void setUserId(String userId) {
        this.userId = userId;
    }

    public String getSid() {
        return sid;
    }

    public void setSid(String sid) {
        this.sid = sid;
    }

    public Long getLastActiveTime() {
		return lastActiveTime;
	}

	public void setLastActiveTime(Long lastActiveTime) {
		this.lastActiveTime = lastActiveTime;
	}

	public WebSocketSession getWsSession() {
        return wsSession;
    }

    public void setWsSession(WebSocketSession wsSession) {
        this.wsSession = wsSession;
    }

	public Socket getSocket() {
		return socket;
	}

	public void setSocket(Socket socket) {
		this.socket = socket;
	}

	public ProtocolType getType() {
		return type;
	}

	public void setType(ProtocolType type) {
		this.type = type;
	}

	public Object getValue() {
		return value;
	}

	public void setValue(Object value) {
		this.value = value;
	}
    
}
