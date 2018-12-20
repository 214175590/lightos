package com.echinacoop.lightos.socket.tcp;

import com.echinacoop.lightos.socket.HandleHelper;
import com.echinacoop.lightos.socket.dto.WSClient;
import com.echinacoop.lightos.socket.dto.WSData;

public interface IMessageHandler {

	public void init(HandleHelper helper);

	public boolean filter(WSClient client, WSData wsData);

	public void onMessage(WSClient client, WSData wsData);

	public void onClose(WSClient client);

	public void onError(WSClient client, Throwable e);

	public void onOpen(WSClient client);

	class _IMessageHandler {

	}
}
