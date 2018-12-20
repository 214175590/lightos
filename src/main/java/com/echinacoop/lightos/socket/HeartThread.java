package com.echinacoop.lightos.socket;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import com.alibaba.fastjson.JSONObject;
import com.echinacoop.lightos.security.jwt.CustomJWT;
import com.echinacoop.lightos.socket.dto.DataCache;
import com.echinacoop.lightos.socket.dto.ProtocolType;
import com.echinacoop.lightos.socket.dto.WSClient;
import com.echinacoop.lightos.socket.dto.WSData;
import com.yinsin.utils.CommonUtils;

public class HeartThread extends Thread {
    private final static Logger logger = LoggerFactory.getLogger(HeartThread.class);
    private static boolean runing = true;
    private static Long millis = 1000 * 30L; // 30秒一次心跳
    private static long sheepMillis = 100; // 间隔100秒没有收到心跳消息，就认为客户端已经断开，服务端强制关闭连接，释放内存
    
    public static void stopThread(){
        runing = false;
    }
    
    @Override
    public void run() {
        logger.info("WebSocket Server Heart Started." + this.getId());
        while(runing){
            try {
            	checkClientStatus();
            	//checkClientTimeout();
                Thread.sleep(millis);
            } catch (Exception e) {
            }
        }
    }
    
    public void sendHeart(){
        try {
            WSData wsData = new WSData();
            wsData.setUrl("chat.heart");
            JSONObject body = new JSONObject();
            body.put("time", WSUtils.getTime());
            wsData.setBody(body);
            Map<String, WSClient> clients = DataCache.getAllClient();
            for (Map.Entry<String, WSClient> entry : clients.entrySet()) {
                try {
                    entry.getValue().sendMessage(wsData);
                } catch (Exception e) {
                }
            }
        } catch (Exception e) {
        }
    }
    
    public void checkClientStatus(){
    	try {
	        Long lastActiveTime = 0L, sheepTime = 0L;
	        Long currTime = WSUtils.getTime();
	        Map<String, WSClient> clients = DataCache.getAllClient(); 
	        //logger.debug("Start Check Client Status ({})", clients.size());
	        List<WSClient> clientList = new ArrayList<WSClient>();
	        WSClient client = null;
	        for (Map.Entry<String, WSClient> entry : clients.entrySet()) {
	            try {
	            	client = entry.getValue();
	            	if(null != client){
	            		lastActiveTime = client.getLastActiveTime();
	            		sheepTime = (currTime - lastActiveTime) / 1000L;
	            		//logger.debug("\t{}({}) ==> {}", client.getUserId(), client.getSid(), sheepTime);
	            		if(null == client.getUserId() || client.getUserId().equals("null") || sheepTime > sheepMillis){
	            			clientList.add(client);
	            		}
	            	}
	            } catch (Exception e) {
	            	if(null != client){
	            		clientList.add(client);
	            	}
	            }
	        }
	        for (WSClient wsClient : clientList) {
	        	DataCache.removeWSClient(wsClient.getSid());
	        	if(wsClient.getType() == ProtocolType.WS){
	        		wsClient.getWsSession().close();
	        	} else if(wsClient.getType() == ProtocolType.TCP){
	        		wsClient.getSocket().close();
	        	}
			}
    	} catch (Exception e) {
        }
    }
    
    public void checkClientTimeout(){
    	try {
    		Map<String, WSClient> clients = DataCache.getAllClient(); 
	        JSONObject userData = null;
	        WSData wsData = null;
	        JSONObject res = new JSONObject();
	        boolean sended = false;
	        res.put("time", System.currentTimeMillis());
	        for (Map.Entry<String, WSClient> entry : clients.entrySet()) {
	            try {
	            	if(entry.getValue().getUserId() != null){
	            		sended = false;
	            		userData = DataCache.getUserDataByUserId(entry.getValue().getUserId());
	                    if(userData != null){
	                    	JSONObject tokenJson = userData.getJSONObject("userToken");
	                        String tokenStr = CommonUtils.excNullToString(tokenJson.getString("access_token"), "");
	                        if(CommonUtils.isNotBlank(tokenStr)){
	                        	if(!CustomJWT.isValidate(tokenStr)){
	                        		sended = true;
	                        	}
	                        } else {
	                        	sended = true;
	                        }
	                        if(sended){
	                        	wsData = new WSData();
	                        	wsData.setUrl("session.timeout");
	                        	wsData.setBody(res);
	                        	WSUtils.sendMessage(entry.getValue(), wsData);
	                        }
	                    }
	            	}
	            } catch (Exception e) {
	            }
	        }
    	} catch (Exception e) {
        }
    }
}
