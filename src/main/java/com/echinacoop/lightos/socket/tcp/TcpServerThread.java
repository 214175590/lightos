package com.echinacoop.lightos.socket.tcp;

import java.io.IOException;
import java.io.InputStream;
import java.net.Socket;

import com.alibaba.fastjson.JSONObject;
import com.echinacoop.lightos.socket.dto.WSClient;
import com.echinacoop.lightos.socket.dto.WSData;
import com.echinacoop.lightos.web.rest.util.JSONUtils;
import com.yinsin.other.LogHelper;
import com.yinsin.utils.ByteUtils;

public class TcpServerThread extends Thread {
	private static final LogHelper logger = LogHelper.getLogger(TcpServerThread.class);

	private Socket socket;
	private WSClient client;
	private IMessageHandler cbi;
	private InputStream is;
	private boolean cut = true;

	private TcpServerThread() {
	}

	TcpServerThread(WSClient client, Socket ss, IMessageHandler cbi) {
		this.client = client;
		this.socket = ss;
		this.cbi = cbi;
	}

	@Override
	public void run() {
		try {
			int i = -1;
			String text = null;
			if (!this.socket.isClosed()) {
				this.is = this.socket.getInputStream();
				byte[] byt = (byte[]) null;
				byte[] tempByt = null, msgByt = null;
				WSData wsData = null;
				JSONObject json = null;
				while (this.cut) {
					byt = new byte[1024];
					i = this.is.read(byt);
					if (i != -1) {
						if (i == 1024) {
							if (tempByt == null) {
								tempByt = byt;
							} else {
								tempByt = ByteUtils.joinByteArray(tempByt, byt);
							}
						} else {
							if (tempByt == null) {
								tempByt = ByteUtils.getByte(byt, i);
							} else {
								tempByt = ByteUtils.joinByteArray(tempByt, ByteUtils.getByte(byt, i));
							}
							msgByt = ByteUtils.copyByteArray(tempByt);
							try {
								text = new String(msgByt);

								TcpPolicyThread.sendPolicyFile(this.socket, text);

								json = JSONObject.parseObject(text);
								wsData = JSONUtils.toJavaObject(json, WSData.class);
								/*if (this.cbi.filter(client, wsData)) {
									callOnMessage(client, wsData);
								}*/
								this.cbi.onMessage(client, wsData);
							} catch (Exception e) {
								logger.error("接收消息异常：" + client.getSid(), e);
							}
							tempByt = null;
						}
					} else {
						this.cbi.onClose(this.client);
						this.cut = false;
					}
				}
			}
		} catch (IOException e) {
			this.cbi.onClose(this.client);
			this.cut = false;
		}
	}
}