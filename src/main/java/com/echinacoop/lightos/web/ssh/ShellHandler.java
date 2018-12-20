package com.echinacoop.lightos.web.ssh;

import com.alibaba.fastjson.JSONObject;
import com.echinacoop.lightos.socket.annotation.MessageHandler;
import com.echinacoop.lightos.socket.annotation.Req;
import com.echinacoop.lightos.socket.dto.WSClient;
import com.echinacoop.lightos.socket.dto.WSData;

@MessageHandler("linux")
public class ShellHandler {
	
	@Req("login")
	public void login(WSClient client, WSData dataPackage) {
		try {
			JSONObject value = (JSONObject) dataPackage.getBody();
			String userId = value.getString("userId");
			String serverIp = value.getString("serverIp");
			int port = value.getInteger("port");
			client.setAttr("userId", userId);
			ShellInstance shell = ShellManager.getByIp(userId, serverIp, port);
			if(null == shell){
				shell = new ShellInstance();
				shell.setUserId(userId);
				shell.setClient(client);
				ShellManager.add(userId, shell);
			} else {
				shell.setClient(client);
			}
			client.sendMessage(dataPackage);
		} catch (Exception e) {
			e.printStackTrace();
		}
	}
	
	public void onOpen(WSClient client) {
	}
	
	public void onClose(WSClient client) {
		ShellInstance shell = ShellManager.get(client.getStringAttr("userId"), client.getSid());
		if(null != shell){
			shell.setClient(null);
			System.err.println("client exit =1==>" + client.getStringAttr("userId") + "----" + client.getSid());
		}
	}
	
	public void onError(WSClient client, Throwable thr) {
		ShellInstance shell = ShellManager.get(client.getStringAttr("userId"), client.getSid());
		if(null != shell){
			shell.setClient(null);
			System.err.println("client exit =2==>" + client.getStringAttr("userId") + "----" + client.getSid());
		}
	}
	
}
