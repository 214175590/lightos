package com.echinacoop.lightos.socket.dto;

import java.io.IOException;
import java.util.HashMap;
import java.util.Map;

import com.alibaba.fastjson.JSONObject;
import com.yinsin.utils.CommonUtils;

public class DataCache {
    
    private static long msgId = 80000000000L;
    
    public static String getMsgId(){
        return String.valueOf(msgId++);
    }
    
    // sid - WSClient
    private static Map<String, WSClient> userSession = new HashMap<String, WSClient>();
    // userId - JSONObject
    private static Map<String, JSONObject> userData = new HashMap<String, JSONObject>();
    
    public static Map<String, WSClient> getAllClient(){
        return userSession;
    }
    
    public static void addWSClient(WSClient client){
    	removeWSClient(client.getSid());
        userSession.put(client.getSid(), client);
    }
    
    public static void removeWSClient(String sid){
        if(CommonUtils.isNotBlank(sid)){
        	try {
	        	WSClient client = userSession.get(sid);
	        	if(null != client){
	        		if(client.getType() == ProtocolType.TCP){
	        			client.getSocket().close();
	        		} else {
	        			client.getWsSession().close();
	        		}
	        	}
        	} catch (IOException e) {
        	}
            userSession.remove(sid);
        }
    }
    
    public static void removeWSClientByUserId(String userId){
        WSClient client = getWSClientByUserId(userId);
        if(null != client){
            removeWSClient(client.getSid());
        }
    }
    
    public static void updateUser(String sid, String userId){
        WSClient client = getWSClientBySessionId(sid);
        if(null != client){
            client.setUserId(userId);
        }
    }
    
    public static void addUserData(String userId, JSONObject udata){
        userData.put(userId, udata);
    }
    
    public static void removeUserData(String userId){
        if(CommonUtils.isNotBlank(userId)){
            userData.remove(userId);
        }
    }
    
    public static WSClient getWSClientBySessionId(String sid){
        return userSession.get(sid);
    }
    
    public static WSClient getWSClientByUserId(String userId){
        WSClient client = null;
        for(Map.Entry<String, WSClient> entity : userSession.entrySet()){
            if(entity.getValue() != null && entity.getValue().getUserId() != null && entity.getValue().getUserId().equals(userId)){
                client = entity.getValue();
                break;
            }
        }
        return client;
    }
    
    public static JSONObject getUserDataBySessionId(String sid){
        WSClient client = getWSClientBySessionId(sid);
        if(null != client){
            return userData.get(client.getUserId());
        }
        return null;
    }
    
    public static JSONObject getUserDataByUserId(String userId){
        return userData.get(userId);
    }
    
}
