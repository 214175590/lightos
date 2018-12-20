package com.echinacoop.lightos.socket;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import com.alibaba.fastjson.JSONObject;
import com.echinacoop.lightos.common.consts.MapContants;
import com.echinacoop.lightos.common.consts.StringConstant;
import com.echinacoop.lightos.security.jwt.CustomJWT;
import com.echinacoop.lightos.socket.annotation.MessageHandler;
import com.echinacoop.lightos.socket.annotation.Req;
import com.echinacoop.lightos.socket.dto.DataCache;
import com.echinacoop.lightos.socket.dto.UserState;
import com.echinacoop.lightos.socket.dto.WSClient;
import com.echinacoop.lightos.socket.dto.WSData;
import com.yinsin.security.MD5;

@MessageHandler("user")
public class ClientMessageHandler {
    private static final Logger log = LoggerFactory.getLogger(MessageHandler.class);
    private static final String SID = "sid";
    private static final String LOGIN_FAIL = "登录失败：";
    
    @Req("login")
    public void login(WSClient client, WSData wsData){
    	JSONObject res = new JSONObject();
        JSONObject message = (JSONObject) wsData.getBody();
        log.debug("调用成功-------------------" + message);
        try {
            if(message.containsKey(StringConstant.KEY_USER_ACCOUNT) && message.containsKey(StringConstant.KEY_USER_TOKEN)){
                String account = message.getString(StringConstant.KEY_USER_ACCOUNT);
                String userToken = message.getString(StringConstant.KEY_USER_TOKEN);
                JSONObject tokenData = DataCache.getUserDataByUserId(StringConstant.ACCESS_TOKEN + account);
                if(tokenData != null){
	                String token = tokenData.getString(StringConstant.ACCESS_TOKEN);
	                if(token != null && token.equalsIgnoreCase(userToken)){
	                	if(CustomJWT.isValidate(userToken)){
	                		res.put(StringConstant.KEY_CODE, MapContants.MSG_CODE_SUCCESS);
	                		res.put(StringConstant.KEY_MSG_ID, message.get(StringConstant.KEY_MSG_ID));
	                		res.put(StringConstant.KEY_MSG, MapContants.getMessage(MapContants.MSG_CODE_SUCCESS));
	                		JSONObject user = new JSONObject();
	                		user.put(StringConstant.KEY_USER_ID, account);
	                		user.put(SID, MD5.md5(MD5.md5(token + account) + MD5.md5(account + token)));
	                		res.put(StringConstant.DATA_KEY, user);
	                		
	                		client.setUserId(account);
	                		
	                		DataCache.updateUser(client.getSid(), account);
	                		
	                		WSUtils.pushUserChangeState(client, UserState.online);
	                	} else {
		                    res.put(StringConstant.KEY_CODE, MapContants.MSG_CODE_SESSION_TIMEOUT);
		                    res.put(StringConstant.KEY_MSG_ID, message.get(StringConstant.KEY_MSG_ID));
		                    res.put(StringConstant.KEY_MSG, MapContants.getMessage(MapContants.MSG_CODE_SESSION_TIMEOUT));
		                }
	                } else {
	                    res.put(StringConstant.KEY_CODE, MapContants.MSG_CODE_INVALID_REQ);
	                    res.put(StringConstant.KEY_MSG_ID, message.get(StringConstant.KEY_MSG_ID));
	                    res.put(StringConstant.KEY_MSG, MapContants.getMessage(MapContants.MSG_CODE_INVALID_REQ));
	                }
                } else {
                	res.put(StringConstant.KEY_CODE, MapContants.MSG_CODE_SESSION_TIMEOUT);
                    res.put(StringConstant.KEY_MSG_ID, message.get(StringConstant.KEY_MSG_ID));
                    res.put(StringConstant.KEY_MSG, MapContants.getMessage(MapContants.MSG_CODE_SESSION_TIMEOUT));
                }
            } else {
                res.put(StringConstant.KEY_CODE, MapContants.MSG_CODE_INVALID_PARAM);
                res.put(StringConstant.KEY_MSG_ID, message.get(StringConstant.KEY_MSG_ID));
                res.put(StringConstant.KEY_MSG, MapContants.getMessage(MapContants.MSG_CODE_INVALID_PARAM));
            }
        } catch (Exception e) {
            log.error(LOGIN_FAIL + e.getMessage(), e);
            res.put(StringConstant.KEY_CODE, MapContants.MSG_CODE_FAILED);
            res.put(StringConstant.KEY_MSG_ID, message.get(StringConstant.KEY_MSG_ID));
            res.put(StringConstant.KEY_MSG, MapContants.getMessage(MapContants.MSG_CODE_FAILED));
        }
        wsData.setBody(res);
        WSUtils.sendMessage(client, wsData);
    }
    
    @Req("logout")
    public void logout(WSClient client, WSData wsData){
        if(null != client){
            // 1、先推送状态消息
            WSUtils.pushUserChangeState(client, UserState.offline);
            // 2、再删除用户信息
            DataCache.removeWSClient(client.getSid());
            DataCache.removeUserData(client.getUserId());
        }
    }
    
    @Req("change-state")
    public void changeState(WSClient client, WSData wsData){
        
    }
    
    @Req("heart")
    public void clientHeart(WSClient client, WSData wsData){
        JSONObject message = (JSONObject) wsData.getBody();
        try {
        	String account = message.getString(StringConstant.KEY_USER_ACCOUNT);
            WSClient wsclient = DataCache.getWSClientByUserId(account);
            if(null != wsclient){
            	wsclient.setLastActiveTime(WSUtils.getTime());
            }
        } catch (Exception e) {
        }
    }
    
}
