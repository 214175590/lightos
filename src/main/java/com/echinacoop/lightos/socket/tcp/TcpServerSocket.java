package com.echinacoop.lightos.socket.tcp;

import java.io.IOException;
import java.net.ServerSocket;
import java.net.Socket;
import java.util.UUID;

import com.echinacoop.lightos.config.ApplicationProperties;
import com.echinacoop.lightos.config.SpringBeanFactoryTool;
import com.echinacoop.lightos.socket.dto.WSClient;
import com.yinsin.other.LogHelper;

/**
 * TCP服务,Socket
 * @author Yisin
 */
public class TcpServerSocket extends Thread {
	private static final LogHelper LOGGER = LogHelper.getLogger(TcpServerSocket.class);
	private ServerSocket server;
	private IMessageHandler handle;
	private static int PORT = 8084;
	private static int status = 0;

	private final static class TcpServerSocketHandle {
		private static TcpServerSocket TSS = new TcpServerSocket();
	}

	private TcpServerSocket() {
		try {
			ApplicationProperties appProperties = SpringBeanFactoryTool.getBean(ApplicationProperties.class);
			int port = appProperties.getSocket().getPort();
			if(port != 0){
				PORT = port;
			}
		} catch (Exception e) {
		}
	}

	public static TcpServerSocket getInstance() {
		return TcpServerSocketHandle.TSS;
	}

	public void startServer(IMessageHandler handle) {
		if (status == 0) {
			this.handle = handle;
			start();
		}
	}

	@Override
	public void run() {
		try {
			if (PORT > 0) {
				this.server = new ServerSocket(PORT);
				LOGGER.info("Yisin Communication # TCP Socket Server Started! POST = " + PORT);
				status = 1;
				String uid = "";
				while (true) {
					Socket soc = this.server.accept();
					LOGGER.debug("Client Access to the... ip " + soc.getRemoteSocketAddress().toString());
					if (this.handle != null) {
						WSClient client = new WSClient(soc);
						client.setSid(soc.getRemoteSocketAddress().toString());
						uid = UUID.randomUUID().toString();
						client.setSid(uid.replaceAll("-", ""));
						this.handle.onOpen(client);
						new TcpServerThread(client, soc, this.handle).start();
					}
				}
			}
		} catch (IOException e) {
			e.printStackTrace();
		}
	}
}