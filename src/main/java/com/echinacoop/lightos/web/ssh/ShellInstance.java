package com.echinacoop.lightos.web.ssh;

import java.util.HashMap;
import java.util.Map;

import com.echinacoop.lightos.domain.User;
import com.echinacoop.lightos.socket.dto.WSClient;
import com.echinacoop.lightos.socket.dto.WSData;
import com.yisin.ssh2.ShellMessageEvent;

public class ShellInstance {
	private User user;
	private String userId;
	private String serverIp;
	private int port;
	private String username;
	private String password;
	private WSClient client;
	private LinuxOs os;
	private boolean sended;
	private boolean enable = true;
	
	private Thread thread = null;
	private boolean run = true;
	private int nonum = 0;

	public void closeLinuxOs() {
		os.close();
		os = null;
	}
	
	public void start(){
		os.getChannel().regEvent(new ShellMessageEvent(){
			private WSData dataPackage = null;
			private Map<String, String> head = new HashMap<String, String>();
			@Override
			public void handle(Object... params) {
				try {
					if(nonum > 0){
						nonum --;
					}
					setSended(false);
					dataPackage = new WSData();
					dataPackage.setUrl("linux.data");
					head.put("flag", "docker");
					head.put("serverIp", serverIp);
					dataPackage.setHead(head);
					dataPackage.setBody(params[0]);
					if(null != client){
						String value = (String)dataPackage.getBody();
						System.out.println(value);
						byte[] bytes = value.getBytes();
						int v = bytes[0] + bytes[1] + bytes[2];
						if(enable && v > 10){
							client.sendMessage(dataPackage);
						}
					}
				} catch (Exception e) {
					e.printStackTrace();
				}
			}
		});
		
		// Wait till channel is closed
		thread = new Thread(){
			@Override
			public void run(){
				try {
					while (run && os != null && !os.getChannel().isClosed()) {
						try {
							Thread.sleep(500);
							if(nonum > 1){
								ShellManager.reconnection(userId, serverIp, port);
							}
						} catch (Exception e) {
						}
					}
					// Disconnect from remote server
					os.getChannel().disconnect();
					os.getSession().disconnect();
				} catch (Exception e) {
				}
			}
		};
		thread.start();
	}
	
	public void stopThread(){
		if(null != thread){
			run = false;
		}
	}
	
	public void send(String command){
		try {
			setSended(true);
			nonum ++;
			os.getChannel().send(command + "\n");
		} catch (Exception e) {
			e.printStackTrace();
		}
	}

	public User getUser() {
		return user;
	}

	public void setUser(User user) {
		this.user = user;
	}

	public String getUsername() {
		return username;
	}

	public void setUsername(String username) {
		this.username = username;
	}

	public String getPassword() {
		return password;
	}

	public void setPassword(String password) {
		this.password = password;
	}

	public WSClient getClient() {
		return client;
	}

	public void setClient(WSClient client) {
		this.client = client;
	}

	public String getUserId() {
		return userId;
	}

	public void setUserId(String userId) {
		this.userId = userId;
	}
	
	public String getServerIp() {
		return serverIp;
	}

	public void setServerIp(String serverIp) {
		this.serverIp = serverIp;
	}

	public int getPort() {
		return port;
	}

	public void setPort(int port) {
		this.port = port;
	}

	public boolean isSended() {
		return sended;
	}

	public void setSended(boolean sended) {
		this.sended = sended;
	}

	public LinuxOs getLinuxOs() {
		return os;
	}
	
	public void setLinuxOs(LinuxOs os) {
		this.os = os;
	}

	public void setEnable(boolean enable) {
		this.enable = enable;
	}
	
}
