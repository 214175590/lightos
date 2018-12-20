package com.echinacoop.lightos.web.rest.util;

import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.io.OutputStream;
import java.net.SocketException;

import org.apache.commons.net.telnet.TelnetClient;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

public class Telnet {
	private static final Logger logger = LoggerFactory.getLogger(Telnet.class);
	
	private TelnetClient tc;
	private String ip;
	private int port;
	private InputStream in;
	private OutputStream os;
	private boolean runing = false;
	private TelnetHeart heart = null;
	
	public Telnet(String address) throws SocketException, IOException{
		if(null != address && !address.isEmpty()){
			String[] arr = address.split(":");
			this.ip = arr[0];
			this.port = Integer.parseInt(arr[1]);
			connection();
		}
	}
	
	public Telnet(String ip, int port) throws SocketException, IOException{
		this.ip = ip;
		this.port = port;
		connection();
	}
	
	private void connection() throws SocketException, IOException{
		tc = new TelnetClient();
		tc.connect(this.ip, this.port);
		in = tc.getInputStream();
        os = tc.getOutputStream();
        if(null == heart){
        	heart = new TelnetHeart();
        	new Thread(heart).start();
        }
	}
	
	/**
     * 写入命令方法
     * @param cmd
     * @param os
     */
    public String send(String cmd){
    	int count = 0;
		while(runing && count < 2){
			try {
				Thread.sleep(1000);
			} catch (InterruptedException e) {
			}
			count++;
		}
    	runing = true;
        try {
        	if(null == tc || !tc.isAvailable() || !tc.isConnected()){
        		connection();
        	}
        	cmd = cmd + "\n";
        	int index = 0;
        	String result = null;
			while (index < 3) {
				try {
					result = writeCmd(cmd);
					if(result != null){
						break;
					}
				} catch (Exception e) {
					tc = null;
				}
				index++;
			}
			runing = false;
			return result;
        } catch (IOException e) {
            logger.error("发送Dubbo Telnet命令异常：" + cmd, e);
        }
        runing = false;
        return null;
    }
    
    /**
     * 写入命令方法
     * @param cmd
     * @param os
     * @throws IOException 
     * @throws SocketException 
     */
    private String writeCmd(String cmd) throws SocketException, IOException{
		if(null == tc || !tc.isAvailable() || !tc.isConnected()){
			connection();
		}
		os.write(cmd.getBytes());
		os.flush();
		return readUntil(cmd, "dubbo>");
    }
    
    /**
     * 读到指定位置,不在向下读
     * @param endFlag
     * @param in
     * @return
     */
    private String readUntil(String cmd, String endFlag) {
    	String str = "";
    	try {
	        InputStreamReader isr = new InputStreamReader(in, "utf-8");
	        char[] charBytes = new char[1024];
	        int n = 0;
	        boolean flag = false;
            while((n = isr.read(charBytes)) != -1){
                for(int i=0; i< n; i++){
                    char c = (char)charBytes[i];
                    str += c;
                    //当拼接的字符串以指定的字符串结尾时,不在继续读
                    if(str.endsWith(endFlag)){
                        flag = true;
                        break;
                    }
                }
                if(flag){
                    break;
                }
            }
        } catch (IOException e) {
        	logger.error("读取Dubbo Telnet结果异常：" + cmd, e);
        }
        str = str.replace("\r\ndubbo>", "");
        return str;
    }
    
    private class TelnetHeart implements Runnable {
    	
		@Override
		public void run() {
			while(true){
				try {
					Thread.sleep(5000);
				} catch (InterruptedException e) {
				}
				if(!runing){
					runing = true;
					try {
						send("status -l");
					} catch (Exception e) {
						try {
							tc.disconnect();
						} catch (Exception e1) {
						}
						tc = null;
						try {
							connection();
						} catch (Exception e1) {
						}
					}
					runing = false;
				}
			}
		}
    	
    }
	
}
