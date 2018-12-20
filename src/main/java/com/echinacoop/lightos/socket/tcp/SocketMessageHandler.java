package com.echinacoop.lightos.socket.tcp;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import com.alibaba.fastjson.JSONObject;
import com.echinacoop.lightos.common.consts.MapContants;
import com.echinacoop.lightos.socket.HandleHelper;
import com.echinacoop.lightos.socket.WSUtils;
import com.echinacoop.lightos.socket.dto.DataCache;
import com.echinacoop.lightos.socket.dto.HandlerMethod;
import com.echinacoop.lightos.socket.dto.WSClient;
import com.echinacoop.lightos.socket.dto.WSData;

public class SocketMessageHandler implements IMessageHandler {
	private final static Logger log = LoggerFactory.getLogger(SocketMessageHandler.class);

	@Override
	public void init(HandleHelper helper) {

	}

	@Override
	public boolean filter(WSClient client, WSData wsData) {

		return false;
	}

	@Override
	public void onMessage(WSClient client, WSData wsData) {
		try {
			JSONObject message = (JSONObject) wsData.getBody();
			log.debug(wsData.getUrl() + "===>" + message);
			if (WSUtils.validateReq(client.getSid(), wsData)) {
				boolean called = callOnMessage(client, wsData);
				if (!called) {
					log.debug("Called Failed ---->" + client.getSid());
				}
			} else {
				JSONObject res = WSUtils.getApplyMessage(MapContants.MSG_CODE_INVALID_REQ, message.getString("msgId"));
				wsData.setBody(res);
				WSUtils.sendMessage(client, wsData);
			}
		} catch (Exception e) {
		}
	}

	@Override
	public void onClose(WSClient client) {
		log.debug("Client Closed---->" + client.getSid());
		if (null != client) {
			// 1、先推送状态消息
			//WSUtils.pushUserChangeState(client, UserState.offline);
			// 3、再删除用户信息
			DataCache.removeWSClient(client.getSid());
			// DataCache.removeUserData(client.getUserId());
			client.close();
		}
	}

	@Override
	public void onError(WSClient client, Throwable e) {
		log.debug("Client Errored---->" + client.getSid());
		if (null != client) {
			// 1、先推送状态消息
			//WSUtils.pushUserChangeState(client, UserState.offline);
			// 3、再删除用户信息
			DataCache.removeWSClient(client.getSid());
			// DataCache.removeUserData(client.getUserId());
			client.close();
		}
	}

	@Override
	public void onOpen(WSClient client) {
		log.debug("Client Connection---->" + client.getSid());
		DataCache.addWSClient(client);
	}

	private boolean callOnMessage(WSClient client, WSData wsData) {
		boolean result = false;
		String url = wsData.getUrl();
		if (url != null) {
			url = url.replaceAll("/", ".");
		}
		HandlerMethod handMethod = HandleHelper.getHandlerMethod(url);
		if (null != handMethod) {
			try {
				handMethod.getMethod().invoke(handMethod.getInstance(), new Object[] { client, wsData });
				result = true;
			} catch (Exception e) {
				result = false;
			}
		}
		return result;
	}

}
