package com.echinacoop.lightos.socket;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.web.socket.CloseStatus;
import org.springframework.web.socket.WebSocketHandler;
import org.springframework.web.socket.WebSocketMessage;
import org.springframework.web.socket.WebSocketSession;

import com.alibaba.fastjson.JSONObject;
import com.echinacoop.lightos.common.consts.MapContants;
import com.echinacoop.lightos.socket.dto.DataCache;
import com.echinacoop.lightos.socket.dto.HandlerMethod;
import com.echinacoop.lightos.socket.dto.UserState;
import com.echinacoop.lightos.socket.dto.WSClient;
import com.echinacoop.lightos.socket.dto.WSData;
import com.echinacoop.lightos.web.rest.util.JSONUtils;
import com.echinacoop.lightos.web.ssh.ShellManager;

public class MyWebSocketHandler implements WebSocketHandler {
    private final static Logger log = LoggerFactory.getLogger(MyWebSocketHandler.class);
    
    private static String chatMsg = null;
    
	@Override
	public void afterConnectionClosed(WebSocketSession wsSession, CloseStatus status) throws Exception {
	    log.debug("Client Closed---->" + wsSession.getId() + " -- " + status.getCode() + "#" + status.toString());
	    WSClient client = DataCache.getWSClientBySessionId(wsSession.getId());
        if(null != client){
            // 1、先推送状态消息
            WSUtils.pushUserChangeState(client, UserState.offline);
            // 3、再删除用户信息
            DataCache.removeWSClient(client.getSid());
            ShellManager.reset(client.getUserId(), client.getSid());
            DataCache.removeUserData(client.getUserId());
        }
        wsSession.close();
	}

	@Override
	public void afterConnectionEstablished(WebSocketSession wsSession) throws Exception {
		log.debug("Client Connection---->" + wsSession.getId());
	    WSClient client = new WSClient();
	    client.setSid(wsSession.getId());
	    client.setWsSession(wsSession);
	    DataCache.addWSClient(client);
	}

	@Override
	public void handleMessage(WebSocketSession wsSession, WebSocketMessage<?> wsMessage){
		try {
			//log.debug("handleMessage--------------"+wsMessage.getPayload());
			String rtnMsg =  wsMessage.getPayload().toString();
			if(!rtnMsg.startsWith("{") || !rtnMsg.endsWith("}")){
			//判断发过来的包是否为异常情况。
				int i = rtnMsg.length();
				//开头没有“{” 结尾有“}”，则代表可能是后半部分的数据包
				if(!rtnMsg.substring(0, 1).equals("{") || rtnMsg.substring(i - 1).equals("}")){
					if(null != chatMsg){
						chatMsg = chatMsg.concat(rtnMsg);
						WSData wsData2 = JSONUtils.toJavaObject(chatMsg, WSData.class);
						if (WSUtils.validateReq(wsSession.getId(), wsData2)) {
							boolean called = callOnMessage(wsSession, wsData2);
							if (!called) {
								log.debug("Called Failed ---->" + wsSession.getId());	
							}
							chatMsg = null;
						}
					}
				}
				//开头有“{” 结尾没有“}”，则代表可能是前半部分的数据包
				else if(!rtnMsg.substring(i - 1).equals("}") || rtnMsg.substring(0, 1).equals("{")){
					chatMsg = rtnMsg;
					return ;
				}
				//开头没“{” 结尾没有“}” 而临时变量里面有值，则代表可能是中间的数据包，则直接拼接。
				else if(!rtnMsg.substring(i - 1).equals("}") || rtnMsg.substring(0, 1).equals("{")){
					if(null != chatMsg){
						chatMsg = chatMsg.concat(rtnMsg);
						return ;
					}
				}
			} else {
				WSData wsData = WSUtils.parseMessage(wsMessage);
				JSONObject message = (JSONObject) wsData.getBody();
				//log.debug("message的值：" + message);
				//log.debug(wsData.getUrl() + "===>" + message);
				if (WSUtils.validateReq(wsSession.getId(), wsData)) {
					boolean called = callOnMessage(wsSession, wsData);
					if (!called) {
						log.debug("Called Failed ---->" + wsSession.getId());
						log.debug(wsMessage.getPayloadLength() + "---->" + wsMessage.getPayload());
					}
				} else {
					JSONObject res = WSUtils.getApplyMessage(MapContants.MSG_CODE_INVALID_REQ, message.getString("msgId"));
					wsData.setBody(res);
					WSUtils.sendMessage(wsSession, wsData);
				}
			}	
		} catch (Exception e) {
			log.error("handleMessage报错：",e);
		}
	}

	@Override
	public void handleTransportError(WebSocketSession wsSession, Throwable e) throws Exception {
	    log.debug("Client Conn Error---->" + wsSession.getId() + " -- " + e.getMessage());
	    WSClient client = DataCache.getWSClientBySessionId(wsSession.getId());
        if(null != client){
            // 1、先推送状态消息
            WSUtils.pushUserChangeState(client, UserState.offline);
            // 3、再删除用户信息
            DataCache.removeWSClient(client.getSid());
            ShellManager.reset(client.getUserId(), client.getSid());
            DataCache.removeUserData(client.getUserId());
        }
        wsSession.close();
	}

	@Override
	public boolean supportsPartialMessages() {
	    log.debug("************************");
		return true;
	}
	
    private boolean callOnMessage(WebSocketSession wsSession, WSData wsData){
	    boolean called = false;
        String url = wsData.getUrl();
        if(url != null){
            url = url.replaceAll("/", ".");
        }
        HandlerMethod handMethod = HandleHelper.getHandlerMethod(url);
        if(null != handMethod){
            try {
            	JSONObject message = (JSONObject) wsData.getBody();
            	WSClient client = DataCache.getWSClientBySessionId(wsSession.getId());
            	if(client != null){
            		handMethod.getMethod().invoke(handMethod.getInstance(), new Object[]{
            			client, wsData                
            		});
            		called = true;
            	} else {
                    JSONObject res = WSUtils.getApplyMessage(MapContants.MSG_CODE_INVALID_REQ, message.getString("msgId"));
            		wsData.setBody(res);
                    WSUtils.sendMessage(client, wsData);
            	}
            } catch (Exception e) {
                e.printStackTrace();
                called = false;
            }
        }
        return called;
    }

}
